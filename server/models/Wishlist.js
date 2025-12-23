const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Ensure a user only has one wishlist
WishlistSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
