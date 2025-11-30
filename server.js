// Загрузка переменных окружения
require('dotenv').config();

// Устанавливаем часовой пояс на Москву
process.env.TZ = process.env.TZ || 'Europe/Moscow';

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Функция для получения московского времени в формате SQLite (YYYY-MM-DD HH:MM:SS)
function getMoscowTime() {
    const now = new Date();
    // Получаем московское время
    const moscowDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    // Форматируем в формат SQLite DATETIME
    const year = moscowDate.getFullYear();
    const month = String(moscowDate.getMonth() + 1).padStart(2, '0');
    const day = String(moscowDate.getDate()).padStart(2, '0');
    const hours = String(moscowDate.getHours()).padStart(2, '0');
    const minutes = String(moscowDate.getMinutes()).padStart(2, '0');
    const seconds = String(moscowDate.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы - папка img (изображения)
app.use('/img', express.static(path.join(__dirname, 'img')));

// Статические файлы - CSS из папки front/css
app.use('/css', express.static(path.join(__dirname, 'front', 'css')));

// Статические файлы - JS из папки front/js
app.use('/js', express.static(path.join(__dirname, 'front', 'js')));

// Статические файлы - HTML из папки front/html
app.use('/html', express.static(path.join(__dirname, 'front', 'html')));

// Корневой маршрут - отдаем страницу входа
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'front', 'html', 'login.html'));
});

// Инициализация базы данных
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('✅ Подключено к SQLite базе данных');
        initDatabase();
    }
});

// Инициализация таблиц
function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            department TEXT,
            position TEXT,
            experience TEXT,
            specialty TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы users:', err.message);
            } else {
                console.log('✅ Таблица users готова');
                // Добавляем колонку phone, если её нет (для существующих БД)
                db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (alterErr) => {
                    if (alterErr && !alterErr.message.includes('duplicate column name')) {
                        console.log('Колонка phone уже существует или ошибка:', alterErr.message);
                    }
                });
            }
        });

        // Таблица заданий
        db.run(`CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT,
            description TEXT,
            deadline TEXT,
            max_score INTEGER DEFAULT 100,
            teacher_id INTEGER,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы assignments:', err.message);
            } else {
                console.log('✅ Таблица assignments готова');
                // Создаем начальные задания, если их нет
                initDefaultAssignments();
            }
        });

        // Таблица отправленных заданий
        db.run(`CREATE TABLE IF NOT EXISTS assignment_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            status TEXT DEFAULT 'submitted',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            score INTEGER,
            feedback TEXT,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы assignment_submissions:', err.message);
            } else {
                console.log('✅ Таблица assignment_submissions готова');
            }
        });

        // Таблица активности (лента)
        db.run(`CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            assignment_id INTEGER,
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
        )`, (err) => {
            if (err) {
                console.error('Ошибка создания таблицы activities:', err.message);
            } else {
                console.log('✅ Таблица activities готова');
            }
        });
    });
}

// Инициализация начальных заданий
function initDefaultAssignments() {
    db.get('SELECT COUNT(*) as count FROM assignments', (err, row) => {
        if (err) {
            console.error('Ошибка проверки заданий:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('📝 Создание начальных заданий...');
            const defaultAssignments = [
                {
                    title: 'Финальный экзамен по математике',
                    subject: 'Математика',
                    description: 'Комплексный экзамен по всему курсу финансовой математики. Включает задачи по процентным ставкам, статистическому анализу и оптимизации портфеля.',
                    deadline: '2025-12-15',
                    max_score: 100,
                    status: 'urgent'
                },
                {
                    title: 'Кейс: Подбор финансового решения',
                    subject: 'Экономика',
                    description: 'Проанализируйте финансовое положение компании и предложите оптимальное решение по реструктуризации долга.',
                    deadline: '2025-12-10',
                    max_score: 50,
                    status: 'active'
                },
                {
                    title: 'Тест: Банковские продукты',
                    subject: 'Финансы',
                    description: 'Тестирование знаний по основным банковским продуктам и услугам Private Banking.',
                    deadline: '2025-12-05',
                    max_score: 30,
                    status: 'active'
                },
                {
                    title: 'Эссе по стандартам KYC',
                    subject: 'Compliance',
                    description: 'Напишите эссе о важности процедур Know Your Customer в современном банкинге и их влиянии на предотвращение финансовых преступлений.',
                    deadline: '2025-12-20',
                    max_score: 40,
                    status: 'active'
                },
                {
                    title: 'Проект: Модель машинного обучения',
                    subject: 'Программирование',
                    description: 'Разработайте модель машинного обучения для прогнозирования кредитного дефолта на основе исторических данных.',
                    deadline: '2025-12-25',
                    max_score: 100,
                    status: 'active'
                }
            ];

            const stmt = db.prepare(`INSERT INTO assignments (title, subject, description, deadline, max_score, status) 
                                     VALUES (?, ?, ?, ?, ?, ?)`);
            
            defaultAssignments.forEach(assignment => {
                stmt.run([
                    assignment.title,
                    assignment.subject,
                    assignment.description,
                    assignment.deadline,
                    assignment.max_score,
                    assignment.status
                ], (err) => {
                    if (err) {
                        console.error('Ошибка создания задания:', err.message);
                    }
                });
            });

            stmt.finalize((err) => {
                if (err) {
                    console.error('Ошибка финализации:', err.message);
                } else {
                    console.log('✅ Начальные задания созданы');
                }
            });
        }
    });
}

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Токен доступа отсутствует' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Недействительный токен' });
        }
        req.user = user;
        next();
    });
};

