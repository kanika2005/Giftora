The Party Shop - MERN (v1)
--------------------------

A full-stack MERN e-commerce app (The Party Shop) with:
- User auth (signup/login)
- Products, Cart
- Checkout (Cash on Delivery)
- Orders (user + admin)
- Admin panel (manage products & orders)
- Tailwind via CDN for styling
- Seed script to populate sample data

Server:
cd server
npm install
cp .env.example .env
# edit .env if needed (MONGODB_URI, JWT_SECRET)
npm run seed
npm run dev

Client:
cd client
npm install
npm start

MongoDB connection (for MongoDB Compass):
mongodb://localhost:27017/the_party_shop
Admin account: admin@thepartyshop.com / admin123
Test user: user@thepartyshop.com / user123# Giftora-
