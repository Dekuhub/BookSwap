import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookFormData, BookPhotoData } from '../../types/book';
import type { Tag } from '../../types/tag';
import { createBook } from '../../api/books';
import { getTags, createTag } from '../../api/tags';

interface AddBookProps {
  onSuccess?: () => void;
}

const AddBook: React.FC<AddBookProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: '',
    author: '',
    description: '',
    state_id: 1,
    tag_ids: [],
    photos: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };

    fetchTags();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: BookPhotoData[] = [];
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите только изображения');
        hasError = true;
        break;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Каждое изображение должно быть меньше 5MB');
        hasError = true;
        break;
      }

      try {
        const base64 = await convertToBase64(file);
        newPhotos.push({
          photo_url: base64,
          is_main: formData.photos.length === 0 && i === 0
        });
      } catch (err) {
        setError('Не удалось обработать одно или несколько изображений');
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos],
      }));
      setError('');
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowTagSuggestions(true);
    setTagCreationError(null);
  };

  const handleTagInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === newTag.toLowerCase());
      
      if (existingTag) {
        if (!formData.tag_ids.includes(existingTag.id)) {
          setFormData((prev) => ({
            ...prev,
            tag_ids: [...prev.tag_ids, existingTag.id],
          }));
        }
        setTagInput('');
        setShowTagSuggestions(false);
      } else {
        try {
          const createdTag = await createTag(newTag);
          setAvailableTags([...availableTags, createdTag]);
          if (!formData.tag_ids.includes(createdTag.id)) {
            setFormData((prev) => ({
              ...prev,
              tag_ids: [...prev.tag_ids, createdTag.id],
            }));
          }
          setTagInput('');
          setShowTagSuggestions(false);
          setTagCreationError(null);
        } catch (err) {
          console.error('Failed to create tag:', err);
          setTagCreationError(`Не удалось создать тег: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }
  };

  const addTag = (tag: Tag) => {
    if (!formData.tag_ids.includes(tag.id)) {
      setFormData((prev) => ({
        ...prev,
        tag_ids: [...prev.tag_ids, tag.id],
      }));
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      tag_ids: prev.tag_ids.filter((_, index) => index !== indexToRemove),
    }));
  };

  const removeImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const newPhotos = prev.photos.filter((_, index) => index !== indexToRemove);
      if (prev.photos[indexToRemove].is_main && newPhotos.length > 0) {
        newPhotos[0].is_main = true;
      }
      return {
        ...prev,
        photos: newPhotos,
      };
    });
  };

  const setMainPhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.map((photo, i) => ({
        ...photo,
        is_main: i === index
      }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBook(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/books');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось добавить книгу');
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !formData.tag_ids.includes(tag.id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Добавить книгу</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-[#999]">
            Название
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-[#999]">
            Автор
          </label>
          <input
            type="text"
            id="author"
            name="author"
            required
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            value={formData.author}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#999]">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="state_id" className="block text-sm font-medium text-[#999]">
            Состояние
          </label>
          <select
            id="state_id"
            name="state_id"
            required
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
            value={formData.state_id}
            onChange={handleChange}
          >
            <option value={1}>Доступна</option>
            <option value={2}>Недоступна</option>
          </select>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-[#999]">
            Фотографии книги
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-[#999]
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#FF6B00] file:text-white
              hover:file:bg-[#E55D00]"
          />
          {formData.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.photo_url}
                    alt={`Preview ${index + 1}`}
                    className={`w-full h-48 object-cover rounded-lg ${photo.is_main ? 'ring-2 ring-[#FF6B00]' : ''}`}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMainPhoto(index)}
                      className={`px-2 py-1 rounded-full text-sm ${
                        photo.is_main 
                          ? 'bg-[#FF6B00] text-white' 
                          : 'bg-[#3D3D3D] text-white hover:bg-[#4D4D4D]'
                      }`}
                    >
                      {photo.is_main ? 'Основное' : 'Сделать основным'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-[#999]">
            Теги
          </label>
          <div className="relative">
            <input
              type="text"
              id="tags"
              className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Введите теги или выберите из предложенных"
              onFocus={() => setShowTagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowTagSuggestions(false), 100)}
            />
            {showTagSuggestions && filteredTags.length > 0 && (
              <ul className="absolute z-10 w-full bg-[#3D3D3D] border border-[#444] rounded-md mt-1 max-h-48 overflow-y-auto">
                {filteredTags.map(tag => (
                  <li
                    key={tag.id}
                    className="px-4 py-2 cursor-pointer hover:bg-[#4D4D4D] text-white"
                    onMouseDown={() => addTag(tag)}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {tagCreationError && (
            <div className="mt-2 p-2 text-sm bg-red-900/50 text-red-200 rounded-md border border-red-700">
              {tagCreationError}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tag_ids.map((tagId, index) => {
              const tag = availableTags.find(t => t.id === tagId);
              return (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF6B00] text-white"
                >
                  {tag?.name || tagId}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[#E55D00]"
                    onClick={() => removeTag(index)}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-full text-white bg-[#FF6B00] hover:bg-[#E55D00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00] focus:ring-offset-[#2D2D2D]"
          >
            Добавить книгу
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook; 