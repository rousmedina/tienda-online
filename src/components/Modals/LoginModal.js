import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { signIn, signUp } from '../../services/authService';
import './LoginModal.css';

function LoginModal() {
  const { state, toggleLoginModal, setLoginTab, showToast } = useApp();
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [loading, setLoading] = useState(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleLoginModal();
    }
  };

  const handleTabSwitch = (tab) => {
    setLoginTab(tab);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await signIn(loginData.email, loginData.password);

    if (error) {
      showToast(error, 'error');
      setLoading(false);
      return;
    }

    showToast('¡Inicio de sesión exitoso!', 'success');
    toggleLoginModal();
    setLoginData({ email: '', password: '', remember: false });
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    if (!registerData.acceptTerms) {
      showToast('Debes aceptar los términos y condiciones', 'error');
      return;
    }

    setLoading(true);

    const { data, error } = await signUp(
      registerData.email,
      registerData.password,
      registerData.name
    );

    if (error) {
      showToast(error, 'error');
      setLoading(false);
      return;
    }

    showToast('¡Cuenta creada exitosamente! Revisa tu correo para confirmar.', 'success');
    toggleLoginModal();
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    alert(`Iniciar sesión con ${provider}`);
  };

  if (!state.isLoginModalOpen) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <div className="login-modal active" onClick={handleOverlayClick}>
      <div className="login-modal-content">
        <button className="login-modal-close" onClick={toggleLoginModal}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="login-modal-header">
          <h2>Bienvenido</h2>
        </div>

        <div className="login-tabs">
          <button 
            className={`login-tab ${state.loginTab === 'login' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`login-tab ${state.loginTab === 'register' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('register')}
          >
            Registrarse
          </button>
        </div>

        {/* Login Form */}
        {state.loginTab === 'login' && (
          <form className="login-form active" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="tu@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required 
              />
            </div>
            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={loginData.remember}
                onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })}
              />
              <label htmlFor="rememberMe">Recordarme</label>
            </div>
            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
            <div className="login-actions">
              <button type="button" className="forgot-password" onClick={() => alert('Funcionalidad de recuperación de contraseña próximamente')}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {state.loginTab === 'register' && (
          <form className="login-form active" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Tu nombre"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="tu@email.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar contraseña</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                required 
              />
            </div>
            <div className="form-checkbox">
              <input 
                type="checkbox" 
                id="acceptTerms"
                checked={registerData.acceptTerms}
                onChange={(e) => setRegisterData({ ...registerData, acceptTerms: e.target.checked })}
                required 
              />
              <label htmlFor="acceptTerms">Acepto los términos y condiciones</label>
            </div>
            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        )}

        <div className="login-divider">
          <span>o continuar con</span>
        </div>

        <div className="social-login">
          <button className="social-btn" onClick={() => handleSocialLogin('Google')}>
            <i className="fab fa-google"></i>
          </button>
          <button className="social-btn" onClick={() => handleSocialLogin('Facebook')}>
            <i className="fab fa-facebook-f"></i>
          </button>
        </div>
      </div>
    </div>,
    portalRoot
  );
}

export default LoginModal;