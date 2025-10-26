import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getOrderById, getOrderByNumber } from '../services/orderService';
import Loading from '../components/Loading/Loading';
import './OrderDetail.css';

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);

    // Intentar primero por ID, luego por número de orden
    let result;
    if (orderId.startsWith('CHI-')) {
      result = await getOrderByNumber(orderId);
    } else {
      result = await getOrderById(orderId);
    }

    const { data, error } = result;

    if (error) {
      showToast('Error al cargar el pedido', 'error');
      console.error('Error loading order:', error);
      setTimeout(() => navigate('/mis-pedidos'), 2000);
    } else if (!data) {
      showToast('Pedido no encontrado', 'error');
      setTimeout(() => navigate('/mis-pedidos'), 2000);
    } else {
      setOrder(data);
    }

    setLoading(false);
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

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'fa-clock',
      processing: 'fa-cog fa-spin',
      shipped: 'fa-truck',
      completed: 'fa-check-circle',
      cancelled: 'fa-times-circle'
    };
    return icons[status] || 'fa-circle';
  };

  const getPaymentStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
      refunded: 'Reembolsado'
    };
    return texts[status] || status;
  };

  if (loading) {
    return <Loading fullScreen text="Cargando detalles del pedido..." />;
  }

  if (!order) {
    return (
      <div className="order-detail-empty">
        <div className="container">
          <i className="fas fa-exclamation-circle"></i>
          <h2>Pedido no encontrado</h2>
          <button className="btn btn-primary" onClick={() => navigate('/mis-pedidos')}>
            Volver a mis pedidos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Header */}
        <div className="order-detail-header">
          <button className="back-btn" onClick={() => navigate('/mis-pedidos')}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>
          <div className="order-number-section">
            <h1>Pedido #{order.order_number}</h1>
            <span className="order-date">
              <i className="far fa-calendar"></i>
              {new Date(order.created_at).toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="order-status-badge" style={{ background: getStatusColor(order.status) }}>
            <i className={`fas ${getStatusIcon(order.status)}`}></i>
            {getStatusText(order.status)}
          </div>
        </div>

        <div className="order-detail-content">
          {/* Progreso del pedido */}
          <div className="order-progress">
            <h2>Estado del pedido</h2>
            <div className="progress-steps">
              <div className={`progress-step ${['pending', 'processing', 'shipped', 'completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-icon">
                  <i className="fas fa-receipt"></i>
                </div>
                <div className="step-info">
                  <strong>Pedido realizado</strong>
                  <span>{new Date(order.created_at).toLocaleDateString('es-PE')}</span>
                </div>
              </div>

              <div className={`progress-step ${['processing', 'shipped', 'completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-icon">
                  <i className="fas fa-box"></i>
                </div>
                <div className="step-info">
                  <strong>Procesando</strong>
                  <span>Preparando tu pedido</span>
                </div>
              </div>

              <div className={`progress-step ${['shipped', 'completed'].includes(order.status) ? 'active' : ''}`}>
                <div className="step-icon">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <div className="step-info">
                  <strong>Enviado</strong>
                  <span>En camino</span>
                </div>
              </div>

              <div className={`progress-step ${order.status === 'completed' ? 'active' : ''}`}>
                <div className="step-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="step-info">
                  <strong>Entregado</strong>
                  <span>Pedido completado</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-detail-grid">
            {/* Productos */}
            <div className="order-section">
              <h2>Productos ({order.items?.length || 0})</h2>
              <div className="order-items-list">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        <i className="fas fa-tshirt"></i>
                      </div>
                      <div className="item-details">
                        <h4>{item.product_name}</h4>
                        {item.size && <p className="item-attr">Talla: {item.size}</p>}
                        {item.color && <p className="item-attr">Color: {item.color}</p>}
                        <p className="item-quantity">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="item-price">
                        <span className="unit-price">S/. {parseFloat(item.product_price).toFixed(2)}</span>
                        <strong className="total-price">
                          S/. {(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-items">No hay productos en este pedido</p>
                )}
              </div>
            </div>

            {/* Información de envío */}
            <div className="order-section">
              <h2>Información de envío</h2>
              <div className="shipping-info">
                <div className="info-row">
                  <i className="fas fa-user"></i>
                  <div>
                    <strong>Nombre</strong>
                    <p>{order.shipping_name}</p>
                  </div>
                </div>
                <div className="info-row">
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>Email</strong>
                    <p>{order.shipping_email}</p>
                  </div>
                </div>
                <div className="info-row">
                  <i className="fas fa-phone"></i>
                  <div>
                    <strong>Teléfono</strong>
                    <p>{order.shipping_phone}</p>
                  </div>
                </div>
                <div className="info-row">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <strong>Dirección</strong>
                    <p>{order.shipping_address}</p>
                    <p>
                      {order.shipping_city}, {order.shipping_state}
                      {order.shipping_postal_code && ` - ${order.shipping_postal_code}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de pago */}
            <div className="order-section">
              <h2>Resumen de pago</h2>
              <div className="payment-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>S/. {parseFloat(order.subtotal).toFixed(2)}</strong>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <strong>S/. {parseFloat(order.shipping_cost).toFixed(2)}</strong>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <strong>S/. {parseFloat(order.total).toFixed(2)}</strong>
                </div>
                <div className="payment-method">
                  <i className="fas fa-credit-card"></i>
                  <div>
                    <strong>Método de pago</strong>
                    <p>{order.payment_method === 'card' ? 'Tarjeta de crédito/débito' : order.payment_method}</p>
                    <span className={`payment-status ${order.payment_status}`}>
                      {getPaymentStatusText(order.payment_status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="order-actions">
          {order.status === 'completed' && (
            <button className="btn btn-primary" onClick={() => showToast('Funcionalidad próximamente', 'info')}>
              <i className="fas fa-redo"></i> Comprar de nuevo
            </button>
          )}
          <button className="btn btn-outline" onClick={() => showToast('Funcionalidad próximamente', 'info')}>
            <i className="fas fa-download"></i> Descargar factura
          </button>
          {['pending', 'processing'].includes(order.status) && (
            <button className="btn btn-outline btn-danger" onClick={() => showToast('Funcionalidad próximamente', 'info')}>
              <i className="fas fa-times"></i> Cancelar pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
