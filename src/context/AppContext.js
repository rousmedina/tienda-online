import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  // Estados de modales
  isSearchModalOpen: false,
  isLoginModalOpen: false,
  isCartSidebarOpen: false,
  isMobileMenuOpen: false,

  // Estado de autenticación
  loginTab: 'login', // 'login' o 'register'

  // Estado del carrito
  cartItems: [
    { id: 'poncho', name: 'Poncho Andino Tradicional', price: 149, quantity: 1 },
    { id: 'pollera', name: 'Pollera Cusqueña Bordada', price: 125, quantity: 1 }
  ],

  // Estado de wishlist/favoritos
  wishlist: [],

  // Estado de búsqueda
  searchQuery: '',

  // Estado de toasts
  toasts: [],

  // Estado de loading
  isLoading: false,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SEARCH_MODAL':
      return { ...state, isSearchModalOpen: !state.isSearchModalOpen };
    
    case 'TOGGLE_LOGIN_MODAL':
      return { ...state, isLoginModalOpen: !state.isLoginModalOpen };
    
    case 'TOGGLE_CART_SIDEBAR':
      return { ...state, isCartSidebarOpen: !state.isCartSidebarOpen };
    
    case 'TOGGLE_MOBILE_MENU':
      return { ...state, isMobileMenuOpen: !state.isMobileMenuOpen };
    
    case 'SET_LOGIN_TAB':
      return { ...state, loginTab: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'ADD_TO_CART':
      const existingItem = state.cartItems.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }]
        };
      }
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, item.quantity + action.payload.change) }
            : item
        )
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(item => item.id !== action.payload)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: []
      };

    case 'ADD_TO_WISHLIST':
      const existingWishlistItem = state.wishlist.find(item => item.id === action.payload.id);
      if (existingWishlistItem) {
        // Si ya está en wishlist, removerlo
        return {
          ...state,
          wishlist: state.wishlist.filter(item => item.id !== action.payload.id)
        };
      } else {
        // Si no está, agregarlo
        return {
          ...state,
          wishlist: [...state.wishlist, action.payload]
        };
      }

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload)
      };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload]
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    
    // Funciones helper
    toggleSearchModal: () => dispatch({ type: 'TOGGLE_SEARCH_MODAL' }),
    toggleLoginModal: () => dispatch({ type: 'TOGGLE_LOGIN_MODAL' }),
    toggleCartSidebar: () => dispatch({ type: 'TOGGLE_CART_SIDEBAR' }),
    toggleMobileMenu: () => dispatch({ type: 'TOGGLE_MOBILE_MENU' }),
    
    setLoginTab: (tab) => dispatch({ type: 'SET_LOGIN_TAB', payload: tab }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }),
    
    addToCart: (item) => dispatch({ type: 'ADD_TO_CART', payload: item }),
    updateCartQuantity: (id, change) => dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, change } }),
    removeFromCart: (id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),

    addToWishlist: (item) => dispatch({ type: 'ADD_TO_WISHLIST', payload: item }),
    removeFromWishlist: (id) => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: id }),

    // Toast functions
    showToast: (message, type = 'info', duration = 3000) => {
      const id = Date.now() + Math.random();
      dispatch({
        type: 'ADD_TOAST',
        payload: { id, message, type, duration }
      });
    },
    removeToast: (id) => dispatch({ type: 'REMOVE_TOAST', payload: id }),

    // Loading functions
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),

    // Computed values
    cartTotal: state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
    cartCount: state.cartItems.reduce((count, item) => count + item.quantity, 0),
    wishlistCount: state.wishlist.length,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
}