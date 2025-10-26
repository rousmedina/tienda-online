import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useBodyScroll } from '../../hooks/useBodyScroll';
import { createOrder } from '../../services/orderService';
import { getCurrentUser } from '../../services/authService';
import {
  processCardPayment,
  processDigitalWalletPayment,
  validatePaymentData
} from '../../services/paymentService';
import './Checkout.css';

// Validaciones
const validations = {
  nombre: (value) => value.trim().length >= 2 ? null : 'El nombre debe tener al menos 2 caracteres',
  apellido: (value) => value.trim().length >= 2 ? null : 'El apellido debe tener al menos 2 caracteres',
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Email inválido';
  },
  telefono: (value) => {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(value.replace(/\D/g, '')) ? null : 'El teléfono debe tener 9 dígitos';
  },
  direccion: (value) => value.trim().length >= 5 ? null : 'La dirección debe tener al menos 5 caracteres',
  ciudad: (value) => value.trim().length >= 2 ? null : 'La ciudad es requerida',
  departamento: (value) => value.length > 0 ? null : 'El departamento es requerido',
  numeroTarjeta: (value) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 16 ? null : 'La tarjeta debe tener 16 dígitos';
  },
  nombreTarjeta: (value) => value.trim().length >= 3 ? null : 'El nombre debe tener al menos 3 caracteres',
  fechaExpiracion: (value) => {
    const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expRegex.test(value)) return 'Formato debe ser MM/AA';
    const [month, year] = value.split('/');
    const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    return expDate > new Date() ? null : 'La tarjeta está vencida';
  },
  cvv: (value) => /^\d{3,4}$/.test(value) ? null : 'El CVV debe tener 3 o 4 dígitos'
};

