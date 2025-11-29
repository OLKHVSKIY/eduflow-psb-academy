// journal.js - Student Journal System
class StudentJournal {
    constructor() {
        this.subjects = [];
        this.grades = [];
        this.currentView = 'detailed';
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.currentStudent = {
            id: 1,
            name: "Иван Иванов",
            group: "П-21",
            course: 2
        };
        
        this.initializeData();
        this.initializeEventListeners();
        this.renderSubjects();
        this.renderCalendar();
        this.initializeAIAssistant();
        this.animateCharts();
    }

    initializeData() {
        // Данные предметов с детальными оценками
        this.subjects = [
            {
                id: 1,
                name: "Математика",
                icon: "fas fa-calculator",
                teacher: "Анна Петрова",
                color: "#0033A0",
                averageGrade: 8.5,
                trend: "up",
                grades: [
                    { date: "2025-11-15", type: "Контрольная работа", topic: "Дифференциальные уравнения", grade: 9.2, comment: "Отлично! Лучший результат в группе" },
                    { date: "2025-11-08", type: "Домашнее задание", topic: "Интегралы", grade: 8.0, comment: "Хорошо, но есть ошибки в вычислениях" },
                    { date: "2025-11-02", type: "Тест", topic: "Производные", grade: 8.5, comment: "Стабильный результат" },
                    { date: "2025-10-20", type: "Проект", topic: "Математический анализ", grade: 9.0, comment: "Отличная работа над проектом" },
                    { date: "2025-10-12", type: "Контрольная работа", topic: "Пределы", grade: 7.8, comment: "Нужно повторить теорию пределов" }
                ]
            },
            {
                id: 2,
                name: "Информатика",
                icon: "fas fa-code",
                teacher: "Михаил Козлов",
                color: "#FF6B35",
                averageGrade: 9.5,
                trend: "up",
                grades: [
                    { date: "2025-11-10", type: "Проект", topic: "Веб-приложение", grade: 9.8, comment: "Прекрасная работа! Код хорошо структурирован" },
                    { date: "2025-11-03", type: "Лабораторная работа", topic: "Алгоритмы сортировки", grade: 9.5, comment: "Отличная реализация алгоритмов" },
                    { date: "2025-10-18", type: "Тест", topic: "Структуры данных", grade: 9.2, comment: "Хорошее понимание темы" },
                    { date: "2025-10-05", type: "Домашнее задание", topic: "ООП", grade: 9.0, comment: "Правильное применение принципов ООП" }
                ]
            },
            {
                id: 3,
                name: "Экономика",
                icon: "fas fa-chart-line",
                teacher: "Елена Смирнова",
                color: "#10B981",
                averageGrade: 6.5,
                trend: "down",
                grades: [
                    { date: "2025-11-12", type: "Домашнее задание", topic: "Спрос и предложение", grade: 6.8, comment: "Нужно повторить теорию спроса и предложения" },
                    { date: "2025-11-05", type: "Контрольная работа", topic: "Рыночное равновесие", grade: 6.0, comment: "Сложности с графическим анализом" },
                    { date: "2025-10-15", type: "Тест", topic: "Основы микроэкономики", grade: 7.2, comment: "Средний результат, есть над чем работать" },
                    { date: "2025-10-01", type: "Эссе", topic: "Экономические системы", grade: 6.0, comment: "Недостаточно глубокий анализ" }
                ]
            },
            {
                id: 4,
                name: "Физика",
                icon: "fas fa-atom",
                teacher: "Дмитрий Иванов",
                color: "#8B5CF6",
                averageGrade: 7.8,
                trend: "stable",
                grades: [
                    { date: "2025-11-08", type: "Лабораторная работа", topic: "Законы Ньютона", grade: 8.0, comment: "Хорошо, но есть ошибки в расчетах" },
                    { date: "2025-10-22", type: "Контрольная работа", topic: "Кинематика", grade: 7.5, comment: "Нужно уделить внимание векторному анализу" },
                    { date: "2025-10-08", type: "Домашнее задание", topic: "Динамика", grade: 8.5, comment: "Отличное решение задач" },
                    { date: "2025-09-25", type: "Тест", topic: "Механика", grade: 7.2, comment: "Стабильный результат" }
                ]
            }
        ];

        // Собираем все оценки для календаря
        this.allGrades = this.subjects.flatMap(subject => 
            subject.grades.map(grade => ({
                ...grade,
                subject: subject.name,
                subjectId: subject.id
            }))
        );
    }

