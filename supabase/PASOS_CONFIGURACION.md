# 🚀 Guía Paso a Paso - Configuración Supabase

## ✅ Credenciales Configuradas

Ya tienes configuradas tus credenciales en `.env`:
- URL: `https://lxrchasyiylatalshtbv.supabase.co`
- Key: ✓ Configurada

---

## 📋 PASO 1: Ejecutar Script SQL (5 minutos)

### 1. Ir al SQL Editor de Supabase

1. Abre tu navegador
2. Ve a: https://supabase.com/dashboard/project/lxrchasyiylatalshtbv
3. Inicia sesión si es necesario
4. En el menú lateral, haz clic en **SQL Editor**

### 2. Ejecutar el script

1. Haz clic en **New query**
2. Abre el archivo `supabase/setup_complete.sql`
3. Copia TODO el contenido
4. Pégalo en el editor SQL de Supabase
5. Haz clic en **Run** o presiona `Ctrl + Enter`

### 3. Verificar resultado

Deberías ver un mensaje como:
```
NOTICE: ==============================================
NOTICE: VERIFICACIÓN DE CONFIGURACIÓN
NOTICE: ==============================================
NOTICE: Tabla addresses: ✓ Creada
NOTICE: Tabla products: ✓ Existe
NOTICE: Tabla profiles: ✓ Creada
```

---

## 📦 PASO 2: Crear Bucket de Storage (3 minutos)

### 1. Ir a Storage

1. En el menú lateral de Supabase, haz clic en **Storage**
2. Haz clic en **New bucket**

### 2. Configurar bucket

- **Name**: `product-images`
- **Public bucket**: ✅ **Activar esta opción**
- **File size limit**: 50 MB (por defecto)
- **Allowed MIME types**: Dejar vacío (permite todos)

3. Haz clic en **Create bucket**

### 3. Configurar políticas del bucket

1. Haz clic en el bucket `product-images` que acabas de crear
2. Ve a la pestaña **Policies**
3. Haz clic en **New policy**

#### Política 1: Lectura Pública
- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'product-images'
  ```
- Haz clic en **Create policy**

#### Política 2: Upload para autenticados
- **Policy name**: `Authenticated upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'product-images'
  ```
- Haz clic en **Create policy**

#### Política 3: Update para autenticados
- **Policy name**: `Authenticated update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'product-images'
  ```
- Haz clic en **Create policy**

#### Política 4: Delete para autenticados
- **Policy name**: `Authenticated delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'product-images'
  ```
- Haz clic en **Create policy**

---

## 📧 PASO 3: Configurar Emails (5 minutos)

### 1. Ir a Authentication

1. En el menú lateral, haz clic en **Authentication**
2. Haz clic en **Email Templates**

### 2. Configurar template de Reset Password

1. Selecciona **Reset Password** en la lista
2. Reemplaza el contenido con:

```html
<h2>Restablecer contraseña - Chinasaqra</h2>

<p>Hola,</p>

<p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Chinasaqra.</p>

<p>Haz clic en el siguiente botón para continuar:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery"
     style="background-color: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 8px;
            display: inline-block;
            font-weight: bold;">
    Restablecer contraseña
  </a>
</p>

<p>O copia y pega este enlace en tu navegador:</p>
<p style="word-break: break-all; color: #666;">{{ .SiteURL }}/reset-password#access_token={{ .Token }}&type=recovery</p>

<p style="margin-top: 30px; color: #666; font-size: 14px;">
  Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
  <br>
  Este enlace expirará en 60 minutos.
</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

<p style="color: #666; font-size: 13px;">
  Saludos,<br>
  <strong>Equipo de Chinasaqra</strong><br>
  Moda Andina Auténtica
</p>
```

3. Haz clic en **Save**

### 3. Configurar URLs de redirección

1. Ve a **Authentication** > **URL Configuration**
2. En **Site URL**, ingresa:
   - Desarrollo: `http://localhost:3000`
3. En **Redirect URLs**, agrega estas líneas (una por línea):
   ```
   http://localhost:3000/**
   http://localhost:3000/reset-password
   ```

4. Haz clic en **Save**

---

## ✅ PASO 4: Verificación (2 minutos)

