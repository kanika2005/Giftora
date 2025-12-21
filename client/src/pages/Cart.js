import React, {useEffect, useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
export default function Cart(){
  const [cart, setCart] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();


  useEffect(()=>{
    if(token){
      API.get('/cart', {headers:{Authorization:'Bearer '+token}})
        .then(r=>setCart(r.data))
        .catch(e=>{
          if(e.response?.status === 401){
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            console.error(e);
          }
        });
    }
  },[token, navigate]);

  const updateQty = async (productId, qty)=> {
    try{
      await API.post('/cart/add', {productId, qty}, {headers:{Authorization:'Bearer '+token}});
      const r = await API.get('/cart', {headers:{Authorization:'Bearer '+token}});
      setCart(r.data);
    }catch(e){
      if(e.response?.status === 401){
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        console.error(e);
      }
    }
  }; 

  if(!token) return <div className="card p-6">Please login to view cart</div>; 
  if(!cart) return <div className="flex items-center justify-center py-12"><Spinner size={48} /></div>;

  const items = cart.items.filter(i => i && i.product); // safeguard
  const subtotal = items.reduce((s,it)=>s + (it.product.price * it.qty), 0);

  return (
    <div className="w-full mx-auto card p-6" style={{maxWidth: '800px'}}> 
      <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
      <ul>
        {items.length===0 && <li>Cart is empty</li>}
        {items.map(it=>(
          <li key={it.product._id} className="flex items-center gap-4 py-3 border-b">
            <img src={it.product.image} style={{width:80,height:80,objectFit:'contain'}} alt={it.product.title || 'cart item'}/>
            <div className="flex-1">
              <strong>{it.product.title}</strong>
              <div className="text-sm text-gray-500">₹{it.product.price.toFixed(0)}</div>


            </div>
            <div>
              <input type="number" className="border rounded p-1 w-20" value={it.qty} onChange={(e)=>updateQty(it.product._id, Number(e.target.value))} />
            </div> 
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-lg font-semibold">Subtotal: ₹{subtotal.toFixed(0)}</div>
        <button onClick={()=>navigate('/checkout')} className="px-4 py-2 rounded btn-gold">Proceed to Checkout</button>
      </div>
    </div>
  );
}