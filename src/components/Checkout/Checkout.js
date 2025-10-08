import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { createOrder } from '../../services/orderService';
import { getCurrentUser } from '../../services/authService';
import {
  processCardPayment,
  processDigitalWalletPayment,
  validatePaymentData
} from '../../services/paymentService';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { state, showToast, clearCart } = useApp();
  const [step, setStep] = useState(1); // 1: Datos, 2: Envío, 3: Pago
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    // Dirección
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    // Pago
    metodoPago: 'tarjeta',
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaExpiracion: '',
    cvv: ''
  });

  const cartTotal = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const envio = 15;
  const total = cartTotal + envio;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinalizarCompra();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalizarCompra = async () => {
    try {
      setProcessing(true);

      // Validar datos de pago
      const validation = validatePaymentData(formData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        showToast(errorMessages, 'error');
        setProcessing(false);
        return;
      }

      // Procesar pago según el método seleccionado
      let paymentResult;

      if (formData.metodoPago === 'tarjeta') {
        showToast('Procesando pago con tarjeta...', 'info');

        paymentResult = await processCardPayment({
          cardNumber: formData.numeroTarjeta,
          cardName: formData.nombreTarjeta,
          expirationDate: formData.fechaExpiracion,
          cvv: formData.cvv,
          amount: total
        });
      } else if (formData.metodoPago === 'yape' || formData.metodoPago === 'plin') {
        showToast(`Procesando pago con ${formData.metodoPago.toUpperCase()}...`, 'info');

        paymentResult = await processDigitalWalletPayment(
          formData.metodoPago,
          total,
          formData.telefono
        );
      }

      // Verificar si el pago fue exitoso
      if (!paymentResult.success) {
        showToast(paymentResult.error, 'error');
        setProcessing(false);
        return;
      }

      showToast('¡Pago procesado exitosamente!', 'success');

      // Obtener usuario actual (si está autenticado)
      const { user } = await getCurrentUser();

      // Preparar datos de la orden
      const orderData = {
        user_id: user?.id || null,
        items: state.cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shipping: {
          full_name: `${formData.nombre} ${formData.apellido}`,
          email: formData.email,
          phone: formData.telefono,
          address: formData.direccion,
          city: formData.ciudad,
          state: formData.departamento,
          postal_code: formData.codigoPostal
        },
        payment: {
          method: formData.metodoPago,
          transaction_id: paymentResult.transactionId,
          status: 'completed'
        },
        subtotal: cartTotal,
        shipping_cost: envio,
        total: total
      };

      // Crear orden en Supabase
      const { data: order, error } = await createOrder(orderData);

      if (error) {
        showToast('Error al crear la orden. Inténtalo de nuevo.', 'error');
        console.error('Error creating order:', error);
        setProcessing(false);
        return;
      }

      // Limpiar carrito
      clearCart();

      // Navegar a la página de confirmación
      navigate('/confirmacion', {
        state: {
          orderNumber: order.order_number,
          orderDate: new Date(order.created_at).toLocaleDateString('es-PE'),
          customerName: `${formData.nombre} ${formData.apellido}`,
          customerEmail: formData.email,
          total: order.total,
          items: state.cartItems,
          transactionId: paymentResult.transactionId,
          paymentMethod: formData.metodoPago
        }
      });

      showToast('¡Orden creada exitosamente!', 'success');
    } catch (err) {
      showToast('Error inesperado al procesar la orden', 'error');
      console.error('Unexpected error:', err);
      setProcessing(false);
    }
  };

  if (state.cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="container">
          <i className="fas fa-shopping-cart"></i>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos para continuar con tu compra</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout">
      <div className="container">
        <div className="checkout-header">
          <h1>Finalizar Compra</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Datos</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Envío</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Pago</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            <form onSubmit={handleNextStep}>
              {/* Paso 1: Datos Personales */}
              {step === 1 && (
                <div className="checkout-section">
                  <h2>Datos Personales</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        className="form-input"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        className="form-input"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        name="telefono"
                        className="form-input"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Paso 2: Dirección de Envío */}
              {step === 2 && (
                <div className="checkout-section">
                  <h2>Dirección de Envío</h2>
                  <div className="form-group">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className="form-input"
                      placeholder="Calle, número, piso, etc."
                      value={formData.direccion}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Ciudad</label>
                      <input
                        type="text"
                        name="ciudad"
                        className="form-input"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Departamento</label>
                      <select
                        name="departamento"
                        className="form-input"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar</option>
                        <option value="Lima">Lima</option>
                        <option value="Cusco">Cusco</option>
                        <option value="Arequipa">Arequipa</option>
                        <option value="Puno">Puno</option>
                        <option value="Ayacucho">Ayacucho</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Código Postal</label>
                    <input
                      type="text"
                      name="codigoPostal"
                      className="form-input"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Paso 3: Método de Pago */}
              {step === 3 && (
                <div className="checkout-section">
                  <h2>Método de Pago</h2>
                  <div className="payment-methods">
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="tarjeta"
                        checked={formData.metodoPago === 'tarjeta'}
                        onChange={handleInputChange}
                      />
                      <i className="fas fa-credit-card"></i>
                      <span>Tarjeta de Crédito/Débito</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="yape"
                        checked={formData.metodoPago === 'yape'}
                        onChange={handleInputChange}
                      />
                      <i className="fas fa-mobile-alt"></i>
                      <span>Yape</span>
                    </label>
                    <label className="payment-method">
                      <input
                        type="radio"
                        name="metodoPago"
                        value="plin"
                        checked={formData.metodoPago === 'plin'}
                        onChange={handleInputChange}
                      />
                      <i className="fas fa-mobile-alt"></i>
                      <span>Plin</span>
                    </label>
                  </div>

                  {formData.metodoPago === 'tarjeta' && (
                    <div className="card-details">
                      <div className="form-group">
                        <label className="form-label">Número de Tarjeta</label>
                        <input
                          type="text"
                          name="numeroTarjeta"
                          className="form-input"
                          placeholder="1234 5678 9012 3456"
                          value={formData.numeroTarjeta}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Nombre en la Tarjeta</label>
                        <input
                          type="text"
                          name="nombreTarjeta"
                          className="form-input"
                          value={formData.nombreTarjeta}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Fecha de Expiración</label>
                          <input
                            type="text"
                            name="fechaExpiracion"
                            className="form-input"
                            placeholder="MM/AA"
                            value={formData.fechaExpiracion}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            className="form-input"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de navegación */}
              <div className="checkout-actions">
                {step > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handlePreviousStep}
                  >
                    <i className="fas fa-arrow-left"></i> Anterior
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {step === 3 ? (
                    <>
                      {processing ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Procesando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i> Finalizar Compra
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Siguiente <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <div className="order-items">
              {state.cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>Cantidad: {item.quantity}</p>
                  </div>
                  <div className="order-item-price">
                    S/. {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="order-total-row">
                <span>Subtotal:</span>
                <span>S/. {cartTotal.toFixed(2)}</span>
              </div>
              <div className="order-total-row">
                <span>Envío:</span>
                <span>S/. {envio.toFixed(2)}</span>
              </div>
              <div className="order-total-row total">
                <span>Total:</span>
                <span>S/. {total.toFixed(2)}</span>
              </div>
            </div>
            <div className="order-security">
              <i className="fas fa-lock"></i>
              <p>Compra 100% segura y protegida</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
