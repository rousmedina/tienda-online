import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getFeaturedProducts } from '../../services/productService';
import { getImageUrl } from '../../services/storageService';
import Loading from '../Loading/Loading';
import './Products.css';

function Products() {
  const navigate = useNavigate();
  const { addToCart, showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeaturedProducts = async () => {
    const { data, error } = await getFeaturedProducts(4);

    if (error) {
      console.error('Error loading products:', error);
      // Usar productos de respaldo
      setProducts([
        {
          id: 'poncho-tradicional',
          name: 'Poncho Andino Tradicional',
          category: 'Ponchos',
          price: 149,
          originalPrice: 189,
          badge: 'Nuevo',
          badgeColor: 'var(--secondary)',
          icon: 'fas fa-tshirt'
        },
        {
          id: 'pollera-cusqueña',
          name: 'Pollera Cusqueña Bordada',
          category: 'Polleras',
          price: 125,
          badge: 'Popular',
          badgeColor: 'var(--accent)',
          icon: 'fas fa-female'
        },
        {
          id: 'chaleco-alpaca',
          name: 'Chaleco de Alpaca Premium',
          category: 'Chalecos',
          price: 199,
          icon: 'fas fa-vest'
        },
        {
          id: 'chal-tejido',
          name: 'Chal Tejido a Mano',
          category: 'Chales',
          price: 65,
          originalPrice: 85,
          badge: 'Oferta',
          badgeColor: 'var(--secondary)',
          icon: 'fas fa-scarf'
        }
      ]);
    } else if (data && data.length > 0) {
      // Mapear datos de Supabase al formato del componente
      const mappedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        badge: product.badge,
        badgeColor: product.badge_color,
        icon: getCategoryIcon(product.category),
        image_url: product.image_url || getImageUrl(product.image_path),
        images: product.images || []
      }));
      setProducts(mappedProducts);
    } else {
      // No hay productos, usar array vacío o productos de respaldo
      setProducts([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFeaturedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price
    });
    showToast(`${product.name} agregado al carrito por S/. ${product.price}`, 'success');
  };

  const handleQuickView = (product) => {
    navigate(`/producto/${product.id}`);
  };

  return (
    <section className="products" id="tienda">
      <div className="container">
        <h2 className="section-title">Productos Destacados</h2>
        {loading ? (
          <Loading text="Cargando productos destacados..." />
        ) : (
          <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.badge && (
                  <div
                    className="product-badge"
                    style={{ background: product.badgeColor }}
                  >
                    {product.badge}
                  </div>
                )}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <i className={product.icon}></i>
                )}
              </div>
              <div className="product-info">
                <p className="product-category">{product.category}</p>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  <span className="price-current">S/. {product.price}</span>
                  {product.originalPrice && (
                    <span className="price-original">S/. {product.originalPrice}</span>
                  )}
                </div>
                <div className="product-actions">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleQuickView(product)}
                  >
                    Vista Rápida
                  </button>
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => handleAddToCart(product)}
                  >
                    <i className="fas fa-cart-plus"></i> Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;