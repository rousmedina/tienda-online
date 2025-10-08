# 🛍️ Chinasaqra - E-commerce de Moda Andina Peruana

Tienda online completa de moda andina peruana construida con React y Supabase. Sistema completo de e-commerce con autenticación, carrito de compras, checkout y pagos.

## ✨ Características Principales

### Frontend
- ✅ **Interfaz moderna y responsive** (Desktop, Tablet, Mobile)
- ✅ **Carrito de compras** completo con gestión de cantidades
- ✅ **Sistema de búsqueda** con filtros por categoría y precio
- ✅ **Wishlist** (lista de favoritos)
- ✅ **Checkout en 3 pasos** (Datos, Envío, Pago)
- ✅ **Autenticación** de usuarios (login/registro)
- ✅ **Notificaciones** con sistema de toasts

### Backend (Supabase)
- ✅ **Base de datos PostgreSQL** con tablas configuradas
- ✅ **Autenticación** integrada con Supabase Auth
- ✅ **Gestión de productos** con filtros y búsqueda
- ✅ **Sistema de órdenes** completo
- ✅ **Row Level Security (RLS)** para protección de datos
- ✅ **API REST** automática

### Pagos
- ✅ **Sistema de pagos simulado** (desarrollo/pruebas)
- ✅ **Validación de tarjetas** (algoritmo de Luhn)
- ✅ **Soporte para múltiples métodos** (Tarjeta, Yape, Plin)
- 🔄 **Integración con pasarelas reales** (Culqi/Niubiz) - Ver guía

## 📁 Estructura del Proyecto

