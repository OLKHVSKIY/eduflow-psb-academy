// assignments.js - Система управления заданиями
class AssignmentsManager {
    constructor() {
        this.assignments = [];
        this.filteredAssignments = [];
        this.currentFilter = 'all';
        this.currentSort = 'deadline';
        this.uploadedFiles = new Map();
        
        this.initializeAssignments();
        this.initializeEventListeners();
        this.applyFilters();
        this.renderAssignments();
    }

    initializeAssignments() {
        this.assignments = [
            {
                id: 1,
                title: "Финальный экзамен по математике",
                subject: "Математика",
                teacher: {
                    name: "Анна Петрова",
                    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",                    email: "anna.petrova@psb.ru"
                },
                description: "Комплексный экзамен по всему курсу финансовой математики. Включает задачи по процентным ставкам, статистическому анализу и оптимизации портфеля.",
                deadline: "2025-12-15",
                status: "urgent",
                maxScore: 100,
                studentScore: null,
                tasks: [
                    "Решить 5 задач по сложным процентам",
                    "Провести статистический анализ данных",
                    "Построить оптимальный инвестиционный портфель",
                    "Написать эссе о применении математики в банкинге"
                ],
                attachments: [
                    { name: "exam_questions.pdf", type: "pdf", size: "2.4 MB" },
                    { name: "data_set.xlsx", type: "doc", size: "1.2 MB" }
                ],
                studentFiles: []
            },
            {
                id: 2,
                title: "Кейс: Подбор финансового решения",
                subject: "Экономика",
                teacher: {
                    name: "Михаил Козлов",
                    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    email: "mikhail.kozlov@psb.ru"
                },
                description: "Проанализируйте финансовое положение компании и предложите оптимальное решение по реструктуризации долга.",
                deadline: "2025-12-10",
                status: "new",
                maxScore: 50,
                studentScore: null,
                tasks: [
                    "Проанализировать финансовые отчеты",
                    "Рассчитать показатели ликвидности",
                    "Предложить план реструктуризации",
                    "Оценить риски предложенного решения"
                ],
                attachments: [
                    { name: "case_description.docx", type: "doc", size: "890 KB" },
                    { name: "financial_reports.zip", type: "zip", size: "3.1 MB" }
                ],
                studentFiles: []
            },
            {
                id: 3,
                title: "Тест: Банковские продукты",
                subject: "Финансы",
                teacher: {
                    name: "Елена Смирнова",
                    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                    email: "elena.smirnova@psb.ru"
                },
                description: "Тестирование знаний по основным банковским продуктам и услугам Private Banking.",
                deadline: "2025-12-05",
                status: "completed",
                maxScore: 30,
                studentScore: 28,
                tasks: [
                    "Ответить на 20 тестовых вопросов",
                    "Решить 5 ситуационных задач"
                ],
                attachments: [
                    { name: "test_questions.pdf", type: "pdf", size: "1.1 MB" }
                ],
                studentFiles: [
                    { name: "my_answers.pdf", type: "pdf", size: "540 KB" }
                ]
            },
            {
                id: 4,
                title: "Эссе по стандартам KYC",
                subject: "Compliance",
                teacher: {
                    name: "Дмитрий Иванов",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    email: "dmitry.ivanov@psb.ru"
                },
                description: "Напишите эссе о важности процедур Know Your Customer в современном банкинге и их влиянии на предотвращение финансовых преступлений.",
                deadline: "2025-12-20",
                status: "active",
                maxScore: 40,
                studentScore: null,
                tasks: [
                    "Исследовать нормативную базу KYC",
                    "Проанализировать кейсы нарушений",
                    "Предложить меры по улучшению процедур",
                    "Написать эссе объемом 1500-2000 слов"
                ],
                attachments: [
                    { name: "kyc_guidelines.pdf", type: "pdf", size: "2.8 MB" },
                    { name: "case_studies.docx", type: "doc", size: "1.5 MB" }
                ],
                studentFiles: []
            },
            {
                id: 5,
                title: "Проект: Модель машинного обучения",
                subject: "Программирование",
                teacher: {
                    name: "Алексей Волков",
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                    email: "aleksey.volkov@psb.ru"
                },
                description: "Разработайте модель машинного обучения для прогнозирования кредитного дефолта на основе исторических данных.",
                deadline: "2025-12-25",
                status: "active",
                maxScore: 100,
                studentScore: null,
                tasks: [
                    "Подготовить и очистить данные",
                    "Выбрать и обучить модель",
                    "Оценить качество прогнозирования",
                    "Написать отчет с выводами"
                ],
                attachments: [
                    { name: "project_description.pdf", type: "pdf", size: "1.8 MB" },
                    { name: "dataset.csv", type: "other", size: "4.2 MB" },
                    { name: "python_template.ipynb", type: "other", size: "156 KB" }
                ],
                studentFiles: []
            }
        ];
    }

