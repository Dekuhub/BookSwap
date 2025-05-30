import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateBook } from '../../api/books';
import { getTags, createTag } from '../../api/tags';
import type { Book, UpdateBookData } from '../../types/book';
import type { Tag } from '../../types/tag';
import { optimizeBase64ToMaxSize } from '../../utils/imageOptimizer';

interface EditBookProps {
  book: Book;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditBook: React.FC<EditBookProps> = ({ book, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [photos, setPhotos] = useState<string[]>([]);
  const [stateId, setStateId] = useState(book.state_id);
  const [selectedTags, setSelectedTags] = useState<number[]>(book.tags.map(tag => tag.id));
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (err) {
        console.error('Failed to load tags:', err);
        setError('Не удалось загрузить теги');
      }
    };

    loadTags();
  }, []);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      const newPhotos = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          setError('Пожалуйста, выберите только изображения');
          continue;
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        const optimizedImage = await optimizeBase64ToMaxSize(base64, 500 * 1024); // 500KB
        newPhotos.push(optimizedImage);
      }

      setPhotos([...photos, ...newPhotos]);
      setError(null);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Ошибка при обработке изображений');
    }
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
        if (!selectedTags.includes(existingTag.id)) {
          setSelectedTags([...selectedTags, existingTag.id]);
        }
        setTagInput('');
        setShowTagSuggestions(false);
      } else {
        try {
          const createdTag = await createTag({ name: newTag, photo: '' });
          setAvailableTags([...availableTags, createdTag]);
          if (!selectedTags.includes(createdTag.id)) {
            setSelectedTags([...selectedTags, createdTag.id]);
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
    if (!selectedTags.includes(tag.id)) {
      setSelectedTags([...selectedTags, tag.id]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (tagId: number) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Введите название книги');
      return;
    }
    if (!author.trim()) {
      setError('Введите автора книги');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookData: UpdateBookData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        photos: photos.length > 0 ? photos : book.photos.map(p => p.photo_url),
        state_id: stateId,
        tag_ids: selectedTags
      };

      await updateBook(book.id, bookData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/books/${book.id}`);
      }
    } catch (err) {
      console.error('Error updating book:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обновить книгу');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Редактировать книгу</h1>
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-[#999]">
            Автор
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#999]">
            Описание
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label htmlFor="state_id" className="block text-sm font-medium text-[#999]">
            Состояние
          </label>
          <select
            id="state_id"
            value={stateId}
            onChange={(e) => setStateId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          >
            <option value={1}>Отличное</option>
            <option value={2}>Хорошее</option>
            <option value={3}>Удовлетворительное</option>
          </select>
        </div>

        <div>
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
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FF6B00] text-white"
                >
                  {tag?.name || tagId}
                  <button
                    type="button"
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[#E55D00]"
                    onClick={() => removeTag(tagId)}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#999] mb-2">
            Фотографии
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {book.photos.map((photo, index) => (
              <div key={photo.id} className="relative aspect-square">
                <img
                  src={photo.photo_url}
                  alt={`Фото ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
            {photos.map((photo, index) => (
              <div key={`new-${index}`} className="relative aspect-square">
                <img
                  src={photo}
                  alt={`Новое фото ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoChange}
            className="w-full text-sm text-[#999]
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#FF6B00] file:text-white
              hover:file:bg-[#E55D00]"
          />
        </div>

        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-white bg-[#3D3D3D] rounded-full hover:bg-[#4D4D4D]"
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook; 