const router = require('express').Router();
const auth = require('../middlewares/auth');
const Wishlist = require('../models/Wishlist');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId; // prefer req.user.id set by auth middleware
    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const userId = req.user?.id || req.userId;
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    // Check if product already exists in wishlist
    const existingItem = wishlist.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.items.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('items.product');

    res.json({ message: 'Added to wishlist', wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const userId = req.user?.id || req.userId;
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('items.product');

    res.json({ message: 'Removed from wishlist', wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear entire wishlist
router.delete('/clear', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({ message: 'Wishlist cleared', wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
