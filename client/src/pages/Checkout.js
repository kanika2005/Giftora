import React, {useState, useEffect, useRef} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

export default function Checkout(){
  const [shipping, setShipping] = useState({name:'',address:'',city:'',postalCode:'',phone:''});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paypalOrder, setPaypalOrder] = useState(null);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [orderMessage, setOrderMessage] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const MESSAGE_LIMIT = 250;
  const TEMPLATES = {
    Birthday: 'Happy Birthday! Wishing you a day filled with love and cake 🎂',
    Anniversary: 'Happy Anniversary! Here’s to many more joyful years together 💕',
    Romantic: 'Forever & always — with all my love ❤️',
    'Thank you': 'Thank you! Your support means the world to me 🙏'
  };
  const msgDebounceRef = React.useRef(null);  
  // Delivery scheduling state
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [availableAddOns, setAvailableAddOns] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  
  // Check if selected date is today
  const isToday = deliveryDate === getTodayDate();
  
  // Check if selected date is tomorrow
  const isTomorrow = deliveryDate === getTomorrowDate();
  
  // Update delivery type and charges based on date selection
  React.useEffect(() => {
    if (isToday && deliveryTimeSlot) {
      setDeliveryType('same-day');
      setDeliveryCharges(200);
    } else if (isTomorrow && deliveryTimeSlot === 'midnight') {
      setDeliveryType('midnight');
      setDeliveryCharges(300);
    } else {
      setDeliveryType('standard');
      setDeliveryCharges(0);
    }
  }, [deliveryDate, deliveryTimeSlot, isToday, isTomorrow]);
  
  // debounce syncing localMessage -> orderMessage for better typing responsiveness
  React.useEffect(()=>{
    if(msgDebounceRef.current) clearTimeout(msgDebounceRef.current);
    msgDebounceRef.current = setTimeout(()=>{
      setOrderMessage(localMessage.slice(0, MESSAGE_LIMIT));
    }, 120);
    return ()=>{ if(msgDebounceRef.current) clearTimeout(msgDebounceRef.current); };
  }, [localMessage]);
  const [upiId, setUpiId] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { show } = useToast();
  
  // Fetch cart data
  useEffect(() => {
    if(token){
      API.get('/cart', {headers:{Authorization:'Bearer '+token}})
        .then(r => setCart(r.data))
        .catch(e => {
          if(e.response?.status === 401){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.error(e);
          }
        });
    }
  }, [token, navigate]);

  // Fetch available add-ons
  useEffect(() => {
    API.get('/products/add-ons/list')
      .then(r => setAvailableAddOns(r.data))
      .catch(e => console.error('Failed to fetch add-ons:', e));
  }, []);
  


  const submit = async (e)=>{
    e.preventDefault();
    if(!token){ return navigate('/login'); }
    
    // Validate delivery scheduling
    if(!deliveryDate){
      show('Please select a delivery date', { type: 'error' });
      return;
    }
    if(!deliveryTimeSlot){
      show('Please select a delivery time slot', { type: 'error' });
      return;
    }
    
    try{
      setIsLoading(true);
      if(paymentMethod === 'PAYPAL') {
        // Create order with PayPal
        const r = await API.post('/orders', {
          shipping, 
          paymentMethod: 'PAYPAL',
          message: orderMessage,
          deliveryDate,
          deliveryTimeSlot,
          deliveryType,
          addOns: selectedAddOns
        }, { headers: { Authorization: 'Bearer '+token } });
        
        setIsLoading(false);
        setPaypalOrder(r.data);
        // PayPal buttons will be rendered by the useEffect
      } else {
        // Cash on Delivery flow
        const r = await API.post('/orders', {
          shipping, 
          paymentMethod: 'COD',
          message: orderMessage,
          deliveryDate,
          deliveryTimeSlot,
          deliveryType,
          addOns: selectedAddOns
        }, { headers: { Authorization: 'Bearer '+token } });
        
        setIsLoading(false);
        show('Order placed! Order id: ' + r.data._id + ' (Cash on Delivery)', { type: 'success' });
        navigate('/orders');
      }
    } catch(e){
      setIsLoading(false);
      if(e.response?.status === 401){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        show(e.response?.data?.message || 'Order failed', { type: 'error' });
      }
    }
  };

  // Calculate total amount
  const subtotal = cart?.items?.reduce((s,it)=>s + (it.product.price * it.qty), 0) || 0;
  const addOnsTotal = selectedAddOns.reduce((s, addOn) => s + addOn.price, 0);
  const totalAmount = subtotal + deliveryCharges + addOnsTotal;

  // Toggle add-on selection
  const toggleAddOn = (addOn) => {
    const exists = selectedAddOns.find(a => a._id === addOn._id);
    if(exists){
      setSelectedAddOns(selectedAddOns.filter(a => a._id !== addOn._id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto card p-6">
      <h2 className="text-xl font-semibold mb-4">Checkout</h2>
      
      {/* Order Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-medium mb-2">Order Summary</h3>
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        {deliveryCharges > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span>{deliveryType === 'same-day' ? 'Same-day Delivery:' : 'Midnight Delivery:'}</span>
            <span className="text-orange-600">+₹{deliveryCharges}</span>
          </div>
        )}
        {addOnsTotal > 0 && (
          <div className="flex justify-between text-sm mt-1">
            <span>Add-ons:</span>
            <span className="text-orange-600">+₹{addOnsTotal}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
          <span>Total:</span>
          <span>₹{totalAmount.toFixed(0)}</span>
        </div>
      </div>
      
      {!paypalOrder ? (
        <form onSubmit={submit}>
          {/* Shipping Information */}
          <h3 className="font-medium mb-2">Shipping Information</h3>
          <input className="w-full border p-2 rounded mb-3" placeholder="Full name" required value={shipping.name} onChange={e=>setShipping({...shipping,name:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Address" required value={shipping.address} onChange={e=>setShipping({...shipping,address:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="City" required value={shipping.city} onChange={e=>setShipping({...shipping,city:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Postal Code" required value={shipping.postalCode} onChange={e=>setShipping({...shipping,postalCode:e.target.value})} />
          <input className="w-full border p-2 rounded mb-3" placeholder="Phone" required value={shipping.phone} onChange={e=>setShipping({...shipping,phone:e.target.value})} />

          {/* Delivery Scheduling */}
          <h3 className="font-medium mb-2 mt-4">Delivery Scheduling</h3>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Select Delivery Date *</label>
            <input 
              type="date" 
              className="w-full border p-2 rounded" 
              required 
              min={getTodayDate()}
              value={deliveryDate} 
              onChange={e=>setDeliveryDate(e.target.value)} 
            />
            {isToday && (
              <div className="text-xs text-blue-600 mt-1">⚡ Same-day delivery available (+₹200)</div>
            )}
            {isTomorrow && (
              <div className="text-xs text-purple-600 mt-1">🌙 Midnight delivery available (+₹300)</div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Time Slot *</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`border p-3 rounded cursor-pointer transition ${deliveryTimeSlot === 'morning' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="timeSlot" 
                  value="morning" 
                  checked={deliveryTimeSlot === 'morning'}
                  onChange={e=>setDeliveryTimeSlot(e.target.value)}
                  className="mr-2"
                />
                <span className="font-medium">Morning</span>
                <div className="text-xs text-gray-500">8 AM – 12 PM</div>
              </label>
              
              <label className={`border p-3 rounded cursor-pointer transition ${deliveryTimeSlot === 'afternoon' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="timeSlot" 
                  value="afternoon" 
                  checked={deliveryTimeSlot === 'afternoon'}
                  onChange={e=>setDeliveryTimeSlot(e.target.value)}
                  className="mr-2"
                />
                <span className="font-medium">Afternoon</span>
                <div className="text-xs text-gray-500">12 PM – 4 PM</div>
              </label>
              
              <label className={`border p-3 rounded cursor-pointer transition ${deliveryTimeSlot === 'evening' ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="timeSlot" 
                  value="evening" 
                  checked={deliveryTimeSlot === 'evening'}
                  onChange={e=>setDeliveryTimeSlot(e.target.value)}
                  className="mr-2"
                />
                <span className="font-medium">Evening</span>
                <div className="text-xs text-gray-500">4 PM – 8 PM</div>
              </label>
              
              <label className={`border p-3 rounded cursor-pointer transition ${deliveryTimeSlot === 'midnight' ? 'bg-purple-50 border-purple-500' : 'hover:bg-gray-50'} ${!isTomorrow ? 'opacity-50' : ''}`}>
                <input 
                  type="radio" 
                  name="timeSlot" 
                  value="midnight" 
                  checked={deliveryTimeSlot === 'midnight'}
                  onChange={e=>setDeliveryTimeSlot(e.target.value)}
                  className="mr-2"
                  disabled={!isTomorrow}
                />
                <span className="font-medium">Midnight 🌙</span>
                <div className="text-xs text-gray-500">12:00 AM – 1:00 AM</div>
                {isTomorrow && <div className="text-xs text-purple-600 mt-1">+₹300</div>}
              </label>
            </div>
          </div>

          {/* Gift Add-Ons Section */}
          {availableAddOns.length > 0 && (
            <div className="mb-4 p-4 bg-pink-50 rounded border border-pink-200">
              <h3 className="font-medium mb-3 flex items-center gap-2">✨ Make your gift extra special</h3>
              <div className="grid grid-cols-1 gap-2">
                {availableAddOns.map(addOn => (
                  <label key={addOn._id} className="flex items-center gap-3 p-2 hover:bg-pink-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAddOns.some(a => a._id === addOn._id)}
                      onChange={() => toggleAddOn(addOn)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{addOn.title}</div>
                      <div className="text-xs text-gray-600">{addOn.description}</div>
                    </div>
                    <span className="font-semibold text-sm">+₹{addOn.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Add a special message for the order (optional)</label>
            <div className="flex gap-2 mb-2">
              {Object.keys(TEMPLATES).map(k=> (
                <button type="button" key={k} className="px-2 py-1 bg-gray-100 rounded text-sm" onClick={()=>{ setLocalMessage(TEMPLATES[k]); setOrderMessage(TEMPLATES[k]); }}>{k}</button>
              ))}
            </div>
            <textarea value={localMessage} onChange={e=>setLocalMessage(e.target.value.slice(0, MESSAGE_LIMIT))} className="w-full border p-2 rounded mb-2" rows={3} placeholder="Add a special message (optional)" />
            <div className="text-xs text-gray-500">{(localMessage || '').length} / {MESSAGE_LIMIT} chars</div>
          </div>          
          {/* Payment Method Selection */}
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="flex flex-col gap-2 mb-4">
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="COD" 
                checked={paymentMethod === 'COD'} 
                onChange={() => setPaymentMethod('COD')} 
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="PAYPAL" 
                checked={paymentMethod === 'PAYPAL'} 
                onChange={() => setPaymentMethod('PAYPAL')} 
              />
              <span>Pay Online (PayPal)</span>
            </label>
          </div>
          
          <button 
            disabled={isLoading} 
            className={`${isLoading ? 'bg-gray-400' : 'bg-green-600'} text-white px-4 py-2 rounded w-full`}
          >
            {isLoading ? 'Processing...' : paymentMethod === 'PAYPAL' ? 'Continue to PayPal' : 'Place Order (COD)'}
          </button>
        </form>
      ) : (
        <div>
          <h3 className="font-medium mb-4">Complete your payment</h3>
          <p className="text-sm text-gray-600 mb-4">Choose your payment method</p>
          
          {!showUpiQr && !showCardForm && (
            <>
              {/* PayPal/UPI button */}
              <button 
                onClick={() => setShowUpiQr(true)}
                className="bg-yellow-500 text-white w-full py-3 rounded font-medium flex items-center justify-center mb-4"
                disabled={isLoading}
              >
                Pay with PayPal/UPI
              </button>
              
              {/* Credit/Debit Card Payment Button */}
              <button 
                onClick={() => setShowCardForm(true)}
                className="bg-blue-600 text-white w-full py-3 rounded font-medium flex items-center justify-center"
                disabled={isLoading}
              >
                Pay with Credit/Debit Card
              </button>
            </>
          )}
          
          {/* UPI QR Code */}
          {showUpiQr && (
            <div className="border p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Scan PartyVerse QR Code to Pay</h4>
              <div className="flex justify-center mb-3">
                <div className="card p-4 w-64 h-64 flex flex-col items-center justify-center">
                  {/* Enhanced QR code with PartyVerse branding */}
                  <div className="relative">
                    <div className="border border-gray-200 w-48 h-48 grid grid-cols-21 grid-rows-21 p-2 bg-card rounded-lg shadow-sm">
                      {/* Position detection patterns - top-left */}
                      <div className="absolute top-2 left-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Position detection patterns - top-right */}
                      <div className="absolute top-2 right-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Position detection patterns - bottom-left */}
                      <div className="absolute bottom-2 left-2 w-12 h-12 flex items-center justify-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-600 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* QR code center content with PartyVerse logo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 grid grid-cols-5 grid-rows-5 gap-1">
                          {[
                            1,0,1,0,1,
                            0,1,0,1,0,
                            1,0,1,0,1,
                            0,1,0,1,0,
                            1,0,1,0,1
                          ].map((value, i) => (
                            <div key={i} className={value ? 'bg-purple-600 rounded-sm' : ''}></div>
                          ))}
                        </div>
                        {/* Balloon logo overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center shadow-sm">
                            <div className="text-xl font-bold text-purple-600">🎈</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-purple-600 font-medium text-sm">PartyVerse - Scan to pay with UPI</div>
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Enter UPI ID</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    if (!upiId.trim()) {
                      show('Please enter UPI ID', { type: 'error' });
                      return;
                    }
                    setIsLoading(true);
                    try {
                      await API.post('/orders/capture-paypal-payment', {
                        orderId: paypalOrder.order._id,
                        paymentId: 'upi-payment-' + Date.now(),
                        payerEmail: upiId,
                        payerCountry: 'IN',
                        currency: 'INR'
                      }, { headers: { Authorization: 'Bearer '+token } });
                      
                      setIsLoading(false);
                      show('Payment successful!', { type: 'success' });
                      navigate('/orders');
                    } catch (error) {
                      setIsLoading(false);
                      if(error.response?.status === 401){
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      } else {
                        console.error('Payment error:', error);
                        show('Payment failed. Please try again.', { type: 'error' });
                      }
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                  onClick={() => setShowUpiQr(false)}
                  className="border border-gray-300 px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Credit Card Form */}
          {showCardForm && (
            <div className="border p-4 rounded mb-4">
              <h4 className="font-medium mb-2">Enter Card Details for PartyVerse</h4>
              <div className="flex items-center mb-3">
                <div className="text-xl text-purple-600 mr-2">🎈</div>
                <div className="text-sm text-gray-500">Secure payment powered by PartyVerse</div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name on Card</label>
                <input 
                  type="text" 
                  className="w-full border p-2 rounded" 
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
              <div className="flex space-x-4 mb-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    // Basic validation
                    if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
                      show('Please fill all card details', { type: 'error' });
                      return;
                    }
                    setIsLoading(true);
                    try {
                      await API.post('/orders/capture-paypal-payment', {
                        orderId: paypalOrder.order._id,
                        paymentId: 'card-payment-' + Date.now(),
                        payerEmail: 'card-payment@example.com',
                        payerCountry: 'IN',
                        currency: 'INR'
                      }, { headers: { Authorization: 'Bearer '+token } });
                      
                      setIsLoading(false);
                      show('Payment successful!', { type: 'success' });
                      navigate('/orders');
                    } catch (error) {
                      setIsLoading(false);
                      if(error.response?.status === 401){
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        navigate('/login');
                      } else {
                        console.error('Payment error:', error);
                        show('Payment failed. Please try again.', { type: 'error' });
                      }
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                  onClick={() => setShowCardForm(false)}
                  className="border border-gray-300 px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setPaypalOrder(null)} 
            className="text-gray-600 underline mt-4 block"
          >
            Cancel and return to checkout
          </button>
        </div>
      )}
    </div>
  );
}