// API Routes

// Healthcheck / базовый эндпоинт API
app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'EduFlow API is running' });
});

// Регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, department, position } = req.body;

        // Валидация
        if (!email || !password || !firstName || !lastName || !phone) {
            return res.status(400).json({ error: 'Заполните все обязательные поля' });
        }

        // Проверка существования пользователя
        db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }
            if (row) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            // Хеширование пароля
            const hashedPassword = await bcrypt.hash(password, 10);

            // Создание пользователя
            const moscowTime = getMoscowTime();
            db.run(
                `INSERT INTO users (email, password, first_name, last_name, phone, department, position, experience, specialty, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, hashedPassword, firstName, lastName, phone || null, department || null, position || null, null, null, moscowTime, moscowTime],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка при создании пользователя' });
                    }

                    // Генерация токена
                    const token = jwt.sign(
                        { id: this.lastID, email: email },
                        JWT_SECRET,
                        { expiresIn: '7d' }
                    );

                    res.status(201).json({
                        message: 'Пользователь успешно зарегистрирован',
                        token: token,
                        user: {
                            id: this.lastID,
                            email: email,
                            firstName: firstName,
                            lastName: lastName
                        }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Вход
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Вход выполнен успешно',
            token: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            }
        });
    });
});

// Получение профиля
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, email, first_name, last_name, phone, department, position, experience, specialty, created_at, updated_at FROM users WHERE id = ?', 
        [req.user.id], 
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }

            res.json({
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                department: user.department,
                position: user.position,
                experience: user.experience,
                specialty: user.specialty,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            });
        }
    );
});

// Обновление профиля
app.put('/api/profile', authenticateToken, (req, res) => {
    const { email, phone, department, position, experience, specialty } = req.body;

    // Проверка email на уникальность (если изменяется)
    if (email) {
        db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id], (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }
            if (row) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            updateProfile();
        });
    } else {
        updateProfile();
    }

    function updateProfile() {
        const updates = [];
        const values = [];

        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone || null);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department || null);
        }
        if (position !== undefined) {
            updates.push('position = ?');
            values.push(position || null);
        }
        if (experience !== undefined) {
            updates.push('experience = ?');
            values.push(experience || null);
        }
        if (specialty !== undefined) {
            updates.push('specialty = ?');
            values.push(specialty || null);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }

        updates.push('updated_at = ?');
        values.push(getMoscowTime());
        values.push(req.user.id);

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        db.run(sql, values, function(err) {
            if (err) {
                return res.status(500).json({ error: 'Ошибка при обновлении профиля' });
            }

            // Получаем обновленный профиль
            db.get('SELECT id, email, first_name, last_name, phone, department, position, experience, specialty, created_at, updated_at FROM users WHERE id = ?', 
                [req.user.id], 
                (err, user) => {
                    if (err) {
                        return res.status(500).json({ error: 'Ошибка базы данных' });
                    }

                    res.json({
                        message: 'Профиль успешно обновлен',
                        user: {
                            id: user.id,
                            email: user.email,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            phone: user.phone,
                            department: user.department,
                            position: user.position,
                            experience: user.experience,
                            specialty: user.specialty,
                            createdAt: user.created_at,
                            updatedAt: user.updated_at
                        }
                    });
                }
            );
        });
    }
});

// Смена пароля
app.post('/api/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 8 символов' });
    }

    // Получаем текущий пароль пользователя
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверяем текущий пароль
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный текущий пароль' });
        }

        // Хешируем новый пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль
        db.run(
            'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
            [hashedPassword, getMoscowTime(), userId],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: 'Ошибка при обновлении пароля' });
                }

                res.json({
                    message: 'Пароль успешно изменен'
                });
            }
        );
    });
});

// Получение заданий пользователя
app.get('/api/assignments', authenticateToken, (req, res) => {
    db.all(`
        SELECT a.*, 
               CASE WHEN s.id IS NOT NULL THEN 'submitted' ELSE 'active' END as user_status,
               s.submitted_at,
               s.score as user_score
        FROM assignments a
        LEFT JOIN assignment_submissions s ON a.id = s.assignment_id AND s.user_id = ?
        ORDER BY a.deadline ASC
    `, [req.user.id], (err, assignments) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        res.json(assignments);
    });
});

// Отправка задания
app.post('/api/assignments/:id/submit', authenticateToken, (req, res) => {
    const assignmentId = parseInt(req.params.id);
    const userId = req.user.id;
    const { files } = req.body; // Массив файлов с информацией о них

    if (isNaN(assignmentId)) {
        return res.status(400).json({ error: 'Неверный ID задания' });
    }

    console.log(`Попытка отправить задание ID: ${assignmentId}, пользователь ID: ${userId}`);

    // Проверяем, не отправлено ли уже задание
    db.get('SELECT id FROM assignment_submissions WHERE assignment_id = ? AND user_id = ?', 
        [assignmentId, userId], (err, existing) => {
            if (err) {
                console.error('Ошибка проверки существующей отправки:', err);
                return res.status(500).json({ error: 'Ошибка базы данных' });
            }

            if (existing) {
                return res.status(400).json({ error: 'Задание уже отправлено' });
            }

            // Получаем информацию о задании
            db.get('SELECT title FROM assignments WHERE id = ?', [assignmentId], (err, assignment) => {
                if (err) {
                    console.error('Ошибка получения задания:', err);
                    return res.status(500).json({ error: 'Ошибка базы данных' });
                }
                if (!assignment) {
                    console.log(`Задание с ID ${assignmentId} не найдено в БД`);
                    return res.status(404).json({ error: 'Задание не найдено' });
                }

                // Создаем запись об отправке
                const submissionTime = getMoscowTime();
                db.run(
                    'INSERT INTO assignment_submissions (assignment_id, user_id, status, submitted_at) VALUES (?, ?, ?, ?)',
                    [assignmentId, userId, 'submitted', submissionTime],
                    function(err) {
                        if (err) {
                            return res.status(500).json({ error: 'Ошибка при отправке задания' });
                        }

                        // Получаем данные пользователя для активности
                        db.get('SELECT first_name, last_name FROM users WHERE id = ?', [userId], (err, user) => {
                            if (err) {
                                return res.status(500).json({ error: 'Ошибка базы данных' });
                            }

                            const userName = `${user.first_name} ${user.last_name}`;

                            // Создаем активность в ленте
                            const activityTime = getMoscowTime();
                            const metadata = {
                                assignmentTitle: assignment.title,
                                files: files || [] // Сохраняем информацию о файлах
                            };
                            
                            db.run(
                                `INSERT INTO activities (user_id, type, title, description, assignment_id, metadata, created_at)
                                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    userId,
                                    'assignment',
                                    'Задание отправлено',
                                    `${userName} отправил задание "${assignment.title}" на проверку`,
                                    assignmentId,
                                    JSON.stringify(metadata),
                                    activityTime
                                ],
                                function(activityErr) {
                                    if (activityErr) {
                                        console.error('Ошибка создания активности:', activityErr);
                                    }

                                    res.json({
                                        message: 'Задание успешно отправлено',
                                        submissionId: this.lastID
                                    });
                                }
                            );
                        });
                    }
                );
            });
        }
    );
});

// Получение активности для ленты
app.get('/api/activities', authenticateToken, (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    
    db.all(`
        SELECT a.*, 
               u.first_name, 
               u.last_name,
               u.email,
               ass.title as assignment_title
        FROM activities a
        JOIN users u ON a.user_id = u.id
        LEFT JOIN assignments ass ON a.assignment_id = ass.id
        ORDER BY a.created_at DESC
        LIMIT ?
    `, [limit], (err, activities) => {
        if (err) {
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }

        const formattedActivities = activities.map(activity => {
            let metadata = null;
            try {
                metadata = activity.metadata ? JSON.parse(activity.metadata) : null;
            } catch (e) {
                console.error('Ошибка парсинга metadata:', e);
                metadata = null;
            }
            
            return {
                id: activity.id,
                type: activity.type,
                title: activity.title,
                description: activity.description,
                userName: `${activity.first_name} ${activity.last_name}`,
                userEmail: activity.email,
                assignmentTitle: activity.assignment_title,
                createdAt: activity.created_at,
                metadata: metadata
            };
        });

        res.json(formattedActivities);
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📝 API доступен по адресу http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('✅ Закрыто подключение к базе данных');
        process.exit(0);
    });
});

