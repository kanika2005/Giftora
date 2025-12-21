const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secretjwt';
const User = require('../models/User');

module.exports = async function(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({message:'No token'});
  const token = auth.split(' ')[1];
  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    // attach minimal user info, including role, by fetching from DB
    const user = await User.findById(decoded.id).select('isAdmin email');
    if(!user) return res.status(401).json({message:'Invalid token'});
    req.user = { id: decoded.id, email: decoded.email, isAdmin: user.isAdmin };
    next();
  }catch(e){ res.status(401).json({message:'Invalid token'}); }
}