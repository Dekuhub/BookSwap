// Получаем элементы
const button = document.querySelector('.info-container button');
const textarea = document.getElementById('info-textarea');
const telegramLink = document.getElementById('telegram-link');
const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const telegramInput = document.getElementById('telegram-input');
const saveTelegramButton = document.getElementById('save-telegram');
const publishButton = document.getElementById('publish-button');
const uploadModal = document.getElementById('upload-modal');
const overlay1 = document.getElementById('overlay1');
const photoSquares = document.querySelectorAll('.photo-square');
const uploadButton = document.getElementById('upload-button');
const slidersContainer = document.getElementById('sliders-container');

// Получаем все чекбоксы жанров
const genreCheckboxes = document.querySelectorAll('.genre-option input[type="checkbox"]');

// Создаем массив соответствия ID жанров (можно настроить под вашу БД)
const genreIds = {
    "Учёба": 1,
    "Популярное": 2,
    "Документальные": 3,
    "Романтика": 4,
    "Детектив": 5,
    "Фантастика": 6,
    "Исторические": 7,
    "Философия": 8,
    "Автобиография": 9,
    "Мистика": 10
};

// Переменные для управления слайдерами
let currentPhotoIndex = 0;
let sliderInterval;

// Обработчик для кнопки "Загрузить"
uploadButton.addEventListener('click', async() => {
    const description = document.getElementById('description-textarea').value;
    const author = document.getElementById('book-author').value;
    const title = document.getElementById('book-title').value;
    const photos = [];
 
    // Собираем фотографии из модального окна
    photoSquares.forEach(square => {
        const photoPreview = square.querySelector('.photo-preview');
        if (photoPreview.src && !photoPreview.src.includes('placeholder.jpg')) {
            photos.push({
                src: photoPreview.src,
                description: description
            });
        }
    });
    

    // Собираем выбранные жанры (теги)
    const tagIds = [];
    genreCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            tagIds.push(index + 1); // Предполагаем, что id жанров начинаются с 1
        }
    });

    // Формируем данные для отправки
    const adData = {
        author: author,
        description: description,
        photos: photos,
        state_id: 1, // Пример: 1 - активное состояние
        tag_ids: tagIds,
        title: title
    };

    try {
        const token = localStorage.getItem('token');
        console.log('Текущий токен:', token);
try {
    const response = await fetch('http://10.3.18.1:8000/api/v1/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(adData)
    });

    const responseText = await response.text(); // получаем текст

    if (!response.ok) {
        // Пытаемся распарсить как JSON, если возможно
        let errorData;
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            // Не удалось распарсить как JSON, выводим текст
            errorData = responseText;
        }
        console.error('Ошибка при запросе:', errorData);
    } else {
        // Ответ успешный, парсим как JSON
        try {
            const result = JSON.parse(responseText);
            console.log('Успех:', result);
        } catch (e) {
            console.error('Ошибка парсинга JSON:', e, 'Ответ:', responseText);
        }
    }
} catch (error) {
    console.error('Ошибка сети или выполнения запроса:', error);
}

        
        if (!response.ok) {
            throw new Error('Ошибка при отправке данных');
        }

        const result = await response.json();
        console.log('Объявление успешно создано:', result);

        // Если есть фотографии, создаем слайдер
        if (photos.length > 0) {
            createSlider(photos.map(photo => ({ src: photo, description })));
            slidersContainer.style.display = 'flex';
        }

        // Очищаем модальное окно
        photoSquares.forEach(square => {
            const photoPreview = square.querySelector('.photo-preview');
            photoPreview.src = '';
        });
        document.getElementById('description-textarea').value = '';
        genreCheckboxes.forEach(checkbox => checkbox.checked = false);

        // Закрываем модальное окно
        uploadModal.style.display = 'none';
        overlay1.style.display = 'none';

        // Показываем уведомление об успехе
        alert('Объявление успешно опубликовано!');

    } catch (error) {
        console.error('Ошибка при создании объявления:', error);
        alert('Произошла ошибка при публикации объявления');
    }
});

// Обработчик для кнопки "Изменить/Сохранить"
document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('edit-button');
    const textarea = document.getElementById('info-textarea');

    if (editButton && textarea) {
        editButton.addEventListener('click', () => {
            textarea.readOnly = !textarea.readOnly;
            editButton.textContent = textarea.readOnly ? 'Изменить' : 'Сохранить';
        });
    } else {
        console.error('Элементы не найдены!');
    }
});
 
// Обработчик для ссылки Telegram
telegramLink.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'block';
    overlay.style.display = 'block';
});
 
