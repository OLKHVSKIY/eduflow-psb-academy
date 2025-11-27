// ===== PROFILE PAGE FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    initProfilePage();
});

function initProfilePage() {
    // Инициализация AI ассистента
    initAIAssistant();
    
    // Инициализация анимаций прогресса
    initProgressAnimations();
    
    // Инициализация интерактивных элементов
    initInteractiveElements();
    
    // Загрузка данных пользователя
    loadUserData();
}

function initAIAssistant() {
    const aiToggle = document.querySelector('.ai-toggle');
    const aiChat = document.querySelector('.ai-chat');
    const aiClose = document.querySelector('.ai-close');
    const aiInput = document.querySelector('.ai-input input');
    const aiSend = document.querySelector('.ai-input button');

    let isChatOpen = false;
    let chatAnimationTimeout;

    aiToggle.addEventListener('click', toggleChat);
    aiClose.addEventListener('click', closeChat);

    // Закрытие чата при клике вне его
    document.addEventListener('click', function(e) {
        if (isChatOpen && !aiChat.contains(e.target) && !aiToggle.contains(e.target)) {
            closeChat();
        }
    });

    function toggleChat() {
        if (!isChatOpen) {
            openChat();
        } else {
            closeChat();
        }
    }

    function openChat() {
        if (isChatOpen) return;
        
        isChatOpen = true;
        
        // Блокировка скролла на мобильных
        if (window.innerWidth <= 768) {
            document.body.classList.add('chat-open-mobile');
        }
        
        // Анимация кнопки
        aiToggle.style.transform = 'scale(0.8)';
        aiToggle.style.background = 'var(--psb-orange)';
        aiToggle.classList.remove('pulse');
        
        // Показываем чат
        aiChat.style.display = 'flex';
        
        // Запускаем анимацию появления
        clearTimeout(chatAnimationTimeout);
        chatAnimationTimeout = setTimeout(() => {
            aiChat.classList.add('active');
            
            // Фокус на input после анимации
            setTimeout(() => {
                aiInput.focus();
            }, 400);
        }, 50);
    }

    function closeChat() {
        if (!isChatOpen) return;
        
        isChatOpen = false;
        
        // Разблокировка скролла
        document.body.classList.remove('chat-open-mobile');
        
        // Анимация кнопки
        aiToggle.style.transform = 'scale(1)';
        aiToggle.style.background = 'var(--psb-blue)';
        aiToggle.classList.add('pulse');
        
        // Анимация закрытия чата
        aiChat.classList.remove('active');
        aiChat.classList.add('closing');
        
        // После анимации скрываем чат
        clearTimeout(chatAnimationTimeout);
        chatAnimationTimeout = setTimeout(() => {
            aiChat.classList.remove('closing');
            aiChat.style.display = 'none';
        }, 300);
    }

    aiSend.addEventListener('click', sendMessage);
    aiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
        const message = aiInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            aiInput.value = '';
            
            // Имитация ответа AI
            setTimeout(() => {
                const responses = [
                    "Отличный вопрос! На основе вашего прогресса я могу порекомендовать...",
                    "Я проанализировал ваши результаты и предлагаю...",
                    "Для улучшения навыков рекомендую обратить внимание на...",
                    "Судя по вашей активности, стоит поработать над...",
                    "Ваши успехи впечатляют! Продолжайте в том же духе!"
                ];
                addMessage(responses[Math.floor(Math.random() * responses.length)], 'bot');
            }, 1000 + Math.random() * 1000);
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        messageDiv.textContent = text;
        
        // Начальное состояние для анимации
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = sender === 'user' 
            ? 'translateX(20px) translateY(10px)' 
            : 'translateX(-20px) translateY(10px)';
        
        const messagesContainer = document.querySelector('.ai-messages');
        messagesContainer.appendChild(messageDiv);
        
        // Анимация появления сообщения
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateX(0) translateY(0)';
        });
        
        // Авто-скролл к новому сообщению
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

function initProgressAnimations() {
    // Анимация прогресс-баров навыков
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });

    // Анимация круговых прогресс-баров
    const progressCircles = document.querySelectorAll('.progress-circle-fill');
    progressCircles.forEach(circle => {
        let percent;
        
        if (circle.hasAttribute('data-percent')) {
            percent = parseFloat(circle.getAttribute('data-percent'));
        } else {
            const percentageText = circle.closest('.progress-ring').querySelector('.progress-percentage').textContent;
            percent = parseFloat(percentageText.replace('%', '')) || 0;
        }
        
        percent = Math.max(0, Math.min(100, percent));
        
        const circumference = 219.8;
        const offset = circumference - (percent / 100) * circumference;
        
        // Устанавливаем начальное значение
        circle.style.strokeDashoffset = circumference;
        
        // Анимируем заполнение
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 800);
    });

    // Анимация появления карточек
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
}

function initInteractiveElements() {
    // Обработка кнопки редактирования
    const editBtn = document.querySelector('.edit-btn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            showNotification('Режим редактирования активирован', 'success');
            // Здесь будет логика открытия модального окна редактирования
        });
    }

    // Обработка кнопки смены аватара
    const editAvatarBtn = document.querySelector('.edit-avatar-btn');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', function() {
            showNotification('Функция смены аватара скоро будет доступна', 'warning');
        });
    }

    // Анимация при наведении на элементы
    const interactiveElements = document.querySelectorAll('.achievement-item, .activity-item, .skill-item');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function loadUserData() {
    // Имитация загрузки данных пользователя
    setTimeout(() => {
        // Здесь будет реальная загрузка данных с сервера
        console.log('Данные пользователя загружены');
        
        // Анимация появления контента
        const contentElements = document.querySelectorAll('.profile-content > *');
        contentElements.forEach((element, index) => {
            element.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
        });
    }, 1000);
}

function showNotification(message, type = 'success') {
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        border-left: 4px solid ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--warning)'};
        z-index: 10000;
        animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s forwards;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
    `;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 
                type === 'error' ? 'fas fa-exclamation-circle' : 
                'fas fa-exclamation-triangle';
    
    notification.innerHTML = `
        <i class="${icon}" style="color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--warning)'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Удалить уведомление после анимации
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
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
    
    .chat-open-mobile {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
    }
    
    .ai-chat.closing {
        opacity: 0;
        transform: scale(0.8) translateY(20px);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
`;
document.head.appendChild(style);