    initializeEventListeners() {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.applyFilters();
            });
        });

        document.querySelectorAll('.filter-btn[data-sort]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn[data-sort]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentSort = e.target.dataset.sort;
                this.applyFilters();
            });
        });

        const modal = document.getElementById('assignmentModal');
        const modalClose = document.getElementById('modalClose');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        this.setInitialActiveStates();
    }

    setInitialActiveStates() {
        const allAssignmentsBtn = document.querySelector('.filter-btn[data-filter="all"]');
        const sortByDeadlineBtn = document.querySelector('.filter-btn[data-sort="deadline"]');
        
        if (allAssignmentsBtn) allAssignmentsBtn.classList.add('active');
        if (sortByDeadlineBtn) sortByDeadlineBtn.classList.add('active');
    }

    applyFilters() {
        this.filteredAssignments = this.assignments.filter(assignment => {
            let matchesFilter = true;
            if (this.currentFilter === 'active') {
                matchesFilter = assignment.status === 'active' || assignment.status === 'new';
            } else if (this.currentFilter === 'completed') {
                matchesFilter = assignment.status === 'completed';
            } else if (this.currentFilter === 'urgent') {
                matchesFilter = assignment.status === 'urgent';
            }
            return matchesFilter;
        });

        this.filteredAssignments = this.sortAssignments(this.filteredAssignments);
        this.renderAssignments();
    }

    sortAssignments(assignments) {
        return assignments.sort((a, b) => {
            switch (this.currentSort) {
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                case 'subject':
                    return a.subject.localeCompare(b.subject);
                case 'teacher':
                    return a.teacher.name.localeCompare(b.teacher.name);
                default:
                    return new Date(a.deadline) - new Date(b.deadline);
            }
        });
    }

    renderAssignments() {
        const container = document.getElementById('assignmentsContainer');
        
        if (this.filteredAssignments.length === 0) {
            container.innerHTML = `
                <div class="no-assignments">
                    <i class="fas fa-tasks"></i>
                    <h3>Задания не найдены</h3>
                    <p>Попробуйте изменить параметры фильтров</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredAssignments.map(assignment => `
            <div class="assignment-section">
                <div class="assignment-header">
                    <div class="assignment-main-info">
                        <div class="assignment-title">
                            <h2>${assignment.title}</h2>
                            <div class="assignment-badge ${this.getBadgeClass(assignment.status)}">
                                ${this.getStatusText(assignment.status)}
                            </div>
                        </div>
                        
                        <div class="assignment-meta">
                            <div class="meta-item">
                                <i class="fas fa-book"></i>
                                <span>${assignment.subject}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-user-tie"></i>
                                <span>${assignment.teacher.name}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>До ${this.formatDate(assignment.deadline)}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-star"></i>
                                <span>Макс. оценка: ${assignment.maxScore}</span>
                            </div>
                            ${assignment.studentScore ? `
                                <div class="meta-item" style="color: var(--success);">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Оценка: ${assignment.studentScore}/${assignment.maxScore}</span>
                                </div>
                            ` : ''}
                        </div>

                        <p class="assignment-description">${assignment.description}</p>
                    </div>

                    <div class="assignment-stats">
                        ${assignment.studentScore ? `
                            <div class="stat">
                                <div class="stat-value" style="color: var(--success)">${assignment.studentScore}</div>
                                <div class="stat-label">Оценка</div>
                            </div>
                        ` : ''}
                        <div class="stat">
                            <div class="stat-value">${assignment.tasks.length}</div>
                            <div class="stat-label">Задач</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${assignment.attachments.length}</div>
                            <div class="stat-label">Материалов</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">${assignment.studentFiles ? assignment.studentFiles.length : 0}</div>
                            <div class="stat-label">Файлов</div>
                        </div>
                    </div>
                </div>

                <div class="assignment-content">
                    <div class="teacher-info">
                        <img src="${assignment.teacher.avatar}" alt="${assignment.teacher.name}" class="teacher-avatar">
                        <div class="teacher-details">
                            <h4>${assignment.teacher.name}</h4>
                            <p>Преподаватель • ${assignment.teacher.email}</p>
                        </div>
                    </div>

                    <div class="assignment-tasks">
                        <div class="tasks-title">
                            <i class="fas fa-list-check"></i>
                            <span>Что нужно сделать:</span>
                        </div>
                        <div class="tasks-list">
                            ${assignment.tasks.map(task => `
                                <div class="task-item">
                                    <div class="task-checkbox ${assignment.status === 'completed' ? 'checked' : ''}">
                                        ${assignment.status === 'completed' ? '✓' : ''}
                                    </div>
                                    <span class="task-text">${task}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    ${assignment.status !== 'completed' ? this.renderUploadSection(assignment) : this.renderSubmissionInfo(assignment)}
                </div>

                <div class="assignment-actions">
                    <button class="btn-outline" onclick="assignmentsManager.viewAssignment(${assignment.id})">
                        Подробнее
                    </button>
                    ${assignment.status !== 'completed' ? `
                        <button class="btn-primary" onclick="assignmentsManager.startAssignment(${assignment.id})">
                            Начать выполнение
                        </button>
                        ${assignment.studentFiles && assignment.studentFiles.length > 0 ? `
                            <button class="btn-outline" onclick="assignmentsManager.submitAssignment(${assignment.id})" 
                                    style="background: var(--success); color: white; border-color: var(--success);">
                                <i class="fas fa-paper-plane"></i> Отправить на проверку
                            </button>
                        ` : ''}
                    ` : `
                        <button class="btn-outline" onclick="assignmentsManager.reviewAssignment(${assignment.id})">
                            Посмотреть решение
                        </button>
                    `}
                </div>
            </div>
        `).join('');
    }

    renderUploadSection(assignment) {
        const hasUploadedFiles = assignment.studentFiles && assignment.studentFiles.length > 0;
        
        return `
            <div class="upload-section" id="uploadSection-${assignment.id}">
                <div class="upload-title">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Загрузка решения</span>
                </div>

                <div class="upload-area" onclick="document.getElementById('fileInput-${assignment.id}').click()">
                    <div class="upload-icon">
                        <i class="fas fa-file-upload"></i>
                    </div>
                    <div class="upload-text">
                        <h4>Перетащите файлы сюда</h4>
                        <p>или нажмите для выбора файлов</p>
                    </div>
                    <button class="upload-btn">
                        Выбрать файлы
                    </button>
                    <input type="file" 
                           class="file-input" 
                           id="fileInput-${assignment.id}" 
                           multiple 
                           onchange="assignmentsManager.handleFileUpload(${assignment.id}, this.files)">
                </div>

                ${hasUploadedFiles ? `
                    <div class="uploaded-files">
                        <div class="file-list">
                            ${assignment.studentFiles.map(file => `
                                <div class="file-item">
                                    <div class="file-icon ${file.type}">
                                        <i class="fas fa-file-${file.type === 'pdf' ? 'pdf' : file.type === 'doc' ? 'word' : 'archive'}"></i>
                                    </div>
                                    <div class="file-info">
                                        <div class="file-name">${file.name}</div>
                                        <div class="file-size">${file.size}</div>
                                    </div>
                                    <div class="file-actions">
                                        <button class="file-action" onclick="assignmentsManager.downloadFile('${file.name}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="file-action" onclick="assignmentsManager.removeFile(${assignment.id}, '${file.name}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderSubmissionInfo(assignment) {
        const submissionDate = new Date().toLocaleDateString('ru-RU');
        
        return `
            <div class="submission-info">
                <div class="submission-header">
                    <div class="submission-details">
                        <h4><i style = "margin-right: 10px" class="fas fa-check-circle"></i>Работа сдана на проверку</h4>
                        <p>Сдано: ${submissionDate}</p>
                    </div>
                </div>
                
                ${assignment.studentFiles && assignment.studentFiles.length > 0 ? `
                    <div class="submitted-files">
                        <h5>Прикрепленные файлы:</h5>
                        <div class="file-list">
                            ${assignment.studentFiles.map(file => `
                                <div class="file-item">
                                    <div class="file-icon ${file.type}">
                                        <i class="fas fa-file-${file.type === 'pdf' ? 'pdf' : file.type === 'doc' ? 'word' : 'archive'}"></i>
                                    </div>
                                    <div class="file-info">
                                        <div class="file-name">${file.name}</div>
                                        <div class="file-size">${file.size}</div>
                                    </div>
                                    <div class="file-actions">
                                        <button class="file-action" onclick="assignmentsManager.downloadFile('${file.name}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${assignment.studentScore ? `
                    <div class="score-info">
                        <div class="score-header">
                            <span>Оценка преподавателя:</span>
                            <span class="score-value">${assignment.studentScore}/${assignment.maxScore}</span>
                        </div>
                    </div>
                ` : `
                    <div class="pending-review">
                        <i class="fas fa-clock"></i>
                        <span>Ожидает проверки преподавателем</span>
                    </div>
                `}
            </div>
        `;
    }

    getBadgeClass(status) {
        const classes = {
            'urgent': 'badge-urgent',
            'new': 'badge-new',
            'completed': 'badge-completed',
            'active': 'badge-in-progress'
        };
        return classes[status] || 'badge-in-progress';
    }

    getStatusText(status) {
        const statuses = {
            'urgent': 'Срочно',
            'new': 'Новое',
            'completed': 'Завершено',
            'active': 'В процессе'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    viewAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;

        const modal = document.getElementById('assignmentModal');
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <div class="assignment-header">
                <div class="assignment-main-info">
                    <div class="assignment-title">
                        <h2>${assignment.title}</h2>
                        <div class="assignment-badge ${this.getBadgeClass(assignment.status)}">
                            ${this.getStatusText(assignment.status)}
                        </div>
                    </div>
                    <p class="assignment-description">${assignment.description}</p>
                </div>
            </div>

            <div class="assignment-content">
                <div class="teacher-info">
                    <img src="${assignment.teacher.avatar}" alt="${assignment.teacher.name}" class="teacher-avatar">
                    <div class="teacher-details">
                        <h4>${assignment.teacher.name}</h4>
                        <p>${assignment.teacher.email}</p>
                    </div>
                </div>

                <div class="assignment-tasks">
                    <div class="tasks-title">
                        <i class="fas fa-list-check"></i>
                        <span>Задачи задания:</span>
                    </div>
                    <div class="tasks-list">
                        ${assignment.tasks.map(task => `
                            <div class="task-item">
                                <div class="task-checkbox ${assignment.status === 'completed' ? 'checked' : ''}">
                                    ${assignment.status === 'completed' ? '✓' : ''}
                                </div>
                                <span class="task-text">${task}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${assignment.attachments.length > 0 ? `
                    <div class="assignment-tasks">
                        <div class="tasks-title">
                            <i class="fas fa-paperclip"></i>
                            <span>Материалы задания:</span>
                        </div>
                        <div class="file-list">
                            ${assignment.attachments.map(file => `
                                <div class="file-item">
                                    <div class="file-icon ${file.type}">
                                        <i class="fas fa-file-${file.type === 'pdf' ? 'pdf' : file.type === 'doc' ? 'word' : 'archive'}"></i>
                                    </div>
                                    <div class="file-info">
                                        <div class="file-name">${file.name}</div>
                                        <div class="file-size">${file.size}</div>
                                    </div>
                                    <div class="file-actions">
                                        <button class="file-action" onclick="assignmentsManager.downloadFile('${file.name}')">
                                            <i class="fas fa-download"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${assignment.status !== 'completed' ? this.renderUploadSection(assignment) : this.renderSubmissionInfo(assignment)}
            </div>
        `;

        modal.classList.add('active');
    }

    startAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            assignment.status = 'active';
            this.applyFilters();
            this.showNotification(`Начинаем выполнение задания: ${assignment.title}`, 'success');
        }
    }

    reviewAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            this.showNotification(`Просматриваем решение задания: ${assignment.title}`, 'info');
        }
    }

    submitAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment) {
            assignment.status = 'completed';
            assignment.submissionDate = new Date().toISOString();
            this.applyFilters();
            this.showNotification(`Задание "${assignment.title}" отправлено на проверку!`, 'success');
        }
    }

    handleFileUpload(assignmentId, files) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;

        Array.from(files).forEach(file => {
            const fileType = this.getFileType(file.name);
            const fileSize = this.formatFileSize(file.size);
            
            const fileInfo = {
                name: file.name,
                type: fileType,
                size: fileSize,
                file: file
            };

            if (!assignment.studentFiles) {
                assignment.studentFiles = [];
            }
            
            assignment.studentFiles.push(fileInfo);
            this.uploadedFiles.set(`${assignmentId}-${file.name}`, file);
        });

        this.applyFilters();
        this.showNotification(`Файлы загружены для задания: ${assignment.title}`, 'success');
    }

    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['pdf'].includes(ext)) return 'pdf';
        if (['doc', 'docx', 'txt'].includes(ext)) return 'doc';
        if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'img';
        return 'other';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    downloadFile(filename) {
        this.showNotification(`Скачивание файла: ${filename}`, 'info');
    }

    removeFile(assignmentId, filename) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (assignment && assignment.studentFiles) {
            assignment.studentFiles = assignment.studentFiles.filter(file => file.name !== filename);
            this.uploadedFiles.delete(`${assignmentId}-${filename}`);
            this.applyFilters();
            this.showNotification(`Файл удален: ${filename}`, 'warning');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10B981' : 
                       type === 'error' ? '#EF4444' : 
                       type === 'warning' ? '#F59E0B' : '#3B82F6';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
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

// Инициализация
let assignmentsManager;

document.addEventListener('DOMContentLoaded', function() {
    assignmentsManager = new AssignmentsManager();
    
    const assignmentsBtn = document.querySelector('.stat-card:nth-child(2)');
    if (assignmentsBtn) {
        assignmentsBtn.style.cursor = 'pointer';
        assignmentsBtn.addEventListener('click', function() {
            window.location.href = 'assignments.html';
        });
    }
});

// Drag and Drop
document.addEventListener('DOMContentLoaded', function() {
    const uploadSections = document.querySelectorAll('.upload-area');
    
    uploadSections.forEach(section => {
        section.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--psb-blue)';
            this.style.background = 'var(--psb-light-blue)';
        });
        
        section.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--psb-border)';
            this.style.background = 'var(--psb-white)';
        });
        
        section.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--psb-border)';
            this.style.background = 'var(--psb-white)';
            
            const assignmentId = this.closest('.upload-section').id.split('-')[1];
            const files = e.dataTransfer.files;
            
            if (files.length > 0 && assignmentsManager) {
                assignmentsManager.handleFileUpload(parseInt(assignmentId), files);
            }
        });
    });
});