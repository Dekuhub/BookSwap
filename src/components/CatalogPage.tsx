import React, { useEffect, useState } from 'react';
import { CategoryCard } from './CategoryCard';
import { getTags } from '../api/tags';
import type { Tag } from '../types/tag';

export const CatalogPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const fetchedTags = await getTags();
        setTags(fetchedTags);
      } catch (err) {
        console.error('Failed to load tags:', err);
        setError('Не удалось загрузить категории');
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white text-center mb-12 font-light">Каталог</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        {tags.map((tag, index) => (
          <CategoryCard
            key={tag.id}
            name={tag.name}
            image={tag.photo || '/images/category-placeholder.jpg'}
            offset={index % 2}
            isTop={index < 5}
          />
        ))}
      </div>
    </div>
  );
}; 