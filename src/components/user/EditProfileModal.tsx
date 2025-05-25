import React, { useState } from 'react';
import { updateUser } from '../../api/users';
import { optimizeBase64ToMaxSize } from '../../utils/imageOptimizer';

interface EditProfileModalProps {
  userId: number;
  currentUsername: string;
  currentAvatar?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  userId,
  currentUsername,
  currentAvatar,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [avatar, setAvatar] = useState<string>(currentAvatar || '');
  const [previewUrl, setPreviewUrl] = useState<string>(currentAvatar || '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64 = await base64Promise;
      const optimizedImage = await optimizeBase64ToMaxSize(base64, 500 * 1024); // 500KB
      
      setAvatar(optimizedImage);
      setPreviewUrl(optimizedImage);
      setError('');
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Ошибка при обработке изображения');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Введите имя пользователя');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        username: username.trim(),
        ...(avatar && { avatar })
      };

      await updateUser(userId, updateData);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Не удалось обновить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-[500px] my-8">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white">Редактировать профиль</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 sm:p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700 text-sm sm:text-base">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base font-medium text-[#999] mb-2">
                Аватар
              </label>
              <div className="flex flex-col items-center space-y-4">
                {previewUrl && (
                  <div className="relative w-24 sm:w-32 h-24 sm:h-32 rounded-full overflow-hidden">
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
                  onChange={handleAvatarChange}
                  className="w-full text-sm sm:text-base text-[#999]
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#FF6B00] file:text-white
                    hover:file:bg-[#E55D00]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm sm:text-base font-medium text-[#999] mb-2">
                Имя пользователя
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md bg-[#3D3D3D] border-[#444] text-white shadow-sm 
                  focus:border-[#FF6B00] focus:ring-[#FF6B00] text-sm sm:text-base px-3 py-2"
                placeholder="Введите имя пользователя"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm sm:text-base text-[#999] hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 sm:px-6 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal; 