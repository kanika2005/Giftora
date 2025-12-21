import React, {useEffect, useState} from 'react';
import API from '../api';

export default function AdminOrders(){
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(()=>{ fetchOrders(); },[]);

  const fetchOrders = async ()=>{
    try{
      const r = await API.get('/admin/orders', { headers: { Authorization: 'Bearer '+token }});
      setOrders(r.data);
    }catch(e){ console.error(e); }
  };

  const updateStatus = async (id, status)=>{
    await API.put('/admin/orders/'+id, {status}, { headers: { Authorization: 'Bearer '+token }});
    fetchOrders();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">All Orders</h2>
      <div className="grid gap-4">
        {orders.length===0 && <div>No orders</div>}
        {orders.map(o=>(
          <div key={o._id} className="card p-4">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">Order #{o._id}</div>
                <div className="text-sm text-gray-500">User: {o.user?.email}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">₹{o.totalAmount.toFixed(2)}</div>
                <div className="text-sm">{o.status}</div>
              </div>
            </div>
            <div className="mt-3">
              <strong>Items:</strong>
              <ul className="mt-2">
                {o.items.map(it=> (
                  <li key={it.product} className="text-sm">
                    {it.name} x {it.qty}
                  </li>
                ))}
              </ul>
            </div>

            {o.message && (
              <div className="mt-3 bg-yellow-50 p-2 rounded text-sm">Order message: {o.message}</div>
            )}

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

            <div className="mt-3 flex gap-2">
              <button onClick={()=>updateStatus(o._id, 'Shipped')} className="px-3 py-1 bg-yellow-300 rounded">Mark Shipped</button>
              <button onClick={()=>updateStatus(o._id, 'Delivered')} className="px-3 py-1 bg-green-400 rounded">Mark Delivered</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}