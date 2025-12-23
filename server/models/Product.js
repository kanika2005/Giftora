const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  image:String,
  category:String,
  stock:{type:Number, default:100},
  // Flag to identify if this product is a gift add-on
  isAddOn:{type:Boolean, default:false},
  // Gift wrapping and personalization options
  giftOptions: {
    allowsWrapping: { type: Boolean, default: true },
    wrappingPrice: { type: Number, default: 5 },
    allowsPersonalization: { type: Boolean, default: false },
    personalizationTypes: [{ type: String, enum: ['message', 'engraving', 'custom-text'] }],
    personalizationPrice: { type: Number, default: 10 }
  }
},{timestamps:true});
module.exports = mongoose.model('Product', ProductSchema);