import React from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import './MobileMenu.css';

function MobileMenu() {
  const { state, toggleMobileMenu } = useApp();

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleMobileMenu();
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    toggleMobileMenu(); // Cerrar menú después de navegar
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'tienda', label: 'Tienda' },
    { id: 'categorias', label: 'Categorías' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' }
  ];

  if (!state.isMobileMenuOpen) return null;

  const portalRoot = document.getElementById('portal-root');
  if (!portalRoot) return null;

  return createPortal(
    <>
      <div className="mobile-overlay active" onClick={handleOverlayClick}></div>
      <div className="mobile-menu active">
        <div className="mobile-menu-header">
          <a 
            href="#inicio" 
            className="logo"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inicio');
            }}
          >
            Chinasaqra Andina
          </a>
          <button className="mobile-menu-close" onClick={toggleMobileMenu}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="mobile-menu-content">
          {menuItems.map((item) => (
            <a 
              key={item.id}
              href={`#${item.id}`} 
              className="mobile-menu-item"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </>,
    portalRoot
  );
}

export default MobileMenu;