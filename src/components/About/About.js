import React from 'react';
import './About.css';

function About() {
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
    <section className="about" id="nosotros">
      <div className="container">
        <div className="about-content">
          <div className="about-text">
            <h2>Nuestra Historia</h2>
            <p>
              Chinasaqra Andina nace del amor por preservar las tradiciones textiles ancestrales del Perú. 
              Cada prenda que creamos lleva consigo siglos de conocimiento transmitido de generación en generación.
            </p>
            <p>
              Trabajamos directamente con artesanas de comunidades andinas, garantizando técnicas auténticas 
              y materiales de la más alta calidad como la lana de alpaca y vicuña.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => scrollToSection('contacto')}
            >
              Conoce Más
            </button>
          </div>
          <div className="about-image">
            <i className="fas fa-mountain"></i>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;