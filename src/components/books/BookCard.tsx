import React from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../../types/book';
import LazyImage from '../common/LazyImage';

interface BookCardProps extends Book {
  isPriority?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  coverUrl,
  thumbnailUrl,
  isPriority = false,
}) => {
  return (
    <Link
      to={`/books/${id}`}
      className="group relative block aspect-[3/4] rounded-lg overflow-hidden bg-[#2D2D2D] transition-transform hover:scale-[1.02] duration-300"
    >
      <div className="absolute inset-0">
        <LazyImage
          src={coverUrl || thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading={isPriority ? "eager" : "lazy"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-white text-lg font-medium line-clamp-2">
          {title}
        </h3>
      </div>
    </Link>
  );
};

export default BookCard; 