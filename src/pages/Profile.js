import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import Loading from '../components/Loading/Loading';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const { user, showToast, authLoading } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (!authLoading) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: user.email || ''
        });
      } else {
        setProfileData({
          full_name: '',
          phone: '',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      showToast('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error al actualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <Loading fullScreen text="Cargando perfil..." />;
  }

  if (!user) {
    return (
      <div className="profile-empty">
        <div className="container">
          <i className="fas fa-user-lock"></i>
          <h2>Acceso restringido</h2>
          <p>Debes iniciar sesión para ver tu perfil</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <h1>Mi Perfil</h1>
          <p>{user.email}</p>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-card-header">
              <h2>Información Personal</h2>
              <p>Actualiza tu información de perfil</p>
            </div>

            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user"></i> Nombre Completo
                </label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-envelope"></i> Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={profileData.email}
                  disabled
                  style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                />
                <small className="form-hint">El email no se puede cambiar</small>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-phone"></i> Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="+51 999 888 777"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Guardando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/')}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <div className="profile-sidebar">
            <div className="profile-quick-links">
              <h3>Accesos Rápidos</h3>
              <button
                className="quick-link-btn"
                onClick={() => navigate('/mis-pedidos')}
              >
                <i className="fas fa-shopping-bag"></i>
                <div>
                  <strong>Mis Pedidos</strong>
                  <span>Ver historial de compras</span>
                </div>
              </button>
              <button
                className="quick-link-btn"
                onClick={() => navigate('/tienda')}
              >
                <i className="fas fa-store"></i>
                <div>
                  <strong>Tienda</strong>
                  <span>Explorar productos</span>
                </div>
              </button>
              <button
                className="quick-link-btn"
                onClick={() => navigate('/favoritos')}
              >
                <i className="fas fa-heart"></i>
                <div>
                  <strong>Mis Favoritos</strong>
                  <span>Productos guardados</span>
                </div>
              </button>
            </div>

            <div className="profile-stats">
              <h3>Estadísticas</h3>
              <div className="stat-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <strong>Miembro desde</strong>
                  <span>{new Date(user.created_at).toLocaleDateString('es-PE', {
                    year: 'numeric',
                    month: 'long'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
