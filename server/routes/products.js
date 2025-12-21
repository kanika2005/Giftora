const router = require('express').Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const auth = require('../middlewares/auth');

router.get('/', async (req, res) => {
  const q = req.query.q;
  const filter = q ? { title: { $regex: q, $options: 'i' } } : {};
  const products = await Product.find(filter);
  res.json(products);
});

// Get all gift add-ons
router.get('/add-ons/list', async (req, res) => {
  try {
    const addOns = await Product.find({ isAddOn: true });
    res.json(addOns);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = new Review({
      user: req.user._id,
      product: req.params.id,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

module.exports = router;