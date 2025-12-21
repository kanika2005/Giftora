const router = require('express').Router();
const auth = require('../middlewares/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const axios = require('axios');

// PayPal configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

// Generate PayPal access token
async function generateAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await axios({
      url: `${PAYPAL_API}/v1/oauth2/token`,
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: 'grant_type=client_credentials'
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to generate PayPal access token:', error);
    throw new Error('Failed to generate PayPal access token');
  }
}

router.post('/', auth, async (req,res)=>{
  try{
    const {shipping, paymentMethod, message, deliveryDate, deliveryTimeSlot, deliveryType, addOns} = req.body;

    if(message && String(message).length > 250) return res.status(400).json({ message: 'Order message must be 250 characters or fewer' });
    
    // Validate delivery scheduling
    if(!deliveryDate) return res.status(400).json({ message: 'Delivery date is required' });
    if(!deliveryTimeSlot) return res.status(400).json({ message: 'Delivery time slot is required' });
    
    const selectedDate = new Date(deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if(selectedDate < today) return res.status(400).json({ message: 'Cannot schedule delivery for past dates' });
    
    // Calculate delivery charges
    let deliveryCharges = 0;
    if(deliveryType === 'same-day') deliveryCharges = 200;
    if(deliveryType === 'midnight') deliveryCharges = 300;

    const cart = await Cart.findOne({user:req.user.id}).populate('items.product');
    if(!cart || cart.items.length===0) return res.status(400).json({message:'Cart is empty'});
    const items = cart.items.map(i=>({
      product: i.product._id,
      name: i.product.title,
      price: i.product.price,
      qty: i.qty
    }));
    const total = items.reduce((s,it)=>s + (it.price * it.qty), 0);
    
    // Process add-ons if provided
    let addOnsData = [];
    let addOnsTotal = 0;
    if(addOns && Array.isArray(addOns) && addOns.length > 0) {
      addOnsData = addOns.map(a => ({
        product: a._id,
        name: a.title,
        price: a.price
      }));
      addOnsTotal = addOnsData.reduce((s, a) => s + a.price, 0);
    }
    
    // Create order based on payment method
    if(paymentMethod === 'PAYPAL') {
      try {
        // Create order in our database first
        const order = new Order({
          user: req.user.id, 
          items, 
          totalAmount: total + deliveryCharges + addOnsTotal, 
          shipping, 
          message: message || '',
          paymentMethod: 'PAYPAL', 
          status: 'Pending',
          deliveryDate: selectedDate,
          deliveryTimeSlot,
          deliveryType: deliveryType || 'standard',
          deliveryCharges,
          addOns: addOnsData
        });
        await order.save();
        
        // Return order details for client-side PayPal integration
        return res.json({
          order,
          clientId: PAYPAL_CLIENT_ID
        });
      } catch (error) {
        console.error('PayPal order creation error:', error);
        return res.status(500).json({ message: 'Failed to create payment order. Please try again.' });
      }
    } else {
      // Default COD flow
      const order = new Order({
        user:req.user.id, 
        items, 
        totalAmount: total + deliveryCharges + addOnsTotal, 
        shipping, 
        message: message || '', 
        paymentMethod:'COD', 
        status:'Pending',
        deliveryDate: selectedDate,
        deliveryTimeSlot,
        deliveryType: deliveryType || 'standard',
        deliveryCharges,
        addOns: addOnsData
      });
      await order.save();
      cart.items = [];
      await cart.save();
      res.json(order);
    }
  }catch(e){ res.status(500).json({message:e.message}); }
});

router.get('/my', auth, async (req,res)=>{
  const orders = await Order.find({user:req.user.id}).sort({createdAt:-1});
  res.json(orders);
});

// Capture payment (PayPal or Credit Card)
router.post('/capture-paypal-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, payerEmail, payerCountry, currency } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ message: 'Missing order ID' });
    }
    
    // Find the order
    const order = await Order.findById(orderId);
    
    // Verify that the order belongs to the authenticated user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update order with payment details
    order.paypal = {
      paymentId: paymentId || 'payment-' + Date.now(),
      payerEmail: payerEmail || 'customer@example.com',
      payerCountry: payerCountry || 'IN',
      currency: currency || 'INR',
      paymentStatus: 'COMPLETED'
    };
    order.status = 'Paid';
    await order.save();
    
    // Clear cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    return res.json({ success: true, order });
  } catch (e) {
    console.error('PayPal payment capture error:', e);
    res.status(500).json({ message: 'Payment capture failed' });
  }
});

// Submit rating and optional feedback for a delivered order
router.post('/:id/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    // coerce rating if it's a string
    const numRating = typeof rating !== 'undefined' ? Number(rating) : undefined;
    if (typeof numRating !== 'undefined' && (isNaN(numRating) || numRating < 1 || numRating > 5)) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (order.status !== 'Delivered') return res.status(400).json({ message: 'Only delivered orders can be rated' });

    if (typeof numRating !== 'undefined') order.rating = numRating;
    if (typeof feedback !== 'undefined') order.feedback = String(feedback).slice(0,1000);
    order.ratingAt = new Date();
    await order.save();

    return res.json(order);
  } catch (e) {
    console.error('Save rating error:', e);
    res.status(500).json({ message: 'Failed to save rating' });
  }
});

module.exports = router; 