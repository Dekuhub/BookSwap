import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTags } from '../api/tags';
import type { Tag } from '../types/tag';

const TagListPage: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const fetchedTags = await getTags();
        setTags(fetchedTags);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        setError('Не удалось загрузить теги');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Теги</h1>
        <Link
          to="/tags/create"
          className="inline-flex items-center px-4 py-2 border-2 border-[#FF6B00] text-sm font-medium rounded-md text-white hover:bg-[#FF6B00]/10 transition-all duration-300"
        >
          Создать тег
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tags.map(tag => (
          <div
            key={tag.id}
            className="bg-[#2D2D2D] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {tag.photo ? (
              <div className="aspect-[3/2]">
                <img
                  src={tag.photo}
                  alt={tag.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[3/2] bg-[#3D3D3D] flex items-center justify-center">
                <span className="text-white/40">Нет фото</span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-white font-medium text-lg">{tag.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/60 mb-6">Теги пока не созданы</p>
          <Link
            to="/tags/create"
            className="inline-flex items-center px-4 py-2 border-2 border-[#FF6B00] text-sm font-medium rounded-md text-white hover:bg-[#FF6B00]/10 transition-all duration-300"
          >
            Создать первый тег
          </Link>
        </div>
      )}
    </div>
  );
};

export default TagListPage; 