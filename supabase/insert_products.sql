-- =====================================================
-- Script para actualizar productos existentes en Supabase
-- Los productos ya existen, solo necesitan actualización
-- =====================================================

-- Verificar productos existentes
SELECT id, name, category, price, stock FROM products ORDER BY name;

-- Verificar que los productos se insertaron correctamente
SELECT
  id,
  name,
  category,
  price,
  stock,
  rating,
  sales
FROM products
ORDER BY category, name;
