import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
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
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import OrderDetail from './pages/OrderDetail';
import Addresses from './pages/Addresses';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="App">
            <Header />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tienda" element={<ShopPage />} />
              <Route path="/producto/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route
                path="/confirmacion"
                element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mis-pedidos"
                element={
                  <ProtectedRoute>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/favoritos" element={<Wishlist />} />
              <Route
                path="/pedido/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/direcciones"
                element={
                  <ProtectedRoute>
                    <Addresses />
                  </ProtectedRoute>
                }
              />
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
    </ErrorBoundary>
  );
}

export default App;