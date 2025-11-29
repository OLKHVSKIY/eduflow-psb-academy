# EduFlow PSB Academy

Платформа обучения для PSB Academy с бэкендом на Node.js/Express и SQLite.

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Запустите сервер:
```bash
npm start
```

Или для разработки с автоперезагрузкой:
```bash
npm run dev
```

3. Откройте браузер и перейдите на:
```
http://localhost:3000/front/html/login.html
```

## Структура проекта

- `server.js` - основной файл сервера Express
- `database.sqlite` - база данных SQLite (создается автоматически)
- `front/` - фронтенд приложения
  - `html/` - HTML страницы
  - `js/` - JavaScript файлы
  - `css/` - CSS стили

## API Endpoints

### Регистрация
- **POST** `/api/register`
- Body: `{ email, password, firstName, lastName, department?, position? }`

### Вход
- **POST** `/api/login`
- Body: `{ email, password }`

### Получение профиля
- **GET** `/api/profile`
- Headers: `Authorization: Bearer <token>`

### Обновление профиля
- **PUT** `/api/profile`
- Headers: `Authorization: Bearer <token>`
- Body: `{ email?, department?, position?, experience?, specialty? }`

## Функционал

1. **Регистрация пользователя** - многошаговая форма регистрации
2. **Личный кабинет** - отображение всех данных профиля
3. **Маркеры незаполненных полей** - красный восклицательный знак "!" для пустых полей
4. **Редактирование профиля** - возможность изменения данных профиля
5. **Автоматическое скрытие маркеров** - после заполнения поля маркер исчезает

## База данных

База данных SQLite создается автоматически при первом запуске сервера. Таблица `users` содержит следующие поля:

- `id` - уникальный идентификатор
- `email` - email пользователя (уникальный)
- `password` - хешированный пароль
- `first_name` - имя
- `last_name` - фамилия
- `department` - отдел (может быть пустым)
- `position` - должность (может быть пустым)
- `experience` - стаж (может быть пустым)
- `specialty` - специальность (может быть пустым)
- `created_at` - дата создания
- `updated_at` - дата обновления

