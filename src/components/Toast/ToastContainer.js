import React, { useCallback, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = React.memo(() => {
  const { state, removeToast } = useApp();
  const removingToastsRef = useRef(new Set());

  // Memoizar removeToast para evitar que cambie de referencia en cada render
  const handleRemoveToast = useCallback((toastId) => {
    // Evitar intentos duplicados de remover el mismo toast
    if (removingToastsRef.current.has(toastId)) {
      return;
    }

    // Marcar que este toast está siendo removido
    removingToastsRef.current.add(toastId);

    // Solo intentar remover si el toast existe en el estado
    if (state.toasts && state.toasts.some(t => t.id === toastId)) {
      removeToast(toastId);

      // Limpiar el marcador después de un tiempo
      setTimeout(() => {
        removingToastsRef.current.delete(toastId);
      }, 500);
    }
  }, [removeToast, state.toasts]);

  // Si no hay toasts, no renderizar nada
  if (!state.toasts || state.toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="region" aria-label="Notificaciones">
      {state.toasts.map((toast) => (
        <Toast
          key={toast.id}
          toastId={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={handleRemoveToast}
        />
      ))}
    </div>
  );
});

ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
