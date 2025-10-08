# 💳 Guía de Integración de Pagos Reales

## 📋 RESUMEN

Actualmente tu aplicación tiene un sistema de pagos **SIMULADO**. Esta guía te ayudará a integrar una pasarela de pago real.

---

## 🇵🇪 OPCIONES PARA PERÚ

### 1️⃣ **NIUBIZ (VisaNet Perú)** ⭐ Recomendado

**Ventajas:**
- ✅ La más usada en Perú
- ✅ Acepta todas las tarjetas peruanas
- ✅ Soporte local
- ✅ Confianza del cliente

**Desventajas:**
- ❌ Proceso de afiliación más largo
- ❌ Requiere RUC y documentación legal
- ❌ Comisiones ~3-4%

**Costo:**
- Comisión por transacción: 3.5% - 4%
- Sin costo de setup (depende del banco)

**Ideal para:** Negocios formales en Perú

---

### 2️⃣ **CULQI** ⭐ Más Fácil

**Ventajas:**
- ✅ Registro rápido y sencillo
- ✅ API bien documentada (en español)
- ✅ Acepta Yape también
- ✅ Dashboard moderno
- ✅ Sin requisitos complejos

**Desventajas:**
- ❌ Comisiones un poco más altas
- ❌ Menos conocido que Niubiz

**Costo:**
- Comisión: 3.99% + S/. 0.50 por transacción
- Sin costo mensual

**Ideal para:** Startups y emprendimientos

---

### 3️⃣ **MERCADO PAGO**

**Ventajas:**
- ✅ Reconocido en Latinoamérica
- ✅ Fácil integración
- ✅ Múltiples métodos de pago
- ✅ Wallet integrado

**Desventajas:**
- ❌ Comisiones altas en Perú
- ❌ Menos usado localmente

**Costo:**
- Comisión: 4.99% + S/. 0.99 por transacción

**Ideal para:** Negocios regionales (varios países)

---

### 4️⃣ **STRIPE** (Internacional)

**Ventajas:**
- ✅ Mejor documentación del mercado
- ✅ Muy fácil de integrar
- ✅ API moderna
- ✅ Dashboard excelente

**Desventajas:**
- ❌ Complicado para cuentas peruanas
- ❌ Requiere cuenta bancaria en USD
- ❌ Menos conveniente para clientes peruanos

**Costo:**
- Comisión: 3.6% + $0.30 por transacción

**Ideal para:** Ventas internacionales

---

## 🎯 RECOMENDACIÓN

### Para tu caso (Chinasaqra):

1. **Primera opción: CULQI**
   - Rápido de implementar
   - No requiere trámites complejos
   - Buena para empezar
   - Acepta Yape (muy popular en Perú)

2. **Segunda opción: NIUBIZ**
   - Si tienes RUC y empresa formal
   - Mejor para volumen alto
   - Más confianza del cliente

---

## 📦 INTEGRACIÓN CON CULQI (Recomendado)

### PASO 1: Crear Cuenta

1. Ve a: https://culqi.com
2. Haz clic en "Crear cuenta"
3. Completa el registro
4. Verifica tu email

### PASO 2: Obtener API Keys

1. Inicia sesión en Culqi
2. Ve a **Desarrollo** → **API Keys**
3. Copia:
   - **Llave pública** (comienza con `pk_test_`)
   - **Llave secreta** (comienza con `sk_test_`)

### PASO 3: Configurar Variables de Entorno

Agrega a tu archivo `.env`:

```env
# Culqi
REACT_APP_CULQI_PUBLIC_KEY=pk_test_tu_llave_publica_aqui
CULQI_SECRET_KEY=sk_test_tu_llave_secreta_aqui
```

### PASO 4: Instalar SDK de Culqi

```bash
npm install @culqi/culqi-js
```

### PASO 5: Implementar en el Frontend

Crea un nuevo archivo `src/services/culqiPaymentService.js`:

```javascript
import Culqi from '@culqi/culqi-js';

const culqi = new Culqi();
culqi.setPublicKey(process.env.REACT_APP_CULQI_PUBLIC_KEY);

/**
 * Procesar pago con Culqi
 */
export const processCulqiPayment = async (paymentData) => {
  const { cardNumber, cardName, expirationDate, cvv, amount, email } = paymentData;

  // Convertir fecha MM/AA a MM y AAAA
  const [month, year] = expirationDate.split('/');
  const fullYear = `20${year}`;

  try {
    // Crear token de tarjeta
    const tokenData = await new Promise((resolve, reject) => {
      culqi.createToken(
        {
          card_number: cardNumber.replace(/\s/g, ''),
          cvv: cvv,
          expiration_month: month,
          expiration_year: fullYear,
          email: email
        },
        (token) => resolve(token),
        (error) => reject(error)
      );
    });

    // Enviar token al backend para crear el cargo
    const response = await fetch('/api/culqi/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenData.id,
        amount: Math.round(amount * 100), // Convertir a centavos
        email: email,
        description: 'Compra en Chinasaqra'
      })
    });

    const charge = await response.json();

    if (charge.object === 'charge' && charge.outcome.type === 'venta_exitosa') {
      return {
        success: true,
        transactionId: charge.id,
        amount: amount,
        cardType: charge.source.iin.card_brand,
        maskedCard: `**** **** **** ${charge.source.card_number.slice(-4)}`,
        timestamp: new Date(charge.creation_date * 1000).toISOString()
      };
    } else {
      return {
        success: false,
        error: charge.user_message || 'Pago rechazado'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.user_message || 'Error al procesar el pago'
    };
  }
};
```

