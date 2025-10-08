import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import SearchModal from './components/Modals/SearchModal';
import LoginModal from './components/Modals/LoginModal';
import CartSidebar from './components/Cart/CartSidebar';
import MobileMenu from './components/Navigation/MobileMenu';
import ToastContainer from './components/Toast/ToastContainer';
import Home from './pages/Home';
import ShopPage from './pages/ShopPage';
import ProductDetail from './pages/ProductDetail';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmation from './pages/OrderConfirmation';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Header />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tienda" element={<ShopPage />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmacion" element={<OrderConfirmation />} />
          </Routes>

          <Footer />

          {/* Modales y sidebars */}
          <SearchModal />
          <LoginModal />
          <CartSidebar />
          <MobileMenu />
          <ToastContainer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;