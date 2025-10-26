-- ============================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN SUPABASE
-- Chinasaqra E-commerce
-- ============================================

-- PASO 1: CREAR TABLA DE DIRECCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_default ON addresses(user_id, is_default);

COMMENT ON TABLE addresses IS 'Direcciones de envío de los usuarios';

-- ============================================
-- PASO 2: ACTUALIZAR TABLA PRODUCTS
-- ============================================

-- Agregar columnas de imagen si no existen
DO $$
BEGIN
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
END $$;

-- Índice para búsquedas por imagen
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
-- PASO 5: FUNCIÓN PARA ACTUALIZAR updated_at
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

-- ============================================
-- PASO 6: POLICIES DE STORAGE
-- ============================================

-- NOTA: Este SQL es para las tablas. Las políticas de Storage
-- se configuran desde el dashboard de Supabase o con estos comandos:

-- Para crear el bucket desde SQL (requiere permisos de admin):
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para product-images
-- (Ejecutar después de crear el bucket desde el dashboard)

/*
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
*/

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
BEGIN
    -- Contar tablas
    SELECT COUNT(*) INTO addresses_count FROM information_schema.tables WHERE table_name = 'addresses';
    SELECT COUNT(*) INTO products_count FROM information_schema.tables WHERE table_name = 'products';
    SELECT COUNT(*) INTO profiles_count FROM information_schema.tables WHERE table_name = 'profiles';

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VERIFICACIÓN DE CONFIGURACIÓN';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Tabla addresses: %', CASE WHEN addresses_count > 0 THEN '✓ Creada' ELSE '✗ No existe' END;
    RAISE NOTICE 'Tabla products: %', CASE WHEN products_count > 0 THEN '✓ Existe' ELSE '✗ No existe' END;
    RAISE NOTICE 'Tabla profiles: %', CASE WHEN profiles_count > 0 THEN '✓ Creada' ELSE '✗ No existe' END;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Siguiente paso: Configurar Storage desde dashboard';
    RAISE NOTICE '==============================================';
END $$;
