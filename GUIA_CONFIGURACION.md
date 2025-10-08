# 🚀 Guía de Configuración - Chinasaqra E-commerce

## 📋 PASO 1: EJECUTAR SQL EN SUPABASE (2 minutos)

### Instrucciones:

1. **Abrir Supabase:**
   - Ve a: https://lxrchayslyiatalshtbv.supabase.co
   - Inicia sesión con tu cuenta

2. **Ir al SQL Editor:**
   - En el menú lateral izquierdo, busca **SQL Editor**
   - Haz clic para abrir el editor

3. **Copiar el SQL:**
   - Abre el archivo `supabase-setup.sql` en este proyecto
   - Selecciona TODO el contenido (Ctrl + A)
   - Copia (Ctrl + C)

4. **Pegar y Ejecutar:**
   - Pega el SQL en el editor de Supabase (Ctrl + V)
   - Haz clic en el botón **RUN** (esquina inferior derecha)
   - Espera a que aparezca "Success. No rows returned"

5. **Verificar:**
   - Si ves errores, revisa que no haya tablas creadas previamente
   - Si hay tablas, elimínalas primero o modifica el SQL

✅ **Resultado:** Se crearon 6 tablas y se insertaron 8 productos

---

## 🔐 PASO 2: HABILITAR AUTENTICACIÓN (30 segundos)

### Instrucciones:

1. **Ir a Authentication:**
   - En el menú lateral, haz clic en **Authentication**
   - Luego en **Providers**

2. **Habilitar Email:**
   - Busca **Email** en la lista de proveedores
   - Haz clic en el toggle para **activarlo**
   - Debería cambiar a verde/activado

3. **Configuración opcional (para pruebas):**
   - Haz clic en **Email** para ver configuraciones
   - **Desactiva** "Confirm email" si quieres probar sin confirmación
   - Esto permite crear usuarios sin necesidad de confirmar el email
   - **Guarda** los cambios

✅ **Resultado:** Los usuarios pueden registrarse e iniciar sesión

---

## ✅ PASO 3: VERIFICAR PRODUCTOS (30 segundos)

### Instrucciones:

1. **Ir a Table Editor:**
   - En el menú lateral, haz clic en **Table Editor**

2. **Seleccionar tabla products:**
   - En el menú de la izquierda, haz clic en **products**

3. **Verificar:**
   - Deberías ver **8 productos** en la tabla:
     1. Poncho Andino Tradicional
     2. Pollera Cusqueña Bordada
     3. Chaleco de Alpaca Premium
     4. Chal Tejido a Mano
     5. Poncho Multicolor Artesanal
     6. Pollera de Fiesta Bordada
     7. Chaleco de Lana Clásico
     8. Chal de Alpaca Suave

4. **Si no hay productos:**
   - Vuelve al SQL Editor
   - Ejecuta solo la parte de INSERT del SQL
   - O inserta manualmente desde Table Editor

✅ **Resultado:** Tienes productos reales en la base de datos

---

## 🧪 PASO 4: PROBAR LA APLICACIÓN

### Instrucciones:

1. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

2. **Verificar productos:**
   - Abre http://localhost:3000
   - Los productos deberían cargarse desde Supabase
   - Si ves productos, ¡funciona!

3. **Probar registro:**
   - Haz clic en "Iniciar Sesión"
   - Selecciona "Crear cuenta"
   - Completa el formulario
   - Deberías poder crear una cuenta

4. **Probar checkout:**
   - Agrega productos al carrito
   - Ve al checkout
   - Completa los 3 pasos
   - La orden debería guardarse en Supabase

5. **Verificar orden:**
   - Ve a Supabase → Table Editor → orders
   - Deberías ver tu orden creada

---

## 🎉 ¡CONFIGURACIÓN COMPLETADA!

Tu aplicación ahora está **100% funcional** con:

✅ Base de datos real (Supabase)
✅ Autenticación de usuarios
✅ 8 productos de ejemplo
✅ Sistema de órdenes
✅ Sistema de pagos (simulado)

---

## ⚠️ IMPORTANTE: SISTEMA DE PAGOS ACTUAL

El sistema de pagos **ES SIMULADO**:
- ✅ Valida números de tarjeta (algoritmo de Luhn)
- ✅ Valida fechas y CVV
- ✅ Genera ID de transacción
- ❌ **NO COBRA DINERO REAL**

### Para pagos reales, continúa con la integración de pasarela:
Ver archivo: `INTEGRACION_PAGOS.md` (próximo paso)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "relation 'products' does not exist"
**Solución:** No ejecutaste el SQL. Ve al Paso 1.

### Error: "Invalid API key"
**Solución:** Verifica el archivo `.env` con las credenciales correctas.

### Los productos no se muestran
**Solución:**
1. Abre la consola del navegador (F12)
2. Busca errores de Supabase
3. Verifica que ejecutaste el SQL correctamente

### No puedo registrarme
**Solución:**
1. Verifica que habilitaste Email en Authentication → Providers
2. Revisa la consola del navegador para ver el error específico

### Error al crear orden
**Solución:**
1. Verifica que las tablas `orders` y `order_items` existen
2. Revisa las políticas RLS en Supabase

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Revisa los logs de Supabase (Logs → Database)
3. Verifica el archivo `.env`

**Archivos de ayuda:**
- `supabase-setup.sql` - SQL completo
- `SUPABASE_SETUP.md` - Documentación original
- `INTEGRACION_PAGOS.md` - Próximo paso (pagos reales)
