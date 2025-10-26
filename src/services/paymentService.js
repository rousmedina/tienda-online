/**
 * Payment Service - Manejo de pagos
 *
 * NOTA: Esta es una implementación de DEMO.
 * Para producción, debes integrar una pasarela de pago real como:
 * - Niubiz (VisaNet Perú)
 * - Culqi (Perú)
 * - Stripe (Internacional)
 * - PayPal
 */

/**
 * Validar número de tarjeta usando algoritmo de Luhn
 */
export const validateCardNumber = (cardNumber) => {
  // Remover espacios y guiones
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Validar que solo sean números
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Validar longitud (13-19 dígitos)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validar fecha de expiración
 */
export const validateExpirationDate = (expDate) => {
  // Formato esperado: MM/AA
  const regex = /^(0[1-9]|1[0-2])\/(\d{2})$/;

  if (!regex.test(expDate)) {
    return false;
  }

  const [month, year] = expDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = currentDate.getMonth() + 1;

  const expYear = parseInt(year, 10);
  const expMonth = parseInt(month, 10);

  // Validar que no esté expirada
  if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
    return false;
  }

  return true;
};

/**
 * Validar CVV
 */
export const validateCVV = (cvv) => {
  // CVV debe ser 3 o 4 dígitos
  const regex = /^\d{3,4}$/;
  return regex.test(cvv);
};

/**
 * Obtener tipo de tarjeta basado en el número
 */
export const getCardType = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Visa
  if (/^4/.test(cleaned)) {
    return 'visa';
  }

  // Mastercard
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return 'mastercard';
  }

  // American Express
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }

  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) {
    return 'diners';
  }

  return 'unknown';
};

/**
 * Formatear número de tarjeta (enmascara todos excepto últimos 4 dígitos)
 */
export const maskCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const lastFour = cleaned.slice(-4);
  return `**** **** **** ${lastFour}`;
};

/**
 * Procesar pago con tarjeta (DEMO)
 * En producción, esto se comunicaría con la API de la pasarela de pago
 */
export const processCardPayment = async (paymentData) => {
  const { cardNumber, expirationDate, cvv, amount } = paymentData;

  // Validaciones
  if (!validateCardNumber(cardNumber)) {
    return {
      success: false,
      error: 'Número de tarjeta inválido'
    };
  }

  if (!validateExpirationDate(expirationDate)) {
    return {
      success: false,
      error: 'Fecha de expiración inválida o tarjeta expirada'
    };
  }

  if (!validateCVV(cvv)) {
    return {
      success: false,
      error: 'CVV inválido'
    };
  }

  // Simular delay de procesamiento (en producción sería una llamada API real)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // DEMO: Simular éxito (90% de probabilidad)
  const isSuccess = Math.random() > 0.1;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amount,
      cardType: getCardType(cardNumber),
      maskedCard: maskCardNumber(cardNumber),
      timestamp: new Date().toISOString()
    };
  } else {
    return {
      success: false,
      error: 'Pago rechazado. Por favor, intenta con otra tarjeta.'
    };
  }
};

/**
 * Procesar pago con Yape/Plin (DEMO)
 * En producción, generarías un QR o redirigirías a la app
 */
export const processDigitalWalletPayment = async (paymentMethod, amount, phoneNumber) => {
  // Validar número de teléfono peruano
  const phoneRegex = /^9\d{8}$/;

  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    return {
      success: false,
      error: 'Número de teléfono inválido'
    };
  }

  // Simular delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    success: true,
    transactionId: `${paymentMethod.toUpperCase()}-${Date.now()}`,
    amount,
    paymentMethod,
    phoneNumber,
    timestamp: new Date().toISOString(),
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${paymentMethod}-payment-${Date.now()}`
  };
};

/**
 * Validar datos de pago completos
 */
export const validatePaymentData = (formData) => {
  const errors = {};

  if (formData.metodoPago === 'tarjeta') {
    if (!formData.numeroTarjeta || !validateCardNumber(formData.numeroTarjeta)) {
      errors.numeroTarjeta = 'Número de tarjeta inválido';
    }

    if (!formData.nombreTarjeta || formData.nombreTarjeta.trim().length < 3) {
      errors.nombreTarjeta = 'Nombre en tarjeta inválido';
    }

    if (!formData.fechaExpiracion || !validateExpirationDate(formData.fechaExpiracion)) {
      errors.fechaExpiracion = 'Fecha de expiración inválida';
    }

    if (!formData.cvv || !validateCVV(formData.cvv)) {
      errors.cvv = 'CVV inválido';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
