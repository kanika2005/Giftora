const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', [
  body('name').isLength({min:2}).withMessage('Name too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({min:6}).withMessage('Password must be at least 6 chars')
], async (req,res)=>{
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    const {name,email,password} = req.body;
    if(await User.findOne({email})) return res.status(400).json({message:'User exists'});
    const hash = await bcrypt.hash(password,10);
    const user = await new User({name,email,password:hash}).save();
    const token = jwt.sign({id:user._id,email:user.email}, JWT_SECRET, {expiresIn:'7d'});
    res.json({user:{id:user._id,name:user.name,email:user.email,isAdmin:user.isAdmin}, token});
  }catch(e){ res.status(500).json({message:e.message}); }
});

router.post('/login', [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').exists().withMessage('Password required')
], async (req,res)=>{
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:'Invalid credentials'});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({message:'Invalid credentials'});
    const token = jwt.sign({id:user._id,email:user.email}, JWT_SECRET, {expiresIn:'7d'});
    res.json({user:{id:user._id,name:user.name,email:user.email,isAdmin:user.isAdmin}, token});
  }catch(e){ res.status(500).json({message:e.message}); }
});

module.exports = router;