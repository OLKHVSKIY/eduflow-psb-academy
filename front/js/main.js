document.addEventListener('DOMContentLoaded', function() {
    // ===== LOAD USER PROFILE =====
    async function loadUserProfile() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Если нет токена, перенаправляем на страницу входа
            window.location.href = '/front/html/login.html';
            return;
        }

        try {
            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                // Токен недействителен
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                window.location.href = '/front/html/login.html';
                return;
            }

            if (!response.ok) {
                throw new Error('Ошибка загрузки профиля');
            }

            const profile = await response.json();
            updateUserInfo(profile);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            // Не перенаправляем, просто показываем дефолтные данные
        }
    }

    function updateUserInfo(profile) {
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Пользователь';
        
        // Обновляем имя в header
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = fullName;
        }

        // Обновляем данные в dropdown меню
        const userFullnameElement = document.querySelector('.user-fullname');
        if (userFullnameElement) {
            userFullnameElement.textContent = fullName;
        }

        const userEmailElement = document.querySelector('.user-email');
        if (userEmailElement) {
            userEmailElement.textContent = profile.email || '';
        }
    }

    // Загружаем профиль при загрузке страницы
    loadUserProfile();

    // ===== USER DROPDOWN MENU =====
    function initUserDropdown() {
        const userProfile = document.getElementById('userProfile');
        if (!userProfile) {
            console.log('User profile element not found');
            return;
        }
        
        let isOpen = false;
        let closeTimeout;

        console.log('Initializing user dropdown...');

        // Открытие/закрытие по клику
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDropdown();
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', function(e) {
            if (isOpen && !userProfile.contains(e.target)) {
                closeDropdown();
            }
        });

        // Закрытие при нажатии Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeDropdown();
            }
        });

        function toggleDropdown() {
            if (isOpen) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            console.log('Opening dropdown');
            isOpen = true;
            userProfile.classList.add('active');
            clearTimeout(closeTimeout);
        }

        function closeDropdown() {
            console.log('Closing dropdown');
            isOpen = false;
            userProfile.classList.remove('active');
            
            // Плавное закрытие анимации
            const dropdownMenu = userProfile.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.style.animation = 'none';
                setTimeout(() => {
                    dropdownMenu.style.animation = '';
                }, 10);
            }
        }

        // Обработка пунктов меню
        const dropdownItems = userProfile.querySelectorAll('.dropdown-item');
        dropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                if (this.classList.contains('logout')) {
                    e.preventDefault();
                    handleLogout();
                }
                closeDropdown();
            });
        });

        function handleLogout() {
            // Анимация выхода
            showNotification('Выход из системы...', 'warning');
            
            // Очищаем токен и данные пользователя
            localStorage.removeItem('authToken');
            localStorage.removeItem('userId');
            
            setTimeout(() => {
                window.location.href = '/front/html/login.html';
            }, 1000);
        }

        console.log('User dropdown initialized successfully');
    }

    // Функция показа уведомлений
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification-global ${type}`;
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
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ===== IMPROVED AI ASSISTANT =====
    const aiToggle = document.querySelector('.ai-toggle');
    const aiChat = document.querySelector('.ai-chat');
    const aiClose = document.querySelector('.ai-close');
    const aiInput = document.querySelector('.ai-input input');
    const aiSend = document.querySelector('.ai-input button');

    let isChatOpen = false;
    let chatAnimationTimeout;

    // Инициализация AI ассистента
    function initAIAssistant() {
        if (!aiToggle || !aiChat) {
            console.log('AI assistant elements not found');
            return;
        }

        aiToggle.addEventListener('click', toggleChat);
        aiClose.addEventListener('click', closeChat);

        // Закрытие чата при клике вне его
        document.addEventListener('click', function(e) {
            if (isChatOpen && !aiChat.contains(e.target) && !aiToggle.contains(e.target)) {
                closeChat();
            }
        });

        // Обработчики отправки сообщений
        aiSend.addEventListener('click', sendMessage);
        aiInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });

        // Адаптация под мобильные устройства
        updateChatPosition();
        window.addEventListener('resize', updateChatPosition);
    }

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
                    "Ваши успехи впечатляют! Продолжайте в том же духе и обратите внимание на..."
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

    function updateChatPosition() {
        if (window.innerWidth <= 768) {
            // Для мобильных - адаптивное позиционирование
            aiChat.style.left = '20px';
            aiChat.style.right = '20px';
            aiChat.style.margin = '0 auto';
        } else {
            // Для десктопа - фиксированная позиция
            aiChat.style.left = 'auto';
            aiChat.style.right = '0';
            aiChat.style.margin = '0';
        }
    }

    // ===== FILTER FUNCTIONALITY =====
    const filterButtons = document.querySelectorAll('.btn-filter');
    const activityItems = document.querySelectorAll('.activity-item');
    
    function initFilterFunctionality() {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Обновляем активную кнопку
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Фильтруем элементы
                filterActivityItems(filter);
            });
        });
    }
    
    function filterActivityItems(filter) {
        console.log('Filtering by:', filter);
        
        // Устанавливаем transition для всех элементов
        activityItems.forEach(item => {
            item.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            item.style.willChange = 'transform, opacity';
        });
        
        activityItems.forEach((item, index) => {
            const itemType = item.getAttribute('data-type');
            const matches = filter === 'all' || itemType === filter;
            
            // Убираем CSS анимации
            item.classList.remove('fade-in-up');
            item.style.animation = 'none';
            
            if (matches) {
                // Показываем элемент с задержкой
                setTimeout(() => {
                    item.classList.remove('hidden');
                    item.style.display = 'block';
                    
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0) scale(1)';
                    }, 20);
                    
                }, index * 80);
                
            } else {
                // Плавное скрытие
                item.style.opacity = '0';
                item.style.transform = 'translateY(-15px) scale(0.95)';
                
                setTimeout(() => {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }, 500);
            }
        });
        
        // Чистим will-change после анимации
        setTimeout(() => {
            activityItems.forEach(item => {
                item.style.willChange = 'auto';
            });
        }, 800);
    }

    // ===== PROGRESS ANIMATIONS =====
    function initProgressAnimations() {
        // Линейные прогресс-бары
        const progressElements = document.querySelectorAll('.progress-fill, .level-fill');
        progressElements.forEach(el => {
            const width = el.style.width;
            el.style.width = '0%';
            setTimeout(() => {
                el.style.width = width;
            }, 500);
        });

        // Круговые прогресс-бары
        const progressCircles = document.querySelectorAll('.progress-circle-fill');
        progressCircles.forEach(circle => {
            let percent;
            
            // Получаем процент из data-атрибута или текста
            if (circle.hasAttribute('data-percent')) {
                percent = parseFloat(circle.getAttribute('data-percent'));
            } else {
                const percentageText = circle.closest('.progress-ring').querySelector('.progress-percentage').textContent;
                percent = parseFloat(percentageText.replace('%', '')) || 0;
            }
            
            // Ограничиваем процент от 0 до 100
            percent = Math.max(0, Math.min(100, percent));
            
            const circumference = 219.8; // 2 * π * 35
            const offset = circumference - (percent / 100) * circumference;
            
            // Устанавливаем начальное значение
            circle.style.strokeDashoffset = circumference;
            
            // Анимируем заполнение
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
                
                // Добавляем класс цвета в зависимости от процента
                if (percent >= 90) {
                    circle.classList.add('excellent');
                } else if (percent >= 70) {
                    circle.classList.add('good');
                } else if (percent >= 50) {
                    circle.classList.add('average');
                } else {
                    circle.classList.add('poor');
                }
            }, 500);
        });
    }

    // ===== MICRO-INTERACTIONS =====
    function initMicroInteractions() {
        const cards = document.querySelectorAll('.stat-card, .recommendation-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }

    // ===== INITIALIZATION =====
    function init() {
        console.log('Initializing PSB Learning Platform...');
        
        initUserDropdown();
        initAIAssistant();
        initFilterFunctionality();
        initProgressAnimations();
        initMicroInteractions();
        
        console.log('PSB Learning Platform initialized successfully');
    }

    // Запуск инициализации
    init();
});

// Добавьте эти анимации в CSS
const dropdownStyles = document.createElement('style');
dropdownStyles.textContent = `
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
`;

// Обработчик клика на блок "Мои уроки"
document.addEventListener('DOMContentLoaded', function() {
    const myCoursesCard = document.querySelector('.stat-card:first-child');
    if (myCoursesCard) {
        myCoursesCard.style.cursor = 'pointer';
        myCoursesCard.addEventListener('click', function() {
            window.location.href = 'courses.html';
        });
        
        // Добавляем индикатор кликабельности
        myCoursesCard.querySelectorAll('.course-item').forEach(item => {
            item.style.cursor = 'pointer';
        });
    }
});

// Обработчик клика на блок "Задания"
document.addEventListener('DOMContentLoaded', function() {
    const assignmentsCard = document.querySelector('.stat-card:nth-child(2)');
    if (assignmentsCard) {
        assignmentsCard.style.cursor = 'pointer';
        assignmentsCard.addEventListener('click', function() {
            window.location.href = 'assignments.html';
        });
        
        // Обновляем счетчик выполненных заданий на главной
        const updateAssignmentsCount = () => {
            const savedTasks = localStorage.getItem('completedTasks');
            if (savedTasks) {
                const completedCount = JSON.parse(savedTasks).length;
                const completedBadge = assignmentsCard.querySelector('.badge.completed');
                if (completedBadge) {
                    completedBadge.textContent = `${completedCount} завершено`;
                }
            }
        };
        
        updateAssignmentsCount();
    }
});

document.head.appendChild(dropdownStyles);