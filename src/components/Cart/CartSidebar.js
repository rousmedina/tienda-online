import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CartSidebar.css';

function CartSidebar() {
  const navigate = useNavigate();
  const {
    state,
    toggleCartSidebar,
    updateCartQuantity,
    removeFromCart,
    cartTotal,
    cartCount
  } = useApp();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleCartSidebar();
    }
  };

  const handleCheckout = () => {
    toggleCartSidebar();
    navigate('/checkout');
  };

  if (!state.isCartSidebarOpen) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <>
      <div className="cart-overlay active" onClick={handleOverlayClick}></div>
      <div className="cart-sidebar active">
        <div className="cart-header">
          <h3>Tu Carrito ({cartCount})</h3>
          <button className="cart-close" onClick={toggleCartSidebar}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="cart-content">
          {state.cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              {state.cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <i className="fas fa-tshirt"></i>
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">S/. {item.price}</div>
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateCartQuantity(item.id, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateCartQuantity(item.id, 1)}
                      >
                        +
                      </button>
                      <button 
                        className="btn btn-outline btn-sm remove-btn" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="cart-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>S/. {cartTotal}</span>
                </div>
                <div className="total-row">
                  <span>Envío:</span>
                  <span className="free-shipping">Gratis</span>
                </div>
                <div className="total-row total-final">
                  <span>Total:</span>
                  <span>S/. {cartTotal}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                  <i className="fas fa-credit-card"></i>
                  Finalizar Compra
                </button>
                <button className="btn btn-outline continue-btn" onClick={toggleCartSidebar}>
                  Seguir Comprando
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    portalRoot
  );
}

export default CartSidebar;