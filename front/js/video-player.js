class VideoPlayer {
    constructor() {
        this.video = document.getElementById('mainVideo');
        this.markers = [];
        this.currentCommentType = 'comment';
        this.currentTimestamp = 0;
        this.isPlaying = false;
        
        // Система автоматического скрытия контролов
        this.controlsTimeout = null;
        this.controlsVisible = false;
        this.hideDelay = 4000; // 4 секунды
        this.userActive = false;
       
        this.initializeElements();
        this.initializeEventListeners();
        this.loadDemoData();
        this.setupMobileFeatures();
        this.setupControlsAutoHide();
        this.setupSidebarResize(); // Новый метод
    }

    setupSidebarResize() {
        if (!this.markersSidebar) {
            console.error('markersSidebar not found');
            return;
        }
        // Создаем resizer
        this.sidebarResizer = document.createElement('div');
        this.sidebarResizer.className = 'sidebar-resizer';
        this.markersSidebar.insertBefore(this.sidebarResizer, this.markersSidebar.firstChild);

        // Загружаем сохраненную ширину из localStorage
        const savedWidth = localStorage.getItem('markersSidebarWidth') || '330';
        this.markersSidebar.style.flex = `0 0 ${savedWidth}px`;
        this.markersSidebar.style.maxWidth = `${savedWidth}px`;

        // Переменные для ресайза
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;

        // Начало перетаскивания (мышь)
        this.sidebarResizer.addEventListener('mousedown', (e) => {
            this.isResizing = true;
            this.startX = e.clientX;
            this.startWidth = this.markersSidebar.offsetWidth;
            this.sidebarResizer.classList.add('dragging');
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        // Начало перетаскивания (тач)
        this.sidebarResizer.addEventListener('touchstart', (e) => {
            this.isResizing = true;
            this.startX = e.touches[0].clientX;
            this.startWidth = this.markersSidebar.offsetWidth;
            this.sidebarResizer.classList.add('dragging');
        }, { passive: false });

        // Перетаскивание
        const doResize = (e) => {
            if (!this.isResizing) return;
            const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
            const delta = this.startX - clientX;
            let newWidth = this.startWidth + delta;
            newWidth = Math.max(126, Math.min(450, newWidth)); // Минимум 126px, максимум 450px
            this.markersSidebar.style.flex = `0 0 ${newWidth}px`;
            this.markersSidebar.style.maxWidth = `${newWidth}px`;
        };

        // Окончание перетаскивания
        const stopResize = () => {
            if (this.isResizing) {
                const finalWidth = this.markersSidebar.offsetWidth;
                localStorage.setItem('markersSidebarWidth', finalWidth); // Сохраняем
                this.isResizing = false;
                this.sidebarResizer.classList.remove('dragging');
                document.body.style.cursor = 'default';
            }
        };

        // Слушатели на document
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', doResize, { passive: false });
        document.addEventListener('touchend', stopResize, { passive: true });
    }

    // Система автоматического скрытия контролов
    setupControlsAutoHide() {
    // Show initially only if playing; otherwise, wait for interaction
    if (!this.video.paused) {
        this.showControls();
        this.startHideTimer();
    }
}

    showControls() {
    if (!this.controlsVisible) {
        this.videoWrapper.classList.add('controls-visible');
        this.controlsVisible = true;
    }
    this.userActive = true; // No need for this var anymore? Simplify if possible, but keep for now
}

// Updated hideControls
hideControls() {
    if (this.controlsVisible && !this.video.paused && !this.isDragging) { // Removed !userActive check; simplify
        this.videoWrapper.classList.remove('controls-visible');
        this.controlsVisible = false;
    }
}

    startHideTimer() {
    if (this.controlsTimeout) {
        clearTimeout(this.controlsTimeout);
    }
    if (!this.video.paused) {
        this.controlsTimeout = setTimeout(() => {
            this.hideControls();
        }, this.hideDelay); // 4000ms
    }
}

    resetHideTimer() {
    this.showControls();
    this.startHideTimer();
}

    // В класс VideoPlayer добавьте:
    setupMobileFeatures() {
        // Переключение сайдбара на мобильных
        this.mobileMarkersToggle = document.getElementById('mobileMarkersToggle');
        this.markersSidebar = document.getElementById('markersSidebar');
    
        if (this.mobileMarkersToggle && this.markersSidebar) {
            this.mobileMarkersToggle.addEventListener('click', () => {
                this.markersSidebar.classList.toggle('mobile-visible');
                this.resetHideTimer();
            });
        
            // Закрытие сайдбара по клику вне
            this.markersSidebar.addEventListener('click', (e) => {
                if (e.target === this.markersSidebar) {
                    this.markersSidebar.classList.remove('mobile-visible');
                }
            });
        }
    }

    handleResize() {
        // На мобильных скрываем сайдбар по умолчанию
        if (window.innerWidth <= 768) {
            this.videoWrapper.classList.add('mobile');
            if (this.markersSidebar) {
                this.markersSidebar.classList.remove('mobile-visible');
            }
            if (this.mobileMarkersToggle) {
                this.mobileMarkersToggle.style.display = 'flex';
            }
        } else {
            this.videoWrapper.classList.remove('mobile');
            if (this.markersSidebar) {
                this.markersSidebar.classList.remove('mobile-visible');
                this.markersSidebar.style.display = 'flex';
            }
            if (this.mobileMarkersToggle) {
                this.mobileMarkersToggle.style.display = 'none';
            }
        }
    }

    initializeElements() {
        // Основные элементы
        this.videoModal = document.getElementById('videoModal');
        this.commentModal = document.getElementById('commentModal');
        this.commentsList = document.getElementById('commentsList');
        this.markersList = document.getElementById('markersList');
        this.markersContainer = document.getElementById('markersContainer');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressThumb = document.getElementById('progressThumb');
        this.videoWrapper = document.querySelector('.video-wrapper');
       
        // Кнопки управления
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playPauseControl = document.getElementById('playPauseControl');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.speedBtn = document.getElementById('speedBtn');
        this.speedOptions = document.getElementById('speedOptions');
        this.bigRewind = document.getElementById('bigRewind');
        this.bigForward = document.getElementById('bigForward');
       
        // Элементы времени
        this.currentTimeDisplay = document.getElementById('currentTime');
        this.durationDisplay = document.getElementById('duration');
       
        // Система комментариев
        this.addCommentBtn = document.getElementById('addCommentBtn');
        this.commentText = document.getElementById('commentText');
        this.commentTimestamp = document.getElementById('commentTimestamp');
        this.currentTimeDisplayModal = document.getElementById('currentTimeDisplay');
        this.timeAdjust = document.getElementById('timeAdjust');
        this.saveCommentBtn = document.getElementById('saveComment');
        this.cancelCommentBtn = document.getElementById('cancelComment');
       
        // Фильтры
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.typeButtons = document.querySelectorAll('.type-btn');
       
        // Мобильные элементы
        this.markersToggle = document.querySelector('.markers-toggle');
        this.markersListContainer = document.querySelector('.markers-list-container');
       
        this.isDragging = false;
        this.currentFilter = 'all';
        this.currentSpeed = 1;

        this.markersSidebar = document.getElementById('markersSidebar');
    }

    setupMobileFeatures() {
        // Переключение видимости меток на мобильных
        if (this.markersToggle) {
            this.markersToggle.addEventListener('click', () => {
                this.markersToggle.classList.toggle('active');
                this.markersListContainer.classList.toggle('expanded');
                this.resetHideTimer();
            });
        }
    }

    initializeEventListeners() {
        // Управление видео
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('click', () => {
            this.togglePlayPause();
            this.resetHideTimer();
        });
        this.video.addEventListener('play', () => this.onPlay());
        this.video.addEventListener('pause', () => this.onPause());
       
        // События мыши для показа/скрытия контролов
        this.videoWrapper.addEventListener('mouseenter', () => {
            this.resetHideTimer();
        });

        this.videoWrapper.addEventListener('mouseleave', () => {
            if (!this.video.paused && !this.isDragging) {
                if (this.controlsTimeout) {
                    clearTimeout(this.controlsTimeout);
                }
                this.hideControls(); // Hide immediately on leave
            }
        });
        
        this.videoWrapper.addEventListener('mousemove', () => {
            this.resetHideTimer(); // Restart timer on any movement
        });

        // Keep touch events similar, but for mobile, you might want always-visible or shorter delay (e.g., hideDelay = 2000)
        this.videoWrapper.addEventListener('touchstart', () => {
            this.resetHideTimer();
        }, { passive: true });
        this.videoWrapper.addEventListener('touchend', () => {
            if (!this.video.paused && !this.isDragging) {
                this.hideControls(); // Immediate hide on touch end (simulate leave)
            }
        }, { passive: true });
       
        // Кнопки управления
        this.playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause();
            this.resetHideTimer();
        });
       
        this.playPauseControl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlayPause();
            this.resetHideTimer();
        });
       
        this.rewindBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rewind(10);
            this.resetHideTimer();
        });
       
        this.forwardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.forward(10);
            this.resetHideTimer();
        });
       
        this.fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFullscreen();
            this.resetHideTimer();
        });
       
        // Большие кнопки в оверлее
        this.bigRewind.addEventListener('click', (e) => {
            e.stopPropagation();
            this.rewind(10);
            this.resetHideTimer();
        });
       
        this.bigForward.addEventListener('click', (e) => {
            e.stopPropagation();
            this.forward(10);
            this.resetHideTimer();
        });
       
        // Контроль скорости
        this.speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSpeedMenu();
            this.resetHideTimer();
        });
       
        this.speedOptions.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.tagName === 'BUTTON') {
                this.changeSpeed(parseFloat(e.target.dataset.speed));
                e.target.parentElement.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.hideSpeedMenu();
                this.resetHideTimer();
            }
        });
       
        // Прогресс-бар
        this.progressBar.addEventListener('click', (e) => {
            this.seek(e);
            this.resetHideTimer();
        });
        this.progressBar.addEventListener('mousedown', (e) => {
            this.startDragging(e);
            this.resetHideTimer();
        });
        this.progressBar.addEventListener('touchstart', (e) => {
            this.startDragging(e);
            this.resetHideTimer();
        }, { passive: false });
        document.addEventListener('mousemove', (e) => {
            this.drag(e);
            if (this.isDragging) {
                this.resetHideTimer();
            }
        });
        document.addEventListener('touchmove', (e) => {
            this.drag(e);
            if (this.isDragging) {
                this.resetHideTimer();
            }
        }, { passive: false });
        document.addEventListener('mouseup', () => {
            this.stopDragging();
            this.resetHideTimer();
        });
        document.addEventListener('touchend', () => {
            this.stopDragging();
            this.resetHideTimer();
        }, { passive: true });
       
        // Система комментариев
        this.addCommentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openCommentModal();
            this.resetHideTimer();
        });
       
        this.saveCommentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.saveComment();
            this.resetHideTimer();
        });
       
        this.cancelCommentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeCommentModal();
            this.resetHideTimer();
        });
       
        // Фильтры
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.filterComments(btn.dataset.type);
                this.resetHideTimer();
            });
        });
       
        this.typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setCommentType(btn);
                this.resetHideTimer();
            });
        });
       
        // Регулятор времени в модальном окне
        this.timeAdjust.addEventListener('input', (e) => {
            this.adjustTimestamp(e.target.value);
            this.resetHideTimer();
        });
       
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
           
            this.handleKeyPress(e);
            this.resetHideTimer();
        });
       
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target === this.commentModal) {
                this.closeCommentModal();
            }
            if (e.target === this.videoModal) {
                closeVideoPlayer();
            }
        });
       
        // Скрытие меню скорости при клике вне
        document.addEventListener('click', (e) => {
            if (!this.speedBtn.contains(e.target) && !this.speedOptions.contains(e.target)) {
                this.hideSpeedMenu();
            }
        });
       
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            this.handleResize();
            this.resetHideTimer();
        });

        // При переходе в полноэкранный режим
        document.addEventListener('fullscreenchange', () => {
            this.resetHideTimer();
        });
    }

    onPlay() {
        this.isPlaying = true;
        this.videoWrapper.classList.add('playing');
        this.videoWrapper.classList.remove('paused');
        this.updatePlayPauseButtons();
        this.resetHideTimer(); // Start timer when play starts
    }

    onPause() {
        this.isPlaying = false;
        this.videoWrapper.classList.remove('playing');
        this.videoWrapper.classList.add('paused');
        this.updatePlayPauseButtons();
        this.showControls(); // Always show when paused
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout); // No auto-hide when paused
        }
    }

    updatePlayPauseButtons() {
        const icon = this.isPlaying ? 'fa-pause' : 'fa-play';
        this.playPauseBtn.innerHTML = `<i class="fas ${icon}"></i>`;
        this.playPauseControl.innerHTML = `<i class="fas ${icon}"></i>`;
    }

    // Управление воспроизведением
    togglePlayPause() {
        if (this.video.paused) {
            this.video.play().catch(e => console.log('Play failed:', e));
        } else {
            this.video.pause();
        }
    }

    rewind(seconds) {
        this.video.currentTime = Math.max(0, this.video.currentTime - seconds);
    }

    forward(seconds) {
        this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + seconds);
    }

    toggleSpeedMenu() {
        const isVisible = this.speedOptions.style.display === 'flex';
        this.speedOptions.style.display = isVisible ? 'none' : 'flex';
    }

    hideSpeedMenu() {
        this.speedOptions.style.display = 'none';
    }

    changeSpeed(speed) {
        this.video.playbackRate = speed;
        this.currentSpeed = speed;
        this.speedBtn.textContent = `${speed}x`;
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.videoWrapper.requestFullscreen) {
                this.videoWrapper.requestFullscreen();
            } else if (this.videoWrapper.webkitRequestFullscreen) {
                this.videoWrapper.webkitRequestFullscreen();
            } else if (this.videoWrapper.msRequestFullscreen) {
                this.videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    // Управление прогресс-баром
    updateDuration() {
        const duration = this.formatTime(this.video.duration);
        this.durationDisplay.textContent = duration;
    }

    updateProgress() {
        const currentTime = this.video.currentTime;
        const duration = this.video.duration;
       
        if (duration) {
            const progress = (currentTime / duration) * 100;
            this.progressFill.style.width = `${progress}%`;
            this.progressThumb.style.left = `${progress}%`;
            this.currentTimeDisplay.textContent = this.formatTime(currentTime);
           
            // Проверка активных комментариев
            this.checkActiveComments(currentTime);
        }
    }

    seek(e) {
        if (!this.isDragging) {
            const rect = this.progressBar.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX) {
                const percent = (clientX - rect.left) / rect.width;
                this.video.currentTime = percent * this.video.duration;
            }
        }
    }

    startDragging(e) {
        this.isDragging = true;
        this.videoWrapper.classList.add('dragging');
        this.seek(e);
    }

    drag(e) {
        if (this.isDragging) {
            this.seek(e);
        }
    }

    stopDragging() {
        this.isDragging = false;
        this.videoWrapper.classList.remove('dragging');
        // После завершения перетаскивания сбрасываем таймер
        this.resetHideTimer();
    }

    // Система комментариев и меток
    openCommentModal() {
        this.currentTimestamp = this.video.currentTime;
        this.commentTimestamp.textContent = this.formatTime(this.currentTimestamp);
        this.currentTimeDisplayModal.textContent = this.formatTime(this.currentTimestamp);
        this.timeAdjust.value = 5;
        this.commentText.value = '';
        this.commentModal.classList.add('show');
        // При открытии модального окна паузим видео
        this.video.pause();
    }

    closeCommentModal() {
        this.commentModal.classList.remove('show');
    }

    adjustTimestamp(value) {
        const adjustment = (value - 5) * 1;
        const adjustedTime = Math.max(0, this.currentTimestamp + adjustment);
        this.commentTimestamp.textContent = this.formatTime(adjustedTime);
    }

    setCommentType(button) {
        this.typeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentCommentType = button.dataset.type;
    }

    saveComment() {
        const content = this.commentText.value.trim();
        if (!content) {
            this.showNotification('Пожалуйста, введите текст комментария', 'error');
            return;
        }
        const adjustment = (this.timeAdjust.value - 5) * 1;
        const timestamp = Math.max(0, this.currentTimestamp + adjustment);
        const newMarker = EduFlowDB.addMarker({
            video_id: 1,
            timestamp: timestamp,
            type: this.currentCommentType,
            content: content,
            author_id: 2
        });
        this.markers.push(newMarker);
        this.renderComments();
        this.renderMarkers();
        this.closeCommentModal();
        this.showNotification('Комментарий успешно добавлен!', 'success');
    }

    filterComments(type) {
        this.currentFilter = type;
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.renderComments();
    }

    checkActiveComments(currentTime) {
        const comments = document.querySelectorAll('.comment-item');
        let hasActive = false;
       
        comments.forEach(comment => {
            const commentTime = parseFloat(comment.dataset.timestamp);
            const timeDiff = Math.abs(currentTime - commentTime);
           
            if (timeDiff < 2 && !hasActive) {
                comment.classList.add('active');
                hasActive = true;
               
                // Плавная прокрутка к активному комментарию
                if (!this.isCommentVisible(comment)) {
                    comment.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                comment.classList.remove('active');
            }
        });
    }

    isCommentVisible(element) {
        const rect = element.getBoundingClientRect();
        const commentsRect = this.commentsList.getBoundingClientRect();
        return rect.top >= commentsRect.top && rect.bottom <= commentsRect.bottom;
    }

    // Визуализация
    renderComments() {
        this.commentsList.innerHTML = '';
       
        const filteredMarkers = this.currentFilter === 'all'
            ? this.markers
            : this.markers.filter(marker => marker.type === this.currentFilter);
       
        if (filteredMarkers.length === 0) {
            this.commentsList.innerHTML = `
                <div class="no-comments">
                    <i class="fas fa-comment-slash"></i>
                    <p>Пока нет комментариев</p>
                    ${this.currentFilter !== 'all' ? '<small>Попробуйте другой фильтр</small>' : ''}
                </div>
            `;
            return;
        }
       
        filteredMarkers
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach(marker => {
                const commentElement = this.createCommentElement(marker);
                this.commentsList.appendChild(commentElement);
            });
    }

    renderMarkers() {
        this.markersContainer.innerHTML = '';
        this.markersList.innerHTML = '';
       
        const markersCount = document.getElementById('markersCount');
        markersCount.textContent = `${this.markers.length} меток`;
       
        // Обновляем текст переключателя только на мобильных
        if (window.innerWidth <= 768 && this.markersToggle) {
            this.markersToggle.querySelector('span').textContent = `Временные метки (${this.markers.length})`;
        }
       
        this.markers
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach(marker => {
                this.createProgressMarker(marker);
                this.createMarkerListItem(marker);
            });
    }

    createCommentElement(marker) {
        const div = document.createElement('div');
        div.className = `comment-item ${marker.type}`;
        div.dataset.timestamp = marker.timestamp;
       
        div.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <div class="author-avatar">${marker.author.avatar}</div>
                    <span>${marker.author.name}</span>
                    <span class="comment-type ${marker.type}">${this.getTypeLabel(marker.type)}</span>
                </div>
                <div class="comment-meta">
                    <span class="comment-time">
                        <i class="fas fa-clock"></i> ${this.formatTime(marker.timestamp)}
                    </span>
                </div>
            </div>
            <div class="comment-content">${marker.content}</div>
            <div class="comment-actions">
                <button class="comment-action like-btn">
                    <i class="fas fa-thumbs-up"></i> Полезно (${marker.reactions.helpful})
                </button>
                <button class="comment-action seek-btn">
                    <i class="fas fa-play"></i> Перейти к моменту
                </button>
            </div>
        `;
       
        // Добавляем обработчики событий
        const likeBtn = div.querySelector('.like-btn');
        const seekBtn = div.querySelector('.seek-btn');
       
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.likeComment(marker.id);
            this.resetHideTimer();
        });
       
        seekBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.seekToTime(marker.timestamp);
            this.resetHideTimer();
        });
       
        // Клик на всем комментарии
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.comment-action')) {
                this.seekToTime(marker.timestamp);
                this.resetHideTimer();
            }
        });
       
        return div;
    }

    createProgressMarker(marker) {
        const markerElement = document.createElement('div');
        markerElement.className = `marker ${marker.type}`;
        if (this.video.duration) {
            markerElement.style.left = `${(marker.timestamp / this.video.duration) * 100}%`;
        }
        markerElement.title = `${this.getTypeLabel(marker.type)}: ${marker.content.substring(0, 50)}...`;
       
        markerElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.seekToTime(marker.timestamp);
            this.resetHideTimer();
        });
       
        this.markersContainer.appendChild(markerElement);
    }

    createMarkerListItem(marker) {
        const div = document.createElement('div');
        div.className = 'marker-item';
       
        div.innerHTML = `
            <div class="marker-color ${marker.type}"></div>
            <div class="marker-info">
                <div class="marker-time">${this.formatTime(marker.timestamp)}</div>
                <div class="marker-preview">${marker.content.substring(0, 40)}...</div>
            </div>
        `;
       
        div.addEventListener('click', () => {
            this.seekToTime(marker.timestamp);
            this.resetHideTimer();
        });
       
        this.markersList.appendChild(div);
    }

    // Вспомогательные методы
    seekToTime(timestamp) {
        this.video.currentTime = timestamp;
        if (this.video.paused) {
            this.video.play().catch(e => console.log('Play failed:', e));
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    getTypeLabel(type) {
        const labels = {
            comment: 'Комментарий',
            question: 'Вопрос',
            idea: 'Идея',
            important: 'Важно'
        };
        return labels[type] || 'Комментарий';
    }

    likeComment(commentId) {
        const marker = this.markers.find(m => m.id == commentId);
        if (marker) {
            marker.reactions.helpful++;
            EduFlowDB.updateMarkerReactions(commentId, marker.reactions);
            this.renderComments();
            this.showNotification('Спасибо за оценку!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#0033A0';
       
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 14px 24px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 600;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            max-width: 300px;
        `;
        notification.textContent = message;
       
        document.body.appendChild(notification);
       
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Обработка горячих клавиш
    handleKeyPress(e) {
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
       
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.rewind(5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.forward(5);
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                this.video.muted = !this.video.muted;
                this.showNotification(this.video.muted ? 'Звук выключен' : 'Звук включен', 'info');
                break;
            case 'Comma':
            case 'Period':
                e.preventDefault();
                const speedChange = e.code === 'Comma' ? -0.25 : 0.25;
                const newSpeed = Math.max(0.25, Math.min(4, this.currentSpeed + speedChange));
                this.changeSpeed(newSpeed);
                this.showNotification(`Скорость: ${newSpeed}x`, 'info');
                break;
            case 'Digit0':
            case 'Numpad0':
                e.preventDefault();
                this.seekToTime(0);
                break;
            case 'Escape':
                if (this.commentModal.classList.contains('show')) {
                    this.closeCommentModal();
                } else if (document.fullscreenElement) {
                    this.toggleFullscreen();
                }
                break;
        }
    }

    // Загрузка данных
    loadDemoData() {
        // Загружаем маркеры из базы данных
        this.markers = EduFlowDB.getMarkers(1);
       
        this.renderComments();
        this.renderMarkers();
       
        // Устанавливаем демо видео
        this.video.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
       
        // Инициализация после загрузки метаданных
        this.video.addEventListener('loadedmetadata', () => {
            this.updateDuration();
            this.renderMarkers(); // Перерисовываем маркеры с актуальной длительностью
        });
    }

    // Очищаем таймеры при уничтожении
    destroy() {
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
        }
    }
}

