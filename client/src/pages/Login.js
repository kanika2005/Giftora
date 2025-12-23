import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../context/UserContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { show } = useToast();
  const { login } = useUser();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', r.data.token);
      login(r.data.user);
      navigate('/');
    } catch (e) {
      show(e.response?.data?.message || 'Login failed', { type: 'error' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT – IMAGE / BRAND */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-green-100 to-pink-100 p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎁</span>
            <span className="text-2xl font-bold">Giftora</span>
          </div>
          <p className="text-gray-600 text-center mb-6">
            Welcome back!  
            Sign in to continue spreading joy 💝
          </p>
          <img
            src="https://i.pinimg.com/1200x/cb/d0/49/cbd0498f330cb2ff45867cf7cce229d5.jpg"
            alt="Gift illustration"
            className="w-64 object-contain"
          />
        </div>

        {/* RIGHT – LOGIN FORM */}
        <div className="p-8 md:p-10">
          <h2 className="text-2xl font-semibold mb-2">Login</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your credentials to access your account
          </p>

          <form onSubmit={submit} className="space-y-4">
            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium transition">
              Login
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-600">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-pink-600 font-medium hover:underline">
              Signup
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
