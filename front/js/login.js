// ===== AUTHENTICATION SYSTEM WITH ANIMATIONS =====
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация системы
    initAuthSystem();
});

function initAuthSystem() {
    // Элементы
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchButtons = document.querySelectorAll('.switch-form');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const registrationProgress = document.getElementById('registrationProgress');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const progressFill = document.querySelector('.progress-fill'); // Добавлено
    const progressSteps = document.querySelectorAll('.step');
    const passwordInput = document.getElementById('regPassword');
    const strengthLevel = document.querySelector('.strength-level');
    const strengthBar = document.querySelector('.password-strength');

    let currentStep = 1;

    // Переключение между формами входа и регистрации
    switchButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            
            if (target === 'register') {
                showRegisterForm();
            } else {
                showLoginForm();
            }
        });
    });

    // Показать форму входа
    function showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        registerForm.classList.remove('active');
        registrationProgress.classList.remove('active');
        
        setTimeout(() => {
            loginForm.classList.add('active');
            animateFormSwitch('login');
        }, 300);
        
        currentStep = 1;
        resetFormSteps();
    }

    // Показать форму регистрации
    function showRegisterForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        loginForm.classList.remove('active');
        
        setTimeout(() => {
            registerForm.classList.add('active');
            registrationProgress.classList.add('active');
            animateFormSwitch('register');
            updateProgressBar(); // Теперь функция существует
        }, 300);
    }

    // Анимация переключения форм
    function animateFormSwitch(type) {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.style.animation = 'none';
            setTimeout(() => {
                form.style.animation = 'slideInUp 0.5s ease';
            }, 10);
        });
    }

    // Переключение видимости пароля
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.style.animation = 'bounceIn 0.3s ease';
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.style.animation = 'bounceIn 0.3s ease';
            }
        });
    });

    // Многошаговая форма регистрации
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = parseInt(this.getAttribute('data-next'));
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = parseInt(this.getAttribute('data-prev'));
            goToStep(prevStep);
        });
    });

    function goToStep(step) {
        // Скрыть текущий шаг
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        currentStepElement.classList.remove('active');
        currentStepElement.style.animation = 'slideOutLeft 0.3s ease';
        
        // Показать следующий шаг
        setTimeout(() => {
            const nextStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
            nextStepElement.classList.add('active');
            
            const animation = step > currentStep ? 'slideInRight' : 'slideInLeft';
            nextStepElement.style.animation = `${animation} 0.5s ease`;
            
            currentStep = step;
            updateProgressBar(); // Теперь функция существует
            updateProgressSteps();
        }, 300);
    }

    // Функция для обновления прогресс-бара (ДОБАВЛЕНО)
    function updateProgressBar() {
        if (progressFill) {
            const progress = ((currentStep - 1) / 2) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    function validateStep(step) {
        let isValid = true;
        
        switch(step) {
            case 1:
                const firstName = document.getElementById('regFirstName');
                const lastName = document.getElementById('regLastName');
                const email = document.getElementById('regEmail');
                
                if (!firstName.value.trim()) {
                    showError(firstName, 'Введите имя');
                    isValid = false;
                }
                
                if (!lastName.value.trim()) {
                    showError(lastName, 'Введите фамилию');
                    isValid = false;
                }
                
                if (!email.value.trim() || !isValidEmail(email.value)) {
                    showError(email, 'Введите корректный email');
                    isValid = false;
                }
                break;
                
            case 2:
                const password = document.getElementById('regPassword');
                const confirmPassword = document.getElementById('regConfirmPassword');
                
                if (password.value.length < 8) {
                    showError(password, 'Пароль должен содержать минимум 8 символов');
                    isValid = false;
                }
                
                if (password.value !== confirmPassword.value) {
                    showError(confirmPassword, 'Пароли не совпадают');
                    isValid = false;
                }
                break;
        }
        
        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        // Показать уведомление
        showNotification(message, 'error');
        
        // Анимация ошибки
        input.style.animation = 'shake 0.5s ease';
        
        // Убрать класс ошибки через время
        setTimeout(() => {
            formGroup.classList.remove('error');
        }, 3000);
    }

    function updateProgressSteps() {
        progressSteps.forEach((step, index) => {
            const stepNumber = parseInt(step.getAttribute('data-step'));
            
            step.classList.remove('active', 'completed');
            
            if (stepNumber === currentStep) {
                step.classList.add('active');
            } else if (stepNumber < currentStep) {
                step.classList.add('completed');
            }
        });
    }

    function resetFormSteps() {
        formSteps.forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector('.form-step[data-step="1"]').classList.add('active');
    }

    // Валидация email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Анализ надежности пароля - ИСПРАВЛЕННАЯ ВЕРСИЯ
    if (passwordInput && strengthBar && strengthLevel) {
        passwordInput.addEventListener('input', function() {
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
        
        return Math.min(strength, 4); // Ограничиваем максимум 4
    }

    function updatePasswordStrength(strength) {
        const strengthClasses = ['password-weak', 'password-medium', 'password-strong', 'password-very-strong'];
        const strengthTexts = ['слабый', 'средний', 'надежный', 'очень надежный'];
        const strengthColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
        
        // Убрать все классы
        strengthBar.classList.remove(...strengthClasses);
        
        if (strength > 0) {
            const strengthIndex = strength - 1;
            strengthBar.classList.add(strengthClasses[strengthIndex]);
            strengthLevel.textContent = strengthTexts[strengthIndex];
            strengthLevel.style.color = strengthColors[strengthIndex];
        } else {
            strengthLevel.textContent = 'слабый';
            strengthLevel.style.color = '#ef4444';
        }
        
        // Добавляем визуальную индикацию
        const strengthFill = strengthBar.querySelector('.strength-fill');
        if (strengthFill) {
            const width = (strength / 4) * 100;
            strengthFill.style.width = `${width}%`;
            strengthFill.style.backgroundColor = strength > 0 ? strengthColors[strength - 1] : '#ef4444';
        }
    }

    // Обработка формы входа
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('.btn-auth');
        submitButton.classList.add('loading');
        
        // Имитация запроса к серверу
        setTimeout(() => {
            submitButton.classList.remove('loading');
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                showNotification('Вход выполнен успешно!', 'success');
                // Здесь будет редирект на главную страницу
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 1500);
            } else {
                showNotification('Пожалуйста, заполните все поля', 'error');
            }
        }, 2000);
    });

    // Обработка формы регистрации
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateStep(3)) return;
        
        const submitButton = this.querySelector('.btn-auth');
        submitButton.classList.add('loading');
        
        // Имитация запроса к серверу
        setTimeout(() => {
            submitButton.classList.remove('loading');
            showNotification('Аккаунт успешно создан!', 'success');
            
            // Автоматический вход после регистрации
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
        }, 3000);
    });

    // Система уведомлений
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
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
            notification.remove();
        }, 3000);
    }

    // Дополнительные анимации при загрузке
    animateFeatures();
}

function animateFeatures() {
    // Анимация для feature items при скролле
    const featureItems = document.querySelectorAll('.feature-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, { threshold: 0.3 });
    
    featureItems.forEach(item => {
        item.style.animationPlayState = 'paused';
        observer.observe(item);
    });
}

// CSS анимации для шагов формы
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutLeft {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50px);
        }
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);