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

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname)));

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
            db.run(
                `INSERT INTO users (email, password, first_name, last_name, phone, department, position, experience, specialty)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [email, hashedPassword, firstName, lastName, phone || null, department || null, position || null, null, null],
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

        updates.push('updated_at = CURRENT_TIMESTAMP');
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

