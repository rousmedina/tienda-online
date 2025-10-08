-- ============================================
-- CONFIGURACIÓN COMPLETA DE SUPABASE
-- Para: Chinasaqra E-commerce
-- ============================================

-- 1. TABLA DE PRODUCTOS
-- ============================================
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
  sizes TEXT[],
  colors TEXT[],
  stock INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  sales INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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

-- 2. TABLA DE PERFILES DE USUARIO
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 3. TABLA DE DIRECCIONES
-- ============================================
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

-- 4. TABLA DE ÓRDENES
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  shipping_name VARCHAR(255) NOT NULL,
  shipping_email VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(20),

  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert orders"
ON orders FOR INSERT
WITH CHECK (true);

-- 5. TABLA DE ITEMS DE ORDEN
-- ============================================
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

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

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

-- 6. TABLA DE WISHLIST
-- ============================================
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist"
ON wishlist FOR ALL
USING (auth.uid() = user_id);

-- 7. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
-- Ahora debes:
-- 1. Ir a Authentication → Providers → Habilitar Email
-- 2. Verificar que los 8 productos se insertaron en Table Editor
-- ============================================
