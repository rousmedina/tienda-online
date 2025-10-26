import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { updatePassword } from '../services/authService';
import Loading from '../components/Loading/Loading';
import './ResetPassword.css';

function ResetPassword() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verificar si hay un token de recuperación en la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (accessToken && type === 'recovery') {
      setIsValidToken(true);
    } else {
      showToast('Enlace inválido o expirado', 'error');
      setTimeout(() => navigate('/'), 3000);
    }

    setChecking(false);
  }, [navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      showToast(error, 'error');
      setLoading(false);
      return;
    }

    showToast('Contraseña actualizada exitosamente', 'success');
    setLoading(false);

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (checking) {
    return <Loading fullScreen text="Verificando enlace..." />;
  }

  if (!isValidToken) {
    return (
      <div className="reset-password-page">
        <div className="container">
          <div className="reset-password-card">
            <i className="fas fa-times-circle error-icon"></i>
            <h2>Enlace inválido</h2>
            <p>Este enlace no es válido o ha expirado. Por favor, solicita un nuevo enlace de recuperación.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <i className="fas fa-key"></i>
            <h2>Restablecer contraseña</h2>
            <p>Ingresa tu nueva contraseña</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock"></i> Nueva contraseña
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <small className="form-hint">Mínimo 6 caracteres</small>
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-lock"></i> Confirmar contraseña
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Actualizando...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Actualizar contraseña
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
