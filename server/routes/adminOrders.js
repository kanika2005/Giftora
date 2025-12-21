const router = require('express').Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const Order = require('../models/Order');

router.get('/', auth, admin, async (req,res)=>{
  const orders = await Order.find({}).populate('user').sort({createdAt:-1});
  res.json(orders);
});

router.put('/:id', auth, admin, async (req,res)=>{
  const {status} = req.body;
  const o = await Order.findByIdAndUpdate(req.params.id, {status}, {new:true});
  res.json(o);
});

module.exports = router;