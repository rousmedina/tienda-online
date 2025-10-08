import React, { useState } from 'react';
import './Footer.css';

function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      alert(`¡Gracias por suscribirte con el email: ${email}!`);
      setEmail('');
    }
  };

  return (
    <>
      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <h2>Mantente al día con nuestras novedades</h2>
          <p>Recibe noticias sobre nuevas colecciones y ofertas especiales</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary">
              Suscribirse
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contacto">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Chinasaqra Andina</h3>
              <p className="footer-description">
                Auténtica moda andina con tradición milenaria
              </p>
              <div className="social-links">
                <a href="https://facebook.com/chinasaqraandina" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://instagram.com/chinasaqraandina" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://wa.me/51999888777" aria-label="WhatsApp">
                  <i className="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>

            <div className="footer-section">
              <h3>Tienda</h3>
              <a href="/categoria/ponchos">Ponchos</a>
              <a href="/categoria/polleras">Polleras</a>
              <a href="/categoria/chalecos">Chalecos</a>
              <a href="/categoria/chales">Chales</a>
              <a href="/ofertas">Ofertas</a>
            </div>

            <div className="footer-section">
              <h3>Ayuda</h3>
              <a href="/ayuda/envios">Envíos</a>
              <a href="/ayuda/devoluciones">Devoluciones</a>
              <a href="/ayuda/tallas">Tallas</a>
              <a href="/ayuda/cuidado">Cuidado de prendas</a>
              <a href="/ayuda/faq">FAQ</a>
            </div>

            <div className="footer-section">
              <h3>Contacto</h3>
              <a href="tel:+51999888777">
                <i className="fas fa-phone"></i> +51 999 888 777
              </a>
              <a href="mailto:info@chinasaqraandina.com">
                <i className="fas fa-envelope"></i> info@chinasaqraandina.com
              </a>
              <a href="https://maps.google.com/?q=Lima,Peru">
                <i className="fas fa-map-marker-alt"></i> Lima, Perú
              </a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Chinasaqra Andina. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;