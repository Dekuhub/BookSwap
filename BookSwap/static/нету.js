// Функции для управления модальными окнами
function openLoginModal() {
    document.getElementById("loginModal").style.display = "block";
    document.getElementById("registrationModal").style.display = "none";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

function openRegistrationModal() {
    document.getElementById("registrationModal").style.display = "block";
    document.getElementById("loginModal").style.display = "none";
}

function closeRegistrationModal() {
    document.getElementById("registrationModal").style.display = "none";
}

// Переключение видимости пароля
function togglePassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(buttonId).querySelector('img');
    if (input.type === "password") {
        input.type = "text";
        icon.src = "/statik/img/hide.png";
    } else {
        input.type = "password";
        icon.src = "/statik/img/show.png";
    }
}

// Обработка входа
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('successMessage').style.display = 'block';
            setTimeout(() => {
                closeLoginModal();
                document.getElementById('successMessage').style.display = 'none';
                document.getElementById('loginButton').style.display = 'none';
                document.getElementById('accountButton').style.display = 'inline-block';
                localStorage.setItem('isLoggedIn', 'true'); // Сохраняем состояние авторизации
                window.location.href = 'index2.html';
            }, 3000);
        } else {
            document.getElementById('emailError').innerText = data.message;
            document.getElementById('emailError').style.display = 'block';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Обработка регистрации
function handleRegistration(event) {
    event.preventDefault();
    const regEmail = document.getElementById('regEmail').value;
    const regPassword = document.getElementById('regPassword').value;
    const regConfirmPassword = document.getElementById('regConfirmPassword').value;

    if (regPassword !== regConfirmPassword) {
        document.getElementById('regPasswordError').innerText = "Пароли не совпадают!";
        document.getElementById('regPasswordError').style.display = 'block';
        return;
    } else {
        document.getElementById('regPasswordError').style.display = 'none';
    }

    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('successMessage').style.display = 'block';
            setTimeout(() => {
                closeRegistrationModal();
                document.getElementById('successMessage').style.display = 'none';
                document.getElementById('loginButton').style.display = 'none';
                document.getElementById('accountButton').style.display = 'inline-block';
                localStorage.setItem('isLoggedIn', 'true'); // Сохраняем состояние авторизации
                window.location.href = 'index2.html';
            }, 3000);
        } else {
            document.getElementById('regEmailError').innerText = data.message;
            document.getElementById('regEmailError').style.display = 'block';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Проверка состояния авторизации при загрузке страницы
window.onload = function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('accountButton').style.display = 'inline-block';
    }
};

const images = [
    {
        src: "/statik/img/Group 13.png",
        styles: {
            filter: "opacity(1)"
        }
    },
    {
        src: "/statik/img/Group 14.png",
        styles: {
            filter: "opacity(0.9)"
        }
    },
    {
        src: "/statik/img/Group 15.png",
        styles: {
            filter: "opacity(0.85)"
        }
    },
    {
        src: "/statik/img/Group 17.png",
        styles: {
            filter: "opacity(0.7)"
        }
    },
    {
        src: "/statik/img/Group 18.png",
        styles: {
            filter: "opacity(0.8)"
        }
    },
    {
        src: "/statik/img/Group 19.png",
        styles: {
            filter: "opacity(0.75)"
        }
    },
];

let currentIndex = 0;

function changeImage() {
    currentIndex++;
    if (currentIndex >= images.length) {
        currentIndex = 0; // Обнуляем индекс при выходе за пределы
    }

    const profileImg = document.getElementById('profileImg');
    const profileDiv = document.getElementById('profileImage');

    // Меняем источник изображения
    profileImg.src = images[currentIndex].src;

    // Применяем стили к изображению
    Object.keys(images[currentIndex].styles).forEach(style => {
        profileDiv.style[style] = images[currentIndex].styles[style];
    });
}

document.getElementById('editButton').addEventListener('click', function() {
    const prof2Content = document.getElementById('prof2Content');
    const prof2Edit = document.getElementById('prof2Edit');

    if (prof2Edit.style.display === 'none') {
        // Переход в режим редактирования
        prof2Edit.value = prof2Content.innerText; // Загружаем текущий текст в текстовое поле
        prof2Content.style.display = 'none';
        prof2Edit.style.display = 'block';
        this.innerText = 'Сохранить'; // Меняем текст кнопки
    } else {
        // Сохранение изменений
        prof2Content.innerText = prof2Edit.value; // Сохраняем текст из текстового поля
        prof2Edit.style.display = 'none';
        prof2Content.style.display = 'block';
        this.innerText = 'Изменить'; // Возвращаем текст кнопки
    }
});

// Получаем элементы
const telegramText = document.querySelector('.telegram p');
const modal = document.getElementById('telegramModal');
const closeBtn = document.querySelector('.close');
const saveBtn = document.getElementById('saveTelegramUsername');
const telegramUsernameInput = document.getElementById('telegramUsername');
const errorMessage = document.getElementById('error-message'); // Новый элемент для ошибок

// Открываем модальное окно при нажатии на "telegram"
telegramText.addEventListener('click', function() {
    modal.style.display = 'block';
    errorMessage.style.display = 'none'; // Скрываем сообщение об ошибке при открытии модала
});

// Закрываем модальное окно при нажатии на крестик
closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Закрываем модальное окно при клике вне его области
window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Сохраняем никнейм Telegram
saveBtn.addEventListener('click', function() {
    const username = telegramUsernameInput.value;
    if (username) {
        const formattedUsername = username.startsWith('@') ? username : `@${username}`;
        if (isValidTelegramUsername(formattedUsername)) {
            telegramText.innerText = formattedUsername; // Обновляем текст "telegram"
            modal.style.display = 'none'; // Закрываем модальное окно
            errorMessage.style.display = 'none'; // Скрываем сообщение об ошибке
        } else {
            errorMessage.innerText = 'Некорректный Telegram-никнейм. Используйте только буквы, цифры и подчеркивания.';
            errorMessage.style.display = 'block'; // Показываем сообщение об ошибке
        }
    } else {
        errorMessage.innerText = 'Пожалуйста, введите ваш Telegram-никнейм.';
        errorMessage.style.display = 'block'; // Показываем сообщение об ошибке
    }
});

function isValidTelegramUsername(username) {
    // Никнейм должен начинаться с "@" и содержать только буквы, цифры и подчеркивания
    const regex = /^@[a-zA-Z0-9_]{5,}$/;
    return regex.test(username);
}