### PASO 6: Crear Endpoint en Backend

Necesitas crear un backend simple (Node.js/Express) para manejar los cargos:

```javascript
// server/routes/culqi.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/charge', async (req, res) => {
  try {
    const { token, amount, email, description } = req.body;

    const response = await axios.post(
      'https://api.culqi.com/v2/charges',
      {
        amount: amount,
        currency_code: 'PEN',
        email: email,
        source_id: token,
        description: description
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CULQI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message
    });
  }
});

module.exports = router;
```

### PASO 7: Actualizar Checkout.js

Reemplaza la función de pago simulado con Culqi:

```javascript
// En Checkout.js
import { processCulqiPayment } from '../../services/culqiPaymentService';

// En handleFinalizarCompra:
if (formData.metodoPago === 'tarjeta') {
  paymentResult = await processCulqiPayment({
    cardNumber: formData.numeroTarjeta,
    cardName: formData.nombreTarjeta,
    expirationDate: formData.fechaExpiracion,
    cvv: formData.cvv,
    amount: total,
    email: formData.email
  });
}
```

---

## 🧪 MODO DE PRUEBAS (CULQI)

Culqi te da un ambiente de pruebas. Usa estas tarjetas de prueba:

### Tarjetas de Prueba:

**Visa (Aprobada):**
- Número: `4111 1111 1111 1111`
- CVV: `123`
- Fecha: Cualquier fecha futura (ej: `12/25`)

**Visa (Rechazada):**
- Número: `4000 0000 0000 0002`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Mastercard (Aprobada):**
- Número: `5111 1111 1111 1118`
- CVV: `123`
- Fecha: Cualquier fecha futura

---

## 📊 INTEGRACIÓN CON NIUBIZ

### PASO 1: Afiliación

1. Contacta a tu banco (BCP, Interbank, BBVA, etc.)
2. Solicita afiliación a Niubiz
3. Presenta documentos (RUC, DNI, etc.)
4. Espera aprobación (1-2 semanas)

### PASO 2: Credenciales

Recibirás:
- **Merchant ID**
- **Access Key**
- **Security Token**

### PASO 3: Implementación

Niubiz requiere integración más compleja. Opciones:

**Opción A: Lightbox (Modal)**
- El cliente paga en un modal de Niubiz
- Más seguro (PCI DSS compliance)
- Recomendado

**Opción B: Checkout Integrado**
- Formulario en tu sitio
- Requiere certificación PCI DSS
- Más complejo

### Documentación:
https://github.com/culqi/culqi-node

---

## 🔒 SEGURIDAD IMPORTANTE

### ⚠️ NUNCA hagas esto:

❌ Guardar números de tarjeta en tu base de datos
❌ Procesar pagos solo en frontend
❌ Exponer llaves secretas en el código frontend
❌ Enviar información de tarjeta sin encriptar

### ✅ SÍ hagas esto:

✅ Usa HTTPS siempre
✅ Procesa pagos en backend
✅ Guarda solo los últimos 4 dígitos
✅ Usa tokens de las pasarelas
✅ Implementa rate limiting
✅ Valida en frontend y backend

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Antes de producción:

- [ ] Pasarela de pago configurada
- [ ] Probado con tarjetas de prueba
- [ ] Backend implementado para cargos
- [ ] Webhooks configurados (para confirmaciones)
- [ ] Variables de entorno seguras
- [ ] HTTPS configurado en producción
- [ ] Manejo de errores implementado
- [ ] Logs de transacciones
- [ ] Emails de confirmación
- [ ] Política de devoluciones clara

---

## 💰 COMPARATIVA DE COSTOS

| Pasarela      | Comisión      | Setup | Ideal para          |
|---------------|---------------|-------|---------------------|
| **Culqi**     | 3.99% + S/0.50| Gratis| Emprendimientos     |
| **Niubiz**    | 3.5%          | Gratis| Empresas formales   |
| **Mercado Pago**| 4.99% + S/0.99| Gratis| Multi-país       |
| **Stripe**    | 3.6% + $0.30  | Gratis| Internacional       |

---

## 🚀 PRÓXIMOS PASOS

1. **Elige tu pasarela** (Recomiendo Culqi para empezar)
2. **Crea cuenta** en la pasarela elegida
3. **Obtén API keys** de prueba
4. **Implementa** siguiendo los pasos de esta guía
5. **Prueba** con tarjetas de prueba
6. **Solicita producción** cuando estés listo
7. **Cambia** a API keys de producción

---

## 📞 SOPORTE

### Culqi:
- Documentación: https://docs.culqi.com
- Soporte: soporte@culqi.com
- Slack: https://culqi-community.slack.com

### Niubiz:
- Portal: https://www.niubiz.com.pe
- Soporte: Llamar a tu banco

---

## ⚡ IMPLEMENTACIÓN RÁPIDA (CULQI)

Si quieres que te ayude a implementar Culqi paso a paso, solo dime y te creo:

1. El servicio de pagos con Culqi
2. El backend para procesar cargos
3. La actualización del Checkout
4. Las pruebas con tarjetas de test

**¿Quieres que implemente Culqi ahora?** 🚀
