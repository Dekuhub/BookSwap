import React, { useState, useCallback } from 'react';
import { optimizeBase64ToMaxSize, createThumbnail } from '../../utils/imageOptimizer';

interface AddBookImageProps {
  onImageSelect: (image: { full: string; thumbnail: string }) => void;
  maxSize?: number; // Максимальный размер в байтах
}

const AddBookImage: React.FC<AddBookImageProps> = ({ 
  onImageSelect,
  maxSize = 500 * 1024 // 500KB по умолчанию
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleImageSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    try {
      setIsProcessing(true);

      // Читаем файл как base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;

      // Оптимизируем изображение
      const optimizedImage = await optimizeBase64ToMaxSize(base64, maxSize);
      
      // Создаем thumbnail
      const thumbnail = await createThumbnail(optimizedImage);

      onImageSelect({
        full: optimizedImage,
        thumbnail
      });
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Ошибка при обработке изображения');
    } finally {
      setIsProcessing(false);
    }
  }, [maxSize, onImageSelect]);

  return (
    <div className="relative">
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed rounded-lg
          cursor-pointer
          transition-colors duration-300
          ${error ? 'border-red-500 bg-red-50/5' : 'border-[#444] hover:border-[#FF6B00]'}
        `}
      >
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex items-center space-x-2 text-white/60">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Обработка изображения...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-8 h-8 mb-2 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-sm text-white/60">
              Нажмите для выбора изображения
            </span>
            <span className="text-xs text-white/40 mt-1">
              Рекомендуемый размер: до {(maxSize / 1024).toFixed(0)}KB
            </span>
          </div>
        )}
      </label>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default AddBookImage; 