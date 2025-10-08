# Configuración de Supabase para Chinasaqra Andina

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa los datos:
   - **Name**: chinasaqra-andina
   - **Database Password**: (guarda esto en un lugar seguro)
   - **Region**: Elige la más cercana a tus usuarios
5. Haz clic en "Create new project"

## Paso 2: Obtener las Credenciales

1. En tu proyecto, ve a **Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJxxx...`

## Paso 3: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Copia el contenido de `.env.example`
3. Reemplaza con tus credenciales:

```env
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Paso 4: Crear las Tablas en Supabase

Ve a **SQL Editor** en tu proyecto de Supabase y ejecuta el siguiente SQL:

### 1. Tabla de Productos

\`\`\`sql
-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  badge VARCHAR(50),
  badge_color VARCHAR(50),
  sizes TEXT[], -- Array de tallas disponibles
  colors TEXT[], -- Array de colores disponibles
  stock INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  sales INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, category, price, original_price, badge, badge_color, sizes, colors, stock, rating, sales) VALUES
('Poncho Andino Tradicional', 'Auténtico poncho andino tejido a mano por artesanos peruanos.', 'Ponchos', 149.00, 189.00, 'Nuevo', '#ec4899', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Natural', 'Rojo', 'Azul'], 50, 4.8, 245),
('Pollera Cusqueña Bordada', 'Hermosa pollera tradicional con bordados a mano.', 'Polleras', 125.00, NULL, 'Popular', '#10b981', ARRAY['S', 'M', 'L', 'XL'], ARRAY['Negro', 'Morado', 'Verde'], 35, 4.9, 312),
('Chaleco de Alpaca Premium', 'Chaleco premium de alpaca baby, suave y cálido.', 'Chalecos', 199.00, NULL, NULL, NULL, ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Beige', 'Marrón', 'Gris'], 20, 5.0, 189),
('Chal Tejido a Mano', 'Chal versátil y elegante tejido a mano.', 'Chales', 65.00, 85.00, 'Oferta', '#ec4899', ARRAY['Único'], ARRAY['Natural', 'Terracota', 'Azul'], 60, 4.7, 421),
('Poncho Multicolor Artesanal', 'Poncho con diseños multicolores tradicionales.', 'Ponchos', 175.00, NULL, NULL, NULL, ARRAY['M', 'L', 'XL'], ARRAY['Multicolor'], 25, 4.6, 156),
('Pollera de Fiesta Bordada', 'Pollera elegante para ocasiones especiales.', 'Polleras', 165.00, 195.00, 'Oferta', '#ec4899', ARRAY['S', 'M', 'L'], ARRAY['Negro', 'Azul'], 15, 4.8, 203),
('Chaleco de Lana Clásico', 'Chaleco tradicional de lana fina.', 'Chalecos', 135.00, NULL, NULL, NULL, ARRAY['S', 'M', 'L', 'XL'], ARRAY['Gris', 'Negro'], 30, 4.5, 178),
('Chal de Alpaca Suave', 'Chal suave de alpaca para el frío.', 'Chales', 95.00, NULL, NULL, NULL, ARRAY['Único'], ARRAY['Beige', 'Café'], 40, 4.9, 267);
\`\`\`

### 2. Tabla de Usuarios Extendida

\`\`\`sql
-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
\`\`\`

### 3. Tabla de Direcciones

\`\`\`sql
-- Tabla de direcciones de envío
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Perú',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
ON addresses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
ON addresses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
ON addresses FOR UPDATE
USING (auth.uid() = user_id);
\`\`\`

### 4. Tabla de Órdenes

\`\`\`sql
-- Tabla de órdenes
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Información de envío
  shipping_name VARCHAR(255) NOT NULL,
  shipping_email VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20),

  -- Información de pago
  payment_method VARCHAR(50), -- tarjeta, yape, plin, etc.
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert orders"
ON orders FOR INSERT
WITH CHECK (true);
\`\`\`

### 5. Tabla de Items de Orden

\`\`\`sql
-- Tabla de items de orden
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Índices
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of own orders"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  )
);

CREATE POLICY "Anyone can insert order items"
ON order_items FOR INSERT
WITH CHECK (true);
\`\`\`

### 6. Tabla de Wishlist

\`\`\`sql
-- Tabla de favoritos/wishlist
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

-- RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
ON wishlist FOR ALL
USING (auth.uid() = user_id);
\`\`\`

### 7. Triggers para actualizar timestamps

\`\`\`sql
-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## Paso 5: Configurar Storage (Opcional)

Para imágenes de productos:

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `products`
3. Configura como público
4. Sube imágenes de tus productos

## Paso 6: Habilitar Autenticación

1. Ve a **Authentication** > **Providers**
2. Habilita:
   - Email/Password
   - Google (opcional)
   - Facebook (opcional)

## Paso 7: Probar la Conexión

Reinicia tu aplicación React:

\`\`\`bash
npm start
\`\`\`

La aplicación ahora estará conectada a Supabase!

## Seguridad

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git. Ya está incluido en `.gitignore`.

## Documentación

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
