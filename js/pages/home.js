/**
 * EduQuiz — Home Page
 * Hero section, stats, features, subject previews, daily challenge, CTA.
 */

const HomePage = (() => {
    async function render() {
        const stats = Storage.getGlobalStats();
        const dailyChallenges = Storage.getDailyChallenges();
        const streak = Storage.getStreak();
        const profile = Storage.getProfile();
        
        let leaderboard = [];
        if (typeof FirebaseDB !== 'undefined') {
            leaderboard = await FirebaseDB.getTopUsers();
        }
        const currentUser = leaderboard.find(u => u.isCurrentUser);
        const rank = currentUser ? currentUser.rank : '-';

        // Calculate hours until midnight for daily challenge timer
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        const hoursLeft = Math.floor((midnight - now) / 3600000);
        const minsLeft = Math.floor(((midnight - now) % 3600000) / 60000);

        return `
            <!-- Hero Section -->
            <div class="hero">
                <div class="hero-glow hero-glow-1"></div>
                <div class="hero-glow hero-glow-2"></div>
                <div class="hero-content">
                    <div class="hero-badge">
                        <i data-feather="activity"></i> ${streak.current > 0 ? streak.current + '-day streak!' : 'Start your streak today!'}
                    </div>
                    <h1>Master Your <span class="text-gradient">Subjects</span> with Fun Quizzes!</h1>
                    <p class="hero-tagline">
                        Practice MCQs for Maths, Science & SST for Class 6-10. 
                        Earn XP, unlock badges, climb the leaderboard, and share your scores!
                    </p>
                    <div class="hero-actions">
                        <button class="btn btn-primary btn-lg btn-glow" onclick="Router.navigate('/class')" id="hero-start-btn">
                            Start Quiz
                        </button>
                        <button class="btn btn-ghost btn-lg" onclick="Router.navigate('/leaderboard')" id="hero-leaderboard-btn">
                            <i data-feather="award"></i> Leaderboard
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Section -->
            <section class="stats-section">
                <div class="stats-grid">
                    <div class="stat-card glass-card">
                        <span class="stat-icon"><i data-feather="edit"></i></span>
                        <div class="stat-value" id="stat-quizzes">${stats.totalQuizzes}</div>
                        <div class="stat-label">Quizzes Played</div>
                    </div>
                    <div class="stat-card glass-card">
                        <span class="stat-icon"><i data-feather="award"></i></span>
                        <div class="stat-value" id="stat-rank">${rank}</div>
                        <div class="stat-label">Leaderboard Rank</div>
                    </div>
                    <div class="stat-card glass-card">
                        <span class="stat-icon"><i data-feather="help-circle"></i></span>
                        <div class="stat-value" id="stat-questions">${stats.totalQuestions}</div>
                        <div class="stat-label">Questions Answered</div>
                    </div>
                    <div class="stat-card glass-card">
                        <span class="stat-icon"><i data-feather="target"></i></span>
                        <div class="stat-value">${stats.avgAccuracy}%</div>
                        <div class="stat-label">Avg. Accuracy</div>
                    </div>
                </div>
            </section>

            <!-- Daily Challenge -->
            <section class="daily-challenge">
                <div class="section-header" style="margin-bottom: 1rem;">
                    <h2><i data-feather="target"></i> Daily Challenges</h2>
                    <p>Complete these challenges to earn extra XP!</p>
                </div>
                <div class="daily-challenges-list" style="display: flex; flex-direction: column; gap: 1rem;">
                    ${dailyChallenges.map(challenge => {
                        const progressPercent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
                        return `
                        <div class="challenge-card glass-card-static" style="display: flex; flex-direction: column; gap: 0.5rem; padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div>
                                    <h3 style="margin-bottom: 0.25rem;">${challenge.title}</h3>
                                    <div class="challenge-timer" style="font-size: 0.8rem; color: var(--text-muted);">⏰ Resets in ${hoursLeft}h ${minsLeft}m</div>
                                </div>
                                <div class="badge badge-primary" style="font-size: 0.8rem;">
                                    +${challenge.xpReward} XP
                                </div>
                            </div>
                            
                            <div style="margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                                    <span>Progress</span>
                                    <span>${challenge.progress} / ${challenge.target}</span>
                                </div>
                                <div class="progress-bar-bg" style="height: 8px; background: var(--bg-card-hover); border-radius: 4px; overflow: hidden;">
                                    <div class="progress-bar-fill" style="height: 100%; width: ${progressPercent}%; background: var(--primary); transition: width 0.3s ease;"></div>
                                </div>
                            </div>
                            
                            <div style="margin-top: 0.5rem; text-align: right;">
                                ${challenge.completed
                                    ? `<div class="badge badge-success"><i data-feather="check-circle"></i> Completed</div>`
                                    : `<button class="btn btn-primary btn-sm" onclick="Router.navigate('/class')" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
                                        Play Now
                                      </button>`
                                }
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </section>


            <!-- Features Section -->
            <section class="features-section">
                <div class="section-header">
                    <h2>Why Students <span class="text-gradient">Love Us</span></h2>
                    <p>Features that make learning addictive</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card glass-card">
                        <span class="feature-icon">XP</span>
                        <h4 class="feature-title">Instant Feedback</h4>
                        <p class="feature-desc">Get immediate results after every answer with detailed explanations</p>
                    </div>
                    <div class="feature-card glass-card">
                        <span class="feature-icon"><i data-feather="award"></i></span>
                        <h4 class="feature-title">Earn & Compete</h4>
                        <p class="feature-desc">Collect XP, unlock badges, and compete on the leaderboard</p>
                    </div>
                    <div class="feature-card glass-card">
                        <span class="feature-icon"><i data-feather="bar-chart-2"></i></span>
                        <h4 class="feature-title">Track Progress</h4>
                        <p class="feature-desc">Monitor your accuracy, streaks, and improvement over time</p>
                    </div>
                    <div class="feature-card glass-card">
                        <span class="feature-icon"><i data-feather="smartphone"></i></span>
                        <h4 class="feature-title">Mobile Friendly</h4>
                        <p class="feature-desc">Practice anytime, anywhere on any device</p>
                    </div>
                    <div class="feature-card glass-card">
                        <span class="feature-icon"><i data-feather="target"></i></span>
                        <h4 class="feature-title">NCERT Aligned</h4>
                        <p class="feature-desc">Questions based on NCERT/CBSE curriculum for Class 6-10</p>
                    </div>
                    <div class="feature-card glass-card">
                        <span class="feature-icon"><i data-feather="refresh-cw"></i></span>
                        <h4 class="feature-title">Unlimited Practice</h4>
                        <p class="feature-desc">Randomized quizzes mean a new experience every time</p>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="cta-section">
                <div class="cta-card glass-card-static">
                    <h2>Ready to <span class="text-gradient">Begin</span>?</h2>
                    <p>Join thousands of students mastering their subjects every day</p>
                    <button class="btn btn-primary btn-lg btn-glow" onclick="Router.navigate('/class')" id="cta-start-btn">
                        Start Your Journey
                    </button>
                </div>
            </section>

            <!-- Ad Slot: In-Content -->
            <div class="ad-slot ad-in-content" id="ad-home-content" aria-hidden="true"></div>
        `;
    }

    function init() {
        // Animate stat counters
        const stats = Storage.getGlobalStats();
        const rankElement = document.getElementById('stat-rank');
        const rank = (rankElement && rankElement.textContent !== '-') ? parseInt(rankElement.textContent) : 0;

        setTimeout(() => {
            UIUtils.animateCounter(document.getElementById('stat-quizzes'), 0, stats.totalQuizzes, 1200);
            if (rank > 0) {
                UIUtils.animateCounter(document.getElementById('stat-rank'), 0, rank, 1200);
            }
            UIUtils.animateCounter(document.getElementById('stat-questions'), 0, stats.totalQuestions, 1200);
        }, 300);
    }

    // Register route
    Router.register('/home', {
        render,
        init,
        title: 'Home',
    });

    return { render, init };
})();
