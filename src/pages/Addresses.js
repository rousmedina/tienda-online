import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../services/addressService';
import Loading from '../components/Loading/Loading';
import './Addresses.css';

function Addresses() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAddresses = async () => {
    setLoading(true);
    const { data, error } = await getUserAddresses(user.id);

    if (error) {
      showToast('Error al cargar direcciones', 'error');
    } else {
      setAddresses(data || []);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      full_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      is_default: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, user.id, formData);
    } else {
      result = await createAddress(user.id, formData);
    }

    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(
        editingAddress ? 'Dirección actualizada' : 'Dirección creada',
        'success'
      );
      resetForm();
      loadAddresses();
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || '',
      full_name: address.full_name || '',
      phone: address.phone || '',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      is_default: address.is_default || false
    });
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      return;
    }

    const { error } = await deleteAddress(addressId, user.id);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Dirección eliminada', 'success');
      loadAddresses();
    }
  };

  const handleSetDefault = async (addressId) => {
    const { error } = await setDefaultAddress(addressId, user.id);

    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Dirección predeterminada actualizada', 'success');
      loadAddresses();
    }
  };

  if (!user) {
    return (
      <div className="addresses-empty">
        <div className="container">
          <i className="fas fa-sign-in-alt"></i>
          <h2>Inicia sesión</h2>
          <p>Debes iniciar sesión para gestionar tus direcciones</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading fullScreen text="Cargando direcciones..." />;
  }

  return (
    <div className="addresses-page">
      <div className="container">
        <div className="addresses-header">
          <h1>
            <i className="fas fa-map-marker-alt"></i> Mis Direcciones
          </h1>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <i className="fas fa-plus"></i> Nueva Dirección
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="address-form-modal">
            <div className="address-form-content">
              <div className="form-header">
                <h2>{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h2>
                <button className="close-btn" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-tag"></i> Etiqueta
                    </label>
                    <input
                      type="text"
                      name="label"
                      className="form-input"
                      value={formData.label}
                      onChange={handleInputChange}
                      placeholder="Ej: Casa, Oficina"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-user"></i> Nombre completo
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-input"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-phone"></i> Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+51 999 888 777"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-city"></i> Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Lima"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-map-marked-alt"></i> Dirección
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Av. Ejemplo 123, Dpto 456"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-globe-americas"></i> Departamento/Región
                    </label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Lima"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <i className="fas fa-mailbox"></i> Código Postal
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      className="form-input"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      placeholder="15001"
                    />
                  </div>
                </div>

                <div className="form-checkbox">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="is_default">Establecer como dirección predeterminada</label>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i>{' '}
                    {editingAddress ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de direcciones */}
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <i className="fas fa-map-marker-alt"></i>
            <h3>No tienes direcciones guardadas</h3>
            <p>Agrega una dirección para facilitar tus compras futuras</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i> Agregar Dirección
            </button>
          </div>
        ) : (
          <div className="addresses-grid">
            {addresses.map((address) => (
              <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
                {address.is_default && (
                  <div className="default-badge">
                    <i className="fas fa-star"></i> Predeterminada
                  </div>
                )}

                <div className="address-label">
                  <i className="fas fa-tag"></i>
                  {address.label}
                </div>

                <div className="address-details">
                  <p className="address-name">
                    <i className="fas fa-user"></i> {address.full_name}
                  </p>
                  <p className="address-phone">
                    <i className="fas fa-phone"></i> {address.phone}
                  </p>
                  <p className="address-location">
                    <i className="fas fa-map-marker-alt"></i> {address.address}
                  </p>
                  <p className="address-city">
                    {address.city}, {address.state}
                    {address.postal_code && ` - ${address.postal_code}`}
                  </p>
                </div>

                <div className="address-actions">
                  {!address.is_default && (
                    <button
                      className="action-btn"
                      onClick={() => handleSetDefault(address.id)}
                      title="Establecer como predeterminada"
                    >
                      <i className="far fa-star"></i>
                    </button>
                  )}
                  <button
                    className="action-btn"
                    onClick={() => handleEdit(address)}
                    title="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(address.id)}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Addresses;
