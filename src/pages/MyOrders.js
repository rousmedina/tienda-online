import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getUserOrders } from '../services/orderService';
import Loading from '../components/Loading/Loading';
import './MyOrders.css';

function MyOrders() {
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    // Timeout de seguridad para evitar loops infinitos
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Timeout: Deteniendo carga de pedidos');
        setLoading(false);
        showToast('Tiempo de espera agotado al cargar pedidos', 'error');
      }
    }, 10000); // 10 segundos máximo

    loadOrders();

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadOrders = async () => {
    if (!user) {
      console.log('No hay usuario, no se cargan pedidos');
      setLoading(false);
      return;
    }

    console.log('Cargando pedidos para usuario:', user.id);
    setLoading(true);

    try {
      const { data, error } = await getUserOrders(user.id);

      if (error) {
        console.error('Error al cargar pedidos:', error);
        showToast('Error al cargar pedidos', 'error');
        setOrders([]);
      } else {
        console.log('Pedidos cargados:', data?.length || 0);
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error inesperado al cargar pedidos:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return <Loading fullScreen text="Cargando tus pedidos..." />;
  }

  if (!user) {
    return (
      <div className="my-orders-empty">
        <div className="container">
          <i className="fas fa-sign-in-alt"></i>
          <h2>Inicia sesión para ver tus pedidos</h2>
          <p>Necesitas iniciar sesión para acceder a tu historial de pedidos</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-orders">
      <div className="container">
        <div className="my-orders-header">
          <h1>Mis Pedidos</h1>
          <p>Revisa el estado de tus compras y órdenes anteriores</p>
        </div>

        {/* Filtros */}
        <div className="orders-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos ({orders.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completados ({orders.filter(o => o.status === 'completed').length})
          </button>
        </div>

        {/* Lista de órdenes */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <i className="fas fa-shopping-bag"></i>
            <h3>No tienes pedidos {filter !== 'all' && getStatusText(filter).toLowerCase()}</h3>
            <p>Explora nuestro catálogo y realiza tu primera compra</p>
            <button className="btn btn-primary" onClick={() => navigate('/tienda')}>
              <i className="fas fa-store"></i> Ir a la Tienda
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <h3>Pedido #{order.order_number}</h3>
                    <span className="order-date">
                      <i className="far fa-calendar"></i>
                      {new Date(order.created_at).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    <i className="fas fa-circle"></i>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="order-items-summary">
                    <p className="items-count">
                      {order.items?.length || 0} producto(s)
                    </p>
                  </div>

                  <div className="order-shipping">
                    <p>
                      <i className="fas fa-map-marker-alt"></i>
                      {order.shipping_city}, {order.shipping_state}
                    </p>
                  </div>

                  <div className="order-total">
                    <span>Total:</span>
                    <strong>S/. {parseFloat(order.total).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="order-card-footer">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/pedido/${order.id}`)}
                  >
                    <i className="fas fa-eye"></i> Ver Detalles
                  </button>
                  {order.status === 'completed' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => alert('Funcionalidad de recompra próximamente')}
                    >
                      <i className="fas fa-redo"></i> Comprar de Nuevo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
