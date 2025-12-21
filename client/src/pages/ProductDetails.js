import React, { useEffect, useState } from 'react';
import API from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../context/UserContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);


  const navigate = useNavigate();
  const { show } = useToast();
  const { user, isAdmin } = useUser();

  useEffect(() => {
    API.get('/products/' + id).then(r => setProduct(r.data)).catch(e => console.error(e));
    fetchReviews();
  }, [id]);

  const fetchReviews = () => {
    API.get(`/products/${id}/reviews`).then(r => setReviews(r.data)).catch(e => console.error(e));
  };

  const addToCart = async () => {
    const userStored = JSON.parse(localStorage.getItem('user') || 'null');
    if (userStored?.isAdmin) {
      show('Admin accounts cannot add items to cart. Use the Admin panel to manage products.', { type: 'info' });
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { return navigate('/login'); }



    try {
      await API.post('/cart/add', { productId: id, qty: 1 }, { headers: { Authorization: 'Bearer ' + token } });
      show('Added to cart', { type: 'success' });
      navigate('/cart');
    } catch (e) {
      show(e.response?.data?.message || 'Error adding to cart', { type: 'error' });
    }
  }; 

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await API.post(`/products/${id}/reviews`, { rating, comment }, {
        headers: { Authorization: 'Bearer ' + token }
      });
      setComment('');
      setRating(5);
      show('Review submitted!', { type: 'success' });
      fetchReviews();
    } catch (e) {
      show(e.response?.data?.message || 'Failed to submit review', { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!product) return <div className="flex items-center justify-center py-12"><Spinner size={48} /></div>;

  const averageRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="md:col-span-1">
          <img src={product.image} alt={product.title || 'product image'} className="w-full h-80 object-contain" />
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500 font-bold text-xl">★ {averageRating}</span>
            <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
          </div>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="text-2xl font-semibold mb-4">₹{product.price.toFixed(0)}</div>

          {!isAdmin ? (
            <button onClick={addToCart} className="px-4 py-2 rounded btn-igp">Add to cart</button>
          ) : (
            <div className="text-sm text-gray-500">Admin accounts cannot add items to cart</div>
          )}
        </div>
      </div>

      <div className="max-w-3xl">
        <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>

        {/* Review Form */}
        {user && !isAdmin && (
          <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-3">Write a Review</h4>
            <div className="mb-3">
              <label className="block text-sm mb-1">Rating</label>
              <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border p-2 rounded">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Comment</label>
              <textarea
                required
                className="w-full border p-2 rounded"
                rows="3"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
              ></textarea>
            </div>
            <button disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="border-b pb-4">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold">{r.user?.name || 'Anonymous'}</div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-yellow-500 text-sm mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p className="text-gray-700">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}