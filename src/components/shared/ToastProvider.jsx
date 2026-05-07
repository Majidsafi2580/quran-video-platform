import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msg, type='info') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p.slice(-4), { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const value = {
    success: (m) => addToast(m, 'success'),
    error:   (m) => addToast(m, 'error'),
    info:    (m) => addToast(m, 'info'),
    warning: (m) => addToast(m, 'warning'),
  };

  const colors = { success:'#4ade80', error:'#f87171', info:'#60a5fa', warning:'#fbbf24' };
  const icons  = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position:'fixed', bottom:'1.25rem', right:'1.25rem', zIndex:9999, display:'flex', flexDirection:'column', gap:'0.5rem', maxWidth:'340px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.75rem 1rem', background:'#1a1208', border:`1px solid ${colors[t.type]}40`, borderRadius:'10px', boxShadow:'0 4px 20px rgba(0,0,0,0.4)', color:'#f5e6c8', fontSize:'0.875rem', animation:'slideIn 0.25s ease', lineHeight:'1.5' }}>
            <span>{icons[t.type]}</span>
            <span style={{ flex:1 }}>{t.msg}</span>
            <button onClick={() => setToasts(p=>p.filter(x=>x.id!==t.id))} style={{ background:'none', border:'none', color:'rgba(245,230,200,0.5)', cursor:'pointer', fontSize:'1rem', lineHeight:1, padding:0 }}>✕</button>
          </div>
        ))}
        <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}`}</style>
      </div>
    </ToastContext.Provider>
  );
}

export { ToastContext };
