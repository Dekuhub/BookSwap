export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    // Проверяем, что URL не пустой
    if (!src) {
      console.warn('Empty image URL provided');
      resolve();
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      resolve();
    };

    img.onerror = () => {
      console.warn(`Failed to preload image: ${src}`);
      resolve(); // Резолвим промис даже при ошибке, чтобы не блокировать загрузку других изображений
    };

    img.src = src;
  });
};

export const preloadImages = async (srcs: string[]): Promise<void> => {
  try {
    // Фильтруем пустые URL
    const validUrls = srcs.filter(src => !!src);
    
    // Загружаем изображения параллельно, но с ограничением в 3 одновременных загрузки
    const batchSize = 3;
    for (let i = 0; i < validUrls.length; i += batchSize) {
      const batch = validUrls.slice(i, i + batchSize);
      await Promise.all(batch.map(src => preloadImage(src)));
    }
  } catch (error) {
    console.warn('Error during image preloading:', error);
  }
};

// Функция для получения оптимального размера изображения
export const getOptimalImageSize = (
  originalWidth: number,
  originalHeight: number,
  targetWidth: number = window.innerWidth
): { width: number; height: number } => {
  const ratio = originalHeight / originalWidth;
  const width = Math.min(originalWidth, targetWidth);
  const height = Math.round(width * ratio);
  
  return { width, height };
};

// Функция для создания URL с параметрами размера и формата
export const getOptimizedImageUrl = (
  baseUrl: string,
  width?: number,
  height?: number,
  format: 'webp' | 'jpeg' | 'png' = 'webp'
): string => {
  // Проверяем, что URL не пустой
  if (!baseUrl) {
    return '';
  }

  try {
    const params = new URLSearchParams();
    
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('format', format);
    
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  } catch (error) {
    console.warn('Error creating optimized URL:', error);
    return baseUrl;
  }
}; 