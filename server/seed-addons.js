const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const addOns = [
  {
    title: 'Greeting Card',
    description: 'Beautiful handcrafted greeting card with your message',
    price: 49,
    image: '/images/greeting-card.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 500
  },
  {
    title: 'Premium Chocolate',
    description: 'Delicious Cadbury Dairy Milk chocolate bar',
    price: 99,
    image: '/images/chocolate.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 300
  },
  {
    title: 'Scented Candle',
    description: 'Aromatic lavender scented candle',
    price: 149,
    image: '/images/candle.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 200
  },
  {
    title: 'Gift Wrapping',
    description: 'Premium gift wrapping with ribbon and bow',
    price: 79,
    image: '/images/gift-wrap.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 1000
  },
  {
    title: 'Mini Teddy Bear',
    description: 'Cute mini teddy bear (6 inches)',
    price: 199,
    image: '/images/teddy.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 150
  },
  {
    title: 'Fresh Flowers',
    description: 'Small bouquet of fresh seasonal flowers',
    price: 249,
    image: '/images/flowers.jpg',
    category: 'Add-Ons',
    isAddOn: true,
    stock: 100
  }
];

async function seedAddOns() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/party_shop');
    console.log('Connected to MongoDB');

    // Remove existing add-ons
    await Product.deleteMany({ isAddOn: true });
    console.log('Removed existing add-ons');

    // Insert new add-ons
    await Product.insertMany(addOns);
    console.log('✅ Successfully seeded gift add-ons!');
    
    console.log('\nAdded the following add-ons:');
    addOns.forEach(addon => {
      console.log(`- ${addon.title} (₹${addon.price})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding add-ons:', error);
    process.exit(1);
  }
}

seedAddOns();
