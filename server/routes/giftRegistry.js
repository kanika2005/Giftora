const router = require('express').Router();
const auth = require('../middlewares/auth');
const GiftRegistry = require('../models/GiftRegistry');

// Get all user's gift registries
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registries = await GiftRegistry.find({ user: userId })
      .populate('items.product')
      .sort('-createdAt');
    res.json(registries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific registry by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registry = await GiftRegistry.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'name email');
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    // Allow access if user owns it or if it's public
    if (registry.user._id.toString() !== userId && !registry.isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(registry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get registry by share code (public access)
router.get('/share/:shareCode', async (req, res) => {
  try {
    const registry = await GiftRegistry.findOne({ 
      shareCode: req.params.shareCode.toUpperCase(),
      isPublic: true 
    })
      .populate('items.product')
      .populate('user', 'name email');
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found or not public' });
    }

    res.json(registry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new gift registry
router.post('/', auth, async (req, res) => {
  try {
    const { eventName, eventType, eventDate, description, isPublic } = req.body;

    const userId = req.user?.id || req.userId;

    if (!eventName || !eventType || !eventDate) {
      return res.status(400).json({ message: 'Event name, type, and date are required' });
    }

    const registry = await GiftRegistry.create({
      user: userId,
      eventName,
      eventType,
      eventDate,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      items: []
    });

    res.status(201).json({ message: 'Registry created', registry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update registry details
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registry = await GiftRegistry.findById(req.params.id);
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    if (registry.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { eventName, eventType, eventDate, description, isPublic, status } = req.body;
    
    if (eventName) registry.eventName = eventName;
    if (eventType) registry.eventType = eventType;
    if (eventDate) registry.eventDate = eventDate;
    if (description !== undefined) registry.description = description;
    if (isPublic !== undefined) registry.isPublic = isPublic;
    if (status) registry.status = status;

    await registry.save();
    await registry.populate('items.product');

    res.json({ message: 'Registry updated', registry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to registry
router.post('/:id/items', auth, async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;

    const userId = req.user?.id || req.userId;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const registry = await GiftRegistry.findById(req.params.id);
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    if (registry.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if product already exists
    const existingItem = registry.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      return res.status(400).json({ message: 'Product already in registry' });
    }

    registry.items.push({ 
      product: productId,
      quantity: quantity || 1,
      notes: notes || ''
    });

    await registry.save();
    await registry.populate('items.product');

    res.json({ message: 'Item added to registry', registry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from registry
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registry = await GiftRegistry.findById(req.params.id);
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    if (registry.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    registry.items = registry.items.filter(item => item._id.toString() !== req.params.itemId);
    await registry.save();
    await registry.populate('items.product');

    res.json({ message: 'Item removed from registry', registry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark item as purchased (anyone can do this for public registries)
router.put('/:id/items/:itemId/purchase', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registry = await GiftRegistry.findById(req.params.id);
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    if (!registry.isPublic && registry.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const item = registry.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.isPurchased = true;
    item.purchasedBy = userId;
    item.purchasedAt = new Date();

    await registry.save();
    await registry.populate('items.product');

    res.json({ message: 'Item marked as purchased', registry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete registry
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const registry = await GiftRegistry.findById(req.params.id);
    
    if (!registry) {
      return res.status(404).json({ message: 'Registry not found' });
    }

    if (registry.user.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await GiftRegistry.findByIdAndDelete(req.params.id);

    res.json({ message: 'Registry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
