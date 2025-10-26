# Instrucciones para Poblar la Base de Datos en Supabase

## Pasos para insertar los productos:

### 1. Accede a tu proyecto de Supabase
- Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Inicia sesión con tu cuenta
- Selecciona el proyecto: **lxrchayslyiatalshtbv**

### 2. Abre el SQL Editor
- En el menú lateral izquierdo, haz clic en **SQL Editor**
- Haz clic en **New query** (Nueva consulta)

### 3. Copia y pega el script
- Abre el archivo `supabase/insert_products.sql`
- Copia TODO el contenido del archivo
- Pégalo en el editor SQL de Supabase

### 4. Ejecuta el script
- Haz clic en el botón **Run** (Ejecutar) o presiona `Ctrl + Enter`
- Deberías ver un mensaje de éxito indicando que se insertaron 8 filas

### 5. Verifica los datos
- Ve a **Table Editor** en el menú lateral
- Selecciona la tabla `products`
- Deberías ver 8 productos:
  - 2 Ponchos
  - 2 Polleras
  - 2 Chalecos
  - 2 Chales

### 6. Recarga la aplicación
- Vuelve a tu aplicación web (http://localhost:3000)
- Recarga la página (F5)
- El mensaje "Error al cargar productos" debería desaparecer
- Los productos ahora se cargan desde Supabase

## Verificación adicional

Si los productos no aparecen, verifica que:

1. **La tabla `products` existe** con las columnas correctas
2. **Las políticas RLS están habilitadas** para permitir lectura pública:
   ```sql
   -- Habilitar RLS
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;

   -- Permitir lectura pública
   CREATE POLICY "Allow public read access"
   ON products FOR SELECT
   USING (true);
   ```

3. **Las variables de entorno están correctas** en el archivo `.env`

## Solución de problemas

### Error: "duplicate key value violates unique constraint"
- Esto significa que los productos ya existen
- Puedes ignorar este error o borrar los productos existentes primero:
  ```sql
  DELETE FROM products;
  ```

### Error: "relation products does not exist"
- La tabla `products` no existe
- Ejecuta primero el script de creación de tablas (si tienes uno)
- O verifica que la tabla se creó correctamente en el Table Editor

### Los productos no se muestran en la app
- Verifica que las políticas RLS están configuradas (ver arriba)
- Revisa la consola del navegador para ver errores
- Verifica que el archivo `.env` tiene las credenciales correctas
