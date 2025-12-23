import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import Spinner from '../components/Spinner';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await API.get('/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data);
    } catch (error) {
      show(error.response?.data?.message || 'Error loading wishlist', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await API.delete(`/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(res.data.wishlist);
      show('Removed from wishlist', { type: 'success' });
    } catch (error) {
      show(error.response?.data?.message || 'Error removing item', { type: 'error' });
    }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await API.post('/cart/add', { productId, qty: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Added to cart', { type: 'success' });
    } catch (error) {
      show(error.response?.data?.message || 'Error adding to cart', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={48} />
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
        <p className="text-gray-600 mb-6">Start adding products you love!</p>
        <Link to="/" className="px-6 py-2 rounded btn-igp inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <span className="text-gray-600">{wishlist.items.length} items</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.items.map((item) => (
          <div key={item._id} className="border rounded-lg p-4 hover:shadow-lg transition">
            <Link to={`/products/${item.product._id}`}>
              <img
                src={item.product.image}
                alt={item.product.title}
                className="w-full h-48 object-contain mb-4"
              />
              <h3 className="font-semibold mb-2 hover:text-pink-600 transition">
                {item.product.title}
              </h3>
            </Link>
            <p className="text-xl font-bold mb-4">₹{(item.product.price || 0).toFixed(0)}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => addToCart(item.product._id)}
                className="flex-1 px-4 py-2 rounded btn-igp text-sm"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(item.product._id)}
                className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-50 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
