// ===== PROFILE PAGE FUNCTIONALITY =====
// Защита от множественного выполнения
if (typeof window.profilePageInitialized === 'undefined') {
    window.profilePageInitialized = false;
}

if (!window.profilePageInitialized) {
    window.profilePageInitialized = true;
    
    console.log('🚀 Загрузка скрипта профиля');

    // Добавляем CSS анимации сразу
    const style = document.createElement('style');
    style.id = 'profile-styles';
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
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .chat-open-mobile {
            overflow: hidden;
        }
        
        .ai-chat.closing {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
        }
        
        .progress-ring {
            position: relative;
            width: 80px;
            height: 80px;
        }
        
        .progress-circle {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
        }
        
        .progress-circle-bg {
            fill: none;
            stroke: #e2e8f0;
            stroke-width: 4;
        }
        
        .progress-circle-fill {
            fill: none;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-dasharray: 219.8;
            stroke-dashoffset: 219.8;
            transition: stroke-dashoffset 1s ease-in-out;
        }
        
        .progress-circle-fill.excellent {
            stroke: #0033A0;
        }
        
        .progress-percentage {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
            font-weight: 700;
            color: #0033A0;
        }
    `;
    document.head.appendChild(style);

    // Ждем полной загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfilePage);
    } else {
        // DOM уже загружен
        setTimeout(initProfilePage, 0);
    }

    function initProfilePage() {
        console.log('🎯 Инициализация страницы профиля (один раз)');
        
        // Запускаем все анимации сразу
        initProgressAnimations();
        initInteractiveElements();
        
        // Если есть AI чат, инициализируем его
        if (document.querySelector('.ai-chat')) {
            initAIAssistant();
        }
    }

    function initAIAssistant() {
        console.log('🤖 Инициализация AI ассистента');
        const aiToggle = document.querySelector('.ai-toggle');
        const aiChat = document.querySelector('.ai-chat');
        const aiClose = document.querySelector('.ai-close');
        const aiInput = document.querySelector('.ai-input input');
        const aiSend = document.querySelector('.ai-input button');

        if (!aiChat) return;

        let isChatOpen = false;

        if (aiToggle) aiToggle.addEventListener('click', toggleChat);
        if (aiClose) aiClose.addEventListener('click', closeChat);

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
            aiChat.style.display = 'flex';
            setTimeout(() => aiChat.classList.add('active'), 50);
            setTimeout(() => aiInput?.focus(), 400);
        }

        function closeChat() {
            if (!isChatOpen) return;
            isChatOpen = false;
            aiChat.classList.remove('active');
            aiChat.classList.add('closing');
            setTimeout(() => {
                aiChat.classList.remove('closing');
                aiChat.style.display = 'none';
            }, 300);
        }

        if (aiSend) aiSend.addEventListener('click', sendMessage);
        if (aiInput) {
            aiInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') sendMessage();
            });
        }

        function sendMessage() {
            const message = aiInput?.value.trim();
            if (message) {
                addMessage(message, 'user');
                aiInput.value = '';
                setTimeout(() => {
                    const responses = [
                        "Отличный вопрос! На основе вашего прогресса я могу порекомендовать...",
                        "Я проанализировал ваши результаты и предлагаю...",
                        "Для улучшения навыков рекомендую обратить внимание на...",
                        "Судя по вашей активности, стоит поработать над...",
                        "Ваши успехи впечатляют! Продолжайте в том же духе!"
                    ];
                    addMessage(responses[Math.floor(Math.random() * responses.length)], 'bot');
                }, 1000);
            }
        }

        function addMessage(text, sender) {
            const messagesContainer = document.querySelector('.ai-messages');
            if (!messagesContainer) return;
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `ai-message ${sender}`;
            messageDiv.textContent = text;
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = sender === 'user' ? 'translateX(20px)' : 'translateX(-20px)';
            
            messagesContainer.appendChild(messageDiv);
            
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'all 0.4s ease';
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateX(0)';
            });
            
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    function initProgressAnimations() {
        console.log('📊 Инициализация анимаций прогресса (один раз)');
        
        // Анимация линейных прогресс-баров
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        });

        // Анимация круговых прогресс-баров
        animateProgressCircles();
    }

    function animateProgressCircles() {
        const progressCircles = document.querySelectorAll('.progress-circle-fill');
        
        if (progressCircles.length === 0) {
            console.log('❌ Круги прогресса не найдены');
            return;
        }
        
        console.log(`🎯 Анимация ${progressCircles.length} кругов прогресса`);
        
        progressCircles.forEach((circle, index) => {
            const percent = parseFloat(circle.getAttribute('data-percent')) || 0;
            const validPercent = Math.max(0, Math.min(100, percent));
            
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (validPercent / 100) * circumference;
            
            // Устанавливаем начальные значения
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = `${circumference}`;
            
            // Анимируем с задержкой
            setTimeout(() => {
                circle.style.strokeDashoffset = `${offset}`;
                console.log(`✅ Круг ${index + 1} заполнен на ${validPercent}%`);
            }, 300 + index * 100);
        });
    }

    function initInteractiveElements() {
        console.log('🔄 Инициализация интерактивных элементов');
        
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                showNotification('Режим редактирования активирован', 'success');
            });
        }

        const editAvatarBtn = document.querySelector('.edit-avatar-btn');
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => {
                showNotification('Функция смены аватара скоро будет доступна', 'warning');
            });
        }

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

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#F59E0B';
        const icon = type === 'success' ? 'fas fa-check-circle' : 
                    type === 'error' ? 'fas fa-exclamation-circle' : 
                    'fas fa-exclamation-triangle';
        
        notification.innerHTML = `
            <i class="${icon}" style="color: ${bgColor}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border-left: 4px solid ${bgColor};
            z-index: 10000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s forwards;
            display: flex;
            align-items: center;
            gap: 12px;
            max-width: 350px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    console.log('Скрипт профиля готов к работе');
} else {
    console.log('Скрипт профиля уже был инициализирован, пропускаем');
}