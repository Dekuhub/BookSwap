import { Link } from 'react-router-dom';

interface CategoryCardProps {
  name: string;
  image: string;
  offset: number;
  isTop: boolean;
}

export const CategoryCard = ({ name, image, offset, isTop }: CategoryCardProps) => {
  const offsetStyle = {
    top: isTop 
      ? `calc(${offset} * 30px)`
      : `calc(${offset} * 2vw + 4vh)`
  };

  // Используем дефолтное изображение, если указанное не найдено
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/categories/default.png';
  };

  return (
    <div 
      className="flex flex-col items-center gap-4 relative" 
      style={offsetStyle}
    >
      <div className="text-sm text-center text-white border-2 border-white px-3 py-1.5 rounded-md">
        {name}
      </div>
      <Link 
        to={`/books/search?q=${encodeURIComponent(name)}`}
        className="aspect-square w-full max-w-[200px] bg-transparent border-2 border-white rounded-lg overflow-hidden block transition-transform duration-300 hover:scale-105"
      >
        <img 
          src={image}
          alt={name} 
          className="w-full h-full object-cover rounded-lg"
          onError={handleImageError}
        />
      </Link>
    </div>
  );
}; 