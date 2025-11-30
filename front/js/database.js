// /js/database.js - Pure JavaScript "база данных" с LocalStorage
class EduFlowDatabase {
    constructor() {
        this.storageKey = 'eduflow_database';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                users: [
                    {
                        id: 1,
                        email: 'teacher@psb.ru',
                        name: 'Мария Иванова',
                        role: 'teacher',
                        avatar: 'МИ',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: 2,
                        email: 'student@psb.ru',
                        name: 'Иван Петров', 
                        role: 'student',
                        avatar: 'ИП',
                        created_at: new Date().toISOString()
                    }
                ],
                video_lessons: [
                    {
                        id: 1,
                        title: 'Новые продукты Private Banking',
                        description: 'Обзор новых банковских продуктов для премиальных клиентов',
                        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                        duration: 2700,
                        thumbnail_url: '',
                        course_id: 1,
                        created_by: 1,
                        created_at: new Date().toISOString()
                    }
                ],
                video_markers: [
                    {
                        id: 1,
                        video_id: 1,
                        timestamp: 120,
                        type: 'important',
                        content: 'Важный момент: условия страхования инвестиционных продуктов',
                        author_id: 1,
                        parent_id: null,
                        created_at: new Date().toISOString(),
                        reactions: { likes: 0, helpful: 3 }
                    },
                    {
                        id: 2,
                        video_id: 1,
                        timestamp: 240,
                        type: 'question',
                        content: 'Какие документы нужны для оформления премиального пакета?',
                        author_id: 2,
                        parent_id: null,
                        created_at: new Date().toISOString(),
                        reactions: { likes: 0, helpful: 1 }
                    },
                    {
                        id: 3,
                        video_id: 1,
                        timestamp: 420,
                        type: 'idea',
                        content: 'Можно добавить сравнение с конкурентными предложениями',
                        author_id: 2,
                        parent_id: null,
                        created_at: new Date().toISOString(),
                        reactions: { likes: 0, helpful: 2 }
                    },
                    {
                        id: 4,
                        video_id: 1,
                        timestamp: 180,
                        type: 'comment',
                        content: 'Хорошее объяснение структуры комиссий',
                        author_id: 2,
                        parent_id: null,
                        created_at: new Date().toISOString(),
                        reactions: { likes: 0, helpful: 0 }
                    }
                ],
                marker_reactions: []
            };
            this.save(initialData);
        }
    }

    save(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    load() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    // CRUD операции для маркеров
    getMarkers(videoId = null) {
        const data = this.load();
        let markers = data.video_markers || [];
        
        if (videoId) {
            markers = markers.filter(marker => marker.video_id == videoId);
        }

        // Добавляем информацию об авторах
        return markers.map(marker => ({
            ...marker,
            author: (data.users || []).find(user => user.id === marker.author_id)
        }));
    }

    addMarker(markerData) {
        const data = this.load();
        const newMarker = {
            id: Date.now(),
            ...markerData,
            created_at: new Date().toISOString(),
            reactions: { likes: 0, helpful: 0 }
        };
        
        data.video_markers = data.video_markers || [];
        data.video_markers.push(newMarker);
        this.save(data);
        
        return { ...newMarker, author: this.getUser(markerData.author_id) };
    }

    updateMarkerReactions(markerId, reactions) {
        const data = this.load();
        const marker = data.video_markers.find(m => m.id == markerId);
        if (marker) {
            marker.reactions = reactions;
            this.save(data);
        }
    }

    getUser(userId) {
        const data = this.load();
        return (data.users || []).find(user => user.id == userId);
    }

    getVideoLesson(videoId) {
        const data = this.load();
        const lesson = (data.video_lessons || []).find(lesson => lesson.id == videoId);
        if (lesson) {
            lesson.created_by_user = this.getUser(lesson.created_by);
        }
        return lesson;
    }
}

// Создаем глобальный экземпляр базы данных
const database = new EduFlowDatabase();

// Функции для использования в других файлах
window.EduFlowDB = {
    getMarkers: (videoId) => database.getMarkers(videoId),
    addMarker: (markerData) => database.addMarker(markerData),
    updateMarkerReactions: (markerId, reactions) => database.updateMarkerReactions(markerId, reactions),
    getVideoLesson: (videoId) => database.getVideoLesson(videoId),
    getUser: (userId) => database.getUser(userId)
};

console.log('🎯 EduFlow Database инициализирована!');