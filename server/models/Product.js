const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  title:String,
  description:String,
  price:Number,
  image:String,
  category:String,
  stock:{type:Number, default:100},
  // Flag to identify if this product is a gift add-on
  isAddOn:{type:Boolean, default:false}
},{timestamps:true});
module.exports = mongoose.model('Product', ProductSchema);