const router = require('express').Router();
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const Product = require('../models/Product');

router.get('/', auth, admin, async (req,res)=>{
  const products = await Product.find({});
  res.json(products);
});

router.post('/', auth, admin, async (req,res)=>{
  const {title, description, price, image, category, stock} = req.body;
  const p = new Product({title, description, price, image, category, stock});
  await p.save();
  res.json(p);
});

router.put('/:id', auth, admin, async (req,res)=>{
  const fields = (({title,description,price,image,category,stock})=>({title,description,price,image,category,stock}))(req.body);
  const p = await Product.findByIdAndUpdate(req.params.id, fields, {new:true});
  if(!p) return res.status(404).json({message:'Not found'});
  res.json(p);
});

router.delete('/:id', auth, admin, async (req,res)=>{
  await Product.findByIdAndDelete(req.params.id);
  res.json({message:'deleted'});
});

module.exports = router;