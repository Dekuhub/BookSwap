import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookFormData } from '../../types/book';
import { createBook } from '../../api/books';

interface PhotoFile extends File {
  preview: string;
}

const BookForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState<'available' | 'unavailable'>('available');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [error, setError] = useState('');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: PhotoFile[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const photoFile = file as PhotoFile;
        
        reader.onloadend = () => {
          photoFile.preview = reader.result as string;
          setPhotos(prev => [...prev, photoFile]);
        };
        
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formData: BookFormData = {
        title,
        author,
        description,
        state,
        tags: selectedTags,
        photos: photos.map(photo => photo.preview) // Отправляем base64 строки
      };

      const response = await createBook(formData);
      if (response.ok) {
        navigate('/books');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create book');
      }
    } catch (err) {
      setError('Failed to create book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Author</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          rows={4}
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">State</label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value as 'available' | 'unavailable')}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          required
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Photos</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
        />
        <div className="mt-4 grid grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Create Book
      </button>
    </form>
  );
};

export default BookForm; 