// Student Report Generator - Main JavaScript
// Author: Priyank
// Created: 2024

class StudentReportApp {
    constructor() {
        this.currentFileId = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursor = null;
        this.cursorFollower = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFileUpload();
        this.setupThemeToggle();
        this.setupAnimations();
        this.createSubtleCursor();
        this.setupMouseTracking();
        this.createParticleSystem();
    }

    setupEventListeners() {
        const uploadForm = document.getElementById('uploadForm');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleFileUpload(e));
        }

        const downloadAllBtn = document.getElementById('downloadAllBtn');
        if (downloadAllBtn) {
            downloadAllBtn.addEventListener('click', () => this.downloadAllReports());
        }

        const viewReportsBtn = document.getElementById('viewReportsBtn');
        if (viewReportsBtn) {
            viewReportsBtn.addEventListener('click', () => this.viewReports());
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.validateFile(e));
            this.setupDragAndDrop(fileInput);
        }
    }

    setupDragAndDrop(fileInput) {
        const uploadWrapper = fileInput.closest('.file-upload-wrapper');
        if (!uploadWrapper) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadWrapper.addEventListener(eventName, () => {
                uploadWrapper.classList.remove('drag-over');
            }, false);
        });

        uploadWrapper.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                this.validateFile({ target: fileInput });
            }
        }, false);
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    validateFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const maxSize = 16 * 1024 * 1024; // 16MB

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls)$/i)) {
            this.showAlert('Please select a valid CSV or Excel file.', 'danger');
            event.target.value = '';
            return false;
        }

        if (file.size > maxSize) {
            this.showAlert('File size must be less than 16MB.', 'danger');
            event.target.value = '';
            return false;
        }

        this.showAlert(`File "${file.name}" selected successfully!`, 'success');
        return true;
    }

    async handleFileUpload(event) {
        event.preventDefault();
        
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showAlert('Please select a file first.', 'warning');
            return;
        }

        this.showProgress();
        this.updateProgress(10, 'Uploading file...');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                this.updateProgress(50, 'File uploaded successfully! Generating reports...');
                this.currentFileId = result.file_id;
                
                document.getElementById('fileName').textContent = result.filename;
                document.getElementById('studentCount').textContent = result.student_count;

                await this.generateReports(result.file_id);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            this.hideProgress();
            this.showAlert(`Upload failed: ${error.message}`, 'danger');
        }
    }

    async generateReports(fileId) {
        try {
            this.updateProgress(70, 'Processing student data...');
            
            const response = await fetch(`/generate/${fileId}`);
            const result = await response.json();

            if (response.ok) {
                this.updateProgress(100, 'Reports generated successfully!');
                
                document.getElementById('reportCount').textContent = result.generated_count;
                
                setTimeout(() => {
                    this.showResults();
                }, 1000);
            } else {
                throw new Error(result.error || 'Report generation failed');
            }
        } catch (error) {
            this.hideProgress();
            this.showAlert(`Report generation failed: ${error.message}`, 'danger');
        }
    }

    showProgress() {
        const progressCard = document.getElementById('progressCard');
        const resultsCard = document.getElementById('resultsCard');

        if (progressCard) {
            progressCard.style.display = 'block';
            progressCard.classList.add('slide-up');

            // Add glowing effect to progress card
            setTimeout(() => {
                progressCard.classList.add('glow');
            }, 500);
        }

        if (resultsCard) {
            resultsCard.style.display = 'none';
        }

        // Start progress animation
        this.startProgressAnimation();
    }

    updateProgress(percentage, message) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressMessage = document.getElementById('progressMessage');

        if (progressBar) {
            // Animate progress bar with easing
            this.animateProgressBar(progressBar, percentage);
            progressBar.setAttribute('aria-valuenow', percentage);
        }

        if (progressText) {
            this.animateCounter(progressText, percentage);
        }

        if (progressMessage) {
            this.typewriterEffect(progressMessage, message);
        }
    }

    animateProgressBar(progressBar, targetPercentage) {
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        const increment = (targetPercentage - currentWidth) / 20;
        let currentPercentage = currentWidth;

        const animate = () => {
            currentPercentage += increment;
            if (currentPercentage >= targetPercentage) {
                currentPercentage = targetPercentage;
                progressBar.style.width = `${currentPercentage}%`;
                return;
            }

            progressBar.style.width = `${currentPercentage}%`;
            requestAnimationFrame(animate);
        };

        animate();
    }

    animateCounter(element, targetNumber) {
        const currentNumber = parseInt(element.textContent) || 0;
        const increment = (targetNumber - currentNumber) / 20;
        let currentCount = currentNumber;

        const animate = () => {
            currentCount += increment;
            if (currentCount >= targetNumber) {
                element.textContent = `${targetNumber}%`;
                return;
            }

            element.textContent = `${Math.round(currentCount)}%`;
            requestAnimationFrame(animate);
        };

        animate();
    }

    typewriterEffect(element, text) {
        element.textContent = '';
        let i = 0;

        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        typeWriter();
    }

    startProgressAnimation() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.classList.add('progress-bar-animated');
        }
    }

    hideProgress() {
        const progressCard = document.getElementById('progressCard');
        if (progressCard) {
            progressCard.style.display = 'none';
        }
    }

    showResults() {
        const progressCard = document.getElementById('progressCard');
        const resultsCard = document.getElementById('resultsCard');

        if (progressCard) {
            // Fade out progress card with animation
            progressCard.classList.add('fade-out');
            setTimeout(() => {
                progressCard.style.display = 'none';
                progressCard.classList.remove('glow', 'fade-out');
            }, 500);
        }

        if (resultsCard) {
            setTimeout(() => {
                resultsCard.style.display = 'block';
                resultsCard.classList.add('bounce-in');

                // Animate result numbers
                this.animateResultNumbers();

                // Add celebration effect
                this.createCelebrationEffect();
            }, 600);
        }
    }

    animateResultNumbers() {
        const studentCount = document.getElementById('studentCount');
        const reportCount = document.getElementById('reportCount');

        if (studentCount) {
            const count = parseInt(studentCount.textContent);
            this.animateCounter(studentCount, count);
        }

        if (reportCount) {
            const count = parseInt(reportCount.textContent);
            this.animateCounter(reportCount, count);
        }
    }

    createCelebrationEffect() {
        // Create confetti-like effect
        const resultsCard = document.getElementById('resultsCard');
        if (!resultsCard) return;

        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createConfetti(resultsCard);
            }, i * 100);
        }
    }

    createConfetti(container) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: absolute;
            width: 8px;
            height: 8px;
            background: hsl(${Math.random() * 360}, 70%, 60%);
            left: ${Math.random() * 100}%;
            top: 0;
            border-radius: 50%;
            pointer-events: none;
            z-index: 1000;
            animation: confettiFall 2s ease-out forwards;
        `;

        container.style.position = 'relative';
        container.appendChild(confetti);

        setTimeout(() => confetti.remove(), 2000);
    }

    downloadAllReports() {
        if (this.currentFileId) {
            window.location.href = `/download/${this.currentFileId}`;
        }
    }

    viewReports() {
        if (this.currentFileId) {
            window.location.href = `/reports/${this.currentFileId}`;
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const body = document.body;
                
                if (body.classList.contains('light-theme')) {
                    body.classList.remove('light-theme');
                    themeIcon.className = 'fas fa-moon';
                    localStorage.setItem('theme', 'dark');
                } else {
                    body.classList.add('light-theme');
                    themeIcon.className = 'fas fa-sun';
                    localStorage.setItem('theme', 'light');
                }
            });
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeIcon) themeIcon.className = 'fas fa-sun';
        }
    }

    setupAnimations() {
        // Enhanced intersection observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;

                    if (element.classList.contains('feature-card')) {
                        element.classList.add('bounce-in');
                    } else if (element.classList.contains('card')) {
                        element.classList.add('slide-up');
                    } else {
                        element.classList.add('fade-in');
                    }

                    // Add staggered animation delay
                    const index = Array.from(element.parentNode.children).indexOf(element);
                    element.style.animationDelay = (index * 0.1) + 's';
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        document.querySelectorAll('.card, .feature-card, .btn, .alert').forEach(el => {
            observer.observe(el);
        });

        // Animate elements on page load
        this.animateOnLoad();
    }

    animateOnLoad() {
        // Animate hero section elements
        const heroTitle = document.querySelector('.hero-section h1');
        const heroLead = document.querySelector('.hero-section .lead');

        if (heroTitle) {
            setTimeout(() => heroTitle.classList.add('slide-in-left'), 200);
        }

        if (heroLead) {
            setTimeout(() => heroLead.classList.add('slide-in-right'), 400);
        }
    }

    createSubtleCursor() {
        // Create subtle cursor effect
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        document.body.appendChild(this.cursor);

        this.cursorFollower = document.createElement('div');
        this.cursorFollower.className = 'cursor-follower';
        document.body.appendChild(this.cursorFollower);

        this.startCursorAnimation();
        this.setupCursorEvents();
    }

    setupCursorEvents() {
        // Hover events for interactive elements
        const interactiveElements = document.querySelectorAll('button, a, .card, .feature-card, input, .btn');

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.cursor.classList.add('hover');
                this.cursorFollower.classList.add('hover');
            });

            element.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('hover');
                this.cursorFollower.classList.remove('hover');
            });
        });
    }

    startCursorAnimation() {
        let cursorX = 0, cursorY = 0;
        let followerX = 0, followerY = 0;

        const animateCursor = () => {
            // Smooth cursor movement
            cursorX += (this.mouseX - cursorX) * 0.9;
            cursorY += (this.mouseY - cursorY) * 0.9;

            // Slower follower movement
            followerX += (this.mouseX - followerX) * 0.1;
            followerY += (this.mouseY - followerY) * 0.1;

            if (this.cursor) {
                this.cursor.style.left = cursorX + 'px';
                this.cursor.style.top = cursorY + 'px';
            }

            if (this.cursorFollower) {
                this.cursorFollower.style.left = followerX + 'px';
                this.cursorFollower.style.top = followerY + 'px';
            }

            requestAnimationFrame(animateCursor);
        };

        animateCursor();
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateMousePosition(e.clientX, e.clientY);
        });
    }

    updateMousePosition(x, y) {
        // Enhanced magnetic effects for elements
        const magneticElements = document.querySelectorAll('.card, .btn, .feature-card');

        magneticElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (x - centerX) / rect.width;
            const deltaY = (y - centerY) / rect.height;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance < 0.6) {
                const strength = (0.6 - distance) / 0.6;
                const moveX = deltaX * strength * 10;
                const moveY = deltaY * strength * 10;
                const rotateX = -deltaY * strength * 5;
                const rotateY = deltaX * strength * 5;

                element.style.transform = `
                    translate(${moveX}px, ${moveY}px)
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale(${1 + strength * 0.02})
                `;

                // Add subtle glow effect
                element.style.boxShadow = `
                    0 ${8 + strength * 15}px ${25 + strength * 20}px rgba(0, 0, 0, 0.3),
                    0 0 ${15 + strength * 25}px rgba(0, 212, 255, ${0.2 + strength * 0.3})
                `;
            } else {
                element.style.transform = '';
                element.style.boxShadow = '';
            }
        });
    }

    createParticleSystem() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
        `;
        heroSection.appendChild(particlesContainer);

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            this.createParticle(particlesContainer);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            animation: particleFloat ${10 + Math.random() * 10}s infinite linear;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 10}s;
        `;

        container.appendChild(particle);
    }

    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('main .container, main .container-fluid');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    new StudentReportApp();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
