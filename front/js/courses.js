// courses.js - Инновационная платформа обучения
class CoursesManager {
    constructor() {
        this.subjects = [];
        this.filteredSubjects = [];
        this.currentFilter = 'all';
        this.currentSort = 'name';
        this.searchQuery = '';
        
        this.initializeCourses();
        this.initializeEventListeners();
        this.applyFilters(); // Добавляем этот вызов!
        this.renderSubjects();
    }

    initializeEventListeners() {
        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Фильтры
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilters();
            });
        });

        // Сортировка
        document.querySelectorAll('.filter-btn[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-sort]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSort = e.target.dataset.sort;
                this.applyFilters();
            });
        });

        // Устанавливаем активное состояние кнопки "Все уроки" при загрузке
        this.setInitialActiveStates();
    }

    setInitialActiveStates() {
        // Устанавливаем активное состояние для кнопки "Все уроки"
        const allLessonsBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (allLessonsBtn) {
            allLessonsBtn.classList.add('active');
        }

        // Устанавливаем активное состояние для сортировки по названию
        const sortByNameBtn = document.querySelector('.filter-btn[data-sort="name"]');
        if (sortByNameBtn) {
            sortByNameBtn.classList.add('active');
        }
    }

    // Остальные методы остаются без изменений...
    applyFilters() {
        this.filteredSubjects = this.subjects.map(subject => {
            const filteredLessons = subject.lessons.filter(lesson => {
                // Поиск
                const matchesSearch = this.searchQuery === '' || 
                    lesson.title.toLowerCase().includes(this.searchQuery) ||
                    lesson.description.toLowerCase().includes(this.searchQuery) ||
                    lesson.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));

                // Фильтр по статусу
                let matchesFilter = true;
                if (this.currentFilter === 'completed') {
                    matchesFilter = lesson.status === 'completed';
                } else if (this.currentFilter === 'in-progress') {
                    matchesFilter = lesson.status === 'in-progress';
                } else if (this.currentFilter === 'new') {
                    matchesFilter = lesson.status === 'new';
                }

                return matchesSearch && matchesFilter;
            });

            return {
                ...subject,
                lessons: this.sortLessons(filteredLessons)
            };
        }).filter(subject => subject.lessons.length > 0);

        this.renderSubjects();
    }

    initializeCourses() {
        // База данных предметов и уроков
        this.subjects = [
            {
                id: 1,
                name: "Математика",
                description: "Фундаментальная математика для банковской сферы",
                icon: "fas fa-calculator",
                color: "#0033A0",
                totalLessons: 12,
                completedLessons: 8,
                lessons: [
                    {
                        id: 101,
                        title: "Финансовая математика: основы",
                        description: "Изучение процентных ставок, сложных процентов и дисконтирования",
                        duration: "45 мин",
                        progress: 100,
                        status: "completed",
                        difficulty: "beginner",
                        tags: ["финансы", "проценты", "расчеты"],
                        lastAccessed: "2024-12-10"
                    },
                    {
                        id: 102,
                        title: "Статистический анализ данных",
                        description: "Методы анализа финансовых данных и построение прогнозов",
                        duration: "60 мин",
                        progress: 75,
                        status: "in-progress",
                        difficulty: "intermediate",
                        tags: ["статистика", "анализ", "данные"],
                        lastAccessed: "2024-12-15"
                    },
                    {
                        id: 103,
                        title: "Линейная алгебра в финансах",
                        description: "Применение матриц и векторов в финансовых моделях",
                        duration: "90 мин",
                        progress: 0,
                        status: "new",
                        difficulty: "advanced",
                        tags: ["алгебра", "матрицы", "модели"],
                        lastAccessed: null
                    },
                    {
                        id: 104,
                        title: "Оптимизация портфеля",
                        description: "Математические методы оптимизации инвестиционного портфеля",
                        duration: "75 мин",
                        progress: 0,
                        status: "new",
                        difficulty: "advanced",
                        tags: ["оптимизация", "портфель", "инвестиции"],
                        lastAccessed: null
                    }
                ]
            },
            {
                id: 2,
                name: "Физика",
                description: "Прикладная физика для финансовых технологий",
                icon: "fas fa-atom",
                color: "#FF6B35",
                totalLessons: 8,
                completedLessons: 3,
                lessons: [
                    {
                        id: 201,
                        title: "Физические основы вычислений",
                        description: "Как физические законы влияют на вычислительные системы",
                        duration: "50 мин",
                        progress: 100,
                        status: "completed",
                        difficulty: "beginner",
                        tags: ["вычисления", "системы", "основы"],
                        lastAccessed: "2024-12-08"
                    },
                    {
                        id: 202,
                        title: "Квантовые вычисления в финансах",
                        description: "Перспективы квантовых компьютеров в финансовом моделировании",
                        duration: "80 мин",
                        progress: 40,
                        status: "in-progress",
                        difficulty: "advanced",
                        tags: ["кванты", "вычисления", "модели"],
                        lastAccessed: "2024-12-14"
                    },
                    {
                        id: 203,
                        title: "Термодинамика сложных систем",
                        description: "Применение законов термодинамики к финансовым рынкам",
                        duration: "65 мин",
                        progress: 0,
                        status: "new",
                        difficulty: "intermediate",
                        tags: ["термодинамика", "системы", "рынки"],
                        lastAccessed: null
                    }
                ]
            },
            {
                id: 3,
                name: "Программирование",
                description: "Современные технологии программирования для банков",
                icon: "fas fa-code",
                color: "#10B981",
                totalLessons: 15,
                completedLessons: 6,
                lessons: [
                    {
                        id: 301,
                        title: "Python для финансовых аналитиков",
                        description: "Основы Python для анализа финансовых данных",
                        duration: "90 мин",
                        progress: 100,
                        status: "completed",
                        difficulty: "beginner",
                        tags: ["python", "анализ", "данные"],
                        lastAccessed: "2024-12-05"
                    },
                    {
                        id: 302,
                        title: "SQL и базы данных в банкинге",
                        description: "Работа с финансовыми базами данных и SQL-запросы",
                        duration: "120 мин",
                        progress: 100,
                        status: "completed",
                        difficulty: "intermediate",
                        tags: ["sql", "базы данных", "запросы"],
                        lastAccessed: "2024-12-09"
                    },
                    {
                        id: 303,
                        title: "Блокчейн и смарт-контракты",
                        description: "Технология блокчейн и её применение в банковской сфере",
                        duration: "95 мин",
                        progress: 60,
                        status: "in-progress",
                        difficulty: "advanced",
                        tags: ["блокчейн", "контракты", "технологии"],
                        lastAccessed: "2024-12-13"
                    },
                    {
                        id: 304,
                        title: "Машинное обучение для кредитного скоринга",
                        description: "Применение ML алгоритмов для оценки кредитоспособности",
                        duration: "110 мин",
                        progress: 0,
                        status: "new",
                        difficulty: "advanced",
                        tags: ["ml", "скоринг", "кредиты"],
                        lastAccessed: null
                    }
                ]
            },
            {
                id: 4,
                name: "Экономика",
                description: "Микро и макроэкономика для финансовых специалистов",
                icon: "fas fa-chart-line",
                color: "#8B5CF6",
                totalLessons: 10,
                completedLessons: 4,
                lessons: [
                    {
                        id: 401,
                        title: "Основы микроэкономики",
                        description: "Теория спроса и предложения, рыночное равновесие",
                        duration: "55 мин",
                        progress: 100,
                        status: "completed",
                        difficulty: "beginner",
                        tags: ["микроэкономика", "рынок", "равновесие"],
                        lastAccessed: "2024-12-07"
                    },
                    {
                        id: 402,
                        title: "Макроэкономические показатели",
                        description: "ВВП, инфляция, безработица и их влияние на банки",
                        duration: "70 мин",
                        progress: 80,
                        status: "in-progress",
                        difficulty: "intermediate",
                        tags: ["макроэкономика", "показатели", "анализ"],
                        lastAccessed: "2024-12-12"
                    },
                    {
                        id: 403,
                        title: "Международная экономика",
                        description: "Валютные курсы, торговые балансы и глобальные рынки",
                        duration: "85 мин",
                        progress: 0,
                        status: "new",
                        difficulty: "advanced",
                        tags: ["международная", "валюты", "рынки"],
                        lastAccessed: null
                    }
                ]
            }
        ];
    }

    initializeEventListeners() {
        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Фильтры
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilters();
            });
        });

        // Сортировка
        document.querySelectorAll('.filter-btn[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-sort]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSort = e.target.dataset.sort;
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        this.filteredSubjects = this.subjects.map(subject => {
            const filteredLessons = subject.lessons.filter(lesson => {
                // Поиск
                const matchesSearch = this.searchQuery === '' || 
                    lesson.title.toLowerCase().includes(this.searchQuery) ||
                    lesson.description.toLowerCase().includes(this.searchQuery) ||
                    lesson.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));

                // Фильтр по статусу
                let matchesFilter = true;
                if (this.currentFilter === 'completed') {
                    matchesFilter = lesson.status === 'completed';
                } else if (this.currentFilter === 'in-progress') {
                    matchesFilter = lesson.status === 'in-progress';
                } else if (this.currentFilter === 'new') {
                    matchesFilter = lesson.status === 'new';
                }

                return matchesSearch && matchesFilter;
            });

            return {
                ...subject,
                lessons: this.sortLessons(filteredLessons)
            };
        }).filter(subject => subject.lessons.length > 0);

        this.renderSubjects();
    }

    sortLessons(lessons) {
        return lessons.sort((a, b) => {
            switch (this.currentSort) {
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'progress':
                    return b.progress - a.progress;
                case 'duration':
                    return this.parseDuration(b.duration) - this.parseDuration(a.duration);
                default:
                    return 0;
            }
        });
    }

    parseDuration(duration) {
        const match = duration.match(/(\d+)\s*мин/);
        return match ? parseInt(match[1]) : 0;
    }

    renderSubjects() {
        const container = document.getElementById('subjectsContainer');
        
        if (this.filteredSubjects.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>Уроки не найдены</h3>
                    <p>Попробуйте изменить параметры поиска или фильтры</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredSubjects.map(subject => `
            <div class="subject-section">
                <div class="subject-header">
                    <div class="subject-title">
                        <div class="subject-icon" style="background: ${subject.color}">
                            <i class="${subject.icon}"></i>
                        </div>
                        <div class="subject-info">
                            <h2>${subject.name}</h2>
                            <p>${subject.description}</p>
                        </div>
                    </div>
                    <div class="subject-stats">
                        <div class="stat">
                            <div class="stat-value">${subject.completedLessons}/${subject.totalLessons}</div>
                            <div class="stat-label">Уроков завершено</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${Math.round((subject.completedLessons / subject.totalLessons) * 100)}%</div>
                            <div class="stat-label">Общий прогресс</div>
                        </div>
                    </div>
                </div>

                <div class="lessons-grid">
                    ${subject.lessons.map(lesson => `
                        <div class="lesson-card ${lesson.status}" onclick="coursesManager.openLesson(${lesson.id})">
                            <div class="lesson-header">
                                <div class="lesson-title">
                                    <h3>${lesson.title}</h3>
                                    <div class="lesson-meta">
                                        <span class="lesson-duration">
                                            <i class="fas fa-clock"></i> ${lesson.duration}
                                        </span>
                                        <span class="difficulty">${this.getDifficultyText(lesson.difficulty)}</span>
                                    </div>
                                </div>
                                <div class="lesson-badge ${this.getBadgeClass(lesson.status)}">
                                    ${this.getStatusText(lesson.status)}
                                </div>
                            </div>
                            
                            <p class="lesson-description">${lesson.description}</p>
                            
                            ${lesson.progress > 0 ? `
                                <div class="lesson-progress">
                                    <div class="progress-info">
                                        <span>Прогресс:</span>
                                        <span>${lesson.progress}%</span>
                                    </div>
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${lesson.progress}%"></div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="lesson-actions">
                                ${this.getActionButton(lesson)}
                                <button class="btn-lesson btn-review" onclick="event.stopPropagation(); coursesManager.showLessonDetails(${lesson.id})">
                                    Подробнее
                                </button>
                            </div>

                            ${this.shouldShowAIRecommendation(lesson) ? this.getAIRecommendation(lesson) : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    getDifficultyText(difficulty) {
        const difficulties = {
            'beginner': 'Начальный',
            'intermediate': 'Средний',
            'advanced': 'Продвинутый'
        };
        return difficulties[difficulty] || difficulty;
    }

    getStatusText(status) {
        const statuses = {
            'completed': 'Завершён',
            'in-progress': 'В процессе',
            'new': 'Новый'
        };
        return statuses[status] || status;
    }

    getBadgeClass(status) {
        const classes = {
            'completed': 'badge-completed',
            'in-progress': 'badge-progress',
            'new': 'badge-new'
        };
        return classes[status] || '';
    }

    getActionButton(lesson) {
        if (lesson.status === 'completed') {
            return `<button class="btn-lesson btn-review" onclick="event.stopPropagation(); coursesManager.restartLesson(${lesson.id})">
                Повторить
            </button>`;
        } else if (lesson.status === 'in-progress') {
            return `<button class="btn-lesson btn-continue" onclick="event.stopPropagation(); coursesManager.continueLesson(${lesson.id})">
                Продолжить
            </button>`;
        } else {
            return `<button class="btn-lesson btn-start" onclick="event.stopPropagation(); coursesManager.startLesson(${lesson.id})">
                Начать
            </button>`;
        }
    }

    shouldShowAIRecommendation(lesson) {
        // AI рекомендует уроки которые подходят пользователю
        return lesson.status === 'new' && 
               (lesson.difficulty === 'beginner' || 
                Math.random() > 0.7); // Случайные рекомендации для разнообразия
    }

    getAIRecommendation(lesson) {
        const recommendations = [
            "AI рекомендует: Этот урок идеально подходит для вашего текущего уровня",
            "AI советует: Начните с этого урока чтобы укрепить базовые знания",
            "AI рекомендует: Отличный выбор для развития ключевых навыков",
            "AI предлагает: Этот урок дополняет ваши предыдущие достижения"
        ];
        
        const randomRec = recommendations[Math.floor(Math.random() * recommendations.length)];
        
        return `
            <div class="ai-recommendation">
                <h4><i class="fas fa-robot"></i> Рекомендация AI</h4>
                <p>${randomRec}</p>
            </div>
        `;
    }

    // Методы для работы с уроками
    openLesson(lessonId) {
        console.log('Открытие урока:', lessonId);
        // Здесь будет логика открытия урока
        this.showNotification(`Открываем урок #${lessonId}`, 'success');
    }

    startLesson(lessonId) {
        console.log('Запуск урока:', lessonId);
        this.showNotification(`Начинаем урок #${lessonId}`, 'success');
    }

    continueLesson(lessonId) {
        console.log('Продолжение урока:', lessonId);
        this.showNotification(`Продолжаем урок #${lessonId}`, 'info');
    }

    restartLesson(lessonId) {
        console.log('Перезапуск урока:', lessonId);
        this.showNotification(`Повторяем урок #${lessonId}`, 'warning');
    }

    showLessonDetails(lessonId) {
        console.log('Детали урока:', lessonId);
        this.showNotification(`Показываем детали урока #${lessonId}`, 'info');
    }

    showNotification(message, type = 'info') {
        // Простая система уведомлений
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация при загрузке страницы
let coursesManager;

document.addEventListener('DOMContentLoaded', function() {
    coursesManager = new CoursesManager();
    
    // Добавляем обработчик для кнопки "Мои уроки" на главной странице
    const myCoursesBtn = document.querySelector('.stat-card:first-child');
    if (myCoursesBtn) {
        myCoursesBtn.style.cursor = 'pointer';
        myCoursesBtn.addEventListener('click', function() {
            window.location.href = 'courses.html';
        });
    }
});