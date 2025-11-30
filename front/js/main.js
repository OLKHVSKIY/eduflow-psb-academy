document.addEventListener('DOMContentLoaded', function() {
    // ===== LOAD USER PROFILE =====
    async function loadUserProfile() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // Если нет токена, перенаправляем на страницу входа
            window.location.href = '/html/login.html';
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
                window.location.href = '/html/login.html';
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
    
    // Загружаем активность при загрузке страницы
    loadActivities();

    // ===== LOAD ACTIVITIES =====
    async function loadActivities() {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch('/api/activities', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки активности');
            }

            const activities = await response.json();
            allActivities = activities; // Сохраняем все активности для фильтрации
            renderDynamicActivities(activities); // Используем новую функцию
        } catch (error) {
            console.error('Ошибка загрузки активности:', error);
        }
    }

    // НОВАЯ ФУНКЦИЯ: рендерит только динамические активности СВЕРХУ
    function renderDynamicActivities(activities) {
        const container = document.getElementById('feedContainer');
        if (!container) return;

        // Находим контейнер для динамических активностей
        let dynamicContainer = container.querySelector('.dynamic-activities-container');
        
        // Если контейнера для динамических активностей нет - создаем его
        if (!dynamicContainer) {
            dynamicContainer = document.createElement('div');
            dynamicContainer.className = 'dynamic-activities-container';
            
            // Вставляем ПЕРВЫМ элементом в контейнер (САМЫЙ ВЕРХ)
            container.prepend(dynamicContainer);
        }

        // Очищаем только динамический контейнер
        dynamicContainer.innerHTML = '';

        // Добавляем динамические активности СВЕРХУ
        if (activities.length > 0) {
            // Сортируем активности по дате (новые сверху)
            const sortedActivities = [...activities].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            dynamicContainer.innerHTML = sortedActivities.map((activity, index) => {
                const timeAgo = formatTimeAgo(activity.createdAt);
                const iconConfig = getActivityIcon(activity.type);
                
                return `
                    <div class="activity-item fade-in-up" style="animation-delay: ${0.1 * index}s" data-type="${activity.type}">
                        <div class="activity-main">
                            <div class="activity-icon" style="background: ${iconConfig.color}">
                                <i class="${iconConfig.icon}"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-header">
                                    <span class="activity-title">${activity.title}</span>
                                    <span class="activity-time">${timeAgo}</span>
                                </div>
                                <p class="activity-text">
                                    ${activity.description || ''}
                                </p>
                                ${activity.assignmentTitle ? `
                                    <div class="activity-meta">
                                        <span class="course-tag">#${activity.assignmentTitle}</span>
                                    </div>
                                ` : ''}
                                ${(() => {
                                    try {
                                        const metadata = typeof activity.metadata === 'string' 
                                            ? JSON.parse(activity.metadata) 
                                            : activity.metadata;
                                        if (metadata && metadata.files && metadata.files.length > 0) {
                                            return `
                                                <div class="activity-files">
                                                    ${metadata.files.map(file => {
                                                        const fileIcon = file.type === 'pdf' ? 'fa-file-pdf' : 
                                                                       file.type === 'doc' ? 'fa-file-word' : 
                                                                       'fa-file';
                                                        return `
                                                            <div class="activity-file-item">
                                                                <i class="fas ${fileIcon}"></i>
                                                                <span class="file-name">${file.name}</span>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            `;
                                        }
                                    } catch (e) {
                                        console.error('Ошибка парсинга metadata:', e);
                                    }
                                    return '';
                                })()}
                            </div>
                        </div>
                        ${activity.type === 'assignment' ? `
                            <div class="activity-badge success">
                                <i class="fas fa-check"></i> Отправлено
                            </div>
                        ` : `
                            <div class="activity-actions">
                                <button class="btn-outline">Открыть</button>
                            </div>
                        `}
                    </div>
                `;
            }).join('');
        } else {
            // Если нет динамических активностей, показываем сообщение
            dynamicContainer.innerHTML = `
                <div class="no-activities-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Нет новых активностей</p>
                </div>
            `;
        }
    }

    function getActivityIcon(type) {
        const icons = {
            'assignment': { icon: 'fas fa-check-circle', color: 'var(--psb-orange)' },
            'course': { icon: 'fas fa-file-alt', color: 'var(--psb-blue)' },
            'discussion': { icon: 'fas fa-comment', color: '#8b5cf6' }
        };
        return icons[type] || { icon: 'fas fa-circle', color: '#64748b' };
    }

    function formatTimeAgo(dateString) {
        // Парсим дату (может быть в формате SQLite или ISO)
        let date;
        if (dateString.includes('T')) {
            date = new Date(dateString);
        } else {
            // Формат SQLite: YYYY-MM-DD HH:MM:SS
            date = new Date(dateString.replace(' ', 'T') + '+03:00'); // Добавляем московский часовой пояс
        }
        
        // Получаем текущее московское время
        const now = new Date();
        const moscowNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
        const moscowDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
        
        const diffMs = moscowNow - moscowDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дня назад`;
        
        return moscowDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'Europe/Moscow' });
    }

    // ===== FILTER FUNCTIONALITY =====
    let allActivities = [];
    
    function initFilterFunctionality() {
        const filterButtons = document.querySelectorAll('.btn-filter');
        
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
        const container = document.getElementById('feedContainer');
        if (!container) return;

        const allItems = container.querySelectorAll('.activity-item');
        
        allItems.forEach(item => {
            const itemType = item.getAttribute('data-type');
            
            if (filter === 'all' || itemType === filter) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

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
                window.location.href = '/html/login.html';
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

    .no-activities-message {
        text-align: center;
        padding: 40px 20px;
        color: var(--psb-gray);
    }

    .no-activities-message i {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
    }

    .no-activities-message p {
        margin-bottom: 8px;
        font-weight: 500;
    }

    .dynamic-activities-container {
        display: contents; /* Сохраняет gap от родительского контейнера */
        order: -1; /* Обеспечивает, что динамические будут выше статических */
    }

    .feed-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
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