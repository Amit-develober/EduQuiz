try {
    const firebaseConfig = window.firebaseConfig;
    if (!firebaseConfig) {
        throw new Error("Firebase config not found in window");
    }
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    window.firebaseAuth = auth;

    window.signInWithGoogle = function() {
        return auth.signInWithPopup(provider);
    };

    window.signUpWithEmail = function(email, password) {
        return auth.createUserWithEmailAndPassword(email, password);
    };

    window.signInWithEmail = function(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    };

    window.subscribeToAuthChanges = function(callback) {
        auth.onAuthStateChanged(callback);
    };

    window.signOutFromGoogle = function() {
        return auth.signOut();
    };
} catch (error) {
    console.error("Firebase initialization error:", error);
    // Provide stub functions so the app doesn't break if Firebase config is missing
    window.signInWithGoogle = async function() {
        alert("Firebase is not configured! Please add your firebaseConfig in js/auth.js");
        throw new Error("Firebase not configured");
    };
    window.signUpWithEmail = async function() {
        alert("Firebase is not configured!");
        throw new Error("Firebase not configured");
    };
    window.signInWithEmail = async function() {
        alert("Firebase is not configured!");
        throw new Error("Firebase not configured");
    };
    window.subscribeToAuthChanges = function(callback) {
        // Stub: Immediately invoke with null to simulate logged-out state
        callback(null);
    };
    window.signOutFromGoogle = async function() {
        // stub
    };
}
