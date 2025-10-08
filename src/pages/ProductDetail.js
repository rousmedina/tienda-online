import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getProductById } from '../services/productService';
import Loading from '../components/Loading/Loading';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleCartSidebar, showToast } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const { data, error } = await getProductById(id);

    if (error) {
      showToast('Error al cargar el producto', 'error');
      console.error('Error loading product:', error);
      // Usar producto de respaldo
      setProduct({
        id: id,
        name: 'Producto no encontrado',
        category: 'General',
        price: 0,
        description: 'Este producto no está disponible en este momento.',
        features: [],
        sizes: ['M'],
        colors: ['Natural'],
        icon: 'fas fa-tshirt'
      });
    } else if (data) {
      // Mapear datos de Supabase al formato del componente
      const mappedProduct = {
        id: data.id,
        name: data.name,
        category: data.category,
        price: parseFloat(data.price),
        originalPrice: data.original_price ? parseFloat(data.original_price) : null,
        description: data.description || '',
        features: data.features || [],
        sizes: data.sizes || ['M'],
        colors: data.colors || ['Natural'],
        icon: getCategoryIcon(data.category),
        badge: data.badge,
        badgeColor: data.badge_color
      };
      setProduct(mappedProduct);
      setSelectedSize(mappedProduct.sizes[0]);
    } else {
      showToast('Producto no encontrado', 'error');
      navigate('/tienda');
    }

    setLoading(false);
  };

  // Helper para obtener el ícono según categoría
  const getCategoryIcon = (category) => {
    const icons = {
      'Ponchos': 'fas fa-tshirt',
      'Polleras': 'fas fa-female',
      'Chalecos': 'fas fa-vest',
      'Chales': 'fas fa-scarf'
    };
    return icons[category] || 'fas fa-tshirt';
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: quantity
    });
    toggleCartSidebar();
  };

  const increaseQuantity = () => setQuantity(quantity + 1);
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (loading) {
    return <Loading fullScreen text="Cargando producto..." />;
  }

  if (!product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="no-product">
            <i className="fas fa-exclamation-circle"></i>
            <h2>Producto no encontrado</h2>
            <button className="btn btn-primary" onClick={() => navigate('/tienda')}>
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <button className="back-button" onClick={() => navigate('/tienda')}>
          <i className="fas fa-arrow-left"></i> Volver a la tienda
        </button>

        <div className="product-detail-content">
          <div className="product-detail-image">
            {product.badge && (
              <div
                className="product-badge"
                style={{ background: product.badgeColor }}
              >
                {product.badge}
              </div>
            )}
            <i className={product.icon}></i>
          </div>

          <div className="product-detail-info">
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>

            <div className="product-price-section">
              <span className="price-current">S/. {product.price}</span>
              {product.originalPrice && (
                <span className="price-original">S/. {product.originalPrice}</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-features">
              <h3>Características:</h3>
              <ul>
                {product.features.map((feature, index) => (
                  <li key={index}>
                    <i className="fas fa-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="product-options">
              <div className="option-group">
                <label>Talla:</label>
                <div className="size-selector">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <label>Cantidad:</label>
                <div className="quantity-selector">
                  <button onClick={decreaseQuantity}>
                    <i className="fas fa-minus"></i>
                  </button>
                  <span>{quantity}</span>
                  <button onClick={increaseQuantity}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="product-actions-detail">
              <button className="btn btn-primary btn-large" onClick={handleAddToCart}>
                <i className="fas fa-cart-plus"></i>
                Agregar al Carrito - S/. {(product.price * quantity).toFixed(2)}
              </button>
            </div>

            <div className="product-shipping">
              <div className="shipping-item">
                <i className="fas fa-truck"></i>
                <span>Envío gratis en compras mayores a S/. 200</span>
              </div>
              <div className="shipping-item">
                <i className="fas fa-undo"></i>
                <span>Devoluciones gratuitas dentro de 30 días</span>
              </div>
              <div className="shipping-item">
                <i className="fas fa-shield-alt"></i>
                <span>Compra protegida y segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
