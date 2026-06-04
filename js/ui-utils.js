/**
 * EduQuiz — UI Utilities Module
 * Handles particles, confetti, sounds (Web Audio API), toasts,
 * counter animations, ripple effects, and motivational messages.
 */

const UIUtils = (() => {
    // ── Audio Context (Web Audio API) ──
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    /**
     * Play a synthesized sound effect using Web Audio API.
     * No external files needed.
     */
    function playSound(type) {
        const settings = Storage.getSettings();
        if (!settings.soundEnabled) return;

        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case 'correct':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(523.25, now); // C5
                    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                    break;

                case 'wrong':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.setValueAtTime(150, now + 0.15);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    osc.start(now);
                    osc.stop(now + 0.3);
                    break;

                case 'click':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.start(now);
                    osc.stop(now + 0.08);
                    break;

                case 'levelup':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.setValueAtTime(554.37, now + 0.12);
                    osc.frequency.setValueAtTime(659.25, now + 0.24);
                    osc.frequency.setValueAtTime(880, now + 0.36);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
                    osc.start(now);
                    osc.stop(now + 0.6);
                    break;

                case 'badge':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.setValueAtTime(800, now + 0.1);
                    osc.frequency.setValueAtTime(1000, now + 0.2);
                    osc.frequency.setValueAtTime(1200, now + 0.3);
                    gain.gain.setValueAtTime(0.25, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                    osc.start(now);
                    osc.stop(now + 0.5);
                    break;

                case 'complete':
                    osc.type = 'sine';
                    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
                        osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    });
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
                    osc.start(now);
                    osc.stop(now + 0.7);
                    break;

                default:
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    gain.gain.setValueAtTime(0.1, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
            }
        } catch (e) {
            // Silently fail if audio is not supported
        }
    }

    // ── Particle Background ──

    let particlesRunning = false;
    let particlesAnimFrame = null;

    function initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas || particlesRunning) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let w, h;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        // Create particles
        const count = Math.min(60, Math.floor(w * h / 15000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                r: Math.random() * 2 + 1,
                alpha: Math.random() * 0.3 + 0.1,
                color: ['#6c5ce7', '#00cec9', '#a29bfe', '#55efc4', '#fdcb6e'][
                    Math.floor(Math.random() * 5)
                ],
            });
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();
            });

            // Draw connections between nearby particles
            ctx.globalAlpha = 0.05;
            ctx.strokeStyle = '#6c5ce7';
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.globalAlpha = 0.05 * (1 - dist / 150);
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            ctx.globalAlpha = 1;
            particlesAnimFrame = requestAnimationFrame(draw);
        }

        particlesRunning = true;
        draw();
    }

    function stopParticles() {
        if (particlesAnimFrame) {
            cancelAnimationFrame(particlesAnimFrame);
            particlesRunning = false;
        }
    }

    // ── Confetti ──

    function fireConfetti(duration = 3000) {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const confettiPieces = [];
        const colors = ['#6c5ce7', '#00cec9', '#ff6b6b', '#fdcb6e', '#55efc4', '#a29bfe', '#ff9ff3', '#ffeaa7'];
        const shapes = ['rect', 'circle'];

        // Create confetti pieces
        for (let i = 0; i < 150; i++) {
            confettiPieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: shapes[Math.floor(Math.random() * shapes.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                alpha: 1,
            });
        }

        const startTime = Date.now();

        function drawConfetti() {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Fade out in last 1s
            const fadeFactor = elapsed > duration - 1000
                ? 1 - (elapsed - (duration - 1000)) / 1000
                : 1;

            confettiPieces.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // gravity
                p.rotation += p.rotationSpeed;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.alpha * fadeFactor;
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            requestAnimationFrame(drawConfetti);
        }

        playSound('complete');
        drawConfetti();
    }

    // ── Toast Notifications ──

    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const icons = {
            success: '<i data-feather="check-circle"></i>',
            error: '<i data-feather="x-circle"></i>',
            warning: '<i data-feather="alert-triangle"></i>️',
            info: '<i data-feather="info"></i>',
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);
        if (window.feather) feather.replace();

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ── Animate Counter ──

    function animateCounter(element, from, to, duration = 1000) {
        if (!element) return;
        const start = performance.now();
        const diff = to - from;

        function update(time) {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + diff * eased);
            element.textContent = current;
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ── Ripple Effect ──

    function addRipple(event) {
        const btn = event.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', x + '%');
        btn.style.setProperty('--ripple-y', y + '%');
    }

    // ── Motivational Messages ──

    const MOTIVATIONAL = {
        correct: [
            ' Excellent!',
            '<i data-feather="activity"></i> Brilliant!',
            '<i data-feather="star"></i> Amazing!',
            '<i data-feather="thumbs-up"></i> Great job!',
            '<i data-feather="award"></i> Outstanding!',
            '<i data-feather="star"></i> Superb!',
            '<i data-feather="star"></i> You nailed it!',
            '<i data-feather="target"></i> Perfect!',
            '<i data-feather="check-circle"></i> Spot on!',
            'Pro Unstoppable!',
        ],
        wrong: [
            '<i data-feather="book"></i> Keep practicing!',
            '<i data-feather="zap"></i> Almost there!',
            '<i data-feather="refresh-cw"></i> Try again next time!',
            '<i data-feather="book-open"></i> Review this topic!',
            '<i data-feather="help-circle"></i> Good attempt!',
            '<i data-feather="thumbs-up"></i> Don\'t give up!',
            '<i data-feather="target"></i> You\'ll get it next time!',
            '<i data-feather="edit"></i> Note this down!',
        ],
        highScore: [
            '<i data-feather="award"></i> You\'re a genius!',
            '<i data-feather="star"></i> Top performer!',
            '<i data-feather="activity"></i> Incredible score!',
            '<i data-feather="hexagon"></i> Diamond performance!',
        ],
        lowScore: [
            '<i data-feather="book"></i> Time to revise!',
            '<i data-feather="thumbs-up"></i> Keep pushing!',
            '<i data-feather="refresh-cw"></i> Practice makes perfect!',
            '<i data-feather="book-open"></i> Review the chapter!',
        ],
        mediumScore: [
            '<i data-feather="thumbs-up"></i> Good effort!',
            '<i data-feather="trending-up"></i> Getting better!',
            '<i data-feather="star"></i> Nice progress!',
            '<i data-feather="zap"></i> Almost there!',
        ],
    };

    function getMotivation(type) {
        const messages = MOTIVATIONAL[type] || MOTIVATIONAL.correct;
        return messages[Math.floor(Math.random() * messages.length)];
    }

    function getPerformanceMessage(percentage) {
        if (percentage >= 90) return getMotivation('highScore');
        if (percentage >= 60) return getMotivation('mediumScore');
        return getMotivation('lowScore');
    }

    // ── Format Time ──

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ── Format Date ──

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    // ── Shuffle Array (Fisher-Yates) ──

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ── Subject Helpers ──

    const SUBJECT_META = {
        maths: { emoji: '<i data-feather="pen-tool"></i>', name: 'Mathematics', color: 'var(--maths-color)' },
        science: { emoji: '<i data-feather="search"></i>', name: 'Science', color: 'var(--science-color)' },
        sst: { emoji: '<i data-feather="globe"></i>', name: 'Social Science', color: 'var(--sst-color)' },
    };

    const CLASS_META = {
        6: { gradient: 'var(--class6-gradient)', color: '#ff6b6b' },
        7: { gradient: 'var(--class7-gradient)', color: '#fdcb6e' },
        8: { gradient: 'var(--class8-gradient)', color: '#55efc4' },
        9: { gradient: 'var(--class9-gradient)', color: '#74b9ff' },
        10: { gradient: 'var(--class10-gradient)', color: '#a29bfe' },
    };

    function getSubjectMeta(subject) {
        return SUBJECT_META[subject] || SUBJECT_META.maths;
    }

    function getClassMeta(classNum) {
        return CLASS_META[classNum] || CLASS_META[8];
    }

    // ── Avatar Helper ──
    function renderAvatar(avatarStr) {
        if (!avatarStr) return '👤';
        if (avatarStr.startsWith('http')) {
            return `<img src="${avatarStr}" alt="Avatar" referrerpolicy="no-referrer" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
        }
        return avatarStr;
    }

    // ── Public API ──
    return {
        playSound,
        initParticles,
        stopParticles,
        fireConfetti,
        showToast,
        animateCounter,
        addRipple,
        getMotivation,
        getPerformanceMessage,
        formatTime,
        formatDate,
        shuffleArray,
        getSubjectMeta,
        getClassMeta,
        renderAvatar,
        SUBJECT_META,
        CLASS_META,
    };
})();
