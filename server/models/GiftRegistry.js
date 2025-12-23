const mongoose = require('mongoose');

const GiftRegistrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventName: { type: String, required: true }, // e.g., "Sarah's Birthday", "John & Jane's Wedding"
  eventType: { type: String, enum: ['birthday', 'wedding', 'baby-shower', 'anniversary', 'graduation', 'other'], required: true },
  eventDate: { type: Date, required: true },
  description: { type: String, maxlength: 1000 },
  isPublic: { type: Boolean, default: true }, // Whether the registry is publicly shareable
  shareCode: { type: String, unique: true, sparse: true }, // Unique code to share the registry
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    isPurchased: { type: Boolean, default: false },
    purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purchasedAt: { type: Date },
    notes: { type: String, maxlength: 500 }
  }],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

// Generate a unique share code before saving
GiftRegistrySchema.pre('save', function(next) {
  if (!this.shareCode) {
    this.shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('GiftRegistry', GiftRegistrySchema);
