import React from 'react';
import { useApp } from '../../context/AppContext';
import { useBodyScroll } from '../../hooks/useBodyScroll';
import './MobileMenu.css';

function MobileMenu() {
  const { state, toggleMobileMenu } = useApp();

  // Usar el hook centralizado para manejar el scroll
  useBodyScroll(state.isMobileMenuOpen);

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

  return (
    <>
      <div className={`mobile-overlay ${state.isMobileMenuOpen ? 'active' : ''}`} onClick={handleOverlayClick}></div>
      <div className={`mobile-menu ${state.isMobileMenuOpen ? 'active' : ''}`}>
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
    </>
  );
}

export default MobileMenu;