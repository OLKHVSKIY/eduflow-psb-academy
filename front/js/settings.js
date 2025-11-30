// ===== SETTINGS PAGE FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    initSettingsPage();
});

function initSettingsPage() {
    // Проверяем авторизацию
    const token = localStorage.getItem('authToken');
    if (!token) {
        showNotification('Необходима авторизация', 'error');
        setTimeout(() => {
            window.location.href = '/html/login.html';
        }, 2000);
        return;
    }

    initPasswordChange();
    initPasswordStrength();
    initTogglePassword();
    initNotifications();
}

// Инициализация смены пароля
function initPasswordChange() {
    const form = document.getElementById('passwordChangeForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Валидация
        if (newPassword !== confirmPassword) {
            showNotification('Новые пароли не совпадают', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showNotification('Пароль должен содержать минимум 8 символов', 'error');
            return;
        }

        const submitButton = form.querySelector('.btn-primary');
        submitButton.classList.add('loading');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();
            submitButton.classList.remove('loading');

            if (response.ok) {
                showNotification('Пароль успешно изменен', 'success');
                form.reset();
                updatePasswordStrength(0);
            } else {
                showNotification(data.error || 'Ошибка при смене пароля', 'error');
            }
        } catch (error) {
            submitButton.classList.remove('loading');
            showNotification('Ошибка соединения с сервером', 'error');
            console.error('Ошибка смены пароля:', error);
        }
    });
}

// Инициализация индикатора надежности пароля
function initPasswordStrength() {
    const newPasswordInput = document.getElementById('newPassword');
    if (!newPasswordInput) return;

    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        updatePasswordStrength(strength);
    });
}

function calculatePasswordStrength(password) {
    if (password.length === 0) return 0;
    
    let strength = 0;
    
    // Длина пароля
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Сложность символов
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 4);
}

function updatePasswordStrength(strength) {
    const strengthBar = document.getElementById('passwordStrength');
    if (!strengthBar) return;

    const strengthClasses = ['password-weak', 'password-medium', 'password-strong', 'password-very-strong'];
    const strengthTexts = ['слабый', 'средний', 'надежный', 'очень надежный'];
    
    // Убрать все классы
    strengthBar.classList.remove(...strengthClasses);
    
    if (strength > 0) {
        const strengthIndex = strength - 1;
        strengthBar.classList.add(strengthClasses[strengthIndex]);
        const strengthLevel = strengthBar.querySelector('.strength-level');
        if (strengthLevel) {
            strengthLevel.textContent = strengthTexts[strengthIndex];
        }
    } else {
        const strengthLevel = strengthBar.querySelector('.strength-level');
        if (strengthLevel) {
            strengthLevel.textContent = 'слабый';
        }
    }
}
function initTogglePassword() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        // Принудительно устанавливаем стили для кнопки - сдвигаем ЛЕВЕЕ
        button.style.position = 'absolute';
        button.style.left = 'calc(100% - 45px)'; // Начинаем с этого значения
        button.style.top = '50%';
        button.style.transform = 'translateY(-50%)';
        button.style.transform = 'translateY(-50%)';
        button.style.background = 'none';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.padding = '4px';
        button.style.margin = '0';
        button.style.zIndex = '2';
        
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.marginRight = '0';
            icon.style.fontSize = '16px';
            icon.style.display = 'flex';
            icon.style.alignItems = 'center';
            icon.style.justifyContent = 'center';
            icon.style.width = '20px';
            icon.style.height = '20px';
        }
        
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Инициализация уведомлений
function initNotifications() {
    // Загружаем сохраненные настройки
    const emailNotifications = localStorage.getItem('emailNotifications') !== 'false';
    const deadlineNotifications = localStorage.getItem('deadlineNotifications') !== 'false';
    const courseNotifications = localStorage.getItem('courseNotifications') === 'true';

    document.getElementById('emailNotifications').checked = emailNotifications;
    document.getElementById('deadlineNotifications').checked = deadlineNotifications;
    document.getElementById('courseNotifications').checked = courseNotifications;

    // Сохраняем изменения
    document.getElementById('emailNotifications').addEventListener('change', function() {
        localStorage.setItem('emailNotifications', this.checked);
    });

    document.getElementById('deadlineNotifications').addEventListener('change', function() {
        localStorage.setItem('deadlineNotifications', this.checked);
    });

    document.getElementById('courseNotifications').addEventListener('change', function() {
        localStorage.setItem('courseNotifications', this.checked);
    });
}

// Функция показа уведомлений
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                type === 'error' ? 'fas fa-exclamation-circle' : 
                'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Удалить уведомление после анимации
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Добавляем анимацию исчезновения
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

