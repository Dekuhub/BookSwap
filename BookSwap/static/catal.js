// Функции для работы с модальными окнами
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('registrationModal').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'flex';
    document.getElementById('loginModal').style.display = 'none';
}

function closeRegistrationModal() {
    document.getElementById('registrationModal').style.display = 'none';
}

// Функция для переключения видимости пароля
function togglePassword(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    const icon = toggle.querySelector('img');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.src = './img/hide.png'; // Иконка "скрыть пароль"
    } else {
        input.type = 'password';
        icon.src = './img/show.png'; // Иконка "показать пароль"
    }
}

// Функция для обработки входа
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('emailError');
    
    // Валидация
    if (!email || !password) {
        errorElement.textContent = 'Пожалуйста, заполните все поля';
        errorElement.style.display = 'block';
        return false;
    }
    
    try {
        const response = await fetch('http://10.3.18.1:8000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Успешный вход
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Показываем кнопку профиля и скрываем кнопку входа
            document.querySelector('.nav-prof').style.display = 'block';
            document.getElementById('loginButton').style.display = 'none';
            
            closeLoginModal();
        } else {
            // Ошибка входа
            errorElement.textContent = data.message || 'Ошибка входа';
            errorElement.style.display = 'block';
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        errorElement.textContent = 'Произошла ошибка при попытке входа';
        errorElement.style.display = 'block';
    }
    
    return false;
}

// Функция для обработки регистрации
async function handleRegistration(event) {
    event.preventDefault();
    
    const login = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const username = login; // Используем login как username или можно добавить отдельное поле
    const emailError = document.getElementById('regEmailError');
    const passwordError = document.getElementById('regPasswordError');
    
    // Сбрасываем ошибки
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    
    // Валидация
    if (!login || !password || !confirmPassword) {
        passwordError.textContent = 'Пожалуйста, заполните все поля';
        passwordError.style.display = 'block';
        return false;
    }
    
    if (password !== confirmPassword) {
        passwordError.textContent = 'Пароли не совпадают';
        passwordError.style.display = 'block';
        return false;
    }
    
    if (password.length < 6) {
        passwordError.textContent = 'Пароль должен содержать минимум 6 символов';
        passwordError.style.display = 'block';
        return false;
    }
    
    try {
        const response = await fetch('http://10.3.18.1:8000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: login,
                password: password,
                username: username // Добавляем username в запрос
            })
        });
        
        // Обработка ответа сервера
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка регистрации');
        }
        
        const data = await response.json();
        
        // Успешная регистрация
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Обновляем интерфейс
        document.querySelector('.nav-prof').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
        
        closeRegistrationModal();
        
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        passwordError.textContent = error.message || 'Произошла ошибка при попытке регистрации';
        passwordError.style.display = 'block';
    }
    
    return false;
}
// Проверяем, авторизован ли пользователь при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const loginButton = document.getElementById('loginButton');
    const profileLink = document.querySelector('.nav-prof');
    
    if (token) {
        // Пользователь авторизован
        loginButton.style.display = 'none';
        profileLink.style.display = 'block';
    } else {
        // Пользователь не авторизован
        loginButton.style.display = 'block';
        profileLink.style.display = 'none';
    }
});

