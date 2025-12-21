const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  phone: { type: String, unique: true, sparse: true }, // v2: for mobile login
  walletBalance: { type: Number, default: 0 },         // v2: for refunds/rewards
  savedAddresses: [{                                   // v2: address management
    label: String, // e.g., "Home", "Office"
    name: String,
    address: String,
    city: String,
    postalCode: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
