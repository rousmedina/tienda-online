-- =====================================================
-- Script para configurar políticas RLS en Supabase
-- Esto permite que la aplicación lea productos sin autenticación
-- =====================================================

-- Habilitar RLS en la tabla products (si no está habilitado)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Allow public read access" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON products;

-- Crear política para permitir lectura pública de productos
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
USING (true);

-- Verificar que la política se creó correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';
