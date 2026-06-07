/**
 * EduQuiz — Profile Page
 * User profile, stats, streak calendar, badges, quiz history, and settings.
 */

const ProfilePage = (() => {
    async function render() {
        const profile = Storage.getProfile();
        const streak = Storage.getStreak();
        const history = Storage.getHistory().slice(0, 10); // Last 10
        const allBadges = Gamification.getAllBadges();
        const settings = Storage.getSettings();
        const level = Gamification.getLevelFromXP(profile.xp);
        const nextLevelXP = Gamification.getNextLevelXP(profile.xp);
        const levelProgress = Gamification.getLevelProgress(profile.xp);

        const accuracy = profile.totalQuestions > 0
            ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
            : 0;

        let leaderboardMsg = '';
        if (typeof FirebaseDB !== 'undefined') {
            const leaderboard = await FirebaseDB.getTopUsers();
            const myEntry = leaderboard.find(u => u.isCurrentUser);
            
            if (myEntry) {
                if (myEntry.rank === 1) {
                    leaderboardMsg = `<div style="color: var(--warning); margin-top: 12px; font-size: 0.9rem; font-weight: 600;">🏆 You are #1 on the leaderboard!</div>`;
                } else {
                    const rank1XP = leaderboard[0].xp;
                    const xpNeeded = rank1XP - profile.xp;
                    leaderboardMsg = `<div style="color: var(--success); margin-top: 12px; font-size: 0.9rem; font-weight: 600;">🌟 You are #${myEntry.rank}! Earn ${xpNeeded} more XP for 1st place.</div>`;
                }
            } else {
                if (leaderboard.length === 10) {
                    const lowestXP = leaderboard[9].xp;
                    const xpNeeded = lowestXP - profile.xp + 1;
                    leaderboardMsg = `<div style="color: var(--primary); margin-top: 12px; font-size: 0.9rem; font-weight: 600;">🎯 Earn ${xpNeeded > 0 ? xpNeeded : 1} more XP to enter the Top 10 Leaderboard!</div>`;
                } else {
                    leaderboardMsg = `<div style="color: var(--primary); margin-top: 12px; font-size: 0.9rem; font-weight: 600;">🎯 Play a quiz to enter the Leaderboard!</div>`;
                }
            }
        }

        // Generate last 14 days for streak calendar
        const today = new Date();
        const calendarDays = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en', { weekday: 'short' }).charAt(0);
            calendarDays.push({
                date: dateStr,
                day: d.getDate(),
                dayName,
                active: streak.history.includes(dateStr),
                isToday: i === 0,
            });
        }

        const historyHTML = history.length > 0
            ? history.map((h) => {
                const subjectMeta = UIUtils.getSubjectMeta(h.subject);
                const pctColor = h.percentage >= 80 ? 'var(--success-light)'
                    : h.percentage >= 50 ? 'var(--warning)' : 'var(--error-light)';
                return `
                    <div class="history-item">
                        <span class="history-subject">${subjectMeta.emoji}</span>
                        <div class="history-info">
                            <div class="history-title">Class ${h.classNum} ${subjectMeta.name}</div>
                            <div class="history-date">${UIUtils.formatDate(h.date)}</div>
                        </div>
                        <div class="history-score">
                            <div class="history-percentage" style="color: ${pctColor}">${h.percentage}%</div>
                            <div class="history-detail">${h.correct}/${h.total} correct</div>
                        </div>
                    </div>
                `;
            }).join('')
            : '<p class="text-secondary text-center" style="padding: var(--space-xl);">No quizzes taken yet. Start your first quiz! ( After Logout It is Remove Recent Quiz )</p>';

        return `
            <div class="profile-page">
                <!-- Profile Header -->
                <div class="profile-header glass-card-static">
                    <span class="profile-avatar">${UIUtils.renderAvatar(profile.avatar)}</span>
                    <h1 class="profile-name">${profile.username || 'Student'}</h1>
                    <div class="profile-level">${level.emoji} Level ${level.level} — ${level.name}</div>
                    <div class="profile-xp-bar">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${levelProgress}%"></div>
                        </div>
                        <div class="profile-xp-text">
                            ${profile.xp} / ${nextLevelXP || 'MAX'} XP
                        </div>
                    </div>
                    ${leaderboardMsg}
                </div>

                <!-- Stats Grid -->
                <div class="profile-stats">
                    <div class="profile-stat glass-card">
                        <div class="profile-stat-value">${profile.xp}</div>
                        <div class="profile-stat-label">Lifetime XP</div>
                    </div>
                    <div class="profile-stat glass-card">
                        <div class="profile-stat-value">${profile.totalQuizzes}</div>
                        <div class="profile-stat-label">Quizzes</div>
                    </div>
                    <div class="profile-stat glass-card">
                        <div class="profile-stat-value">${accuracy}%</div>
                        <div class="profile-stat-label">Accuracy</div>
                    </div>
                    <div class="profile-stat glass-card">
                        <div class="profile-stat-value">${profile.badges.length}</div>
                        <div class="profile-stat-label">Badges</div>
                    </div>
                </div>

                <!-- Streak Section -->
                <div class="streak-section glass-card-static">
                    <div class="streak-header">
                        <h3><i data-feather="activity"></i> Daily Streak</h3>
                        <div class="streak-counter">
                            <i data-feather="activity"></i> ${streak.current} ${streak.current === 1 ? 'day' : 'days'}
                        </div>
                    </div>
                    <div class="streak-calendar">
                        ${calendarDays.map((d) => `
                            <div class="streak-day ${d.active ? 'active' : ''} ${d.isToday ? 'today' : ''}"
                                 title="${d.date}">
                                ${d.day}
                            </div>
                        `).join('')}
                    </div>
                    <div style="text-align: center; margin-top: var(--space-md);">
                        <span class="text-muted" style="font-size: var(--fs-xs);">
                            Longest streak: ${streak.longest} days
                        </span>
                    </div>
                </div>

                <!-- Badges Section -->
                <div class="badges-section">
                    <h3 style="margin-bottom: var(--space-lg);"><i data-feather="award"></i>️ Badges</h3>
                    <div class="profile-badges-grid">
                        ${allBadges.map((badge) => `
                            <div class="profile-badge ${badge.earned ? '' : 'locked'}">
                                <span class="profile-badge-icon">${badge.emoji}</span>
                                <span class="profile-badge-name">${badge.name}</span>
                                <div class="profile-badge-desc">${badge.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Quiz History -->
                <div class="history-section">
                    <h3 style="margin-bottom: var(--space-lg);"><i data-feather="bar-chart-2"></i> Recent Quizzes</h3>
                    <div class="history-list">
                        ${historyHTML}
                    </div>
                </div>

                <!-- Settings -->
                <div class="settings-section">
                    <h3 style="margin-bottom: var(--space-lg);"><i data-feather="settings"></i>️ Settings</h3>
                    <div class="settings-list">
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4><i data-feather="volume-2"></i> Sound Effects</h4>
                                <p>Play sounds for correct/wrong answers</p>
                            </div>
                            <button class="toggle-switch ${settings.soundEnabled ? 'active' : ''}"
                                    onclick="ProfilePage.toggleSetting('soundEnabled')"
                                    id="toggle-sound"></button>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4><i data-feather="clock"></i> Timer Mode</h4>
                                <p>Add a countdown timer to quizzes</p>
                            </div>
                            <button class="toggle-switch ${settings.timerEnabled ? 'active' : ''}"
                                    onclick="ProfilePage.toggleSetting('timerEnabled')"
                                    id="toggle-timer"></button>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4><i data-feather="x-circle"></i> Wrong Answer Penalty</h4>
                                <p>Deduct 1 point for wrong answers</p>
                            </div>
                            <button class="toggle-switch ${settings.penaltyEnabled ? 'active' : ''}"
                                    onclick="ProfilePage.toggleSetting('penaltyEnabled')"
                                    id="toggle-penalty"></button>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4><i data-feather="zap"></i> Show Explanations</h4>
                                <p>Display explanations after each answer</p>
                            </div>
                            <button class="toggle-switch ${settings.showExplanations ? 'active' : ''}"
                                    onclick="ProfilePage.toggleSetting('showExplanations')"
                                    id="toggle-explanations"></button>
                        </div>
                    </div>
                </div>

                <!-- Danger Zone -->
                <div style="text-align: center; margin-top: var(--space-2xl); display: flex; flex-direction: column; gap: var(--space-md); align-items: center;">
                    <button class="btn btn-outline btn-sm" onclick="ProfilePage.signOut()" id="signout-btn">
                        <i data-feather="log-out"></i>️ Logout
                    </button>
                </div>
            </div>
        `;
    }

    function toggleSetting(key) {
        const settings = Storage.getSettings();
        settings[key] = !settings[key];
        Storage.saveSettings(settings);

        // Update toggle visual
        const toggleMap = {
            soundEnabled: 'toggle-sound',
            timerEnabled: 'toggle-timer',
            penaltyEnabled: 'toggle-penalty',
            showExplanations: 'toggle-explanations',
        };

        const btn = document.getElementById(toggleMap[key]);
        if (btn) {
            btn.classList.toggle('active', settings[key]);
        }

        // Update sound toggle in navbar
        if (key === 'soundEnabled') {
            const soundOn = document.querySelector('.sound-on');
            const soundOff = document.querySelector('.sound-off');
            if (soundOn) soundOn.style.display = settings[key] ? '' : 'none';
            if (soundOff) soundOff.style.display = settings[key] ? 'none' : '';
        }

        UIUtils.showToast(
            `${settings[key] ? '<i data-feather="check-circle"></i> Enabled' : '<i data-feather="x-circle"></i> Disabled'}: ${key.replace(/([A-Z])/g, ' $1').trim()}`,
            'info',
            2000
        );
    }

    function signOut() {
        if (confirm('Are you sure you want to sign out?')) {
            if (window.signOutFromGoogle) {
                window.signOutFromGoogle().then(() => {
                    Storage.clearAll();
                    window.location.hash = '#/';
                    window.location.reload();
                }).catch(e => {
                    console.error('Sign out error', e);
                    UIUtils.showToast('Failed to sign out', 'error');
                });
            } else {
                Storage.clearAll();
                window.location.hash = '#/';
                window.location.reload();
            }
        }
    }

    // Register route
    Router.register('/profile', {
        render,
        title: 'Profile',
    });

    return {
        render,
        toggleSetting,
        signOut,
    };
})();
