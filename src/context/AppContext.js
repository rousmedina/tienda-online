import React, { createContext, useContext, useReducer } from 'react';
import { useAuth } from '../hooks/useAuth';

const AppContext = createContext();

const initialState = {
  // Estados de modales
  isSearchModalOpen: false,
  isLoginModalOpen: false,
  isCartSidebarOpen: false,
  isMobileMenuOpen: false,

  // Estado de autenticación
  loginTab: 'login', // 'login' o 'register'
  user: null,
  session: null,

  // Estado del carrito
  cartItems: [],

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
      const maxStock = action.payload.stock || 999; // Stock máximo del producto

      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.payload.quantity || 1);
        if (newQuantity > maxStock) {
          // No agregar si excede el stock
          return state;
        }
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: Math.min(newQuantity, maxStock) }
              : item
          )
        };
      } else {
        const quantity = Math.min(action.payload.quantity || 1, maxStock);
        return {
          ...state,
          cartItems: [...state.cartItems, { ...action.payload, quantity }]
        };
      }
    
    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item => {
          if (item.id === action.payload.id) {
            const newQty = item.quantity + action.payload.change;
            const maxStock = item.stock || 999;
            return {
              ...item,
              quantity: Math.max(1, Math.min(newQty, maxStock))
            };
          }
          return item;
        })
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

    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        session: action.payload.session
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        session: null,
        cartItems: [],
        wishlist: []
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, session, loading: authLoading, isAuthenticated } = useAuth();

  // Sincronizar usuario de Supabase con el estado global
  React.useEffect(() => {
    dispatch({ type: 'SET_USER', payload: { user, session } });
  }, [user, session]);

  const value = {
    state,
    dispatch,

    // Auth
    user: state.user,
    session: state.session,
    isAuthenticated,
    authLoading,
    logout: () => dispatch({ type: 'LOGOUT' }),

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
      // Generar un ID más único y confiable
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      dispatch({
        type: 'ADD_TOAST',
        payload: { id, message, type, duration }
      });
    },
    removeToast: (id) => {
      // Verificar que el toast existe antes de removerlo
      if (state.toasts.some(toast => toast.id === id)) {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }
    },

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