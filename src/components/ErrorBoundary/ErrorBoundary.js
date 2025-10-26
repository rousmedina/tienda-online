import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Oops! Algo salió mal</h1>
            <p className="error-message">
              Lo sentimos, ha ocurrido un error inesperado.
              Estamos trabajando para solucionarlo.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Detalles técnicos (solo en desarrollo)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button className="btn btn-primary" onClick={this.handleReload}>
                <i className="fas fa-redo"></i> Recargar Página
              </button>
              <a href="/" className="btn btn-outline">
                <i className="fas fa-home"></i> Ir al Inicio
              </a>
            </div>

            <div className="error-contact">
              <p>Si el problema persiste, contáctanos:</p>
              <a href="mailto:soporte@chinasaqraandina.com">
                <i className="fas fa-envelope"></i> soporte@chinasaqraandina.com
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
