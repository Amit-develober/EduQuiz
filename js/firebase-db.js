/**
 * EduQuiz — Firebase Database Module
 * Handles syncing user data to Firestore and fetching the real leaderboard.
 */

const FirebaseDB = (() => {
    let db = null;
    try {
        if (window.firebase && window.firebase.firestore) {
            db = window.firebase.firestore();
        }
    } catch (e) {
        console.error("Firestore initialization error:", e);
    }

    /**
     * Syncs the current local profile to Firestore.
     * Uses the logged-in user's UID as the document ID if available,
     * otherwise skips syncing.
     */
    async function syncUserProfile(profile) {
        if (!db) return;
        const currentUser = window.firebaseAuth ? window.firebaseAuth.currentUser : null;
        if (!currentUser) return; // Only sync for logged-in users

        try {
            const accuracy = profile.totalQuestions > 0
                ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100)
                : 0;
            
            await db.collection("users").doc(currentUser.uid).set({
                username: profile.username || currentUser.displayName || "Unknown Student",
                avatar: profile.avatar || "U",
                xp: profile.xp || 0,
                accuracy: accuracy,
                quizzes: profile.totalQuizzes || 0,
                classNum: profile.classNum || 8,
                lastActive: window.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error syncing profile to Firestore:", error);
        }
    }

    /**
     * Fetches the top 10 users from Firestore ordered by XP.
     */
    async function getTopUsers() {
        if (!db) {
            // Fallback for when Firestore is not configured/available
            console.warn("Firestore not available, returning empty leaderboard.");
            return [];
        }

        try {
            const snapshot = await db.collection("users")
                                     .orderBy("xp", "desc")
                                     .limit(10)
                                     .get();
            
            const users = [];
            let rank = 1;
            const currentUser = window.firebaseAuth ? window.firebaseAuth.currentUser : null;

            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    username: data.username,
                    avatar: data.avatar,
                    xp: data.xp,
                    accuracy: data.accuracy,
                    quizzes: data.quizzes,
                    rank: rank++,
                    isCurrentUser: currentUser && doc.id === currentUser.uid
                });
            });

            return users;
        } catch (error) {
            console.error("Error fetching leaderboard:", error);
            return [];
        }
    }

    /**
     * Fetches the user profile from Firestore.
     */
    async function getUserProfile(uid) {
        if (!db) return null;
        try {
            const doc = await db.collection("users").doc(uid).get();
            if (doc.exists) {
                return doc.data();
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
        return null;
    }

    return {
        syncUserProfile,
        getTopUsers,
        getUserProfile
    };
})();
