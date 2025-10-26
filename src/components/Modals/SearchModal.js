import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './SearchModal.css';

function SearchModal() {
  const { state, toggleSearchModal, setSearchQuery } = useApp();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (state.isSearchModalOpen) {
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';

      // Focus en el input cuando se abre el modal
      setTimeout(() => {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
      }, 100);
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [state.isSearchModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      alert(`Buscando: "${searchInput.trim()}"`);
      toggleSearchModal();
      setSearchInput('');
    }
  };

  const handleSuggestionClick = (term) => {
    setSearchInput(term);
    setSearchQuery(term);
    alert(`Buscando: "${term}"`);
    toggleSearchModal();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleSearchModal();
    }
  };

  const suggestions = [
    'Ponchos',
    'Polleras', 
    'Alpaca',
    'Chales',
    'Bordado',
    'Tradicional'
  ];

  return (
    <div className={`search-modal ${state.isSearchModalOpen ? 'active' : ''}`} onClick={handleOverlayClick}>
        <div className="search-modal-content">
          <div className="search-modal-header">
            <h3>Buscar Productos</h3>
            <button className="search-modal-close" onClick={toggleSearchModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="¿Qué estás buscando?"
              id="searchInput"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoComplete="off"
            />
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <div className="search-suggestions">
            <h4>Búsquedas populares:</h4>
            <div className="suggestion-tags">
              {suggestions.map((suggestion) => (
                <span
                  key={suggestion}
                  className="suggestion-tag"
                  onClick={() => handleSuggestionClick(suggestion.toLowerCase())}
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}

export default SearchModal;