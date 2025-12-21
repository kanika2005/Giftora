import React, {useState} from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useUser } from '../context/UserContext';

export default function Signup(){
  const [name,setName]=useState(''), [email,setEmail]=useState(''), [password,setPassword]=useState('');
  const navigate = useNavigate();
  const { show } = useToast();
  const { login } = useUser();

  const submit = async (e)=>{ e.preventDefault();
    try{
      const r = await API.post('/auth/signup',{name,email,password});
      localStorage.setItem('token', r.data.token);
      login(r.data.user);
      navigate('/');
    }catch(e){
      const data = e.response?.data;
      if(data?.errors && Array.isArray(data.errors)){
        const msg = data.errors.map(err=>err.msg).join(', ');
        show(msg, { type: 'error' });
      }else{
        show(data?.message || 'Signup failed', { type: 'error' });
      }
    }
  };
  return (
    <div className="max-w-xl w-full mx-auto card p-6">
      <h2 className="text-xl font-semibold mb-4">Signup</h2>
      <form onSubmit={submit}>
        <input className="w-full border p-2 rounded mb-3" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-pink-500 text-white px-4 py-2 rounded">Signup</button>
      </form>
    </div>
  );
}