function Checkout() {
  const navigate = useNavigate();
  const { state, showToast, clearCart } = useApp();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    metodoPago: 'tarjeta',
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaExpiracion: '',
    cvv: ''
  });

  // Ref para rastrear si el componente está montado
  const isMountedRef = useRef(true);

  // Guardar una copia local de los items del carrito al montar el componente
  // Esto evita errores cuando clearCart() limpia state.cartItems durante la navegación
  const [localCartItems] = useState(() => [...state.cartItems]);

  const cartTotal = localCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const envio = 15;
  const total = cartTotal + envio;

  // Usar el hook centralizado para manejar el scroll cuando el modal está abierto
  useBodyScroll(showConfirmExit);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setStep(1);
    setErrors({});
  }, []);

  // Manejar tecla Escape para cerrar el modal
  useEffect(() => {
    if (showConfirmExit) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setShowConfirmExit(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showConfirmExit]);

  const maskCardNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    const masked = cleaned.slice(0, -4).replace(/\d/g, '*') + cleaned.slice(-4);
    return masked.replace(/(.{4})/g, '$1 ').trim();
  };

  const validateField = (name, value) => {
    if (validations[name]) {
      return validations[name](value);
    }
    return null;
  };

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      ['nombre', 'apellido', 'email', 'telefono'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    } else if (step === 2) {
      ['direccion', 'ciudad', 'departamento'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    } else if (step === 3 && formData.metodoPago === 'tarjeta') {
      ['numeroTarjeta', 'nombreTarjeta', 'fechaExpiracion', 'cvv'].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'telefono') {
      finalValue = value.replace(/\D/g, '').slice(0, 9);
    } else if (name === 'numeroTarjeta') {
      finalValue = value.replace(/\D/g, '').slice(0, 16);
    } else if (name === 'cvv') {
      finalValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'fechaExpiracion') {
      finalValue = value.replace(/\D/g, '').slice(0, 4);
      if (finalValue.length >= 2) {
        finalValue = finalValue.slice(0, 2) + '/' + finalValue.slice(2);
      }
    }

    setFormData({ ...formData, [name]: finalValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!validateStep()) {
      showToast('Por favor corrige los errores', 'error');
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinalizarCompra();
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleCancel = () => {
    if (Object.values(formData).some(value => value !== '' && value !== 'tarjeta')) {
      setShowConfirmExit(true);
    } else {
      navigate('/tienda');
    }
  };

  const confirmExit = () => {
    // Primero cerrar el modal
    setShowConfirmExit(false);

    // Esperar a que React actualice el DOM antes de navegar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        navigate('/tienda', { replace: true });
        // Limpiar carrito después de navegar
        setTimeout(() => {
          clearCart();
        }, 100);
      });
    });
  };

  const handleFinalizarCompra = async () => {
    // Si ya se está procesando, no hacer nada
    if (processing) return;

    try {
      if (!isMountedRef.current) return;
      setProcessing(true);

      const validation = validatePaymentData(formData);
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        showToast(errorMessages, 'error');
        if (isMountedRef.current) setProcessing(false);
        return;
      }

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

      if (!isMountedRef.current) return;

      if (!paymentResult || !paymentResult.success) {
        showToast(paymentResult?.error || 'Error al procesar el pago', 'error');
        if (isMountedRef.current) setProcessing(false);
        return;
      }

      showToast('¡Pago procesado exitosamente!', 'success');

      const { user } = await getCurrentUser();

      // Usar la copia local de los items del carrito
      const orderItems = localCartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const orderData = {
        user_id: user?.id || null,
        items: orderItems,
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

      const { data: order, error } = await createOrder(orderData);

      if (!isMountedRef.current) return;

      if (error) {
        showToast('Error al crear la orden. Inténtalo de nuevo.', 'error');
        console.error('Error creating order:', error);
        if (isMountedRef.current) setProcessing(false);
        return;
      }

      // Preparar datos de navegación antes de limpiar
      const navigationData = {
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('es-PE'),
        customerName: `${formData.nombre} ${formData.apellido}`,
        customerEmail: formData.email,
        total: order.total,
        items: orderItems,
        transactionId: paymentResult.transactionId,
        paymentMethod: formData.metodoPago
      };

      showToast('¡Orden creada exitosamente!', 'success');

      // Usar requestAnimationFrame para asegurar que el DOM se actualice correctamente
      requestAnimationFrame(() => {
        // Navegar con replace para evitar que el usuario vuelva al checkout
        navigate('/confirmacion', {
          state: navigationData,
          replace: true
        });

        // Limpiar carrito después de navegar
        setTimeout(() => {
          if (isMountedRef.current) {
            clearCart();
          }
        }, 100);
      });

    } catch (err) {
      if (!isMountedRef.current) return;
      showToast('Error inesperado al procesar la orden', 'error');
      console.error('Unexpected error:', err);
      if (isMountedRef.current) setProcessing(false);
    }
  };

  return (
    <>
      <div className="checkout">
        {localCartItems.length === 0 ? (
          <div className="checkout-empty">
            <div className="container">
              <i className="fas fa-shopping-cart"></i>
              <h2>Tu carrito está vacío</h2>
              <p>Agrega productos para continuar con tu compra</p>
              <button className="btn btn-primary" onClick={() => navigate('/tienda')}>
                <i className="fas fa-shopping-bag"></i> Ir a la Tienda
              </button>
            </div>
          </div>
        ) : (
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
                  {step === 1 && (
                    <div className="checkout-section">
                      <h2>Datos Personales</h2>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Nombre *</label>
                          <input
                            type="text"
                            name="nombre"
                            className={`form-input ${errors.nombre ? 'input-error' : ''}`}
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Tu nombre"
                            required
                          />
                          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Apellido *</label>
                          <input
                            type="text"
                            name="apellido"
                            className={`form-input ${errors.apellido ? 'input-error' : ''}`}
                            value={formData.apellido}
                            onChange={handleInputChange}
                            placeholder="Tu apellido"
                            required
                          />
                          {errors.apellido && <span className="error-message">{errors.apellido}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            name="email"
                            className={`form-input ${errors.email ? 'input-error' : ''}`}
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            required
                          />
                          {errors.email && <span className="error-message">{errors.email}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Teléfono *</label>
                          <input
                            type="tel"
                            name="telefono"
                            className={`form-input ${errors.telefono ? 'input-error' : ''}`}
                            value={formData.telefono}
                            onChange={handleInputChange}
                            placeholder="912345678"
                            required
                          />
                          {errors.telefono && <span className="error-message">{errors.telefono}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="checkout-section">
                      <h2>Dirección de Envío</h2>
                      <div className="form-group">
                        <label className="form-label">Dirección *</label>
                        <input
                          type="text"
                          name="direccion"
                          className={`form-input ${errors.direccion ? 'input-error' : ''}`}
                          placeholder="Calle, número, piso, etc."
                          value={formData.direccion}
                          onChange={handleInputChange}
                          required
                        />
                        {errors.direccion && <span className="error-message">{errors.direccion}</span>}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Ciudad *</label>
                          <input
                            type="text"
                            name="ciudad"
                            className={`form-input ${errors.ciudad ? 'input-error' : ''}`}
                            placeholder="Lima, Cusco, etc."
                            value={formData.ciudad}
                            onChange={handleInputChange}
                            required
                          />
                          {errors.ciudad && <span className="error-message">{errors.ciudad}</span>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Departamento *</label>
                          <select
                            name="departamento"
                            className={`form-input ${errors.departamento ? 'input-error' : ''}`}
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
                          {errors.departamento && <span className="error-message">{errors.departamento}</span>}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Código Postal</label>
                        <input
                          type="text"
                          name="codigoPostal"
                          className="form-input"
                          placeholder="Opcional"
                          value={formData.codigoPostal}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  )}

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
                            <label className="form-label">Número de Tarjeta *</label>
                            <input
                              type="text"
                              name="numeroTarjeta"
                              className={`form-input ${errors.numeroTarjeta ? 'input-error' : ''}`}
                              placeholder="1234 5678 9012 3456"
                              value={formData.numeroTarjeta}
                              onChange={handleInputChange}
                              maxLength="19"
                              required
                            />
                            {formData.numeroTarjeta && (
                              <p className="card-preview">
                                <i className="fas fa-credit-card"></i> {maskCardNumber(formData.numeroTarjeta)}
                              </p>
                            )}
                            {errors.numeroTarjeta && <span className="error-message">{errors.numeroTarjeta}</span>}
                          </div>
                          <div className="form-group">
                            <label className="form-label">Nombre en la Tarjeta *</label>
                            <input
                              type="text"
                              name="nombreTarjeta"
                              className={`form-input ${errors.nombreTarjeta ? 'input-error' : ''}`}
                              placeholder="Nombre Completo"
                              value={formData.nombreTarjeta}
                              onChange={handleInputChange}
                              required
                            />
                            {errors.nombreTarjeta && <span className="error-message">{errors.nombreTarjeta}</span>}
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label className="form-label">Fecha de Expiración *</label>
                              <input
                                type="text"
                                name="fechaExpiracion"
                                className={`form-input ${errors.fechaExpiracion ? 'input-error' : ''}`}
                                placeholder="MM/AA"
                                value={formData.fechaExpiracion}
                                onChange={handleInputChange}
                                maxLength="5"
                                required
                              />
                              {errors.fechaExpiracion && <span className="error-message">{errors.fechaExpiracion}</span>}
                            </div>
                            <div className="form-group">
                              <label className="form-label">CVV *</label>
                              <input
                                type="password"
                                name="cvv"
                                className={`form-input ${errors.cvv ? 'input-error' : ''}`}
                                placeholder="***"
                                value={formData.cvv}
                                onChange={handleInputChange}
                                maxLength="4"
                                required
                              />
                              {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                            </div>
                          </div>
                          <div className="card-security-info">
                            <i className="fas fa-info-circle"></i>
                            <p>Tu información de tarjeta es procesada de forma segura y nunca es almacenada</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="checkout-actions">
                    <button type="button" className="btn btn-danger" onClick={handleCancel} disabled={processing}>
                      <i className="fas fa-times"></i> Cancelar
                    </button>
                    {step > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handlePreviousStep}
                        disabled={processing}
                      >
                        <i className="fas fa-arrow-left"></i> Anterior
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={processing}>
                      {step === 3 && processing && (
                        <span><i className="fas fa-spinner fa-spin"></i> Procesando...</span>
                      )}
                      {step === 3 && !processing && (
                        <span><i className="fas fa-check"></i> Finalizar Compra</span>
                      )}
                      {step !== 3 && (
                        <span>Siguiente <i className="fas fa-arrow-right"></i></span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="order-summary">
                <h3>Resumen del Pedido</h3>
                <div className="order-items">
                  {localCartItems.map((item) => (
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
        )}
      </div>

      {showConfirmExit && (
        <div className="modal-overlay" onClick={() => setShowConfirmExit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Abandonar compra</h2>
              <button className="modal-close" onClick={() => setShowConfirmExit(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro de que deseas abandonar tu compra?</p>
              <p className="text-muted">Se perderán todos los datos que has ingresado.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowConfirmExit(false)}>
                Continuar comprando
              </button>
              <button className="btn btn-danger" onClick={confirmExit}>
                Sí, abandonar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;