import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAllProducts } from '../services/productService';
import { getImageUrl } from '../services/storageService';
import Loading from '../components/Loading/Loading';
import './ShopPage.css';

function ShopPage() {
  const navigate = useNavigate();
  const { addToCart, addToWishlist, state, showToast } = useApp();

  // Estados para filtros y ordenamiento
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('destacados');
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos de Supabase
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getAllProducts();

    if (error || !data || data.length === 0) {
      if (error) {
        console.error('Error loading products:', error);
      }
      console.log('Usando productos de respaldo');
      // Usar productos de respaldo si falla o no hay datos
      setAllProducts([
    {
      id: 'poncho-tradicional',
      name: 'Poncho Andino Tradicional',
      category: 'Ponchos',
      price: 149,
      originalPrice: 189,
      badge: 'Nuevo',
      badgeColor: 'var(--secondary)',
      icon: 'fas fa-tshirt',
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.8,
      sales: 245,
      stock: 50
    },
    {
      id: 'pollera-cusqueña',
      name: 'Pollera Cusqueña Bordada',
      category: 'Polleras',
      price: 125,
      badge: 'Popular',
      badgeColor: 'var(--accent)',
      icon: 'fas fa-female',
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.9,
      sales: 312,
      stock: 35
    },
    {
      id: 'chaleco-alpaca',
      name: 'Chaleco de Alpaca Premium',
      category: 'Chalecos',
      price: 199,
      icon: 'fas fa-vest',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      rating: 5.0,
      sales: 189,
      stock: 20
    },
    {
      id: 'chal-tejido',
      name: 'Chal Tejido a Mano',
      category: 'Chales',
      price: 65,
      originalPrice: 85,
      badge: 'Oferta',
      badgeColor: 'var(--secondary)',
      icon: 'fas fa-scarf',
      sizes: ['Único'],
      rating: 4.7,
      sales: 421,
      stock: 60
    },
    {
      id: 'poncho-colorido',
      name: 'Poncho Multicolor Artesanal',
      category: 'Ponchos',
      price: 175,
      icon: 'fas fa-tshirt',
      sizes: ['M', 'L', 'XL'],
      rating: 4.6,
      sales: 156,
      stock: 25
    },
    {
      id: 'pollera-fiesta',
      name: 'Pollera de Fiesta Bordada',
      category: 'Polleras',
      price: 165,
      originalPrice: 195,
      badge: 'Oferta',
      badgeColor: 'var(--secondary)',
      icon: 'fas fa-female',
      sizes: ['S', 'M', 'L'],
      rating: 4.8,
      sales: 203,
      stock: 15
    },
    {
      id: 'chaleco-lana',
      name: 'Chaleco de Lana Clásico',
      category: 'Chalecos',
      price: 135,
      icon: 'fas fa-vest',
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.5,
      sales: 178,
      stock: 30
    },
    {
      id: 'chal-alpaca',
      name: 'Chal de Alpaca Suave',
      category: 'Chales',
      price: 95,
      icon: 'fas fa-scarf',
      sizes: ['Único'],
      rating: 4.9,
      sales: 267,
      stock: 40
    }
      ]);
    } else {
      // Mapear datos de Supabase al formato del componente
      const mappedProducts = data.map(product => ({
        id: product.slug || product.id, // Usar slug si está disponible, sino UUID
        name: product.name,
        category: product.category,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        badge: product.badge,
        badgeColor: product.badge_color,
        icon: getCategoryIcon(product.category),
        sizes: product.sizes || [],
        colors: product.colors || [],
        rating: parseFloat(product.rating) || 0,
        sales: product.sales || 0,
        stock: product.stock || 50,
        description: product.description,
        image_url: product.image_url || getImageUrl(product.image_path),
        images: product.images || []
      }));
      setAllProducts(mappedProducts);
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

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Filtro por categoría
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtro por rango de precio
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filtro por tallas
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p =>
        p.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Filtro por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Ordenamiento
    switch (sortBy) {
      case 'precio-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'precio-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nombre':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'ventas':
        filtered.sort((a, b) => b.sales - a.sales);
        break;
      default:
        // destacados - orden original
        break;
    }

    return filtered;
  }, [allProducts, selectedCategory, priceRange, selectedSizes, sortBy, searchQuery]);

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleAddToCart = (product) => {
    const stock = product.stock || 50; // Stock por defecto si no está definido

    // Verificar si hay stock disponible
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

  const handleAddToWishlist = (product) => {
    const isInWishlist = state.wishlist?.some(item => item.id === product.id);
    addToWishlist(product);
    if (isInWishlist) {
      showToast(`${product.name} removido de favoritos`, 'info');
    } else {
      showToast(`${product.name} agregado a favoritos`, 'success');
    }
  };

  const clearFilters = () => {
    setSelectedCategory('todos');
    setPriceRange([0, 500]);
    setSelectedSizes([]);
    setSearchQuery('');
    setSortBy('destacados');
  };

  if (loading) {
    return <Loading fullScreen text="Cargando productos..." />;
  }

  return (
    <div className="shop-page">
      <div className="container">
        <div className="shop-header">
          <h1>Nuestra Tienda</h1>
          <p>Descubre nuestra colección completa de moda andina auténtica</p>
        </div>

        <div className="shop-layout">
          {/* Sidebar de Filtros */}
          <aside className="shop-sidebar">
            <div className="filter-section">
              <div className="filter-header">
                <h3>Filtros</h3>
                <button className="clear-filters" onClick={clearFilters}>
                  Limpiar
                </button>
              </div>

              {/* Búsqueda */}
              <div className="filter-group">
                <label className="filter-label">Buscar</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categorías */}
              <div className="filter-group">
                <label className="filter-label">Categoría</label>
                <div className="filter-options">
                  {['todos', 'Ponchos', 'Polleras', 'Chalecos', 'Chales'].map((cat) => (
                    <label key={cat} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span>{cat === 'todos' ? 'Todos' : cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rango de Precio */}
              <div className="filter-group">
                <label className="filter-label">
                  Precio: S/. {priceRange[0]} - S/. {priceRange[1]}
                </label>
                <div className="price-range">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="range-slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="range-slider"
                  />
                </div>
              </div>

              {/* Tallas */}
              <div className="filter-group">
                <label className="filter-label">Tallas</label>
                <div className="size-filters">
                  {['S', 'M', 'L', 'XL', 'XXL', 'Único'].map((size) => (
                    <button
                      key={size}
                      className={`size-filter-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => handleSizeToggle(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Contenido Principal */}
          <main className="shop-content">
            {/* Barra de herramientas */}
            <div className="shop-toolbar">
              <div className="results-count">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="sort-controls">
                <label>Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="destacados">Destacados</option>
                  <option value="nombre">Nombre (A-Z)</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                  <option value="rating">Mejor Valorados</option>
                  <option value="ventas">Más Vendidos</option>
                </select>
              </div>
            </div>

            {/* Grid de Productos */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card-shop">
                    <div className="product-image" onClick={() => navigate(`/producto/${product.id}`)}>
                      {product.badge && (
                        <div className="product-badge" style={{ background: product.badgeColor }}>
                          {product.badge}
                        </div>
                      )}
                      <button
                        className="wishlist-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToWishlist(product);
                        }}
                      >
                        <i className={`${state.wishlist?.some(item => item.id === product.id) ? 'fas' : 'far'} fa-heart`}></i>
                      </button>
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} />
                      ) : (
                        <i className={product.icon}></i>
                      )}
                    </div>
                    <div className="product-info">
                      <p className="product-category">{product.category}</p>
                      <h3 className="product-name" onClick={() => navigate(`/producto/${product.id}`)}>
                        {product.name}
                      </h3>
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
                      <div className="product-price">
                        <span className="price-current">S/. {product.price}</span>
                        {product.originalPrice && (
                          <span className="price-original">S/. {product.originalPrice}</span>
                        )}
                      </div>
                      {product.stock <= 5 && product.stock > 0 && (
                        <p className="stock-warning">
                          <i className="fas fa-exclamation-circle"></i> Solo quedan {product.stock} unidades
                        </p>
                      )}
                      {product.stock === 0 ? (
                        <button className="btn btn-outline add-to-cart-btn" disabled>
                          <i className="fas fa-times-circle"></i> Sin Stock
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="fas fa-cart-plus"></i> Agregar al Carrito
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o la búsqueda</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Limpiar Filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default ShopPage;
