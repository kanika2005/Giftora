const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  items:[{ 
    product:{type:mongoose.Schema.Types.ObjectId, ref:'Product'}, 
    name:String, 
    price:Number, 
    qty:Number,
    // Gift options for this order item
    giftWrapping: { type: Boolean, default: false },
    giftWrappingPrice: { type: Number, default: 0 },
    personalization: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ['message', 'engraving', 'custom-text'] },
      text: { type: String, maxlength: 200 },
      price: { type: Number, default: 0 }
    }
  }],
  totalAmount:Number,
  shipping:{ name:String, address:String, city:String, postalCode:String, phone:String },
  paymentMethod:{type:String, default:'COD'},
  status:{type:String, default:'Pending'},
  paypal: {
    orderId: String,
    paymentId: String,
    payerEmail: String,
    payerCountry: String,
    currency: String,
    paymentStatus: String
  },
  // Order-level special message (optional, kept for gift messages)
  message:{ type: String, maxlength: 4000 },
  // Delivery scheduling
  deliveryDate: { type: Date, required: true },
  deliveryTimeSlot: { type: String, enum: ['morning', 'afternoon', 'evening', 'midnight'], required: true },
  deliveryType: { type: String, enum: ['standard', 'same-day', 'midnight'], default: 'standard' },
  deliveryCharges: { type: Number, default: 0 },
  // Customer rating and feedback
  rating:{ type: Number, min: 1, max: 5 },
  feedback:{ type: String, maxlength: 1000 },
  ratingAt:{ type: Date },
  // Gift Add-Ons (optional items to enhance the gift)
  addOns:[{ product:{type:mongoose.Schema.Types.ObjectId, ref:'Product'}, name:String, price:Number }]
},{timestamps:true});
module.exports = mongoose.model('Order', OrderSchema);