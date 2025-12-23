import React, {useEffect, useState} from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../context/UserContext';

export default function Home(){
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const { show } = useToast();
  const { isAdmin } = useUser();
  const productsRef = React.useRef(null);

  useEffect(()=>{
    setLoading(true);
    API.get('/products').then(r=>{
      setProducts(r.data);
      setLoading(false);
    }).catch(e=>{
      console.error(e);
      setLoading(false);
    });
  },[]);

  const handleAddToCart = async (productId) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if(user?.isAdmin){
      show('Admin accounts cannot add items to cart. Use the Admin panel to manage products.', { type: 'info' });
      return;
    }
    if(!token){
      navigate('/signup');
      return;
    }
    try{
      setAddingToCart(productId);
      await API.post('/cart/add', {productId, qty:1}, {headers:{Authorization:'Bearer '+token}});
      show('Added to cart!', { type: 'success' });
    }catch(e){
      show(e.response?.data?.message || 'Error adding to cart', { type: 'error' });
    }finally{
      setAddingToCart(null);
    }
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const categories = ['All', ...new Set(products.map(p=>p.category||'Other'))];
  const filteredProducts = selectedCategory==='All' ? products : products.filter(p=>p.category===selectedCategory);

  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="hero-banner relative bg-soft-pink overflow-hidden mb-8 rounded-lg" style={{backgroundImage:'linear-gradient(135deg, var(--soft-pink) 0%, rgba(230,0,92,0.1) 100%)'}}>
        <div className="max-w-6xl mx-auto flex items-center gap-8 py-16 px-6">
          <div className="flex-1">
            <h1 className="hero-title text-5xl font-bold mb-2" style={{color:'var(--text-dark)'}}>Make Every Moment Unforgettable 💝</h1>
            <p className="hero-sub text-lg mb-6" style={{color:'var(--text-light)'}}>Cakes, bouquets, surprises, and party essentials — everything you need to make someone smile.</p>
            <button onClick={scrollToProducts} className="px-6 py-3 rounded-full font-semibold" style={{background:'#5F6F52', color:'white'}}>Shop Now</button>
          </div>
          {/* Hero image collage */}
<div className="hidden md:flex flex-1 items-center justify-center">
  <div className="hero-images">
    {/* decorative rectangular backgrounds */}
    <div className="rect rect-large" aria-hidden="true" />
    <div className="rect rect-small" aria-hidden="true" />

    {/* cropped photos as rectangles (use same image with different crop) */}
    <div
      className="photo photo-main"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/77/e4/81/77e48104ff0473d49f39134243a01640.jpg')", backgroundPosition: 'center 18%' }}
      aria-hidden="true"
    />
    <div
      className="photo photo-small"
      style={{ backgroundImage: "url('https://i.pinimg.com/736x/06/b2/08/06b208aec23f1b6302a0b348567d122b.jpg')", backgroundPosition: 'center 70%' }}
      aria-hidden="true"
    />
  </div>
</div>

        </div>
      </section>

      {/* Category Filter Tabs */}
      <div className="mb-8 border-b border-soft">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.map(cat=>(
            <button
              key={cat}
              onClick={()=>setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                selectedCategory===cat
                  ? 'text-white'
                  : 'border border-soft text-gray-700 hover:bg-gray-50'
              }`}
              style={selectedCategory===cat ? {background:'var(--igp-pink)'} : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size={48} />
        </div>
      ) : filteredProducts.length===0 ? (
        <div className="text-center py-12 text-gray-500">No products found in this category.</div>
      ) : (
        <div ref={productsRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map(p=>(
            <div key={p._id} className="group">
              <div className="relative card overflow-hidden transition">
                {/* Product Image Container */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition"/>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                    <Link to={'/product/'+p._id} className="px-4 py-2 rounded text-sm" style={{background:'var(--igp-pink)', color:'white'}}>Details</Link>
                    {/* Hide add-to-cart for admin users */}
                    {!isAdmin && (
                      <button onClick={()=>handleAddToCart(p._id)} disabled={addingToCart===p._id} className="px-4 py-2 rounded text-sm font-semibold" style={{background:'var(--gold-accent)', color:'#111'}} title="Add to cart">
                        {addingToCart===p._id ? '...' : '🛒'}
                      </button>
                    )}
                  </div>
                </div>
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm truncate" style={{color:'var(--text-dark)'}}>{p.title}</h3>
                  <p className="text-xs mb-3" style={{color:'var(--text-light)'}}>{p.category||'Other'}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-bold" style={{color:'var(--igp-pink)'}}>₹{(p.price || 0).toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trust Badges Section */}
      <section className="bg-gray-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-8 text-center" style={{color:'var(--text-dark)'}}>Why Shop With Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🚚</div>
            <div>
              <h3 className="font-semibold mb-1" style={{color:'var(--text-dark)'}}>Free Shipping & Returns</h3>
              <p className="text-sm" style={{color:'var(--text-light)'}}>Fast delivery to all locations. Easy returns within 14 days.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🛡️</div>
            <div>
              <h3 className="font-semibold mb-1" style={{color:'var(--text-dark)'}}>Lifetime Warranty</h3>
              <p className="text-sm" style={{color:'var(--text-light)'}}>Quality guaranteed. We stand behind every product.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="font-semibold mb-1" style={{color:'var(--text-dark)'}}>24/7 Customer Service</h3>
              <p className="text-sm" style={{color:'var(--text-light)'}}>We're here to help. Chat with our team anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6" style={{color:'var(--text-dark)'}}>Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 group-hover:bg-black/10 transition">
              <h3 className="text-2xl font-bold mb-2" style={{color:'var(--text-dark)'}}>Birthday Balloons</h3>
              <p className="text-sm mb-4" style={{color:'var(--text-light)'}}>Colorful balloons for any age</p>
              <button className="px-4 py-2 rounded-full text-sm font-semibold" style={{background:'var(--soft-pink)', color:'var(--igp-pink)'}}>Shop Now</button>
            </div>
          </div>
          <div className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-50 rounded-lg overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 group-hover:bg-black/10 transition">
              <h3 className="text-2xl font-bold mb-2" style={{color:'var(--text-dark)'}}>Wedding Collections</h3>
              <p className="text-sm mb-4" style={{color:'var(--text-light)'}}>Elegant decorations for your big day</p>
              <button className="px-4 py-2 rounded-full text-sm font-semibold" style={{background:'var(--soft-pink)', color:'var(--igp-pink)'}}>Shop Now</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}