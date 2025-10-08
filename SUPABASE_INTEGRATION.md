# Integración de Supabase - Guía de Uso

## ✅ Lo que ya está implementado

### 1. **Configuración** (`src/config/supabase.js`)
- Cliente de Supabase configurado
- Verificación de configuración
- Auto-refresh de tokens

### 2. **Servicios Creados**

#### `authService.js` - Autenticación
```javascript
import { signUp, signIn, signOut, getCurrentUser } from './services/authService';

// Registrar usuario
const { data, error } = await signUp('email@example.com', 'password', 'Nombre Completo');

// Iniciar sesión
const { data, error } = await signIn('email@example.com', 'password');

// Cerrar sesión
await signOut();

// Obtener usuario actual
const { user } = await getCurrentUser();
```

#### `productService.js` - Productos
```javascript
import { getAllProducts, getProductById, searchProducts } from './services/productService';

// Obtener todos los productos con filtros
const { data: products } = await getAllProducts({
  category: 'Ponchos',
  minPrice: 100,
  maxPrice: 200,
  search: 'alpaca',
  sortBy: 'precio-asc'
});

// Obtener un producto
const { data: product } = await getProductById('product-id');

// Buscar productos
const { data: results } = await searchProducts('poncho');
```

#### `orderService.js` - Órdenes
```javascript
import { createOrder, getUserOrders, getOrderByNumber } from './services/orderService';

// Crear orden
const orderData = {
  user_id: userId, // null para usuarios no autenticados
  items: [
    { id: 'product-id', name: 'Producto', price: 100, quantity: 2 }
  ],
  shipping: {
    full_name: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '999888777',
    address: 'Calle Principal 123',
    city: 'Lima',
    state: 'Lima'
  },
  payment: {
    method: 'tarjeta'
  },
  subtotal: 200,
  shipping_cost: 15,
  total: 215
};

const { data: order } = await createOrder(orderData);

// Obtener órdenes del usuario
const { data: orders } = await getUserOrders(userId);

// Buscar orden por número
const { data: order } = await getOrderByNumber('CHI-123456-789');
```

#### `wishlistService.js` - Favoritos
```javascript
import { getUserWishlist, addToWishlist, removeFromWishlist } from './services/wishlistService';

// Obtener wishlist
const { data: wishlist } = await getUserWishlist(userId);

// Agregar a wishlist
await addToWishlist(userId, productId);

// Remover de wishlist
await removeFromWishlist(userId, productId);
```

## 📝 Cómo usar en tus componentes

### Ejemplo: LoginModal con Supabase

```javascript
import { useState } from 'react';
import { signIn, signUp } from '../services/authService';
import { useApp } from '../context/AppContext';

function LoginModal() {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await signIn(email, password);

    if (error) {
      showToast(error, 'error');
      return;
    }

    showToast('¡Sesión iniciada con éxito!', 'success');
    // Redirigir o actualizar estado...
  };

  return (
    // ... tu JSX
  );
}
```

### Ejemplo: ShopPage con productos de Supabase

```javascript
import { useState, useEffect } from 'react';
import { getAllProducts } from '../services/productService';
import Loading from '../components/Loading/Loading';

function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'todos',
    minPrice: 0,
    maxPrice: 500
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    const { data, error } = await getAllProducts(filters);

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  };

  if (loading) return <Loading fullScreen text="Cargando productos..." />;

  return (
    <div>
      {/* Renderizar productos */}
    </div>
  );
}
```

### Ejemplo: Checkout con creación de orden

```javascript
import { createOrder } from '../services/orderService';
import { getCurrentUser } from '../services/authService';

const handleFinalizarCompra = async () => {
  const { user } = await getCurrentUser();

  const orderData = {
    user_id: user?.id || null,
    items: cartItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),
    shipping: {
      full_name: `${formData.nombre} ${formData.apellido}`,
      email: formData.email,
      phone: formData.telefono,
      address: formData.direccion,
      city: formData.ciudad,
      state: formData.departamento,
      postal_code: formData.codigoPostal
    },
    payment: {
      method: formData.metodoPago
    },
    subtotal: cartTotal,
    shipping_cost: 15,
    total: cartTotal + 15
  };

  const { data: order, error } = await createOrder(orderData);

  if (error) {
    showToast('Error al crear la orden', 'error');
    return;
  }

  // Navegar a confirmación
  navigate('/confirmacion', {
    state: {
      orderNumber: order.order_number,
      orderDate: new Date(order.created_at).toLocaleDateString('es-PE'),
      customerName: orderData.shipping.full_name,
      customerEmail: orderData.shipping.email,
      total: order.total,
      items: orderData.items
    }
  });
};
```

## 🔐 Manejo de Autenticación Persistente

Para mantener la sesión del usuario:

```javascript
// En App.js o un componente padre
import { useEffect, useState } from 'react';
import { onAuthStateChange, getCurrentUser } from './services/authService';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario actual
    getCurrentUser().then(({ user }) => {
      setUser(user);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const { data: authListener } = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    // ... tu app
  );
}
```

## 🎯 Próximos Pasos

1. **Configurar Supabase** siguiendo `SUPABASE_SETUP.md`
2. **Crear el archivo `.env`** con tus credenciales
3. **Ejecutar el SQL** para crear las tablas
4. **Actualizar componentes** para usar los servicios de Supabase
5. **Probar** la autenticación, productos y órdenes

## 🚀 Ventajas de usar Supabase

- ✅ **Base de datos PostgreSQL** real y escalable
- ✅ **Autenticación** incorporada (email, Google, Facebook, etc.)
- ✅ **Row Level Security** para seguridad de datos
- ✅ **Realtime subscriptions** para actualizaciones en vivo
- ✅ **Storage** para imágenes y archivos
- ✅ **Edge Functions** para lógica backend
- ✅ **API REST y GraphQL** automáticas
- ✅ **Gratis hasta 500MB** de base de datos

## 📚 Recursos

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de React con Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