// Глобальные функции
let videoPlayer;

function openVideoPlayer() {
    if (!videoPlayer) {
        videoPlayer = new VideoPlayer();
    }
   
    document.getElementById('videoModal').classList.add('show');
    document.body.style.overflow = 'hidden';
   
    // Фокус на видео для работы горячих клавиш
    setTimeout(() => {
        document.getElementById('mainVideo').focus();
    }, 100);
}

function closeVideoPlayer() {
    document.getElementById('videoModal').classList.remove('show');
    if (videoPlayer) {
        videoPlayer.video.pause();
        videoPlayer.hideSpeedMenu();
        videoPlayer.destroy(); // Очищаем таймеры
    }
    document.body.style.overflow = 'auto';
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    const closeVideoModal = document.getElementById('closeVideoModal');
    const closeCommentModal = document.getElementById('closeCommentModal');
   
    if (closeVideoModal) {
        closeVideoModal.addEventListener('click', closeVideoPlayer);
    }
   
    if (closeCommentModal) {
        closeCommentModal.addEventListener('click', () => {
            if (videoPlayer) {
                videoPlayer.closeCommentModal();
            }
        });
    }
   
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoPlayer();
            if (videoPlayer) {
                videoPlayer.closeCommentModal();
            }
        }
    });
   
    // Обработка полноэкранного режима
    document.addEventListener('fullscreenchange', () => {
        if (videoPlayer) {
            videoPlayer.videoWrapper.classList.toggle('fullscreen', !!document.fullscreenElement);
        }
    });
});

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
   
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
   
    .no-comments {
        text-align: center;
        padding: 40px 20px;
        color: var(--psb-gray);
    }
   
    .no-comments i {
        font-size: 3rem;
        margin-bottom: 16px;
        opacity: 0.5;
    }
   
    .no-comments p {
        margin: 0 0 8px 0;
        font-weight: 600;
    }
   
    .no-comments small {
        opacity: 0.7;
    }
   
    .video-wrapper.mobile .custom-controls {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
   
    .video-wrapper.fullscreen {
        background: #000;
    }
   
    .video-wrapper.dragging .progress-thumb {
        opacity: 1 !important;
        transform: translate(-50%, -50%) scale(1.2);
    }
`;
document.head.appendChild(style);

console.log('🎥 Усовершенствованный видео-плеер с авто-скрытием контролов загружен!');