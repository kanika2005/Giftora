const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const app = express();

// SECURITY: use helmet for secure headers
app.use(helmet());

// Restrict CORS to the client origin in production
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: CLIENT_ORIGIN }));

// Rate limiter for authentication endpoints to mitigate brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Fail fast when critical environment variables are missing in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set in environment');
    process.exit(1);
  } else {
    console.warn('Warning: JWT_SECRET not set — using a temporary development secret.');
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  }
}

app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_party_shop';
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB connected')).catch(e => console.error(e));
}

// Apply auth rate limiter to auth routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/admin/products', require('./routes/adminProducts'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin/orders', require('./routes/adminOrders'));

// Basic health-check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

const PORT = process.env.PORT || 5000;
// Only listen if the file is executed directly (not when imported by Vercel)
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log('Server running on port', PORT));
}

module.exports = app;