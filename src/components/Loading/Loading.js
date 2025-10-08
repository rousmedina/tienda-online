import React from 'react';
import './Loading.css';

function Loading({ fullScreen = false, text = 'Cargando...' }) {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-inline">
      <div className="spinner-small"></div>
      <span>{text}</span>
    </div>
  );
}

export default Loading;
