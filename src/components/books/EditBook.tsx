import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateBook, deleteBook, checkBookDependencies } from '../../api/books';
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
  const [photos, setPhotos] = useState<string[]>(book.photos.map(p => p.photo_url));
  const [stateId, setStateId] = useState(book.state_id);
  const [selectedTags, setSelectedTags] = useState<number[]>(book.tags.map(tag => tag.id));
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleRemovePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
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

  const handleDeleteClick = async () => {
    setDeleteError(null);
    try {
      const dependencies = await checkBookDependencies(book.id);
      if (dependencies.hasActiveExchanges || dependencies.hasExchangeRequests || dependencies.hasExchangeHistory) {
        setDeleteError('Книгу нельзя удалить, так как она участвует в активных или завершенных обменах.');
        return;
      }
      setShowDeleteConfirm(true);
    } catch (err) {
      console.error('Error checking dependencies:', err);
      setDeleteError(err instanceof Error ? err.message : 'Не удалось проверить зависимости книги.');
    }
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setDeleteError(null);
    try {
      await deleteBook(book.id);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/profile'); // Перенаправить на страницу профиля или список книг
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setDeleteError(err instanceof Error ? err.message : 'Не удалось удалить книгу.');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
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
          <label htmlFor="photos" className="block text-sm font-medium text-[#999]">
            Фотографии
          </label>
          <input
            type="file"
            id="photos"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-1 block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FF6B00] file:text-white hover:file:bg-[#FF6B00]/90"
          />
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photos.map((photoUrl, index) => (
              <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                <img src={photoUrl} alt={`Book Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  aria-label="Удалить фото"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-[#999]">
            Состояние
          </label>
          <select
            id="state"
            value={stateId}
            onChange={(e) => setStateId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          >
            <option value={1}>Доступна</option>
            <option value={2}>Недоступна</option>
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-[#999]">
            Теги
          </label>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            onFocus={() => setShowTagSuggestions(true)}
            onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
            placeholder="Добавить тег..."
            className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm focus:border-[#FF6B00] focus:ring-[#FF6B00]"
          />
          {tagCreationError && <p className="mt-2 text-red-400 text-sm">{tagCreationError}</p>}
          {showTagSuggestions && filteredTags.length > 0 && (
            <div className="absolute z-10 bg-[#3D3D3D] border border-[#444] rounded-md shadow-lg mt-1 w-full max-h-40 overflow-y-auto">
              {filteredTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onMouseDown={() => addTag(tag)}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-[#FF6B00]/20"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <span
                  key={tag.id}
                  className="flex items-center bg-[#FF6B00] text-white px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    className="ml-2 text-white/80 hover:text-white focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#FF6B00]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Удалить книгу
          </button>
        </div>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2D2D2D] p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-white mb-4">Подтверждение удаления</h3>
            <p className="text-gray-300 mb-6">Вы уверены, что хотите удалить эту книгу? Это действие необратимо.</p>
            {deleteError && (
              <p className="text-red-400 mb-4">{deleteError}</p>
            )}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBook; 