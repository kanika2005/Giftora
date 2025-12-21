import React, {useState, useEffect} from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import AdminOrders from './pages/AdminOrders';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { UserProvider, useUser } from './context/UserContext';

function Navbar({cartCount}){
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useUser();

  return (
    <header className="bg-white border-b border-soft">
      <div className="max-w-6xl mx-auto flex items-center gap-4 p-4">
        <div className="flex items-center gap-4 flex-1">
          <Link to="/" className="text-2xl font-bold text-gray-800">Giftora🎁</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:underline">Home</Link>
          {!isAdmin && <Link to="/cart" className="text-gray-600 hover:underline">Cart{cartCount>0 && <span className="ml-1 px-2 rounded" style={{background:'var(--soft-pink)',color:'var(--igp-pink)'}}>{cartCount}</span>}</Link>}
          {user && !isAdmin && <Link to="/orders" className="text-gray-600 hover:underline">My Orders</Link>}
          {user && isAdmin && <Link to="/admin" className="text-gray-600 px-3 py-1 rounded">Admin Panel</Link>}
          {user && isAdmin && <Link to="/admin-orders" className="text-gray-600 px-3 py-1 rounded">Orders</Link>}
          {user ? (
            <>
              <span className="px-2 text-gray-700">Hi, {user.name}</span>
              <button onClick={logout} className="px-3 py-1 rounded" style={{background:'var(--soft-pink)', color:'var(--igp-pink)'}}>Logout</button>
            </>
          ):(
            <>
              <Link to="/login" className="px-3 py-1 rounded" style={{background:'var(--soft-pink)', color:'var(--igp-pink)'}}>Login</Link>
              <Link to="/signup" className="px-3 py-1 rounded" style={{background:'var(--soft-pink)', color:'var(--igp-pink)'}}>Signup</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AppContent(){
  const { user } = useUser();
  const [cartCount, setCartCount] = useState(0);

  useEffect(()=>{
    const fetchCartCount = async ()=>{
      const token = localStorage.getItem('token');
      if(!token) { setCartCount(0); return; }
      try{
        const API = (await import('./api')).default;
        const r = await API.get('/cart', { headers: { Authorization: 'Bearer '+token } });
        const items = r.data?.items || [];
        const count = items.reduce((s,it)=>s + (it?.qty||0), 0);
        setCartCount(count);
      }catch(e){ console.error('Cart count fetch failed', e); setCartCount(0); }
    };
    fetchCartCount();
  }, [user]);

  return (
    <div>
      <Navbar cartCount={cartCount} />
      <main className="max-w-6xl mx-auto p-6 bg-[#ffffff]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin-orders" element={<AdminOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>
      <footer className="text-center py-6 text-gray-600">© {new Date().getFullYear()} Giftora</footer>
    </div>
  );
}

export default function App(){
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}