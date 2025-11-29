CREATE DATABASE eduflow_platform;

\c eduflow_platform;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    video_url VARCHAR(1000) NOT NULL,
    duration INTEGER NOT NULL,
    thumbnail_url VARCHAR(1000),
    course_id INTEGER,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE video_markers (
    id SERIAL PRIMARY KEY,
    video_id INTEGER REFERENCES video_lessons(id) ON DELETE CASCADE,
    timestamp INTEGER NOT NULL,
    type VARCHAR(50) DEFAULT 'comment',
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id),
    parent_id INTEGER REFERENCES video_markers(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marker_reactions (
    id SERIAL PRIMARY KEY,
    marker_id INTEGER REFERENCES video_markers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    reaction_type VARCHAR(50) DEFAULT 'like',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(marker_id, user_id)
);

INSERT INTO users (email, name, role) VALUES 
('teacher@psb.ru', 'Мария Иванова', 'teacher'),
('student@psb.ru', 'Иван Петров', 'student');

INSERT INTO video_lessons (title, description, video_url, duration, course_id, created_by) VALUES 
('Новые продукты Private Banking', 'Обзор новых банковских продуктов для премиальных клиентов', '/videos/private-banking.mp4', 2700, 1, 1);