import { supabase } from '../config/supabase';

// Obtener todos los productos
export const getAllProducts = async (filters = {}) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    // Filtro por categoría
    if (filters.category && filters.category !== 'todos') {
      query = query.eq('category', filters.category);
    }

    // Filtro por rango de precio
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Búsqueda por texto
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Ordenamiento
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'precio-asc':
          query = query.order('price', { ascending: true });
          break;
        case 'precio-desc':
          query = query.order('price', { ascending: false });
          break;
        case 'nombre':
          query = query.order('name', { ascending: true });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'ventas':
          query = query.order('sales', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Buscar productos
export const searchProducts = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .eq('is_active', true)
      .limit(10);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener productos destacados
export const getFeaturedProducts = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener productos más vendidos
export const getBestSellers = async (limit = 4) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sales', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Actualizar stock de producto
export const updateProductStock = async (productId, quantity) => {
  try {
    const { data: product } = await getProductById(productId);
    if (!product) throw new Error('Producto no encontrado');

    const newStock = product.stock - quantity;
    if (newStock < 0) throw new Error('Stock insuficiente');

    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Incrementar contador de ventas
export const incrementProductSales = async (productId, quantity = 1) => {
  try {
    const { data: product } = await getProductById(productId);
    if (!product) throw new Error('Producto no encontrado');

    const { data, error } = await supabase
      .from('products')
      .update({ sales: product.sales + quantity })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
