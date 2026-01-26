import React, { useEffect, useState } from 'react';

const TOAST_LIFETIME = 4000;

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Expose a simple global API for toasts
    window.toast = {
      success: (msg) => addToast({ type: 'success', text: msg }),
      error: (msg) => addToast({ type: 'error', text: msg }),
      info: (msg) => addToast({ type: 'info', text: msg })
    };

    return () => { window.toast = undefined; };
  }, []);

  const addToast = (t) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...t }]);
    setTimeout(() => removeToast(id), TOAST_LIFETIME);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div style={{ position: 'fixed', right: 16, top: 16, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ minWidth: 240, padding: '10px 12px', borderRadius: 8, color: '#fff', boxShadow: '0 6px 18px rgba(2,6,23,0.2)', background: t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#16a34a' : '#0f172a' }}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
