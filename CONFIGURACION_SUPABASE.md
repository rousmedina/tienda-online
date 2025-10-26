# 🔧 Configuración de Supabase para Chinasaqra

## 1. Crear tabla de direcciones (addresses)

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla de direcciones
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);

-- Habilitar Row Level Security
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 2. Actualizar tabla de productos para imágenes

```sql
-- Agregar columnas de imagen si no existen
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_path TEXT,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Índice para búsquedas por imagen
CREATE INDEX IF NOT EXISTS idx_products_image_path ON products(image_path);
```

---

## 3. Configurar Storage para imágenes de productos

### Paso 1: Crear bucket
1. Ve a **Storage** en el dashboard de Supabase
2. Haz clic en **New bucket**
3. Nombre: `product-images`
4. Público: ✅ **Activar "Public bucket"**
5. Crear

### Paso 2: Configurar políticas del bucket

```sql
-- Política para lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Política para que usuarios autenticados puedan subir
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Política para que usuarios autenticados puedan actualizar
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'product-images' );

-- Política para que usuarios autenticados puedan eliminar
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product-images' );
```

---

## 4. Configurar Authentication

### Email de recuperación de contraseña

1. Ve a **Authentication** > **Email Templates**
2. Selecciona **Reset Password**
3. Actualiza el template:

```html
<h2>Restablecer contraseña</h2>
<p>Hola,</p>
<p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
<p>Haz clic en el siguiente enlace para continuar:</p>
<p><a href="{{ .SiteURL }}/reset-password?token={{ .TokenHash }}&type=recovery">Restablecer contraseña</a></p>
<p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
<p>Este enlace expirará en 60 minutos.</p>
<br>
<p>Saludos,<br>Equipo de Chinasaqra</p>
```

### Configurar URL de redirección

1. Ve a **Authentication** > **URL Configuration**
2. Agrega estas URLs:
   - **Site URL**: `http://localhost:3000` (desarrollo)
   - **Redirect URLs**:
     - `http://localhost:3000/reset-password`
     - `http://localhost:3000/**`

Para producción, agrega:
- `https://tudominio.com`
- `https://tudominio.com/reset-password`
- `https://tudominio.com/**`

---

## 5. Verificar tablas existentes

Asegúrate de que estas tablas ya existen:

### Tabla products
```sql
-- Verificar estructura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products';
```

Debe incluir:
- id, name, description, price, original_price
- category, badge, badge_color
- sizes (array), colors (array)
- rating, sales, stock
- image_url, image_path, images
- slug, created_at, updated_at

### Tabla orders
```sql
-- Verificar estructura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders';
```

### Tabla order_items
```sql
-- Verificar estructura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'order_items';
```

### Tabla profiles
```sql
-- Verificar estructura
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
```

---

## 6. Insertar datos de prueba

### Productos con imágenes (opcional para testing)
```sql
INSERT INTO products (
  name,
  category,
  description,
  price,
  original_price,
  badge,
  badge_color,
  sizes,
  colors,
  rating,
  sales,
  stock,
  slug
) VALUES
(
  'Poncho Andino Premium',
  'Ponchos',
  'Poncho tejido a mano con lana de alpaca 100% natural',
  189.00,
  249.00,
  'Oferta',
  '#ef4444',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Rojo', 'Azul', 'Verde'],
  4.8,
  156,
  25,
  'poncho-andino-premium'
);
```

---

## 7. Configurar Edge Functions (Opcional - Avanzado)

Para webhooks de pagos y notificaciones:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Inicializar funciones
supabase functions new payment-webhook
supabase functions new order-notification
```

---

## 8. Variables de entorno

Crea/actualiza tu archivo `.env`:

```env
# Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu-clave-publica-anonima

# Opcionales para producción
REACT_APP_NIUBIZ_MERCHANT_ID=tu-merchant-id
REACT_APP_NIUBIZ_API_KEY=tu-api-key
```

---

## 9. Verificación final

### Checklist de configuración:

- [ ] Tabla `addresses` creada con RLS habilitado
- [ ] Tabla `products` tiene columnas de imagen
- [ ] Bucket `product-images` creado y público
- [ ] Políticas de Storage configuradas
- [ ] Templates de email personalizados
- [ ] URLs de redirección configuradas
- [ ] Variables de entorno en `.env`
- [ ] Tablas `orders`, `order_items`, `profiles` existen

---

## 10. Testing de configuración

### Test 1: Autenticación
```javascript
// En consola del navegador
import { supabase } from './config/supabase';
const { data, error } = await supabase.auth.signUp({
  email: 'test@test.com',
  password: 'test123456'
});
console.log(data, error);
```

### Test 2: Storage
```javascript
// Subir imagen de prueba
const file = document.querySelector('input[type=file]').files[0];
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`test/${Date.now()}.jpg`, file);
console.log(data, error);
```

### Test 3: Direcciones
```javascript
// Crear dirección
const { data, error } = await supabase
  .from('addresses')
  .insert({
    user_id: 'tu-user-id',
    label: 'Casa',
    full_name: 'Test User',
    phone: '999888777',
    address: 'Av Test 123',
    city: 'Lima',
    state: 'Lima',
    is_default: true
  });
console.log(data, error);
```

---

## 🚨 Problemas comunes

### Error: "relation addresses does not exist"
**Solución**: Ejecuta el SQL de creación de tabla en el paso 1

### Error: "permission denied for bucket"
**Solución**: Verifica que el bucket sea público o configura las políticas correctamente

### Error: "Invalid redirect URL"
**Solución**: Agrega la URL en Authentication > URL Configuration

### Error: "Row Level Security policy violation"
**Solución**: Verifica que las políticas RLS estén creadas correctamente

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Edge Functions](https://supabase.com/docs/guides/functions)

---

**Una vez completados todos estos pasos, tu backend estará 100% configurado** ✅
