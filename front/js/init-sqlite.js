// init-sqlite.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем базу данных
const db = new sqlite3.Database('./eduflow.db', (err) => {
    if (err) {
        console.error('Ошибка при создании базы данных:', err);
    } else {
        console.log('Подключение к SQLite базе данных установлено.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // Создание таблиц
    const queries = [
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'student',
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS video_lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            video_url TEXT NOT NULL,
            duration INTEGER NOT NULL,
            thumbnail_url TEXT,
            course_id INTEGER,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS video_markers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id INTEGER NOT NULL,
            timestamp INTEGER NOT NULL,
            type TEXT DEFAULT 'comment',
            content TEXT NOT NULL,
            author_id INTEGER NOT NULL,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (video_id) REFERENCES video_lessons (id) ON DELETE CASCADE,
            FOREIGN KEY (author_id) REFERENCES users (id),
            FOREIGN KEY (parent_id) REFERENCES video_markers (id) ON DELETE CASCADE
        )`,
        
        `CREATE TABLE IF NOT EXISTS marker_reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            marker_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            reaction_type TEXT DEFAULT 'like',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(marker_id, user_id),
            FOREIGN KEY (marker_id) REFERENCES video_markers (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`
    ];

    // Выполняем запросы последовательно
    let completed = 0;
    queries.forEach((query, index) => {
        db.run(query, (err) => {
            if (err) {
                console.error(`Ошибка при создании таблицы ${index + 1}:`, err);
            } else {
                console.log(`Таблица ${index + 1} создана успешно`);
            }
            completed++;
            
            if (completed === queries.length) {
                insertDemoData();
            }
        });
    });
}

function insertDemoData() {
    // Вставка демо-данных
    const demoData = [
        `INSERT OR IGNORE INTO users (email, name, role) VALUES 
        ('teacher@psb.ru', 'Мария Иванова', 'teacher'),
        ('student@psb.ru', 'Иван Петров', 'student')`,
        
        `INSERT OR IGNORE INTO video_lessons (title, description, video_url, duration, course_id, created_by) VALUES 
        ('Новые продукты Private Banking', 'Обзор новых банковских продуктов для премиальных клиентов', '/videos/private-banking.mp4', 2700, 1, 1)`,
        
        `INSERT OR IGNORE INTO video_markers (video_id, timestamp, type, content, author_id) VALUES 
        (1, 120, 'important', 'Важный момент: условия страхования инвестиционных продуктов', 1),
        (1, 240, 'question', 'Какие документы нужны для оформления премиального пакета?', 2),
        (1, 420, 'idea', 'Можно добавить сравнение с конкурентными предложениями', 2),
        (1, 180, 'comment', 'Хорошее объяснение структуры комиссий', 2)`
    ];

    demoData.forEach((query, index) => {
        db.run(query, (err) => {
            if (err) {
                console.error(`Ошибка при вставке данных ${index + 1}:`, err);
            } else {
                console.log(`Демо-данные ${index + 1} вставлены успешно`);
            }
            
            if (index === demoData.length - 1) {
                console.log('База данных инициализирована успешно!');
                db.close();
            }
        });
    });
}