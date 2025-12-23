const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
  items:[{ 
    product:{type:mongoose.Schema.Types.ObjectId, ref:'Product'}, 
    qty:Number,
    // Gift options for this cart item
    giftWrapping: { type: Boolean, default: false },
    personalization: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ['message', 'engraving', 'custom-text'] },
      text: { type: String, maxlength: 200 }
    }
  }]
},{timestamps:true});
module.exports = mongoose.model('Cart', CartSchema);