// Обработчик для кнопки "Сохранить" в модальном окне Telegram
saveTelegramButton.addEventListener('click', () => {
    const newTelegram = telegramInput.value.trim();
    if (newTelegram) {
        telegramLink.textContent = newTelegram;
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
});
 
// Обработчик для кнопки "Опубликовать"
publishButton.addEventListener('click', () => {
    uploadModal.style.display = 'block';
    overlay1.style.display = 'block';
});
 
// Обработчики для добавления фотографий
photoSquares.forEach(square => {
    const fileInput = square.querySelector('.photo-input');
    const photoPreview = square.querySelector('.photo-preview');
    const addPhotoBtn = square.querySelector('.add-photo-btn');
 
    addPhotoBtn.addEventListener('click', () => {
        fileInput.click();
    });
 
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
});
 
// Функция для создания слайдера
function createSlider(photos) {
    const sliderContainer = document.createElement('div');
    sliderContainer.classList.add('slider');

    // Создаем элементы слайдера
    photos.forEach((photo, index) => {
        const sliderItem = document.createElement('div');
        sliderItem.classList.add('slider-item');
        if (index === 0) sliderItem.classList.add('active');

        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = 'Slider Photo';
        img.classList.add('slider-photo');

        const description = document.createElement('div');
        description.classList.add('slider-description');
        description.textContent = photo.description || 'Описание отсутствует';

        sliderItem.appendChild(img);
        sliderItem.appendChild(description);
        sliderContainer.appendChild(sliderItem);
    });

    // Добавляем слайдер в контейнер
    slidersContainer.appendChild(sliderContainer);

    // Запускаем слайдер
    startSlider(sliderContainer);
}
 
// Функция для отображения следующей фотографии
function showNextPhoto(sliderItems) {
    sliderItems[currentPhotoIndex].classList.remove('active');
    currentPhotoIndex = (currentPhotoIndex + 1) % sliderItems.length;
    sliderItems[currentPhotoIndex].classList.add('active');
}
 
// Закрытие модальных окон при клике вне их области
document.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    const uploadModal = document.getElementById('upload-modal');
    const overlay = document.getElementById('overlay');
    const overlay1 = document.getElementById('overlay1');
 
    // Закрываем первое модальное окно
    if (
        modal.style.display === 'block' &&
        !modal.contains(event.target) &&
        event.target !== telegramLink // Не закрываем, если клик был на кнопке открытия
    ) {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    }
 
    // Закрываем второе модальное окно
    if (
        uploadModal.style.display === 'block' &&
        !uploadModal.contains(event.target) &&
        event.target !== publishButton // Не закрываем, если клик был на кнопке открытия
    ) {
        uploadModal.style.display = 'none';
        overlay1.style.display = 'none';
    }
});
 
// Остановка слайдера при наведении
slidersContainer.addEventListener('mouseenter', () => {
    clearInterval(sliderInterval);
});

// Возобновление слайдера при уходе курсора
slidersContainer.addEventListener('mouseleave', () => {
    const sliderItems = slidersContainer.querySelectorAll('.slider-item');
    startSlider(sliderItems);
});

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();

            // Опционально: подтверждение выхода
            if (!confirm('Вы уверены, что хотите выйти?')) {
                return; // Отмена выхода
            }

            // 1. Очищаем данные авторизации
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // 2. Обновляем интерфейс (если не делаете редирект)
            const loginButton = document.getElementById('loginButton');
            const profileLink = document.querySelector('.nav-prof');
            if (loginButton) loginButton.style.display = 'block';
            if (profileLink) profileLink.style.display = 'none';

            // 3. Перенаправляем на главную страницу
            window.location.href = './Catalog.html'; // Укажите нужный URL
        });
    }
});

// Функция для запуска слайдера
function startSlider(sliderContainer) {
    const sliderItems = sliderContainer.querySelectorAll('.slider-item');
    let currentIndex = 0;

    sliderInterval = setInterval(() => {
        sliderItems[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % sliderItems.length;
        sliderItems[currentIndex].classList.add('active');
    }, 3000);
}

    // Обработчик для выпадающего списка жанров
    document.addEventListener('DOMContentLoaded', function() {
        const genreToggle = document.getElementById('genre-toggle');
        const genreDropdown = document.getElementById('genre-dropdown');
        
        if (genreToggle && genreDropdown) {
            // Открытие/закрытие выпадающего списка
            genreToggle.addEventListener('click', function() {
                genreDropdown.style.display = genreDropdown.style.display === 'block' ? 'none' : 'block';
                genreToggle.innerHTML = genreDropdown.style.display === 'block' ? 
                    'Выберите жанры ▲' : 'Выберите жанры ▼';
            });
            
            // Закрытие при клике вне списка
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.genre-selector')) {
                    genreDropdown.style.display = 'none';
                    genreToggle.innerHTML = 'Выберите жанры ▼';
                }
            });
        }});