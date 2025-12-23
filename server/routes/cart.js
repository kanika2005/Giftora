const router = require('express').Router();
const auth = require('../middlewares/auth');
const Cart = require('../models/Cart');

function wordCount(s){ if(!s) return 0; return String(s).trim().split(/\s+/).filter(Boolean).length; }

router.get('/', auth, async (req,res)=>{
  if(req.user?.isAdmin) return res.status(403).json({message: 'Admins cannot have a customer cart'});
  let cart = await Cart.findOne({user:req.user.id}).populate('items.product');
  if(!cart) cart = await new Cart({user:req.user.id, items:[]}).save();
  // remove null product entries (product deleted)
  cart.items = cart.items.filter(i => i.product);
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});

router.post('/add', auth, async (req,res)=>{
  if(req.user?.isAdmin) return res.status(403).json({message: 'Admins cannot add items to cart'});
  const {productId, qty, giftWrapping, personalization} = req.body;

  let cart = await Cart.findOne({user:req.user.id});
  if(!cart) cart = new Cart({user:req.user.id, items:[]});
  const idx = cart.items.findIndex(i=>i.product.toString() === productId);
  if(idx>-1){
    cart.items[idx].qty = qty;
    if(giftWrapping !== undefined) cart.items[idx].giftWrapping = giftWrapping;
    if(personalization) cart.items[idx].personalization = personalization;
    if(qty<=0) cart.items.splice(idx,1);
  } else {
    const newItem = {product: productId, qty};
    if(giftWrapping) newItem.giftWrapping = giftWrapping;
    if(personalization) newItem.personalization = personalization;
    cart.items.push(newItem);
  }
  await cart.save();
  cart = await cart.populate('items.product');
  res.json(cart);
});

module.exports = router;