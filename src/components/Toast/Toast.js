import React, { useEffect, useRef, useState } from 'react';
import './Toast.css';

const Toast = React.memo(({ message, type = 'info', duration = 3000, onClose, toastId }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);
  const hasCalledCloseRef = useRef(false);
  const autoCloseTimerRef = useRef(null);
  const exitAnimationTimerRef = useRef(null);

  // Función para iniciar el proceso de cierre
  const startClosing = () => {
    if (isExiting || !shouldRender) return;
    setIsExiting(true);
  };

  // Función para cerrar de forma segura (solo una vez)
  const safeClose = () => {
    if (hasCalledCloseRef.current) return;
    hasCalledCloseRef.current = true;
    setShouldRender(false);

    // Llamar a onClose después de un pequeño delay para asegurar que la animación termine
    if (onClose && toastId) {
      onClose(toastId);
    }
  };

  // Efecto para auto-cierre
  useEffect(() => {
    autoCloseTimerRef.current = setTimeout(() => {
      startClosing();
    }, duration);

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  // Efecto para manejar la animación de salida
  useEffect(() => {
    if (isExiting) {
      // Esperar a que termine la animación CSS (300ms) antes de remover
      exitAnimationTimerRef.current = setTimeout(() => {
        safeClose();
      }, 320); // Un poco más que la duración de la animación para seguridad
    }

    return () => {
      if (exitAnimationTimerRef.current) {
        clearTimeout(exitAnimationTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
      if (exitAnimationTimerRef.current) {
        clearTimeout(exitAnimationTimerRef.current);
      }
    };
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-times-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  const handleCloseClick = (e) => {
    e.stopPropagation();
    if (!isExiting) {
      startClosing();
    }
  };

  // No renderizar si ya no debería estar en el DOM
  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`toast toast-${type} ${isExiting ? 'toast-exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={handleCloseClick}
        aria-label="Cerrar notificación"
        type="button"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
});

Toast.displayName = 'Toast';

export default Toast;
