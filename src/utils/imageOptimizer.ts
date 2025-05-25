/**
 * Конвертирует base64 в Blob
 */
const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
};

/**
 * Конвертирует Blob в base64
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

/**
 * Оптимизирует base64 изображение
 */
export const optimizeBase64Image = async (
  base64: string,
  options: OptimizeOptions = {}
): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    format = 'image/webp'
  } = options;

  // Создаем изображение из base64
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = base64;
  });

  // Вычисляем новые размеры с сохранением пропорций
  let width = img.width;
  let height = img.height;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  // Создаем canvas для рисования изображения
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // Рисуем изображение с новыми размерами
  ctx.drawImage(img, 0, 0, width, height);

  // Конвертируем в нужный формат с указанным качеством
  const optimizedBase64 = canvas.toDataURL(format, quality);

  return optimizedBase64;
};

/**
 * Оптимизирует размер base64 изображения до указанного максимального размера в байтах
 */
export const optimizeBase64ToMaxSize = async (
  base64: string,
  maxSizeInBytes: number = 500 * 1024 // 500KB по умолчанию
): Promise<string> => {
  let quality = 0.8;
  let optimized = await optimizeBase64Image(base64, { quality });
  let currentSize = new Blob([optimized]).size;

  // Если размер все еще больше максимального, уменьшаем качество
  while (currentSize > maxSizeInBytes && quality > 0.1) {
    quality -= 0.1;
    optimized = await optimizeBase64Image(base64, { quality });
    currentSize = new Blob([optimized]).size;
  }

  return optimized;
};

/**
 * Создает оптимизированный thumbnail из base64 изображения
 */
export const createThumbnail = async (
  base64: string,
  maxSize: number = 150
): Promise<string> => {
  return optimizeBase64Image(base64, {
    maxWidth: maxSize,
    maxHeight: maxSize,
    quality: 0.6,
    format: 'image/webp'
  });
};

/**
 * Проверяет поддержку WebP
 */
export const supportsWebP = async (): Promise<boolean> => {
  const canvas = document.createElement('canvas');
  if (!canvas.getContext) return false;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Получает размер base64 строки в байтах
 */
export const getBase64Size = (base64: string): number => {
  const base64Length = base64.split(';base64,')[1].length;
  return (base64Length * 3) / 4;
}; 