    initializeEventListeners() {
        // Переключение вида
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.dataset.view;
                this.renderSubjects();
            });
        });

        // Период аналитики
        document.getElementById('analyticsPeriod').addEventListener('change', (e) => {
            this.updateAnalytics(e.target.value);
        });

        // Все оценки модалка
        document.getElementById('allGradesClose').addEventListener('click', () => {
            document.getElementById('allGradesModal').classList.remove('active');
        });
        
        document.getElementById('allGradesModal').addEventListener('click', (e) => {
            if (e.target.id === 'allGradesModal') {
                document.getElementById('allGradesModal').classList.remove('active');
            }
        });

        // Показать все оценки
        document.getElementById('showAllGrades').addEventListener('click', () => {
            this.showAllGrades();
        });

        // Модальное окно предмета
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('subjectModal').addEventListener('click', (e) => {
            if (e.target.id === 'subjectModal') {
                this.closeModal();
            }
        });

        // Навигация календаря
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.navigateCalendar(true);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.navigateCalendar(false);
        });

        // Закрытие popup при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.calendar-day') && !e.target.closest('.day-grades-popup')) {
                this.hideDayPopup();
            }
        });
    }

    renderSubjects() {
        const container = document.getElementById('subjectsContainer');
        
        if (this.currentView === 'detailed') {
            container.innerHTML = this.subjects.map(subject => `
                <div class="subject-card" onclick="studentJournal.showSubjectDetails(${subject.id})">
                    <div class="subject-header">
                        <div class="subject-icon ${subject.name.toLowerCase()}">
                            <i class="${subject.icon}"></i>
                        </div>
                        <div class="subject-info">
                            <h3 class="subject-name">${subject.name}</h3>
                            <p class="subject-teacher">${subject.teacher}</p>
                        </div>
                    </div>
                    
                    <div class="subject-stats">
                        <div class="subject-stat">
                            <span class="stat-value">${subject.averageGrade}</span>
                            <span class="stat-label">Средний балл</span>
                        </div>
                        <div class="subject-stat">
                            <span class="stat-value">${subject.grades.length}</span>
                            <span class="stat-label">Оценок</span>
                        </div>
                        <div class="subject-stat">
                            <span class="stat-value">
                                <i class="fas fa-arrow-${subject.trend}"></i>
                            </span>
                            <span class="stat-label">Тренд</span>
                        </div>
                    </div>
                    
                    <div class="recent-grades">
                        <h4>Последние оценки</h4>
                        <div class="grades-list">
                            ${subject.grades.slice(0, 3).map(grade => `
                                <div class="grade-item">
                                    <span class="grade-type">${grade.type}</span>
                                    <span class="grade-value ${this.getGradeClass(grade.grade)}">${grade.grade}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            // View for grades table
            container.innerHTML = `
                <div class="grades-table-view">
                    <table>
                        <thead>
                            <tr>
                                <th>Предмет</th>
                                <th>Последняя оценка</th>
                                <th>Средний балл</th>
                                <th>Тренд</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.subjects.map(subject => `
                                <tr>
                                    <td>
                                        <div class="subject-cell">
                                            <div class="subject-icon small ${subject.name.toLowerCase()}" style="background: ${subject.color}">
                                                <i class="${subject.icon}"></i>
                                            </div>
                                            <span>${subject.name}</span>
                                        </div>
                                    </td>
                                    <td class="grade-cell ${this.getGradeClass(subject.grades[0].grade)}">
                                        ${subject.grades[0].grade}
                                    </td>
                                    <td class="average-cell">${subject.averageGrade}</td>
                                    <td class="trend-cell">
                                        <i class="fas fa-arrow-${subject.trend} ${subject.trend === 'up' ? 'trend-up' : subject.trend === 'down' ? 'trend-down' : ''}"></i>
                                    </td>
                                    <td>
                                        <button class="btn-sm" onclick="studentJournal.showSubjectDetails(${subject.id})">
                                            Подробнее
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    }

    showSubjectDetails(subjectId) {
        const subject = this.subjects.find(s => s.id === subjectId);
        if (!subject) return;

        // Обновляем заголовок модального окна
        document.getElementById('modalSubjectName').textContent = subject.name;
        
        // Обновляем статистику
        document.getElementById('modalAverage').textContent = subject.averageGrade;
        document.getElementById('modalTotalGrades').textContent = subject.grades.length;
        document.getElementById('modalTrend').innerHTML = `<i class="fas fa-arrow-${subject.trend}"></i>`;

        // Группируем оценки по типам
        const gradeTypes = {};
        subject.grades.forEach(grade => {
            if (!gradeTypes[grade.type]) {
                gradeTypes[grade.type] = {
                    count: 0,
                    total: 0
                };
            }
            gradeTypes[grade.type].count++;
            gradeTypes[grade.type].total += grade.grade;
        });

        // Отображаем breakdown
        const breakdownContainer = document.getElementById('gradesBreakdown');
        breakdownContainer.innerHTML = Object.entries(gradeTypes).map(([type, data]) => `
            <div class="breakdown-item">
                <span class="breakdown-type">${type}</span>
                <span class="breakdown-average">${(data.total / data.count).toFixed(1)}</span>
            </div>
        `).join('');

        // Отображаем детальную таблицу оценок
        const gradesTable = document.getElementById('detailedGradesTable');
        gradesTable.innerHTML = subject.grades.map(grade => `
            <tr>
                <td>${new Date(grade.date).toLocaleDateString('ru-RU')}</td>
                <td>${grade.type}</td>
                <td>${grade.topic}</td>
                <td class="grade-value ${this.getGradeClass(grade.grade)}">${grade.grade}</td>
                <td>${grade.comment}</td>
            </tr>
        `).join('');

        // Показываем модальное окно
        document.getElementById('subjectModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('subjectModal').classList.remove('active');
    }

    // КАЛЕНДАРЬ
    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const today = new Date();
        
        // Обновляем заголовок месяца
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[this.currentMonth]} ${this.currentYear}`;
        
        // Получаем первый день месяца и количество дней
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Создаем заголовок с днями недели
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        let calendarHTML = '<div class="calendar-header">';
        
        dayNames.forEach(day => {
            calendarHTML += `<div class="calendar-day-name">${day}</div>`;
        });
        calendarHTML += '</div><div class="calendar-days">';
        
        // Добавляем пустые ячейки для первого дня недели
        const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < startDay; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Добавляем дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayGrades = this.allGrades.filter(grade => grade.date === dateStr);
            const hasGrade = dayGrades.length > 0;
            const isToday = day === today.getDate() && 
                           this.currentMonth === today.getMonth() && 
                           this.currentYear === today.getFullYear();
            
            let gradeClass = '';
            let gradeDots = '';
            
            if (hasGrade) {
                const avgGrade = dayGrades.reduce((sum, grade) => sum + grade.grade, 0) / dayGrades.length;
                gradeClass = this.getGradeClass(avgGrade);
                
                // Создаем точки для каждого предмета
                gradeDots = '<div class="day-grades">';
                dayGrades.slice(0, 3).forEach(grade => {
                    const subjectClass = this.getGradeClass(grade.grade);
                    gradeDots += `<span class="day-grade-dot ${subjectClass}" title="${grade.subject}: ${grade.grade}"></span>`;
                });
                if (dayGrades.length > 3) {
                    gradeDots += `<span class="day-grade-dot more" title="Ещё ${dayGrades.length - 3} оценок">+${dayGrades.length - 3}</span>`;
                }
                gradeDots += '</div>';
            }
            
            calendarHTML += `
                <div class="calendar-day ${isToday ? 'current' : ''} ${hasGrade ? `has-grade ${gradeClass}` : ''}" 
                     data-date="${dateStr}"
                     onmouseenter="studentJournal.showDayPopup('${dateStr}', this)"
                     onmouseleave="studentJournal.hideDayPopup()">
                    <span class="day-number">${day}</span>
                    ${gradeDots}
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        calendarGrid.innerHTML = calendarHTML;
    }

    showDayPopup(dateStr, element) {
        const dayGrades = this.allGrades.filter(grade => grade.date === dateStr);
        if (dayGrades.length === 0) return;
        
        const popup = document.getElementById('dayGradesPopup');
        const popupDate = document.getElementById('popupDate');
        const popupGrades = document.getElementById('popupGrades');
        
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        popupDate.textContent = formattedDate;
        popupGrades.innerHTML = dayGrades.map(grade => `
            <div class="popup-grade-item">
                <span class="popup-subject">${grade.subject}</span>
                <span class="popup-grade ${this.getGradeClass(grade.grade)}">${grade.grade}</span>
            </div>
        `).join('');
        
        // Позиционируем popup
        const rect = element.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        popup.classList.add('active');
    }

    hideDayPopup() {
        const popup = document.getElementById('dayGradesPopup');
        popup.classList.remove('active');
    }

    navigateCalendar(previous) {
        if (previous) {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
        } else {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
        }
        this.renderCalendar();
    }

    // ВСЕ ОЦЕНКИ МОДАЛКА
    showAllGrades() {
        this.renderAllGradesModal();
        document.getElementById('allGradesModal').classList.add('active');
    }

    renderAllGradesModal() {
        const allGrades = this.allGrades.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Обновляем статистику
        document.getElementById('totalGradesCount').textContent = allGrades.length;
        
        const overallAverage = allGrades.reduce((sum, grade) => sum + grade.grade, 0) / allGrades.length;
        document.getElementById('overallAverage').textContent = overallAverage.toFixed(1);
        
        const excellentCount = allGrades.filter(grade => grade.grade >= 8.5).length;
        document.getElementById('excellentCount').textContent = excellentCount;

        const improvementCount = Math.round((overallAverage - 7.0) / 7.0 * 100);
        document.getElementById('improvementCount').textContent = `${improvementCount > 0 ? '+' : ''}${improvementCount}%`;
        
        // Заполняем таблицу
        const tableBody = document.getElementById('allGradesTableBody');
        tableBody.innerHTML = allGrades.map(grade => {
            const date = new Date(grade.date);
            const subject = this.subjects.find(s => s.id === grade.subjectId);
            
            return `
                <tr>
                    <td>${date.toLocaleDateString('ru-RU')}</td>
                    <td>
                        <div class="subject-cell">
                            <div class="subject-icon small ${subject.name.toLowerCase()}" style="background: ${subject.color}">
                                <i class="${subject.icon}"></i>
                            </div>
                            <span>${grade.subject}</span>
                        </div>
                    </td>
                    <td>${grade.type}</td>
                    <td>${grade.topic}</td>
                    <td>
                        <span class="grade-badge ${this.getGradeClass(grade.grade)}">
                            ${grade.grade}
                        </span>
                    </td>
                    <td>${grade.comment}</td>
                </tr>
            `;
        }).join('');
        
        // Добавляем обработчики для фильтров
        this.initializeGradeFilters();
    }

    initializeGradeFilters() {
        const subjectFilter = document.getElementById('subjectFilter');
        const gradeTypeFilter = document.getElementById('gradeTypeFilter');
        const timeFilter = document.getElementById('timeFilter');
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        const filterHandler = () => this.filterAllGrades();
        
        subjectFilter.addEventListener('change', filterHandler);
        gradeTypeFilter.addEventListener('change', filterHandler);
        timeFilter.addEventListener('change', filterHandler);
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.sortAllGrades(e.target.dataset.sort);
            });
        });
    }

    filterAllGrades() {
        const subjectFilter = document.getElementById('subjectFilter').value;
        const gradeTypeFilter = document.getElementById('gradeTypeFilter').value;
        const timeFilter = document.getElementById('timeFilter').value;
        
        let filteredGrades = [...this.allGrades];
        
        // Фильтр по предмету
        if (subjectFilter !== 'all') {
            filteredGrades = filteredGrades.filter(grade => grade.subject === subjectFilter);
        }
        
        // Фильтр по типу оценки
        if (gradeTypeFilter !== 'all') {
            filteredGrades = filteredGrades.filter(grade => grade.type === gradeTypeFilter);
        }
        
        // Фильтр по времени
        if (timeFilter !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (timeFilter) {
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                    break;
                case 'quarter':
                    startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                    break;
            }
            
            filteredGrades = filteredGrades.filter(grade => new Date(grade.date) >= startDate);
        }
        
        this.renderFilteredGrades(filteredGrades);
    }

    sortAllGrades(sortType) {
        let sortedGrades = [...this.allGrades];
        
        switch (sortType) {
            case 'date':
                sortedGrades.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'grade':
                sortedGrades.sort((a, b) => b.grade - a.grade);
                break;
            case 'subject':
                sortedGrades.sort((a, b) => a.subject.localeCompare(b.subject));
                break;
        }
        
        this.renderFilteredGrades(sortedGrades);
    }

    renderFilteredGrades(grades) {
        const tableBody = document.getElementById('allGradesTableBody');
        
        if (grades.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--psb-gray);">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        Оценки не найдены
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = grades.map(grade => {
            const date = new Date(grade.date);
            const subject = this.subjects.find(s => s.id === grade.subjectId);
            
            return `
                <tr>
                    <td>${date.toLocaleDateString('ru-RU')}</td>
                    <td>
                        <div class="subject-cell">
                            <div class="subject-icon small ${subject.name.toLowerCase()}" style="background: ${subject.color}">
                                <i class="${subject.icon}"></i>
                            </div>
                            <span>${grade.subject}</span>
                        </div>
                    </td>
                    <td>${grade.type}</td>
                    <td>${grade.topic}</td>
                    <td>
                        <span class="grade-badge ${this.getGradeClass(grade.grade)}">
                            ${grade.grade}
                        </span>
                    </td>
                    <td>${grade.comment}</td>
                </tr>
            `;
        }).join('');
    }

    // Остальные методы
    updateAnalytics(period) {
        this.showNotification(`Аналитика обновлена для периода: ${period}`, 'success');
    }

    getGradeClass(grade) {
        if (grade >= 8.5) return 'excellent';
        if (grade >= 7.0) return 'good';
        if (grade >= 6.0) return 'medium';
        return 'low';
    }

    animateCharts() {
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0';
                setTimeout(() => {
                    bar.style.width = width;
                }, 300);
            });
        }, 500);
    }

    initializeAIAssistant() {
        const aiToggle = document.getElementById('aiToggle');
        const aiChat = document.getElementById('aiChat');
        const aiClose = document.getElementById('aiClose');
        const aiInput = document.getElementById('aiInput');
        const aiSend = document.getElementById('aiSend');

        aiToggle.addEventListener('click', () => {
            aiChat.classList.toggle('active');
        });

        aiClose.addEventListener('click', () => {
            aiChat.classList.remove('active');
        });

        aiSend.addEventListener('click', this.sendAIMessage.bind(this));
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendAIMessage();
            }
        });

        // Быстрые действия
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                aiInput.value = e.currentTarget.dataset.prompt;
                this.sendAIMessage();
            });
        });
    }

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();
        
        if (!message) return;

        const messagesContainer = document.getElementById('aiMessages');
        
        // Добавляем сообщение пользователя
        const userMessage = document.createElement('div');
        userMessage.className = 'ai-message user';
        userMessage.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${message}</div>
            </div>
        `;
        messagesContainer.appendChild(userMessage);

        // Очищаем input
        input.value = '';

        // Прокручиваем к последнему сообщению
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Имитируем ответ AI
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'ai-message bot';
            botMessage.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.generateAIResponse(message)}</div>
                </div>
            `;
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('повторить') || lowerMessage.includes('темы')) {
            return "На основе ваших оценок, рекомендую повторить:\n\n• Экономика: теорию спроса и предложения, рыночное равновесие\n• Физика: векторный анализ в кинематике\n• Математика: теорию пределов\n\nХорошие результаты по информатике - продолжайте в том же духе!";
        } else if (lowerMessage.includes('экономик')) {
            return "Для улучшения оценок по экономике:\n\n1. Повторите базовые понятия: спрос, предложение, равновесие\n2. Практикуйтесь в построении графиков\n3. Решайте больше практических задач\n4. Обратитесь к преподавателю за консультацией\n\nВаш средний балл по экономике: 6.5 - есть потенциал для роста!";
        } else if (lowerMessage.includes('план') || lowerMessage.includes('недел')) {
            return "План подготовки на неделю:\n\nПонедельник:\n• Экономика - теория (1.5 часа)\n• Математика - повторение пределов (1 час)\n\nВторник:\n• Физика - задачи по кинематике (1.5 часа)\n• Информатика - практика (1 час)\n\nСреда:\n• Экономика - практические задачи (2 часа)\n\nЧетверг:\n• Математика - дифференциальные уравнения (1.5 часа)\n\nПятница:\n• Общее повторение (1 час)\n\nВыходные:\n• Отдых и закрепление материала";
        } else if (lowerMessage.includes('лучш') || lowerMessage.includes('хорош')) {
            return "Ваши лучшие предметы:\n\n🥇 Информатика - 9.5/10\n• Отличные практические навыки\n• Хорошее понимание алгоритмов\n\n🥈 Математика - 8.5/10\n• Стабильно высокие результаты\n• Лучший в группе по некоторым темам\n\nПродолжайте развиваться в этих направлениях!";
        } else {
            const responses = [
                "Я вижу, что у вас хороший прогресс в информатике и математике. Экономика требует дополнительного внимания - рекомендую уделить ей 2-3 часа в неделю.",
                "Ваша успеваемость показывает стабильный рост. Средний балл вырос на 8.2% за последний месяц. Продолжайте в том же духе!",
                "На основе анализа ваших оценок, самая сложная тема - рыночное равновесие в экономике. Рекомендую посмотреть дополнительные видеоуроки по этой теме.",
                "Вы excellently справляетесь с практическими заданиями по информатике. Ваш проект получил высшую оценку в группе!",
                "Заметил, что оценки по физика стабильны, но есть потенциал для роста. Попробуйте решать больше задач на применение законов Ньютона."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Инициализация при загрузке страницы
let studentJournal;

document.addEventListener('DOMContentLoaded', function() {
    studentJournal = new StudentJournal();
    
    // Бургер-меню
    const burgerMenu = document.getElementById('burgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    
    if (burgerMenu) {
        burgerMenu.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
        
        document.addEventListener('click', function(e) {
            if (!burgerMenu.contains(e.target) && !mobileNav.contains(e.target)) {
                burgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
            }
        });
        
        mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', function() {
                burgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }
});