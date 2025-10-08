import { supabase } from '../config/supabase';

// Obtener wishlist de un usuario
export const getUserWishlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        *,
        products (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Agregar producto a wishlist
export const addToWishlist = async (userId, productId) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .insert([
        {
          user_id: userId,
          product_id: productId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Remover producto de wishlist
export const removeFromWishlist = async (userId, productId) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Verificar si un producto está en wishlist
export const isInWishlist = async (userId, productId) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { inWishlist: !!data, error: null };
  } catch (error) {
    return { inWishlist: false, error: error.message };
  }
};

// Limpiar wishlist completa
export const clearWishlist = async (userId) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};
