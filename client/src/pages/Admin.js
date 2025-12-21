import React, { useEffect, useState } from 'react';
import API from '../api';
import { useToast } from '../components/ToastProvider';

export default function Admin() {
  const { show } = useToast();
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: 0, image: '/images/balloons.jpeg', category: 'decor', stock: 100 });
  const token = localStorage.getItem('token');

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const r = await API.get('/admin/products', { headers: { Authorization: 'Bearer ' + token } });
      setProducts(r.data);
    } catch (e) { console.error(e); }
  };

  const startAdd = () => { setEditing(null); setForm({ title: '', description: '', price: 0, image: '/images/balloons.jpeg', category: 'decor', stock: 100 }); }

  const submit = async () => {
    try {
      if (editing) {
        await API.put('/admin/products/' + editing._id, form, { headers: { Authorization: 'Bearer ' + token } });
        show('Updated', { type: 'success' });
      } else {
        await API.post('/admin/products', form, { headers: { Authorization: 'Bearer ' + token } });
        show('Created', { type: 'success' });
      }
      fetchProducts();
    } catch (e) { show(e.response?.data?.message || 'Error', { type: 'error' }); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await API.delete('/admin/products/' + id, { headers: { Authorization: 'Bearer ' + token } });
    fetchProducts();
  };

  const edit = (p) => { setEditing(p); setForm({ title: p.title, description: p.description, price: p.price, image: p.image, category: p.category, stock: p.stock }); window.scrollTo(0, 0); }

  return (
    <div>
      <div className="card p-4 mb-6">
        <h2 className="text-xl font-semibold">{editing ? 'Edit Product' : 'Add Product'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="border p-2 rounded" placeholder="Title" />
          <input value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="border p-2 rounded" placeholder="Price" />
          <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border p-2 rounded" placeholder="Category" />
          <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="border p-2 rounded" placeholder="Image URL" />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border p-2 rounded col-span-2" placeholder="Description" />
          <input value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="border p-2 rounded" placeholder="Stock" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={submit} className="bg-pink-500 text-white px-4 py-2 rounded">{editing ? 'Update' : 'Create'}</button>
          <button onClick={startAdd} className="px-4 py-2 border rounded">New</button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3">Products</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {products.map(p => (
            <div key={p._id} className="flex gap-3 items-center border rounded p-3">
              <img src={p.image} alt="" className="w-24 h-24 object-contain" />
              <div className="flex-1">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-500">₹{p.price} · {p.category}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => edit(p)} className="px-3 py-1 bg-yellow-300 rounded">Edit</button>
                <button onClick={() => del(p._id)} className="px-3 py-1 bg-red-400 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}