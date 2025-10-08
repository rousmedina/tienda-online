import React from 'react';
import './Hero.css';

function Hero() {
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
    <section className="hero" id="inicio">
      <div className="container">
        <div className="hero-content animate-in">
          <h1>Chinasaqra Andina</h1>
          <p>Auténtica moda andina con tradición milenaria</p>
          <button 
            className="btn btn-primary"
            onClick={() => scrollToSection('tienda')}
          >
            <i className="fas fa-shopping-bag"></i>
            Descubrir Colección
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;