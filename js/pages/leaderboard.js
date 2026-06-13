/**
 * EduQuiz — Leaderboard Page
 * Top students podium, ranked list with tabs for weekly/monthly/all-time.
 */

const LeaderboardPage = (() => {
    async function render() {
        const isLoggedIn = !!(window.firebaseAuth && window.firebaseAuth.currentUser);
        let leaderboard = [];
        if (typeof FirebaseDB !== 'undefined') {
            const allUsers = await FirebaseDB.getTopUsers();
            // Only show users who have actually earned XP
            leaderboard = allUsers.filter(u => u.xp > 0);
            
            // Re-assign ranks to handle ties properly
            let currentRank = 1;
            for(let i=0; i<leaderboard.length; i++) {
                if (i > 0 && leaderboard[i].xp === leaderboard[i-1].xp) {
                    leaderboard[i].rank = leaderboard[i-1].rank;
                } else {
                    leaderboard[i].rank = currentRank;
                }
                currentRank++;
            }
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
        const hasPlayed = typeof Storage !== 'undefined' && Storage.getProfile().xp > 0;

        return `
            <div class="leaderboard-page">
                <div class="section-header">
                    <h1><i data-feather="award"></i> <span class="text-gradient">Leaderboard</span></h1>
                    <p>Top performing students</p>
                </div>

                <!-- Tabs (Removed for now as they are not backed by DB logic yet) -->

                <!-- Podium -->
                ${podiumHTML}

                <!-- Rest of the list -->
                <div class="leaderboard-list">
                    ${listHTML}
                </div>

                ${!isLoggedIn ? `
                    <div style="text-align: center; margin-top: var(--space-2xl); background: rgba(108, 92, 231, 0.05); padding: var(--space-xl); border-radius: var(--br-lg); border: 1px dashed var(--primary-light);">
                        <p class="text-secondary" style="margin-bottom: var(--space-md);">Sign in to track your scores, earn XP, and climb the leaderboard!</p>
                        <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
                            <button class="btn btn-outline" onclick="window.showWelcomeModal()" id="lb-signin-btn">Sign In / Create Account</button>
                            <button class="btn btn-primary" onclick="Router.navigate('/class')" id="lb-start-btn">Browse Quizzes</button>
                        </div>
                    </div>
                ` : (!userInTop3 && !userInRest ? `
                    <div style="text-align: center; margin-top: var(--space-2xl);">
                        <p class="text-secondary" style="margin-bottom: var(--space-md);">${hasPlayed ? 'Keep learning to climb the leaderboard!' : 'Take quizzes to appear on the leaderboard!'}</p>
                        <button class="btn btn-primary" onclick="Router.navigate('/class')" id="lb-start-btn">${hasPlayed ? 'Continue Learning' : 'Start a Quiz'}</button>
                    </div>
                ` : '')}
            </div>
        `;
    }

    function init() {
        // Removed fake tab switching logic

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
