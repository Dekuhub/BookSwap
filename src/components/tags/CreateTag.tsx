import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTag } from '../../api/tags';
import { optimizeBase64ToMaxSize } from '../../utils/imageOptimizer';

const CreateTag: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    try {
      // Читаем файл как base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      
      // Оптимизируем изображение
      const optimizedImage = await optimizeBase64ToMaxSize(base64, 500 * 1024); // 500KB
      
      setPhoto(optimizedImage);
      setPreviewUrl(optimizedImage);
      setError('');
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Ошибка при обработке изображения');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введите название тега');
      return;
    }
    if (!photo) {
      setError('Добавьте фотографию для тега');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createTag({
        name: name.trim(),
        photo
      });
      navigate('/tags');
    } catch (err) {
      console.error('Error creating tag:', err);
      setError(err instanceof Error ? err.message : 'Не удалось создать тег');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Создать тег</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#999]">
            Название тега
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            placeholder="Введите название тега"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-2">
            Фотография тега
          </label>
          <div className="flex flex-col items-center space-y-4">
            {previewUrl && (
              <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full text-sm text-[#999]
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#FF6B00] file:text-white
                hover:file:bg-[#E55D00]"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#FF6B00] hover:bg-[#E55D00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00] focus:ring-offset-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Создание...' : 'Создать тег'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTag; 