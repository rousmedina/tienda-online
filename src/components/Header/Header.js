import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toggleSearchModal,
    toggleLoginModal,
    toggleCartSidebar,
    toggleMobileMenu,
    cartCount
  } = useApp();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-content">
            <span><i className="fas fa-phone"></i> Contacto: +51 999 888 777</span>
            <span><i className="fas fa-truck"></i> Envío gratis en compras mayores a S/. 120</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <a href="/" className="logo" onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}>
              Chinasaqra Andina
            </a>

            <ul className="nav-menu">
              <li>
                <a
                  href="/"
                  className={location.pathname === '/' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/tienda"
                  className={location.pathname === '/tienda' ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/tienda');
                  }}
                >
                  Tienda
                </a>
              </li>
              <li>
                <a href="#categorias" onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === '/') {
                    scrollToSection('categorias');
                  } else {
                    navigate('/');
                  }
                }}>
                  Categorías
                </a>
              </li>
              <li>
                <a href="#nosotros" onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === '/') {
                    scrollToSection('nosotros');
                  } else {
                    navigate('/');
                  }
                }}>
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#contacto" onClick={(e) => {
                  e.preventDefault();
                  if (location.pathname === '/') {
                    scrollToSection('contacto');
                  } else {
                    navigate('/');
                  }
                }}>
                  Contacto
                </a>
              </li>
            </ul>

            <div className="nav-actions">
              <button className="btn btn-outline" onClick={toggleSearchModal}>
                <i className="fas fa-search"></i>
              </button>
              <button className="btn btn-outline cart-btn" onClick={toggleCartSidebar}>
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-count">{cartCount}</span>
              </button>
              <button className="btn btn-outline" onClick={toggleLoginModal}>
                <i className="fas fa-user"></i>
              </button>
              <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}

export default Header;