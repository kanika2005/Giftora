import React, { useState, useEffect } from 'react';
import API from '../api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import Spinner from '../components/Spinner';

export default function GiftRegistryDetails() {
  const { id } = useParams();
  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => {
    fetchRegistry();
    fetchProducts();
  }, [id]);

  const fetchRegistry = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await API.get(`/gift-registry/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistry(res.data);
    } catch (error) {
      show(error.response?.data?.message || 'Error loading registry', { type: 'error' });
      navigate('/gift-registry');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addItemToRegistry = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await API.post(`/gift-registry/${id}/items`, { productId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Item added to registry', { type: 'success' });
      setShowAddProduct(false);
      fetchRegistry();
    } catch (error) {
      show(error.response?.data?.message || 'Error adding item', { type: 'error' });
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item from registry?')) return;

    const token = localStorage.getItem('token');
    try {
      await API.delete(`/gift-registry/${id}/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Item removed', { type: 'success' });
      fetchRegistry();
    } catch (error) {
      show(error.response?.data?.message || 'Error removing item', { type: 'error' });
    }
  };

  const markAsPurchased = async (itemId) => {
    const token = localStorage.getItem('token');
    try {
      await API.put(`/gift-registry/${id}/items/${itemId}/purchase`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Marked as purchased', { type: 'success' });
      fetchRegistry();
    } catch (error) {
      show(error.response?.data?.message || 'Error updating item', { type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={48} />
      </div>
    );
  }

  if (!registry) return null;

  const isOwner = registry.user && JSON.parse(localStorage.getItem('user') || '{}')._id === registry.user._id;

  return (
    <div>
      <Link to="/gift-registry" className="text-pink-600 mb-4 inline-block">← Back to Registries</Link>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{registry.eventName}</h2>
            <div className="flex gap-2 mb-2">
              <span className="text-sm px-2 py-1 bg-pink-100 text-pink-800 rounded">
                {registry.eventType}
              </span>
              <span className={`text-sm px-2 py-1 rounded ${
                registry.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {registry.status}
              </span>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2 rounded btn-igp text-sm"
            >
              Add Products
            </button>
          )}
        </div>

        <p className="text-gray-600 mb-2">
          <strong>Event Date:</strong> {new Date(registry.eventDate).toLocaleDateString()}
        </p>

        {registry.description && (
          <p className="text-gray-600 mb-4">{registry.description}</p>
        )}

        {registry.isPublic && (
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-700">
              <strong>Share Code:</strong> {registry.shareCode}
            </p>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold mb-4">Registry Items ({registry.items.length})</h3>

      {registry.items.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-gray-600">No items added yet</p>
          {isOwner && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="mt-4 px-6 py-2 rounded btn-igp"
            >
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registry.items.map((item) => (
            <div key={item._id} className={`border rounded-lg p-4 ${item.isPurchased ? 'opacity-60' : ''}`}>
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
              <p className="text-lg font-bold mb-2">₹{(item.product.price || 0).toFixed(0)}</p>
              <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>

              {item.isPurchased ? (
                <div className="text-green-600 font-semibold text-sm mb-2">
                  ✓ Purchased {item.purchasedAt && `on ${new Date(item.purchasedAt).toLocaleDateString()}`}
                </div>
              ) : (
                <div className="flex gap-2">
                  {!isOwner && (
                    <button
                      onClick={() => markAsPurchased(item._id)}
                      className="flex-1 px-4 py-2 rounded btn-igp text-sm"
                    >
                      Mark as Purchased
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => removeItem(item._id)}
                      className="flex-1 px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-50 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}

              {item.notes && (
                <p className="text-sm text-gray-500 mt-2 italic">{item.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add Products to Registry</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter(p => !p.isAddOn).map((product) => {
                const alreadyAdded = registry.items.some(i => i.product._id === product._id);
                return (
                  <div key={product._id} className="border rounded p-3">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-32 object-contain mb-2"
                    />
                    <h4 className="font-semibold text-sm mb-1">{product.title}</h4>
                    <p className="text-sm font-bold mb-2">₹{(product.price || 0).toFixed(0)}</p>
                    <button
                      onClick={() => addItemToRegistry(product._id)}
                      disabled={alreadyAdded}
                      className={`w-full px-3 py-1 rounded text-sm ${
                        alreadyAdded
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'btn-igp'
                      }`}
                    >
                      {alreadyAdded ? 'Already Added' : 'Add to Registry'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
