/**
 * EduQuiz — Leaderboard Page
 * Top students podium, ranked list with tabs for weekly/monthly/all-time.
 */

const LeaderboardPage = (() => {
    async function render() {
        let leaderboard = [];
        if (typeof FirebaseDB !== 'undefined') {
            leaderboard = await FirebaseDB.getTopUsers();
        }
        
        const top3 = leaderboard.slice(0, 3);
        const rest = leaderboard.slice(3);

        // Podium order: 2nd, 1st, 3rd
        let podiumHTML = '';
        if (top3.length > 0) {
            podiumHTML += '<div class="podium">';
            if (top3.length >= 2) {
                podiumHTML += `
                <div class="podium-item second">
                    <div class="podium-rank">2nd</div>
                    <div class="podium-avatar">${UIUtils.renderAvatar(top3[1].avatar)}</div>
                    <div class="podium-name">${top3[1].username}</div>
                    <div class="podium-xp">XP ${top3[1].xp}</div>
                    <div class="podium-score">${top3[1].quizzes} quizzes • ${top3[1].accuracy}% accuracy</div>
                </div>`;
            }
            if (top3.length >= 1) {
                podiumHTML += `
                <div class="podium-item first">
                    <div class="podium-rank">1st</div>
                    <div class="podium-avatar">${UIUtils.renderAvatar(top3[0].avatar)}</div>
                    <div class="podium-name">${top3[0].username}</div>
                    <div class="podium-xp">XP ${top3[0].xp}</div>
                    <div class="podium-score">${top3[0].quizzes} quizzes • ${top3[0].accuracy}% accuracy</div>
                </div>`;
            }
            if (top3.length >= 3) {
                podiumHTML += `
                <div class="podium-item third">
                    <div class="podium-rank">3rd</div>
                    <div class="podium-avatar">${UIUtils.renderAvatar(top3[2].avatar)}</div>
                    <div class="podium-name">${top3[2].username}</div>
                    <div class="podium-xp">XP ${top3[2].xp}</div>
                    <div class="podium-score">${top3[2].quizzes} quizzes • ${top3[2].accuracy}% accuracy</div>
                </div>`;
            }
            podiumHTML += '</div>';
        }

        const listHTML = rest.map((user) => `
            <div class="leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}">
                <div class="lb-rank">${user.rank}</div>
                <div class="lb-avatar">${UIUtils.renderAvatar(user.avatar)}</div>
                <div class="lb-info">
                    <div class="lb-name">${user.username} ${user.isCurrentUser ? '(You)' : ''}</div>
                    <div class="lb-stats">${user.quizzes} quizzes • ${user.accuracy}% accuracy</div>
                </div>
                <div class="lb-score">
                    <div class="lb-xp">XP ${user.xp}</div>
                </div>
            </div>
        `).join('');

        // Check if current user is in top 3
        const userInTop3 = top3.some((u) => u.isCurrentUser);
        const userInRest = rest.find((u) => u.isCurrentUser);

        return `
            <div class="leaderboard-page">
                <div class="section-header">
                    <h1><i data-feather="award"></i> <span class="text-gradient">Leaderboard</span></h1>
                    <p>Top performing students</p>
                </div>

                <!-- Tabs -->
                <div class="leaderboard-tabs">
                    <button class="leaderboard-tab active" id="tab-all-time">All Time</button>
                    <button class="leaderboard-tab" id="tab-weekly">This Week</button>
                    <button class="leaderboard-tab" id="tab-monthly">This Month</button>
                </div>

                <!-- Podium -->
                ${podiumHTML}

                <!-- Rest of the list -->
                <div class="leaderboard-list">
                    ${listHTML}
                </div>

                ${!userInTop3 && !userInRest ? `
                    <div style="text-align: center; margin-top: var(--space-2xl);">
                        <p class="text-secondary" style="margin-bottom: var(--space-md);">Take quizzes to appear on the leaderboard!</p>
                        <button class="btn btn-primary" onclick="Router.navigate('/class')" id="lb-start-btn">Start a Quiz</button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function init() {
        // Tab switching (simulated — same data for all tabs in this version)
        const tabs = document.querySelectorAll('.leaderboard-tab');
        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                tabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                // In production, would filter data by time period
                UIUtils.showToast('Showing ' + tab.textContent.toLowerCase() + ' rankings', 'info', 2000);
            });
        });

        // Removed JS-based entrance animations for better performance
    }

    // Register route
    Router.register('/leaderboard', {
        render,
        init,
        title: 'Leaderboard',
    });

    return { render, init };
})();
