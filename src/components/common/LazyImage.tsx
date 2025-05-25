import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  thumbnailSrc?: string;
  priority?: boolean;
  fallbackSrc?: string; // URL изображения-заглушки
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  onClick,
  thumbnailSrc,
  priority = false,
  fallbackSrc = '/images/placeholder.jpg' // Путь к дефолтной заглушке
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || '');
  const [error, setError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    // Сбрасываем состояние при изменении src
    if (src) {
      setError(false);
      retryCount.current = 0;
      
      if (priority) {
        loadImage(src);
      } else if ('IntersectionObserver' in window) {
        setupIntersectionObserver();
      } else {
        loadImage(src);
      }
    }

    return () => {
      if (observerRef.current && imageRef.current) {
        observerRef.current.unobserve(imageRef.current);
      }
    };
  }, [src, priority]);

  const setupIntersectionObserver = () => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadImage(src);
            if (observerRef.current && imageRef.current) {
              observerRef.current.unobserve(imageRef.current);
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    if (imageRef.current) {
      observerRef.current.observe(imageRef.current);
    }
  };

  const loadImage = (imageSrc: string) => {
    if (!imageSrc) {
      setError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(imageSrc);
      setIsLoading(false);
      setError(false);
    };

    img.onerror = () => {
      // Пробуем загрузить еще раз, если не превышен лимит попыток
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        setTimeout(() => loadImage(imageSrc), 1000 * retryCount.current); // Увеличиваем задержку с каждой попыткой
      } else {
        setError(true);
        setIsLoading(false);
        // Если есть fallback, пробуем его загрузить
        if (fallbackSrc && fallbackSrc !== imageSrc) {
          loadImage(fallbackSrc);
        }
      }
    };

    img.src = imageSrc;
  };

  // Определяем наиболее подходящий формат изображения
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return fallbackSrc;

    try {
      // Если src уже WebP, возвращаем как есть
      if (originalSrc.endsWith('.webp')) {
        return originalSrc;
      }

      // Проверяем поддержку WebP
      const supportsWebP = document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;

      if (supportsWebP && originalSrc.includes('/api/')) {
        return `${originalSrc}${originalSrc.includes('?') ? '&' : '?'}format=webp`;
      }

      return originalSrc;
    } catch (error) {
      console.warn('Error optimizing image URL:', error);
      return originalSrc;
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onClick={onClick}
      ref={imageRef}
    >
      {/* Placeholder или thumbnail */}
      {isLoading && thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-105"
        />
      )}

      {/* Placeholder анимация */}
      {isLoading && !thumbnailSrc && (
        <div className="absolute inset-0 bg-[#3D3D3D] animate-pulse" />
      )}

      {/* Основное изображение */}
      <picture>
        <source
          type="image/webp"
          srcSet={getOptimizedSrc(currentSrc || src)}
        />
        <img
          src={currentSrc || src || fallbackSrc}
          alt={alt}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          loading={priority ? 'eager' : 'lazy'}
        />
      </picture>

      {/* Показываем ошибку только если нет fallback изображения */}
      {error && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2D2D2D] text-white/60">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LazyImage; 