### Verificar tablas creadas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver estas tablas:
   - ✅ `addresses`
   - ✅ `products`
   - ✅ `profiles`
   - ✅ `orders`
   - ✅ `order_items`

### Verificar Storage

1. Ve a **Storage**
2. Deberías ver el bucket:
   - ✅ `product-images` (público)

### Verificar productos de ejemplo

1. Ve a **Table Editor**
2. Haz clic en `products`
3. Deberías ver **8 productos** insertados

---

## 🖼️ PASO 5: Subir Imágenes de Productos (Opcional)

### Opción A: Subir desde dashboard

1. Ve a **Storage** > `product-images`
2. Crea una carpeta llamada `products`
3. Haz clic en **Upload files**
4. Sube imágenes con nombres descriptivos:
   - `poncho-andino-tradicional.jpg`
   - `pollera-cusquena-bordada.jpg`
   - etc.

### Opción B: Actualizar productos con URLs

1. Ve a **Table Editor** > `products`
2. Para cada producto, edita la columna `image_url`
3. Pega la URL pública de la imagen desde Storage

**Formato de URL**:
```
https://lxrchasyiylatalshtbv.supabase.co/storage/v1/object/public/product-images/products/nombre-imagen.jpg
```

---

## 🧪 PASO 6: Probar la Configuración

### Test 1: Autenticación

```bash
# En tu terminal, ejecuta:
npm start
```

1. Abre http://localhost:3000
2. Haz clic en el icono de usuario
3. Regístrate con un email de prueba
4. Verifica que recibes el email de confirmación

### Test 2: Recuperación de contraseña

1. En el modal de login, haz clic en "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Verifica que recibes el email
4. Haz clic en el enlace y cambia tu contraseña

### Test 3: Crear dirección

1. Inicia sesión
2. Ve a `/direcciones` (agrega el link en el header o ve directo)
3. Crea una nueva dirección
4. Verifica en **Table Editor** > `addresses` que se creó

### Test 4: Ver productos

1. Ve a `/tienda`
2. Deberías ver los 8 productos de ejemplo
3. Si subiste imágenes, deberían aparecer

---

## ❗ Solución de Problemas

### Error: "relation addresses does not exist"
**Solución**: Vuelve a ejecutar el script SQL del PASO 1

### Error: "bucket product-images does not exist"
**Solución**: Crea el bucket manualmente en PASO 2

### No recibo emails
**Solución**:
1. Verifica tu bandeja de spam
2. En desarrollo, los emails pueden tardar hasta 5 minutos
3. Revisa **Authentication** > **Users** para ver si el usuario se creó

### Las imágenes no cargan
**Solución**:
1. Verifica que el bucket sea público
2. Comprueba que las URLs sean correctas
3. Asegúrate de que las políticas de Storage estén creadas

---

## 📊 Checklist Final

Marca cada item cuando lo completes:

- [ ] ✅ Script SQL ejecutado correctamente
- [ ] ✅ Tabla `addresses` creada
- [ ] ✅ Tabla `products` actualizada con columnas de imagen
- [ ] ✅ Tabla `profiles` creada
- [ ] ✅ Bucket `product-images` creado
- [ ] ✅ Bucket configurado como público
- [ ] ✅ 4 políticas de Storage creadas
- [ ] ✅ Template de email configurado
- [ ] ✅ URLs de redirección agregadas
- [ ] ✅ 8 productos de ejemplo insertados
- [ ] ✅ Aplicación corriendo en localhost:3000
- [ ] ✅ Test de registro exitoso
- [ ] ✅ Test de recuperación de contraseña exitoso

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu Supabase estará **100% configurado** y listo para usar.

### Próximos pasos:
1. Subir imágenes reales de productos
2. Configurar pasarela de pago
3. Personalizar diseño según tu marca
4. Testing completo
5. Deploy a producción

---

## 🆘 ¿Necesitas ayuda?

Si algo no funciona:
1. Revisa el error en la consola del navegador (F12)
2. Verifica las credenciales en `.env`
3. Comprueba que todas las tablas existan en Table Editor
4. Revisa las políticas RLS en cada tabla

**Tiempo total estimado**: 15-20 minutos ⏱️
