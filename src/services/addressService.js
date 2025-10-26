import { supabase } from '../config/supabase';

// Obtener todas las direcciones de un usuario
export const getUserAddresses = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener una dirección por ID
export const getAddressById = async (addressId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', addressId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Crear nueva dirección
export const createAddress = async (userId, addressData) => {
  try {
    // Si esta será la dirección predeterminada, desactivar las demás
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert([
        {
          user_id: userId,
          ...addressData
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

// Actualizar dirección
export const updateAddress = async (addressId, userId, addressData) => {
  try {
    // Si esta será la dirección predeterminada, desactivar las demás
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Eliminar dirección
export const deleteAddress = async (addressId, userId) => {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Establecer dirección como predeterminada
export const setDefaultAddress = async (addressId, userId) => {
  try {
    // Desactivar todas las direcciones predeterminadas
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Activar la nueva dirección predeterminada
    const { data, error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener dirección predeterminada
export const getDefaultAddress = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
