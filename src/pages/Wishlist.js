import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Wishlist.css';

function Wishlist() {
  const navigate = useNavigate();
  const { state, addToCart, removeFromWishlist, showToast } = useApp();

  const handleAddToCart = (product) => {
    const stock = product.stock || 50;

    if (stock <= 0) {
      showToast('Producto sin stock disponible', 'error');
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: stock
    });

    showToast(`${product.name} agregado al carrito`, 'success');
  };

  const handleRemoveFromWishlist = (product) => {
    removeFromWishlist(product.id);
    showToast(`${product.name} removido de favoritos`, 'info');
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product);
    removeFromWishlist(product.id);
  };

  if (!state.wishlist || state.wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="container">
          <i className="far fa-heart"></i>
          <h2>Tu lista de favoritos está vacía</h2>
          <p>Explora nuestro catálogo y guarda tus productos favoritos</p>
          <button className="btn btn-primary" onClick={() => navigate('/tienda')}>
            <i className="fas fa-store"></i> Ir a la Tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>
            <i className="fas fa-heart"></i> Mis Favoritos
          </h1>
          <p>{state.wishlist.length} producto{state.wishlist.length !== 1 ? 's' : ''} guardado{state.wishlist.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="wishlist-grid">
          {state.wishlist.map((product) => (
            <div key={product.id} className="wishlist-card">
              <button
                className="remove-wishlist-btn"
                onClick={() => handleRemoveFromWishlist(product)}
                title="Quitar de favoritos"
              >
                <i className="fas fa-times"></i>
              </button>

              <div
                className="wishlist-image"
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                {product.badge && (
                  <div className="product-badge" style={{ background: product.badgeColor }}>
                    {product.badge}
                  </div>
                )}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <i className={product.icon || 'fas fa-tshirt'}></i>
                )}
              </div>

              <div className="wishlist-info">
                <p className="product-category">{product.category}</p>
                <h3
                  className="product-name"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {product.name}
                </h3>

                {product.rating && (
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fa${i < Math.floor(product.rating) ? 's' : 'r'} fa-star`}
                        ></i>
                      ))}
                    </div>
                    <span className="rating-text">({product.rating})</span>
                  </div>
                )}

                <div className="product-price">
                  <span className="price-current">S/. {product.price}</span>
                  {product.originalPrice && (
                    <span className="price-original">S/. {product.originalPrice}</span>
                  )}
                </div>

                {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                  <p className="stock-warning">
                    <i className="fas fa-exclamation-circle"></i> Solo quedan {product.stock} unidades
                  </p>
                )}

                <div className="wishlist-actions">
                  {product.stock === 0 ? (
                    <button className="btn btn-outline btn-block" disabled>
                      <i className="fas fa-times-circle"></i> Sin Stock
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleAddToCart(product)}
                      >
                        <i className="fas fa-cart-plus"></i> Agregar
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleMoveToCart(product)}
                      >
                        <i className="fas fa-shopping-cart"></i> Mover al carrito
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="wishlist-footer">
          <button className="btn btn-outline" onClick={() => navigate('/tienda')}>
            <i className="fas fa-arrow-left"></i> Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}

export default Wishlist;