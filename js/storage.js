/**
 * EduQuiz — Storage Module
 * LocalStorage abstraction for all persistent data.
 * Handles profile, quiz history, settings, bookmarks, and streak tracking.
 */

const Storage = (() => {
    // Storage keys
    const KEYS = {
        PROFILE: 'mm_profile',
        HISTORY: 'mm_history',
        SETTINGS: 'mm_settings',
        STREAK: 'mm_streak',
        LEADERBOARD: 'mm_leaderboard',
        DAILY_CHALLENGE: 'mm_daily_challenge',
        VERSION: 'mm_version',
        SESSION_ID: 'mm_session_id',
    };

    const CURRENT_VERSION = 1;

    // ── Helpers ──

    function get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Storage write failed:', e);
        }
    }

    // ── Profile ──

    const defaultProfile = {
        username: '',
        avatar: 'U',
        classNum: 8,
        xp: 0,
        level: 1,
        totalQuizzes: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        badges: [],
        createdAt: null,
    };

    function getProfile() {
        return get(KEYS.PROFILE, { ...defaultProfile });
    }

    function saveProfile(profile) {
        set(KEYS.PROFILE, profile);
        // Sync to cloud if available
        if (typeof FirebaseDB !== 'undefined') {
            FirebaseDB.syncUserProfile(profile);
        }
    }

    function updateProfile(updates) {
        const profile = getProfile();
        Object.assign(profile, updates);
        saveProfile(profile);
        return profile;
    }

    function getSessionId() {
        let sessId = localStorage.getItem(KEYS.SESSION_ID);
        if (!sessId) {
            sessId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
            localStorage.setItem(KEYS.SESSION_ID, sessId);
        }
        return sessId;
    }

    function isFirstVisit() {
        return !localStorage.getItem(KEYS.PROFILE);
    }

    // ── Settings ──

    const defaultSettings = {
        soundEnabled: true,
        timerEnabled: true,
        timerDuration: 30, // seconds per question
        penaltyEnabled: true, // -1 for wrong answers
        showExplanations: true,
    };

    function getSettings() {
        let settings = { ...defaultSettings, ...get(KEYS.SETTINGS, {}) };
        
        // Migrate existing users to have timer and penalty active by default once
        if (!settings.defaultsUpdatedV2) {
            settings.timerEnabled = true;
            settings.penaltyEnabled = true;
            settings.defaultsUpdatedV2 = true;
            saveSettings(settings);
        }
        
        return settings;
    }

    function saveSettings(settings) {
        set(KEYS.SETTINGS, settings);
    }

    function updateSettings(updates) {
        const settings = getSettings();
        Object.assign(settings, updates);
        saveSettings(settings);
        return settings;
    }

    // ── Quiz History ──

    function getHistory() {
        return get(KEYS.HISTORY, []);
    }

    function saveQuizResult(result) {
        // result: { classNum, subject, score, total, correct, wrong, skipped,
        //           percentage, xpEarned, date, timeTaken }
        const history = getHistory();
        result.id = Date.now();
        result.date = result.date || new Date().toISOString();
        history.unshift(result); // newest first
        // Keep max 100 entries
        if (history.length > 100) history.pop();
        set(KEYS.HISTORY, history);
        return result;
    }

    function getHistoryBySubject(classNum, subject) {
        return getHistory().filter(
            (h) => h.classNum == classNum && h.subject === subject
        );
    }



    // ── Streak ──

    function getStreak() {
        return get(KEYS.STREAK, {
            current: 0,
            longest: 0,
            lastDate: null,
            history: [], // array of YYYY-MM-DD strings
        });
    }

    function updateStreak() {
        const streak = getStreak();
        const today = new Date().toISOString().split('T')[0];

        if (streak.lastDate === today) {
            // Already played today
            return streak;
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (streak.lastDate === yesterday) {
            // Consecutive day
            streak.current += 1;
        } else {
            // Streak broken, reset
            streak.current = 1;
        }

        streak.longest = Math.max(streak.longest, streak.current);
        streak.lastDate = today;

        // Keep last 30 days of history
        if (!streak.history.includes(today)) {
            streak.history.push(today);
        }
        if (streak.history.length > 30) {
            streak.history = streak.history.slice(-30);
        }

        set(KEYS.STREAK, streak);
        return streak;
    }

    // ── Leaderboard (Moved to Firebase) ──


    // ── Daily Challenge ──

    function getDailyChallenges() {
        const today = new Date().toISOString().split('T')[0];
        const saved = get(KEYS.DAILY_CHALLENGE, null);

        if (saved && saved.date === today && Array.isArray(saved.challenges)) {
            return saved.challenges;
        }

        const CHALLENGE_TEMPLATES = [
            { id: 'sci_accuracy', type: 'quiz_count', title: 'Complete 5 Science Quizzes with 70% Accuracy', target: 5, xpReward: 50, conditions: { subject: 'science', minAccuracy: 70 } },
            { id: 'math_accuracy', type: 'quiz_count', title: 'Complete 5 Maths Quizzes with 70% Accuracy', target: 5, xpReward: 50, conditions: { subject: 'maths', minAccuracy: 70 } },
            { id: 'sst_accuracy', type: 'quiz_count', title: 'Complete 5 Social Science Quizzes with 70% Accuracy', target: 5, xpReward: 50, conditions: { subject: 'sst', minAccuracy: 70 } },
            { id: 'any_badge', type: 'badge_count', title: 'Earn 2 Badges', target: 2, xpReward: 100, conditions: {} },
            { id: 'perfect_score', type: 'perfect_score', title: 'Get a Perfect Score on 2 Quizzes', target: 2, xpReward: 100, conditions: {} },
            { id: 'play_quizzes', type: 'quiz_count', title: 'Play 5 Quizzes of any subject', target: 5, xpReward: 60, conditions: { minAccuracy: 0 } },
        ];

        // Generate deterministic challenges based on date
        const seed = parseInt(today.replace(/-/g, ''));
        let challenges = [];
        
        const index1 = seed % CHALLENGE_TEMPLATES.length;
        let index2 = (seed + 3) % CHALLENGE_TEMPLATES.length;

        if (index1 === index2) {
             index2 = (index2 + 1) % CHALLENGE_TEMPLATES.length;
        }

        challenges.push({ ...CHALLENGE_TEMPLATES[index1], progress: 0, completed: false });
        challenges.push({ ...CHALLENGE_TEMPLATES[index2], progress: 0, completed: false });

        const state = { date: today, challenges };
        set(KEYS.DAILY_CHALLENGE, state);
        return challenges;
    }

    function updateChallengeProgress(id, amount) {
        const state = get(KEYS.DAILY_CHALLENGE, null);
        let newlyCompleted = false;
        let challengeRef = null;

        if (state && Array.isArray(state.challenges)) {
            const challenge = state.challenges.find(c => c.id === id);
            if (challenge && !challenge.completed) {
                challenge.progress += amount;
                if (challenge.progress >= challenge.target) {
                    challenge.progress = challenge.target;
                    challenge.completed = true;
                    newlyCompleted = true;
                }
                challengeRef = challenge;
                set(KEYS.DAILY_CHALLENGE, state);
            }
        }
        return { newlyCompleted, challenge: challengeRef };
    }

    // ── Global Stats ──

    function getGlobalStats() {
        const history = getHistory();
        const profile = getProfile();
        return {
            totalQuizzes: profile.totalQuizzes || history.length,
            totalStudents: 15420 + (profile.username ? 1 : 0), // Simulated global number
            totalQuestions: profile.totalQuestions || 0,
            avgAccuracy: profile.totalQuestions > 0
                ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
                : 0,
        };
    }

    // ── Clear Data ──

    function clearAll() {
        Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
    }

    // ── Public API ──
    return {
        getProfile,
        saveProfile,
        updateProfile,
        isFirstVisit,
        getSettings,
        saveSettings,
        updateSettings,
        getHistory,
        saveQuizResult,
        getHistoryBySubject,
        getStreak,
        updateStreak,
        getDailyChallenges,
        updateChallengeProgress,
        getGlobalStats,
        clearAll,
        getSessionId,
    };
})();
