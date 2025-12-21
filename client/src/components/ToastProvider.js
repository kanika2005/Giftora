import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }){
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, opts = {}) => {
    const id = ++idCounter;
    const toast = { id, message, type: opts.type || 'info', timeout: opts.timeout || 4000 };
    setToasts((t)=>[...t, toast]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t)=>t.filter(x=>x.id!==id));
  }, []);

  useEffect(()=>{
    const timers = toasts.map(t => {
      const tm = setTimeout(()=> remove(t.id), t.timeout);
      return tm;
    });
    return ()=> timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <ToastContext.Provider value={{ show, remove }}>
      {children}
      <div aria-live="polite" className="fixed z-50 right-4 bottom-6 flex flex-col gap-3 items-end">
        {toasts.map(t=> (
          <div key={t.id} className={`max-w-sm w-full px-4 py-2 rounded shadow-md text-sm ${t.type==='error' ? 'bg-red-100 text-red-800' : t.type==='success' ? 'bg-green-100 text-green-800' : 'card text-gray-900'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(){
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

export default ToastProvider;
