const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    
  rating:{ type: Number, min: 1, max: 5 },
  feedback:{ type: String, maxlength: 1000 },
  ratingAt:{ type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
