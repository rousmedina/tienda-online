import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener datos de la orden desde el state de navegación
  const orderData = location.state || {
    orderNumber: Math.floor(Math.random() * 1000000),
    orderDate: new Date().toLocaleDateString('es-PE'),
    customerName: 'Cliente',
    customerEmail: 'cliente@ejemplo.com',
    total: 0,
    items: []
  };

  useEffect(() => {
    // Si no hay datos de orden, redirigir al home
    if (!location.state) {
      // Simular datos de orden para demo
      console.log('No hay datos de orden, usando datos de demo');
    }
  }, [location.state]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrders = () => {
    alert('Funcionalidad de historial de pedidos próximamente');
  };

  const handleDownloadInvoice = () => {
    alert(`Descargando factura #${orderData.orderNumber}...`);
  };

  return (
    <div className="order-confirmation">
      <div className="container">
        <div className="confirmation-content">
          {/* Success Icon */}
          <div className="confirmation-icon">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
                <div className="icon-circle"></div>
                <div className="icon-fix"></div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="confirmation-header">
            <h1>¡Compra Exitosa!</h1>
            <p className="confirmation-subtitle">
              Gracias por tu compra, <strong>{orderData.customerName}</strong>
            </p>
            <p className="confirmation-message">
              Tu pedido ha sido procesado exitosamente. Te hemos enviado un correo de confirmación a{' '}
              <strong>{orderData.customerEmail}</strong>
            </p>
          </div>

          {/* Order Details */}
          <div className="order-details-card">
            <div className="order-info-header">
              <div className="order-info-item">
                <span className="order-label">Número de Pedido</span>
                <span className="order-value">#{orderData.orderNumber}</span>
              </div>
              <div className="order-info-item">
                <span className="order-label">Fecha</span>
                <span className="order-value">{orderData.orderDate}</span>
              </div>
              <div className="order-info-item">
                <span className="order-label">Total</span>
                <span className="order-value total-amount">S/. {orderData.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            {orderData.items && orderData.items.length > 0 && (
              <div className="order-items-section">
                <h3>Productos Ordenados</h3>
                <div className="order-items-list">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <div className="item-details">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">S/. {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="delivery-info">
              <h3>Información de Entrega</h3>
              <div className="delivery-timeline">
                <div className="timeline-item active">
                  <div className="timeline-icon">
                    <i className="fas fa-check"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>Pedido Confirmado</h4>
                    <p>Tu pedido ha sido recibido</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <i className="fas fa-box"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>En Preparación</h4>
                    <p>Preparando tu pedido</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <i className="fas fa-truck"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>En Camino</h4>
                    <p>Tu pedido está en camino</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <i className="fas fa-home"></i>
                  </div>
                  <div className="timeline-content">
                    <h4>Entregado</h4>
                    <p>Estimado: 3-5 días hábiles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="info-cards">
            <div className="info-card">
              <i className="fas fa-envelope"></i>
              <h4>Confirmación Enviada</h4>
              <p>Revisa tu correo para más detalles</p>
            </div>
            <div className="info-card">
              <i className="fas fa-headset"></i>
              <h4>Soporte 24/7</h4>
              <p>Estamos aquí para ayudarte</p>
            </div>
            <div className="info-card">
              <i className="fas fa-shield-alt"></i>
              <h4>Compra Protegida</h4>
              <p>Tu pago está 100% seguro</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="confirmation-actions">
            <button className="btn btn-primary" onClick={handleContinueShopping}>
              <i className="fas fa-shopping-bag"></i>
              Seguir Comprando
            </button>
            <button className="btn btn-outline" onClick={handleViewOrders}>
              <i className="fas fa-list"></i>
              Ver Mis Pedidos
            </button>
            <button className="btn btn-outline" onClick={handleDownloadInvoice}>
              <i className="fas fa-download"></i>
              Descargar Factura
            </button>
          </div>

          {/* Contact Info */}
          <div className="contact-section">
            <p className="contact-text">
              ¿Tienes alguna pregunta sobre tu pedido?
            </p>
            <div className="contact-options">
              <a href="tel:+51999888777" className="contact-link">
                <i className="fas fa-phone"></i> +51 999 888 777
              </a>
              <a href="mailto:info@chinasaqraandina.com" className="contact-link">
                <i className="fas fa-envelope"></i> info@chinasaqraandina.com
              </a>
              <a href="https://wa.me/51999888777" className="contact-link">
                <i className="fab fa-whatsapp"></i> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
