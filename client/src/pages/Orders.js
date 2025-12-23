import React, {useEffect, useState} from 'react';
import API from '../api';

export default function Orders(){
  const [orders, setOrders] = useState([]);
  const [feedbackOpenFor, setFeedbackOpenFor] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const token = localStorage.getItem('token');

  useEffect(()=>{ if(token){ API.get('/orders/my', { headers: { Authorization: 'Bearer '+token }}).then(r=>setOrders(r.data)).catch(e=>console.error(e)); } },[]);

  const refreshOrders = async ()=>{
    if(!token) return;
    try{ const r = await API.get('/orders/my', { headers: { Authorization: 'Bearer '+token }}); setOrders(r.data); }catch(e){console.error(e)}
  }

  const submitRating = async (orderId, rating, feedback='')=>{
    try{
      await API.post(`/orders/${orderId}/rate`, { rating, feedback }, { headers: { Authorization: 'Bearer '+token }});
      await refreshOrders();
      setFeedbackOpenFor(null); setFeedbackText(''); setSelectedRating(0);
    }catch(e){ console.error(e); alert(e.response?.data?.message || 'Failed to save rating'); }
  }

  const renderStars = (o, editable=false)=>{
    const current = o.rating || 0;
    let arr = [];
    for(let i=1;i<=5;i++){
      const filled = i <= current;
      const starStyle = { cursor: editable ? 'pointer' : 'default', color: filled ? '#f6b011' : '#ddd', fontSize: '20px', marginRight: '2px' };
      arr.push(<span key={i} style={starStyle} onClick={editable ? ()=>submitRating(o._id, i, '') : undefined}>★</span>);
    }
    return <div>{arr}</div>;
  }

  if(!token) return <div className="card p-6">Please login to view your orders</div>; 

  return (
    <div className="w-full mx-auto" style={{maxWidth: '800px'}}>
      <h2 className="text-xl font-semibold mb-4">My Orders</h2>
      <div className="grid gap-4">
        {orders.length===0 && <div>No orders yet</div>}
        {orders.map(o=>(
          <div key={o._id} className="card p-6">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Order #{o._id}</div>
                <div className="text-sm text-gray-500">Placed: {new Date(o.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{o.totalAmount.toFixed(0)}</div>
                <div className="text-sm">{o.status}</div>
                <div className="text-xs text-gray-500">{o.paymentMethod === 'PAYPAL' ? 'Paid Online' : 'Cash on Delivery'}</div>
              </div>
            </div>
            <div className="mt-3">
              <strong>Items:</strong>
              <ul className="mt-2">
                {o.items.map(it=>(
                  <li key={it.product} className="flex justify-between">
                    <div>
                      <div>{it.name} x {it.qty}</div>
                    </div>
                    <span>₹{(it.price || 0).toFixed(0)}</span>
                  </li>
                ))} 
              </ul>
            </div>
            <div className="mt-3 text-sm text-gray-600">
              <strong>Shipping:</strong> {o.shipping?.name}, {o.shipping?.address}, {o.shipping?.city} - {o.shipping?.postalCode}
            </div>

            {o.deliveryDate && (
              <div className="mt-2 text-sm bg-blue-50 p-2 rounded">
                <strong>Scheduled Delivery:</strong> {new Date(o.deliveryDate).toLocaleDateString()} 
                {' - '}
                <span className="capitalize">{o.deliveryTimeSlot?.replace('-', ' ')}</span>
                {o.deliveryType !== 'standard' && (
                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                    {o.deliveryType === 'same-day' ? 'Same-day' : 'Midnight'} (+₹{o.deliveryCharges || 0})
                  </span>
                )}
              </div>
            )}

            {o.message && (
              <div className="mt-3 bg-yellow-50 p-3 rounded text-sm">
                <strong>Order message:</strong> {o.message}
              </div>
            )}
            {o.paymentMethod === 'PAYPAL' && o.paypal?.paymentId && (
              <div className="mt-2 text-sm text-green-600">
                <strong>Payment ID:</strong> {o.paypal.paymentId}
                {o.paypal.payerEmail && <div><strong>Payer:</strong> {o.paypal.payerEmail}</div>}
              </div>
            )}

            {/* Rating & Feedback section - shown for delivered orders */}
            {o.status === 'Delivered' && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">{renderStars(o, true)} {o.rating ? <span className="ml-2 text-sm text-gray-600">({o.rating})</span> : <span className="ml-2 text-sm text-gray-600">Rate this order</span>}</div>
                    {o.feedback && <div className="mt-1 text-sm text-gray-700"><strong>Feedback:</strong> {o.feedback}</div>}
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-yellow-400 rounded text-sm mr-2" onClick={()=>{ setFeedbackOpenFor(o._id); setSelectedRating(o.rating || 0); setFeedbackText(o.feedback || '');}}>Feedback</button>
                  </div>
                </div>

                {feedbackOpenFor === o._id && (
                  <div className="mt-3 bg-gray-50 p-3 rounded">
                    <div className="mb-2">Your Rating:</div>
                    <div className="mb-2">{[1,2,3,4,5].map(i=>(
                      <span key={i} style={{cursor:'pointer', color: i<=selectedRating ? '#f6b011':'#ddd', fontSize:'22px', marginRight:4}} onClick={()=>setSelectedRating(i)}>★</span>
                    ))}</div>
                    <textarea value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} className="w-full p-2 border rounded" rows="3" placeholder="Write feedback (optional)"></textarea>
                    <div className="mt-2">
                      <button className="px-3 py-1 bg-green-400 rounded mr-2" onClick={()=>submitRating(o._id, selectedRating || 5, feedbackText)}>Submit</button>
                      <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>setFeedbackOpenFor(null)}>Cancel</button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}