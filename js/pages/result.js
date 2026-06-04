/**
 * EduQuiz — Result Page
 * Score display, stats, XP earned, badges, sharing, and next actions.
 */

const ResultPage = (() => {
    function render(params) {
        // Get result from sessionStorage
        const raw = sessionStorage.getItem('mm_last_result');
        if (!raw) {
            return `
                <div class="result-page">
                    <h2>No results found</h2>
                    <p class="text-secondary" style="margin: 1rem 0;">Take a quiz to see your results here.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/class')">Start a Quiz</button>
                </div>
            `;
        }

        const result = JSON.parse(raw);
        const subjectMeta = UIUtils.getSubjectMeta(result.subject);

        // Determine performance tier
        let emoji, title, message;
        if (result.percentage >= 90) {
            emoji = '<i data-feather="award"></i>';
            title = 'Outstanding!';
            message = 'You absolutely crushed it! You have excellent command over this subject. Keep up the amazing work!';
        } else if (result.percentage >= 70) {
            emoji = '<i data-feather="star"></i>';
            title = 'Great Job!';
            message = 'Solid performance! You have a good understanding of the topic. A bit more practice and you\'ll be perfect!';
        } else if (result.percentage >= 50) {
            emoji = '<i data-feather="thumbs-up"></i>';
            title = 'Good Effort!';
            message = 'You\'re getting there! Focus on the questions you got wrong and review the explanations.';
        } else {
            emoji = '<i data-feather="book"></i>';
            title = 'Keep Practicing!';
            message = 'Don\'t worry, every expert was once a beginner. Review the chapter and try again — you\'ll improve!';
        }

        // Score circle SVG values
        const circumference = 2 * Math.PI * 85;
        const offset = circumference - (result.percentage / 100) * circumference;
        const scoreColor = result.percentage >= 80 ? '#00b894'
            : result.percentage >= 50 ? '#fdcb6e' : '#ff6b6b';

        // Badges HTML
        const badgesHTML = result.newBadges && result.newBadges.length > 0
            ? `
                <div class="badges-earned">
                    <h3><i data-feather="award"></i>️ Badges Earned!</h3>
                    <div class="badges-grid">
                        ${result.newBadges.map((b) => `
                            <div class="badge-item">
                                <span class="badge-icon">${b.emoji}</span>
                                <span class="badge-name">${b.name}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
              `
            : '';

        return `
            <div class="result-page">
                <!-- Header -->
                <div class="result-header">
                    <span class="result-emoji">${emoji}</span>
                    <h1 class="result-title">${title}</h1>
                    <p class="result-subtitle">${subjectMeta.emoji} Class ${result.classNum} ${subjectMeta.name} Quiz</p>
                </div>

                <!-- Score Circle -->
                <div class="score-circle-container">
                    <div class="score-circle">
                        <svg viewBox="0 0 200 200">
                            <circle class="score-circle-bg" cx="100" cy="100" r="85" />
                            <circle class="score-circle-fill" cx="100" cy="100" r="85"
                                    stroke="${scoreColor}"
                                    stroke-dasharray="${circumference}"
                                    stroke-dashoffset="${circumference}"
                                    id="score-circle-fill" />
                        </svg>
                        <div class="score-circle-text">
                            <span class="score-percentage" id="score-pct" style="color: ${scoreColor}">0%</span>
                            <span class="score-label">${result.correct}/${result.total} correct</span>
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="result-stats">
                    <div class="result-stat correct glass-card">
                        <div class="result-stat-value" id="stat-correct">0</div>
                        <div class="result-stat-label">Correct</div>
                    </div>
                    <div class="result-stat wrong glass-card">
                        <div class="result-stat-value" id="stat-wrong">0</div>
                        <div class="result-stat-label">Wrong</div>
                    </div>
                    <div class="result-stat skipped glass-card">
                        <div class="result-stat-value" id="stat-skipped">0</div>
                        <div class="result-stat-label">Skipped</div>
                    </div>
                    <div class="result-stat score glass-card">
                        <div class="result-stat-value">${UIUtils.formatTime(result.timeTaken)}</div>
                        <div class="result-stat-label">Time</div>
                    </div>
                </div>

                <!-- XP Earned -->
                <div class="xp-earned-section">
                    <div class="xp-earned-title">XP XP Earned</div>
                    <div class="xp-earned-value" id="xp-earned">+0</div>
                    ${result.leveledUp
                        ? `<div style="margin-top: 8px; font-size: var(--fs-sm); color: var(--success-light);">
                                Level Up! ${result.newLevel.emoji} ${result.newLevel.name}
                           </div>`
                        : ''
                    }
                </div>

                <!-- Performance Message -->
                <div class="performance-message glass-card-static">
                    <h3>${emoji} ${title}</h3>
                    <p>${message}</p>
                </div>

                <!-- Badges -->
                ${badgesHTML}

                <!-- Share Section -->
                <div class="share-section">
                    <h3><i data-feather="share"></i> Share Your Score</h3>
                    <div class="share-buttons">
                        <button class="share-btn copy-link" onclick="ResultPage.copyLink()" id="share-copy">
                            <i data-feather="clipboard"></i> Copy Text
                        </button>
                        <button class="share-btn download" onclick="ResultPage.downloadCard()" id="share-download">
                            <i data-feather="download"></i> Download Card
                        </button>
                    </div>
                </div>

                <!-- Actions -->
                <div class="result-actions">
                    <button class="btn btn-primary" onclick="Router.navigate('/quiz/class${result.classNum}/${result.subject}')" id="retry-btn">
                        <i data-feather="refresh-cw"></i> Retry Quiz
                    </button>
                    <button class="btn btn-secondary" onclick="Router.navigate('/subjects/class${result.classNum}')" id="next-quiz-btn">
                        <i data-feather="edit"></i> Next Quiz
                    </button>
                    <button class="btn btn-ghost" onclick="Router.navigate('/home')" id="go-home-btn">
                        <i data-feather="home"></i> Home
                    </button>
                </div>
            </div>
        `;
    }

    function init() {
        const raw = sessionStorage.getItem('mm_last_result');
        if (!raw) return;
        const result = JSON.parse(raw);

        // Animate score circle
        setTimeout(() => {
            const circle = document.getElementById('score-circle-fill');
            if (circle) {
                const circumference = 2 * Math.PI * 85;
                const offset = circumference - (result.percentage / 100) * circumference;
                circle.style.strokeDashoffset = offset;
            }
        }, 300);

        // Animate percentage counter
        setTimeout(() => {
            const pctEl = document.getElementById('score-pct');
            if (pctEl) {
                UIUtils.animateCounter(pctEl, 0, result.percentage, 1500);
                // Append % symbol
                const originalUpdate = () => {
                    if (pctEl.textContent && !pctEl.textContent.includes('%')) {
                        pctEl.textContent += '%';
                    }
                };
                setTimeout(originalUpdate, 1600);
            }
        }, 500);

        // Animate stat counters
        setTimeout(() => {
            UIUtils.animateCounter(document.getElementById('stat-correct'), 0, result.correct, 1000);
            UIUtils.animateCounter(document.getElementById('stat-wrong'), 0, result.wrong, 1000);
            UIUtils.animateCounter(document.getElementById('stat-skipped'), 0, result.skipped, 1000);
        }, 700);

        // Animate XP
        setTimeout(() => {
            const xpEl = document.getElementById('xp-earned');
            if (xpEl) {
                let current = 0;
                const target = result.xpEarned;
                const step = Math.ceil(target / 30);
                const interval = setInterval(() => {
                    current = Math.min(current + step, target);
                    xpEl.textContent = `+${current}`;
                    if (current >= target) clearInterval(interval);
                }, 30);
            }
        }, 1000);

        // Fire confetti for high scores
        if (result.percentage >= 80) {
            setTimeout(() => UIUtils.fireConfetti(4000), 500);
        }
    }

    // Share functions
    function getResult() {
        const raw = sessionStorage.getItem('mm_last_result');
        return raw ? JSON.parse(raw) : null;
    }

    function copyLink() {
        const result = getResult();
        if (result) Share.copyToClipboard(result);
    }

    function downloadCard() {
        const result = getResult();
        if (result) Share.downloadScoreCard(result);
    }

    // Register route
    Router.register('/result/:classNum/:subject', {
        render,
        init,
        title: 'Results',
    });

    return {
        copyLink,
        downloadCard,
    };
})();
