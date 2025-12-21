/**
 * Database initialization script
 * 
 * This file has been modified to remove seed data.
 * Products should be added through the admin interface.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_party_shop';

mongoose.connect(MONGODB_URI).then(async ()=>{
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@thepartyshop.com';
  let admin = await User.findOne({email: adminEmail});
  if(!admin){
    const hash = await bcrypt.hash('admin123', 10);
    admin = new User({name:'Admin', email:adminEmail, password:hash, isAdmin:true});
    await admin.save();
    console.log('Created admin user ->', adminEmail, 'password: admin123');
  }
  
  console.log('Database initialization complete');
  process.exit(0);
}).catch(e=>{ console.error(e); process.exit(1); });