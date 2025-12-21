import React, {useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../context/UserContext';

export default function Login(){
  const [email,setEmail]=useState(''), [password,setPassword]=useState('');
  const navigate = useNavigate();
  const { show } = useToast();
  const { login } = useUser();

  const submit = async (e)=>{ e.preventDefault();
    try{
      const r = await API.post('/auth/login',{email,password});
      localStorage.setItem('token', r.data.token);
      login(r.data.user);
      navigate('/');
    }catch(e){ show(e.response?.data?.message || 'Login failed', { type: 'error' }); }
  };
  return (
    <div className="max-w-xl w-full mx-auto card p-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={submit}>
        <input className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-pink-500 text-white px-4 py-2 rounded">Login</button>
      </form>
    </div>
  );
}