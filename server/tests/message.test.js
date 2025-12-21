process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Mock auth middleware to attach a test user
jest.mock('../middlewares/auth', () => (req, res, next) => { req.user = { id: '507f1f77bcf86cd799439011', isAdmin: false }; next(); });

afterEach(()=>{ jest.restoreAllMocks(); });

test('adding to cart with per-item message is ignored (single order message only)', async () => {
  // Mock Cart.findOne to return null so save is called
  const savedCart = { _id: 'c2', user: 'u1', items: [{ product: 'p1', qty: 1 }], populate: async function(){ return this; } };
  jest.spyOn(Cart, 'findOne').mockResolvedValue(null);
  jest.spyOn(Cart.prototype, 'save').mockImplementation(function(){ return Promise.resolve(savedCart); });

  const res = await request(app).post('/api/cart/add').send({ productId: 'p1', qty: 1, message: 'This should be ignored' });
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.items)).toBeTruthy();
  expect(res.body.items[0].message).toBeUndefined();
});

test('rejects order message longer than 250 chars', async () => {
  const long = 'x'.repeat(251);
  const cartObj = { _id: 'c1', user: 'u1', items: [{ product: { _id: 'p1', title: 'P', price: 100 }, qty: 1 }], save: async ()=>{} };
  cartObj.populate = async function(){ return this; };
  jest.spyOn(Cart, 'findOne').mockResolvedValue(cartObj);
  const res = await request(app).post('/api/orders').send({ shipping: { name:'A', address:'B', city:'C', postalCode:'1', phone:'1'}, paymentMethod: 'COD', message: long });
  expect(res.status).toBe(400);
  expect(res.body.message).toMatch(/250/);
});

test('accepts order-level message and persists to saved order', async () => {
  const msg = 'Happy birthday!';
  // Mock Cart.findOne to return a cart with one item
  const cartObj = { _id: 'c1', user: 'u1', items: [{ product: { _id: 'p1', title: 'P', price: 100 }, qty: 1 }], save: async ()=>{} };
  cartObj.populate = async function(){ return this; };
  jest.spyOn(Cart, 'findOne').mockResolvedValue(cartObj);
  // Mock Order.prototype.save to return saved order
  jest.spyOn(Order.prototype, 'save').mockImplementation(function(){ return Promise.resolve(Object.assign({_id:'o1'}, this)); });

  const res = await request(app).post('/api/orders').send({ shipping: { name:'A', address:'B', city:'C', postalCode:'1', phone:'1'}, paymentMethod: 'COD', message: msg });
  if(res.status !== 200){ console.error('ORDER CREATE ERROR BODY:', res.body); }
  expect(res.status).toBe(200);
  expect(res.body.message).toBe(msg);
});
