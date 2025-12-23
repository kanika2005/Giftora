import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import Spinner from '../components/Spinner';

export default function GiftRegistry() {
  const [registries, setRegistries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'birthday',
    eventDate: '',
    description: '',
    isPublic: true
  });
  const navigate = useNavigate();
  const { show } = useToast();

  useEffect(() => {
    fetchRegistries();
  }, []);

  const fetchRegistries = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await API.get('/gift-registry', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistries(res.data);
    } catch (error) {
      show(error.response?.data?.message || 'Error loading registries', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createRegistry = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      await API.post('/gift-registry', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Registry created successfully!', { type: 'success' });
      setShowCreateModal(false);
      setFormData({
        eventName: '',
        eventType: 'birthday',
        eventDate: '',
        description: '',
        isPublic: true
      });
      fetchRegistries();
    } catch (error) {
      show(error.response?.data?.message || 'Error creating registry', { type: 'error' });
    }
  };

  const deleteRegistry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registry?')) return;

    const token = localStorage.getItem('token');
    try {
      await API.delete(`/gift-registry/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      show('Registry deleted', { type: 'success' });
      fetchRegistries();
    } catch (error) {
      show(error.response?.data?.message || 'Error deleting registry', { type: 'error' });
    }
  };

  const copyShareLink = (shareCode) => {
    const link = `${window.location.origin}/registry/${shareCode}`;
    navigator.clipboard.writeText(link);
    show('Share link copied to clipboard!', { type: 'success' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Gift Registries</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded btn-igp"
        >
          Create New Registry
        </button>
      </div>

      {registries.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Gift Registries Yet</h3>
          <p className="text-gray-600 mb-4">Create a registry for your special event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registries.map((registry) => (
            <div key={registry._id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{registry.eventName}</h3>
                  <span className="text-sm px-2 py-1 bg-pink-100 text-pink-800 rounded">
                    {registry.eventType}
                  </span>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  registry.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {registry.status}
                </span>
              </div>

              <p className="text-gray-600 mb-2">
                <strong>Date:</strong> {new Date(registry.eventDate).toLocaleDateString()}
              </p>
              
              {registry.description && (
                <p className="text-gray-600 mb-4 text-sm">{registry.description}</p>
              )}

              <p className="text-sm text-gray-500 mb-4">
                {registry.items.length} items • {registry.items.filter(i => i.isPurchased).length} purchased
              </p>

              <div className="flex gap-2 mb-3">
                <Link
                  to={`/gift-registry/${registry._id}`}
                  className="flex-1 px-4 py-2 rounded btn-igp text-center text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => deleteRegistry(registry._id)}
                  className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-50 text-sm"
                >
                  Delete
                </button>
              </div>

              {registry.isPublic && (
                <button
                  onClick={() => copyShareLink(registry.shareCode)}
                  className="w-full px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  Copy Share Link ({registry.shareCode})
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Registry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Create New Gift Registry</h3>
            <form onSubmit={createRegistry}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Name *</label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., Sarah's Birthday"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Type *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="baby-shower">Baby Shower</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="graduation">Graduation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Event Date *</label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="Optional description..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Make this registry publicly shareable</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded btn-igp"
                >
                  Create Registry
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