```
chinasaqra-demo/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header/
│   │   ├── Hero/
│   │   ├── Categories/
│   │   ├── Products/
│   │   ├── About/
│   │   ├── Footer/
│   │   ├── Modals/
│   │   ├── Cart/
│   │   └── Navigation/
│   ├── context/
│   │   └── AppContext.js
│   ├── index.css
│   ├── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Supabase

**⚠️ IMPORTANTE:** Antes de iniciar la app, debes configurar Supabase.

📖 **Sigue la guía paso a paso:** [`GUIA_CONFIGURACION.md`](./GUIA_CONFIGURACION.md)

**Resumen rápido:**
1. Abre https://lxrchayslyiatalshtbv.supabase.co
2. Ve a SQL Editor
3. Copia y ejecuta el contenido de `supabase-setup.sql`
4. Ve a Authentication → Providers → Activa Email
5. Verifica los productos en Table Editor

**Tiempo total: 3 minutos** ⏱️

### 3. Verificar Variables de Entorno

El archivo `.env` ya debería estar configurado con:
```env
REACT_APP_SUPABASE_URL=https://lxrchayslyiatalshtbv.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_clave_aqui
```

### 4. Iniciar la Aplicación
```bash
npm start
```

Abre http://localhost:3000 🎉

### 5. Probar la App

1. ✅ Ver productos en la página principal
2. ✅ Crear una cuenta de prueba
3. ✅ Agregar productos al carrito
4. ✅ Completar el checkout (pagos simulados)
5. ✅ Verificar la orden en Supabase → Table Editor → orders

## 🎨 Componentes

### Componentes Principales
- `Header` - Navegación y acciones del usuario
- `Hero` - Sección principal con llamada a la acción
- `Categories` - Grid de categorías de productos
- `Products` - Lista de productos destacados
- `About` - Información de la empresa
- `Footer` - Enlaces y información de contacto

### Modales y Funcionalidades
- `SearchModal` - Búsqueda con sugerencias populares
- `LoginModal` - Login/registro con tabs intercambiables
- `CartSidebar` - Carrito lateral deslizante
- `MobileMenu` - Menú de navegación móvil

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1200px+)
- Tablet (768px - 1199px) 
- Mobile (< 768px)

## 🎯 Estado Global

Gestión de estado centralizada con Context API:
- Estados de modales y navegación
- Carrito de compras completo
- Preferencias de usuario
- Datos de búsqueda

## 🔧 Tecnologías

### Frontend
- **React 18** - Framework principal
- **React Router v6** - Navegación
- **Context API** - Gestión de estado global
- **CSS3** - Estilos personalizados
- **Font Awesome** - Iconografía

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Base de datos
- **Supabase Auth** - Autenticación
- **Row Level Security** - Seguridad de datos

### Pagos
- **Algoritmo de Luhn** - Validación de tarjetas
- **Sistema modular** - Listo para Culqi/Niubiz/Stripe

---

## 📚 Documentación

### Guías de Configuración
- 📖 **[GUIA_CONFIGURACION.md](./GUIA_CONFIGURACION.md)** - Configuración paso a paso de Supabase
- 💳 **[INTEGRACION_PAGOS.md](./INTEGRACION_PAGOS.md)** - Cómo integrar pagos reales (Culqi/Niubiz)
- 📊 **[RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)** - Estado completo del proyecto

### Documentación Técnica
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detalles de la base de datos
- **[SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md)** - Ejemplos de uso de servicios
- **[supabase-setup.sql](./supabase-setup.sql)** - SQL para crear tablas

---

## 💳 Sistema de Pagos

### Estado Actual: Simulado (Para Desarrollo)
El sistema de pagos actual es completamente funcional pero **NO procesa pagos reales**. Incluye:

- ✅ Validación completa de tarjetas
- ✅ Validación de fechas y CVV
- ✅ Generación de ID de transacción
- ✅ Soporte para Yape/Plin (simulado)
- ⚠️ **NO cobra dinero real**

### Para Producción: Integración Real

Para procesar pagos reales, consulta **[INTEGRACION_PAGOS.md](./INTEGRACION_PAGOS.md)**

**Opciones recomendadas para Perú:**
1. **Culqi** - Rápido y fácil (Recomendado para empezar)
2. **Niubiz** - Para empresas formales
3. **Mercado Pago** - Regional
4. **Stripe** - Internacional

---

## 🗃️ Base de Datos (Supabase)

### Tablas Configuradas
- **products** - Catálogo de productos
- **profiles** - Perfiles de usuarios
- **addresses** - Direcciones de envío
- **orders** - Órdenes de compra
- **order_items** - Items de cada orden
- **wishlist** - Lista de favoritos

### Datos de Ejemplo
- 8 productos pre-cargados
- Categorías: Ponchos, Polleras, Chalecos, Chales
- Precios en Soles (PEN)

---

## 🔐 Seguridad

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de acceso configuradas
- ✅ Autenticación con JWT
- ✅ Variables de entorno protegidas
- ✅ Validación en frontend y backend

---

## 🎯 Estado del Proyecto

### ✅ Completado (100%)
- Frontend completo
- Integración con Supabase
- Sistema de autenticación
- Carrito y checkout
- Sistema de pagos (simulado)
- Documentación completa

### 🔄 En Desarrollo
- Integración de pagos reales (Culqi/Niubiz)
- Panel de administración
- Emails transaccionales

### 📈 Futuro
- SEO y meta tags
- Google Analytics
- PWA (Progressive Web App)
- Chat de soporte

---

## 🐛 Solución de Problemas

### Error: "relation 'products' does not exist"
**Solución:** Ejecuta el SQL en Supabase (ver `GUIA_CONFIGURACION.md`)

### Los productos no se muestran
**Solución:**
1. Verifica que ejecutaste el SQL
2. Revisa la consola del navegador (F12)
3. Verifica las credenciales en `.env`

### No puedo registrarme
**Solución:** Habilita Email Auth en Supabase → Authentication → Providers

### Más ayuda
Consulta `GUIA_CONFIGURACION.md` sección "Solución de Problemas"

---

## 📞 Soporte

Para más ayuda:
1. Revisa los archivos de documentación (`.md`)
2. Consulta la consola del navegador (F12)
3. Verifica los logs de Supabase

---

## 📄 Licencia

Proyecto educativo - Chinasaqra © 2025

---

## 🙏 Créditos

- Diseño inspirado en moda andina peruana
- Desarrollado con React y Supabase
- Iconos por Font Awesome

---

**¿Listo para empezar?** 🚀

1. Sigue [`GUIA_CONFIGURACION.md`](./GUIA_CONFIGURACION.md)
2. Ejecuta `npm start`
3. ¡Empieza a vender! 🛍️