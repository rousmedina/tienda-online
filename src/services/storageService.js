import { supabase } from '../config/supabase';

const BUCKET_NAME = 'product-images';

// Subir imagen de producto
export const uploadProductImage = async (file, productId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { data: { path: filePath, url: urlData.publicUrl }, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Subir múltiples imágenes
export const uploadMultipleImages = async (files, productId) => {
  try {
    const uploadPromises = files.map((file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Date.now()}-${index}.${fileExt}`;
      const filePath = `products/${fileName}`;

      return supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
    });

    const results = await Promise.all(uploadPromises);

    const urls = results.map((result, index) => {
      if (result.error) return null;
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(result.data.path);
      return urlData.publicUrl;
    }).filter(url => url !== null);

    return { data: urls, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Eliminar imagen
export const deleteProductImage = async (filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Obtener URL pública de imagen
export const getImageUrl = (filePath) => {
  if (!filePath) return null;

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// Listar imágenes de un producto
export const listProductImages = async (productId) => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`products/${productId}`, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    const urls = data.map(file => {
      const filePath = `products/${productId}/${file.name}`;
      return getImageUrl(filePath);
    });

    return { data: urls, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};