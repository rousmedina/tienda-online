import { supabase } from '../config/supabase';
import { incrementProductSales, updateProductStock } from './productService';

// Crear una nueva orden
export const createOrder = async (orderData) => {
  try {
    const { user_id, items, shipping, payment, subtotal, shipping_cost, total } = orderData;

    // Generar número de orden único
    const orderNumber = `CHI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Crear la orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user_id || null,
          order_number: orderNumber,
          status: 'pending',
          subtotal,
          shipping_cost,
          total,
          shipping_name: shipping.full_name,
          shipping_email: shipping.email,
          shipping_phone: shipping.phone,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_state: shipping.state,
          shipping_postal_code: shipping.postal_code || '',
          payment_method: payment.method,
          payment_status: payment.status || 'pending',
          payment_transaction_id: payment.transaction_id || null
        }
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Crear items de la orden
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Actualizar stock y ventas de productos
    for (const item of items) {
      await updateProductStock(item.id, item.quantity);
      await incrementProductSales(item.id, item.quantity);
    }

    return { data: order, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener orden por ID
export const getOrderById = async (orderId) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Obtener items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError) throw itemsError;

    return { data: { ...order, items }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener orden por número de orden
export const getOrderByNumber = async (orderNumber) => {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError) throw orderError;

    // Obtener items de la orden
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsError) throw itemsError;

    return { data: { ...order, items }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener órdenes de un usuario
export const getUserOrders = async (userId) => {
  try {
    // Primero obtener las órdenes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;

    // Si no hay órdenes, retornar array vacío
    if (!orders || orders.length === 0) {
      return { data: [], error: null };
    }

    // Obtener items para cada orden
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('Error loading items for order:', order.id, itemsError);
          return { ...order, items: [] };
        }

        return { ...order, items: items || [] };
      })
    );

    return { data: ordersWithItems, error: null };
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return { data: [], error: error.message };
  }
};

// Actualizar estado de orden
export const updateOrderStatus = async (orderId, status) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Actualizar estado de pago
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Cancelar orden
export const cancelOrder = async (orderId) => {
  try {
    // Obtener la orden y sus items
    const { data: orderData } = await getOrderById(orderId);
    if (!orderData) throw new Error('Orden no encontrada');

    // Actualizar estado
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Restaurar stock de productos (opcional)
    // for (const item of orderData.items) {
    //   await updateProductStock(item.product_id, -item.quantity);
    // }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};