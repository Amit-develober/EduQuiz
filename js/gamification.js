/**
 * EduQuiz — Gamification Module
 * XP system, levels, badges, achievements, and daily rewards.
 */

const Gamification = (() => {
    // ── XP Constants ──
    const XP_PER_CORRECT = 10;
    const XP_PER_QUIZ = 5;
    const XP_PERFECT_BONUS = 20;
    const XP_STREAK_BONUS = 15;
    const XP_DAILY_CHALLENGE = 25;

    // ── Level System ──
    // Exponential: each level requires more XP
    const LEVELS = [
        { level: 1, name: 'Newbie', minXP: 0, emoji: '🌱' },
        { level: 2, name: 'Beginner', minXP: 50, emoji: '📖' },
        { level: 3, name: 'Learner', minXP: 120, emoji: '📘' },
        { level: 4, name: 'Student', minXP: 220, emoji: '🎓' },
        { level: 5, name: 'Scholar', minXP: 350, emoji: '🤓' },
        { level: 6, name: 'Achiever', minXP: 520, emoji: '🎯' },
        { level: 7, name: 'Expert', minXP: 730, emoji: '🌟' },
        { level: 8, name: 'Master', minXP: 1000, emoji: '⚡' },
        { level: 9, name: 'Pro', minXP: 1350, emoji: '💎' },
        { level: 10, name: 'Champion', minXP: 1800, emoji: '🏅' },
        { level: 11, name: 'Genius', minXP: 2400, emoji: '🧠' },
        { level: 12, name: 'Legend', minXP: 3200, emoji: '👑' },
        { level: 13, name: 'Mythic', minXP: 4500, emoji: '🔥' },
        { level: 14, name: 'Immortal', minXP: 6000, emoji: '💫' },
        { level: 15, name: 'Transcendent', minXP: 8000, emoji: '🌌' },
    ];

    // ── Badge Definitions ──
    const BADGES = [
        {
            id: 'first_quiz',
            name: 'First Steps',
            emoji: '🌱',
            desc: 'Complete your first quiz',
            check: (p) => p.totalQuizzes >= 1,
        },
        {
            id: 'perfect_score',
            name: 'Perfect Score',
            emoji: '💯',
            desc: 'Score 100% in any quiz',
            check: (p, h) => h.some((r) => r.percentage === 100),
        },
        {
            id: 'five_quizzes',
            name: 'Quiz Enthusiast',
            emoji: '🔥',
            desc: 'Complete 5 quizzes',
            check: (p) => p.totalQuizzes >= 5,
        },
        {
            id: 'ten_quizzes',
            name: 'Quiz Master',
            emoji: '🏆',
            desc: 'Complete 10 quizzes',
            check: (p) => p.totalQuizzes >= 10,
        },
        {
            id: 'streak_3',
            name: 'On Fire',
            emoji: '📈',
            desc: 'Maintain a 3-day streak',
            check: (p, h, s) => s.current >= 3 || s.longest >= 3,
        },
        {
            id: 'streak_7',
            name: 'Week Warrior',
            emoji: '📅',
            desc: 'Maintain a 7-day streak',
            check: (p, h, s) => s.current >= 7 || s.longest >= 7,
        },
        {
            id: 'maths_master',
            name: 'Maths Whiz',
            emoji: '📐',
            desc: 'Complete 5 Maths quizzes',
            check: (p, h) => h.filter((r) => r.subject === 'maths').length >= 5,
        },
        {
            id: 'science_master',
            name: 'Science Pro',
            emoji: '🔬',
            desc: 'Complete 5 Science quizzes',
            check: (p, h) => h.filter((r) => r.subject === 'science').length >= 5,
        },
        {
            id: 'sst_master',
            name: 'History Buff',
            emoji: '🌍',
            desc: 'Complete 5 SST quizzes',
            check: (p, h) => h.filter((r) => r.subject === 'sst').length >= 5,
        },
        {
            id: 'hundred_questions',
            name: 'Century Club',
            emoji: '🌟',
            desc: 'Answer 100 questions',
            check: (p) => p.totalQuestions >= 100,
        },
        {
            id: 'speed_demon',
            name: 'Speed Demon',
            emoji: '⚡',
            desc: 'Complete a quiz in under 2 minutes',
            check: (p, h) => h.some((r) => r.timeTaken && r.timeTaken < 120),
        },
        {
            id: 'all_subjects',
            name: 'Well Rounded',
            emoji: '🎯',
            desc: 'Complete quizzes in all 3 subjects',
            check: (p, h) => {
                const subjects = new Set(h.map((r) => r.subject));
                return subjects.size >= 3;
            },
        },
        {
            id: 'accuracy_master',
            name: 'Accuracy Master',
            emoji: '🎯',
            desc: 'Maintain 90%+ average accuracy over 5 quizzes',
            check: (p, h) => p.totalQuizzes >= 5 && (p.totalCorrect / p.totalQuestions) >= 0.9,
        },
        {
            id: 'marathon',
            name: 'Marathon',
            emoji: '🏃',
            desc: 'Complete 20 quizzes',
            check: (p) => p.totalQuizzes >= 20,
        },
        {
            id: 'weekend_warrior',
            name: 'Weekend Warrior',
            emoji: '⛺',
            desc: 'Complete a quiz on the weekend',
            check: (p, h) => h.some(r => new Date(r.date).getDay() === 0 || new Date(r.date).getDay() === 6),
        },
        {
            id: 'night_owl',
            name: 'Night Owl',
            emoji: '🦉',
            desc: 'Complete a quiz between 10 PM and 4 AM',
            check: (p, h) => h.some(r => { const hour = new Date(r.date).getHours(); return hour >= 22 || hour < 4; }),
        },
        {
            id: 'early_bird',
            name: 'Early Bird',
            emoji: '🌅',
            desc: 'Complete a quiz between 5 AM and 8 AM',
            check: (p, h) => h.some(r => { const hour = new Date(r.date).getHours(); return hour >= 5 && hour < 8; }),
        },
    ];

    // ── Core Functions ──

    /**
     * Calculate level from XP.
     */
    function getLevelFromXP(xp) {
        let level = LEVELS[0];
        for (const l of LEVELS) {
            if (xp >= l.minXP) level = l;
            else break;
        }
        return level;
    }

    /**
     * Get XP needed for next level.
     */
    function getNextLevelXP(xp) {
        const currentLevel = getLevelFromXP(xp);
        const nextLevel = LEVELS.find((l) => l.minXP > xp);
        return nextLevel ? nextLevel.minXP : null; // null = max level
    }

    /**
     * Get XP progress towards next level (0-100%).
     */
    function getLevelProgress(xp) {
        const currentLevel = getLevelFromXP(xp);
        const nextLevel = LEVELS.find((l) => l.minXP > xp);
        if (!nextLevel) return 100;
        const range = nextLevel.minXP - currentLevel.minXP;
        const progress = xp - currentLevel.minXP;
        return Math.round((progress / range) * 100);
    }

    /**
     * Calculate XP earned from a quiz result.
     */
    function calculateXP(result) {
        let xp = 0;
        const breakdown = [];

        // XP per correct answer
        xp += result.correct * XP_PER_CORRECT;
        breakdown.push(`${result.correct} correct × ${XP_PER_CORRECT} XP = ${result.correct * XP_PER_CORRECT}`);

        // Quiz completion bonus
        xp += XP_PER_QUIZ;
        breakdown.push(`Quiz completed: +${XP_PER_QUIZ} XP`);

        // Perfect score bonus
        if (result.percentage === 100) {
            xp += XP_PERFECT_BONUS;
            breakdown.push(`Perfect score! +${XP_PERFECT_BONUS} XP`);
        }

        // Streak bonus
        const streak = Storage.getStreak();
        if (streak.current >= 2) {
            xp += XP_STREAK_BONUS;
            breakdown.push(`Streak bonus (${streak.current} days): +${XP_STREAK_BONUS} XP`);
        }


        return { xp, breakdown };
    }

    /**
     * Award XP and check for level ups.
     * Returns { newXP, leveledUp, newLevel, oldLevel }
     */
    function awardXP(xpAmount) {
        const profile = Storage.getProfile();
        const oldLevel = getLevelFromXP(profile.xp);
        profile.xp += xpAmount;
        const newLevel = getLevelFromXP(profile.xp);
        profile.level = newLevel.level;
        Storage.saveProfile(profile);

        const leveledUp = newLevel.level > oldLevel.level;

        if (leveledUp) {
            UIUtils.playSound('levelup');
            UIUtils.showToast(
                ` Level Up! You're now ${newLevel.emoji} ${newLevel.name}!`,
                'success',
                4000
            );
        }

        // Update nav XP display
        const xpEl = document.getElementById('nav-xp-value');
        if (xpEl) xpEl.textContent = profile.xp;

        return { newXP: profile.xp, leveledUp, newLevel, oldLevel };
    }

    /**
     * Check and award new badges.
     * Returns array of newly earned badges.
     */
    function checkBadges() {
        const profile = Storage.getProfile();
        const history = Storage.getHistory();
        const streak = Storage.getStreak();
        const newBadges = [];

        for (const badge of BADGES) {
            if (profile.badges.includes(badge.id)) continue;

            if (badge.check(profile, history, streak)) {
                profile.badges.push(badge.id);
                newBadges.push(badge);
            }
        }

        if (newBadges.length > 0) {
            Storage.saveProfile(profile);
            // Play badge sound and show toast for each
            newBadges.forEach((badge, i) => {
                setTimeout(() => {
                    UIUtils.playSound('badge');
                    UIUtils.showToast(
                        `${badge.emoji} Badge earned: ${badge.name}!`,
                        'success',
                        4000
                    );
                }, i * 1000);
            });
        }

        return newBadges;
    }

    /**
     * Get all badges with earned status.
     */
    function getAllBadges() {
        const profile = Storage.getProfile();
        return BADGES.map((badge) => ({
            ...badge,
            earned: profile.badges.includes(badge.id),
        }));
    }

    /**
     * Process a completed quiz: award XP, update stats, check badges, update streak.
     */
    function processQuizCompletion(result) {
        // Calculate XP
        const { xp, breakdown } = calculateXP(result);

        // Update profile stats
        const profile = Storage.getProfile();
        profile.totalQuizzes += 1;
        profile.totalCorrect += result.correct;
        profile.totalQuestions += result.total;
        Storage.saveProfile(profile);

        // Award XP
        const xpResult = awardXP(xp);

        // Update streak
        const streak = Storage.updateStreak();

        // Update nav streak
        const streakEl = document.getElementById('nav-streak-value');
        if (streakEl) streakEl.textContent = streak.current;

        // Save quiz result to history
        Storage.saveQuizResult({
            ...result,
            xpEarned: xp,
        });

        // Check badges first so badge challenges can evaluate them
        const newBadges = checkBadges();

        // Evaluate daily challenges
        let totalXpEarned = xp;
        const dailyChallenges = Storage.getDailyChallenges();
        dailyChallenges.forEach(challenge => {
            if (challenge.completed) return;

            let progressIncrement = 0;
            if (challenge.type === 'quiz_count') {
                const cond = challenge.conditions || {};
                const matchSubject = !cond.subject || cond.subject === result.subject;
                const matchAccuracy = (cond.minAccuracy === undefined) || (result.percentage >= cond.minAccuracy);
                if (matchSubject && matchAccuracy) {
                    progressIncrement = 1;
                }
            } else if (challenge.type === 'perfect_score') {
                if (result.percentage === 100) {
                    progressIncrement = 1;
                }
            } else if (challenge.type === 'badge_count') {
                progressIncrement = newBadges.length;
            }

            if (progressIncrement > 0) {
                const update = Storage.updateChallengeProgress(challenge.id, progressIncrement);
                if (update.newlyCompleted) {
                    const reward = challenge.xpReward || 50;
                    awardXP(reward);
                    totalXpEarned += reward;
                    breakdown.push(`Challenge: ${challenge.title} (+${reward} XP)`);
                    
                    setTimeout(() => {
                        UIUtils.showToast(`🎉 Challenge Completed! +${reward} XP`, 'success', 4000);
                    }, 500);
                }
            }
        });

        return {
            xpEarned: totalXpEarned,
            xpBreakdown: breakdown,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel,
            newBadges,
            streak,
        };
    }

    // ── Public API ──
    return {
        LEVELS,
        BADGES,
        getLevelFromXP,
        getNextLevelXP,
        getLevelProgress,
        calculateXP,
        awardXP,
        checkBadges,
        getAllBadges,
        processQuizCompletion,
        XP_PER_CORRECT,
    };
})();
