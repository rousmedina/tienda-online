-- ============================================
-- SCRIPT CORREGIDO - CONFIGURACIÓN SUPABASE
-- Chinasaqra E-commerce
-- ============================================

-- PASO 1: AGREGAR COLUMNAS FALTANTES A ADDRESSES
-- ============================================

-- Agregar columnas faltantes a la tabla addresses si no existen
DO $$
BEGIN
    -- Verificar y agregar is_default
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='addresses' AND column_name='is_default') THEN
        ALTER TABLE addresses ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
    END IF;

    -- Verificar y agregar created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='addresses' AND column_name='created_at') THEN
        ALTER TABLE addresses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Verificar y agregar updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='addresses' AND column_name='updated_at') THEN
        ALTER TABLE addresses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);

-- ============================================
-- PASO 2: CREAR O ACTUALIZAR TABLA PRODUCTS
-- ============================================

-- Crear tabla products si no existe
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  badge VARCHAR(50),
  badge_color VARCHAR(20),
  sizes TEXT[],
  colors TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0,
  sales INTEGER DEFAULT 0,
  stock INTEGER DEFAULT 0,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes a products si no existen
DO $$
BEGIN
    -- Columnas de imagen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='image_path') THEN
        ALTER TABLE products ADD COLUMN image_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='images') THEN
        ALTER TABLE products ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Columna slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='slug') THEN
        ALTER TABLE products ADD COLUMN slug VARCHAR(255) UNIQUE;
    END IF;

    -- Columnas básicas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='description') THEN
        ALTER TABLE products ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='category') THEN
        ALTER TABLE products ADD COLUMN category VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='original_price') THEN
        ALTER TABLE products ADD COLUMN original_price DECIMAL(10, 2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='badge') THEN
        ALTER TABLE products ADD COLUMN badge VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='badge_color') THEN
        ALTER TABLE products ADD COLUMN badge_color VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='sizes') THEN
        ALTER TABLE products ADD COLUMN sizes TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='colors') THEN
        ALTER TABLE products ADD COLUMN colors TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='rating') THEN
        ALTER TABLE products ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='sales') THEN
        ALTER TABLE products ADD COLUMN sales INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='stock') THEN
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name='products' AND column_name='updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_image_path ON products(image_path);

-- ============================================
-- PASO 3: ROW LEVEL SECURITY - ADDRESSES
-- ============================================

-- Habilitar RLS
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

-- Políticas de seguridad
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PASO 4: VERIFICAR TABLA PROFILES
-- ============================================

-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- PASO 5: CREAR TABLAS DE ORDERS
-- ============================================

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(255),
  shipping_phone VARCHAR(50),
  shipping_address TEXT,
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de orden
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name VARCHAR(255) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- RLS para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS para order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- ============================================
-- PASO 6: FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para addresses
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PASO 7: DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Insertar productos de ejemplo con estructura completa
INSERT INTO products (
  name,
  description,
  category,
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
  'Poncho Andino Tradicional',
  'Poncho tejido a mano con lana de alpaca 100% natural. Diseño tradicional cusqueño con motivos geométricos ancestrales.',
  'Ponchos',
  149.00,
  189.00,
  'Nuevo',
  '#667eea',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Rojo', 'Azul', 'Verde', 'Multicolor'],
  4.8,
  245,
  50,
  'poncho-andino-tradicional'
),
(
  'Pollera Cusqueña Bordada',
  'Pollera tradicional bordada a mano con hilos de colores. Perfecta para festividades y uso diario.',
  'Polleras',
  125.00,
  NULL,
  'Popular',
  '#ef4444',
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Negro', 'Azul', 'Morado'],
  4.9,
  312,
  35,
  'pollera-cusquena-bordada'
),
(
  'Chaleco de Alpaca Premium',
  'Chaleco de alpaca 100% hecho a mano. Suave, abrigador y elegante.',
  'Chalecos',
  199.00,
  NULL,
  NULL,
  NULL,
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ARRAY['Beige', 'Marrón', 'Negro'],
  5.0,
  189,
  20,
  'chaleco-alpaca-premium'
),
(
  'Chal Tejido a Mano',
  'Chal tejido artesanalmente con lana de oveja. Diseño versátil para cualquier ocasión.',
  'Chales',
  65.00,
  85.00,
  'Oferta',
  '#f59e0b',
  ARRAY['Único'],
  ARRAY['Rojo', 'Verde', 'Azul', 'Morado'],
  4.7,
  421,
  60,
  'chal-tejido-mano'
),
(
  'Poncho Multicolor Artesanal',
  'Poncho con diseño multicolor único. Cada pieza es irrepetible, tejida por artesanos andinos.',
  'Ponchos',
  175.00,
  NULL,
  NULL,
  NULL,
  ARRAY['M', 'L', 'XL'],
  ARRAY['Multicolor'],
  4.6,
  156,
  25,
  'poncho-multicolor-artesanal'
),
(
  'Pollera de Fiesta Bordada',
  'Pollera elegante con bordados en hilos dorados y plateados. Ideal para ocasiones especiales.',
  'Polleras',
  165.00,
  195.00,
  'Oferta',
  '#f59e0b',
  ARRAY['S', 'M', 'L'],
  ARRAY['Negro', 'Azul marino'],
  4.8,
  203,
  15,
  'pollera-fiesta-bordada'
),
(
  'Chaleco de Lana Clásico',
  'Chaleco clásico de lana de oveja. Diseño simple y elegante para uso diario.',
  'Chalecos',
  135.00,
  NULL,
  NULL,
  NULL,
  ARRAY['S', 'M', 'L', 'XL'],
  ARRAY['Gris', 'Negro', 'Azul'],
  4.5,
  178,
  30,
  'chaleco-lana-clasico'
),
(
  'Chal de Alpaca Suave',
  'Chal de alpaca baby ultra suave. Perfecto para climas fríos.',
  'Chales',
  95.00,
  NULL,
  NULL,
  NULL,
  ARRAY['Único'],
  ARRAY['Blanco', 'Beige', 'Gris', 'Negro'],
  4.9,
  267,
  40,
  'chal-alpaca-suave'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Consulta para verificar que todo está correcto
DO $$
DECLARE
    addresses_count INTEGER;
    products_count INTEGER;
    profiles_count INTEGER;
    orders_count INTEGER;
BEGIN
    -- Contar tablas
    SELECT COUNT(*) INTO addresses_count FROM information_schema.tables WHERE table_name = 'addresses';
    SELECT COUNT(*) INTO products_count FROM information_schema.tables WHERE table_name = 'products';
    SELECT COUNT(*) INTO profiles_count FROM information_schema.tables WHERE table_name = 'profiles';
    SELECT COUNT(*) INTO orders_count FROM information_schema.tables WHERE table_name = 'orders';

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VERIFICACIÓN DE CONFIGURACIÓN';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tabla addresses: %', CASE WHEN addresses_count > 0 THEN '✓ Creada' ELSE '✗ No existe' END;
    RAISE NOTICE 'Tabla products: %', CASE WHEN products_count > 0 THEN '✓ Existe' ELSE '✗ No existe' END;
    RAISE NOTICE 'Tabla profiles: %', CASE WHEN profiles_count > 0 THEN '✓ Creada' ELSE '✗ No existe' END;
    RAISE NOTICE 'Tabla orders: %', CASE WHEN orders_count > 0 THEN '✓ Creada' ELSE '✗ No existe' END;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Siguiente paso: Configurar Storage desde dashboard';
    RAISE NOTICE '==============================================';
END $$;
