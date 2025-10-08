import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import Toast from './Toast';
import './Toast.css';

function ToastContainer() {
  const { state, removeToast } = useApp();

  if (!state.toasts || state.toasts.length === 0) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <div className="toast-container">
      {state.toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>,
    portalRoot
  );
}

export default ToastContainer;
