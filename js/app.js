/**
 * EduQuiz — App Bootstrap
 * Initializes the entire application: particles, welcome modal,
 * navbar interactions, sound toggle, and router.
 */

(function () {
    'use strict';

    // ── Initialize on DOM Ready ──
    document.addEventListener('DOMContentLoaded', () => {
        // Particle background removed for performance and cleaner UI
        // UIUtils.initParticles();

        // Setup navbar
        setupNavbar();

        // Setup sound toggle
        setupSoundToggle();

        // Auth State Listener
        if (window.subscribeToAuthChanges) {
            window.subscribeToAuthChanges(async (user) => {
                const loader = document.getElementById('initial-loader');
                if (loader) loader.style.display = 'none';

                if (user) {
                    // User is signed in.
                    const modal = document.getElementById('welcome-modal');
                    if (modal) modal.style.display = 'none';
                    
                    // If first visit or profile incomplete, initialize profile
                    if (Storage.isFirstVisit() || !Storage.getProfile().username) {
                        const appEl = document.getElementById('app');
                        const navEl = document.getElementById('navbar');
                        
                        // First, attempt to retrieve the user's profile from Firestore
                        let dbProfile = null;
                        if (typeof FirebaseDB !== 'undefined' && FirebaseDB.getUserProfile) {
                            // Show loader while fetching profile
                            const loader = document.getElementById('initial-loader');
                            if (loader) loader.style.display = 'flex';
                            
                            try {
                                dbProfile = await FirebaseDB.getUserProfile(user.uid);
                            } catch (error) {
                                console.error("Error fetching user profile from database:", error);
                            } finally {
                                if (loader) loader.style.display = 'none';
                            }
                        }

                        if (dbProfile && dbProfile.username) {
                            // Profile exists in database, restore it locally
                            const emailName = user.email ? user.email.split('@')[0] : 'Student';
                            let profileData = {
                                username: dbProfile.username,
                                avatar: dbProfile.avatar || user.photoURL || '🦁',
                                classNum: dbProfile.classNum || 8,
                                xp: dbProfile.xp || 0,
                                level: 1,
                                totalQuizzes: dbProfile.quizzes || 0,
                                totalCorrect: 0,
                                totalQuestions: 0,
                                badges: dbProfile.badges || [],
                                createdAt: dbProfile.createdAt || new Date().toISOString(),
                            };

                            if (typeof Gamification !== 'undefined' && Gamification.getLevelFromXP) {
                                const levelInfo = Gamification.getLevelFromXP(profileData.xp);
                                profileData.level = levelInfo ? levelInfo.level : 1;
                            }

                            // Estimate questions to maintain accuracy locally
                            profileData.totalQuestions = profileData.totalQuizzes * 10;
                            profileData.totalCorrect = Math.round((dbProfile.accuracy || 0) * profileData.totalQuestions / 100);

                            Storage.saveProfile(profileData);
                            if (appEl) appEl.style.display = '';
                            if (navEl) navEl.style.display = '';
                            updateNavProfile();
                        } else {
                            // No profile exists in database. Check if they are a new user
                            const isNewUser = user.metadata && user.metadata.creationTime === user.metadata.lastSignInTime;
                            
                            // If they are a new user, or if we have no profile anywhere, force them to set it up
                            if (isNewUser || !dbProfile || !dbProfile.username) {
                                if (appEl) appEl.style.display = 'none';
                                if (navEl) navEl.style.display = 'none';
                                showProfileSetupModal(user);
                            } else {
                                // Fallback: Create a default profile
                                const emailName = user.email ? user.email.split('@')[0] : 'Student';
                                let profileData = {
                                    username: user.displayName || emailName,
                                    avatar: user.photoURL || '🦁',
                                    classNum: 8,
                                    xp: 0,
                                    level: 1,
                                    totalQuizzes: 0,
                                    totalCorrect: 0,
                                    totalQuestions: 0,
                                    badges: [],
                                    createdAt: new Date().toISOString(),
                                };
                                Storage.saveProfile(profileData);
                                if (appEl) appEl.style.display = '';
                                if (navEl) navEl.style.display = '';
                                updateNavProfile();
                            }
                        }
                    } else {
                        const appEl = document.getElementById('app');
                        const navEl = document.getElementById('navbar');
                        if (appEl) appEl.style.display = '';
                        if (navEl) navEl.style.display = '';
                        updateNavProfile();
                    }
                } else {
                    // User is signed out.
                    const appEl = document.getElementById('app');
                    const navEl = document.getElementById('navbar');
                    if (appEl) appEl.style.display = 'none';
                    if (navEl) navEl.style.display = 'none';
                    showWelcomeModal();
                }
            });
        } else {
            // Fallback if auth.js failed to load
            if (Storage.isFirstVisit()) {
                showWelcomeModal();
            } else {
                updateNavProfile();
            }
        }

        // Initialize router (will render the first page)
        Router.init();

        // Remove initial loader
        const loader = document.getElementById('initial-loader');
        if (loader) loader.style.display = 'none';

        // Initialize feather icons for static HTML
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Show Daily Challenge notification
        setTimeout(() => {
            UIUtils.showToast('Complete the Daily Challenge to get Reward', 'info', 5000);
        }, 1000);
    });

    // ── Navbar ──

    function setupNavbar() {
        const hamburger = document.getElementById('nav-hamburger');
        const navLinks = document.getElementById('nav-links');

        if (hamburger && navLinks) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('open');
            });

            // Close mobile menu when clicking a link
            navLinks.querySelectorAll('.nav-link').forEach((link) => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('open');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('open');
                }
            });
        }

        // Hide navbar on scroll down, show on scroll up
        let lastScroll = 0;
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > lastScroll && currentScroll > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ── Sound Toggle ──

    function setupSoundToggle() {
        const toggle = document.getElementById('sound-toggle');
        if (!toggle) return;

        const settings = Storage.getSettings();
        updateSoundIcon(settings.soundEnabled);

        toggle.addEventListener('click', () => {
            const settings = Storage.getSettings();
            settings.soundEnabled = !settings.soundEnabled;
            Storage.saveSettings(settings);
            updateSoundIcon(settings.soundEnabled);
            UIUtils.playSound('click');
        });
    }

    function updateSoundIcon(enabled) {
        const soundOn = document.querySelector('.sound-on');
        const soundOff = document.querySelector('.sound-off');
        if (soundOn) soundOn.style.display = enabled ? '' : 'none';
        if (soundOff) soundOff.style.display = enabled ? 'none' : '';
    }

    // ── Welcome Modal ──

    function showWelcomeModal() {
        const modal = document.getElementById('welcome-modal');
        if (!modal) return;
        modal.style.display = '';

        let isLogin = true; // Track current mode (Login vs SignUp)

        const tabLogin = document.getElementById('tab-login');
        const tabSignup = document.getElementById('tab-signup');
        const emailForm = document.getElementById('email-auth-form');
        let emailSubmitBtn = document.getElementById('email-submit-btn');

        if (tabLogin && tabSignup) {
            tabLogin.addEventListener('click', () => {
                isLogin = true;
                tabLogin.style.background = 'rgba(108, 92, 231, 0.1)';
                tabLogin.style.border = '2px solid var(--primary)';
                tabSignup.style.background = 'transparent';
                tabSignup.style.border = '2px solid transparent';
                if (emailSubmitBtn) emailSubmitBtn.textContent = 'Sign In';
            });
            tabSignup.addEventListener('click', () => {
                isLogin = false;
                tabSignup.style.background = 'rgba(108, 92, 231, 0.1)';
                tabSignup.style.border = '2px solid var(--primary)';
                tabLogin.style.background = 'transparent';
                tabLogin.style.border = '2px solid transparent';
                if (emailSubmitBtn) emailSubmitBtn.textContent = 'Create Account';
            });
        }

        if (emailForm) {
            // Remove old listeners by cloning
            const newForm = emailForm.cloneNode(true);
            emailForm.parentNode.replaceChild(newForm, emailForm);
            
            // Re-query the submit button from the new form so text updates work
            emailSubmitBtn = newForm.querySelector('#email-submit-btn');
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // We re-query the inputs from the new form
                const emailInput = newForm.querySelector('#auth-email');
                const passwordInput = newForm.querySelector('#auth-password');
                const email = emailInput ? emailInput.value : '';
                const password = passwordInput ? passwordInput.value : '';

                if (!email || !password) {
                    UIUtils.showToast('Please enter both email and password.', 'warning');
                    return;
                }

                if (isLogin) {
                    if (window.signInWithEmail) {
                        window.signInWithEmail(email, password).catch((error) => {
                            console.error("Email login failed:", error);
                            UIUtils.showToast(error.message || 'Login failed. Please try again.', 'error');
                        });
                    }
                } else {
                    if (window.signUpWithEmail) {
                        window.signUpWithEmail(email, password).catch((error) => {
                            console.error("Email signup failed:", error);
                            UIUtils.showToast(error.message || 'Signup failed. Please try again.', 'error');
                        });
                    }
                }
            });
        }

        // Start button (Google Sign In)
        const signinBtn = document.getElementById('google-signin-btn');
        if (signinBtn) {
            // Remove previous listeners to avoid duplicates if called multiple times
            const newBtn = signinBtn.cloneNode(true);
            signinBtn.parentNode.replaceChild(newBtn, signinBtn);
            newBtn.addEventListener('click', () => {
                if (window.signInWithGoogle) {
                    window.signInWithGoogle().catch((error) => {
                        console.error("Sign in failed:", error);
                        UIUtils.showToast('Login failed. Please try again.', 'error');
                    });
                } else {
                    UIUtils.showToast('Firebase not configured. Please add your config in js/auth.js', 'warning');
                }
            });
        }
    }

    function showProfileSetupModal(user) {
        const modal = document.getElementById('profile-setup-modal');
        if (!modal) return;
        modal.style.display = '';

        // Pre-fill Google Name
        const nameInput = document.getElementById('setup-username-input');
        if (nameInput) nameInput.value = user.displayName || '';

        // Avatar selection
        const avatarSelector = document.getElementById('setup-avatar-selector');
        let selectedAvatar = user.photoURL || '🦁';

        // Pre-fill google avatar preview button if URL exists
        const googleAvatarBtn = document.getElementById('google-avatar-btn');
        if (googleAvatarBtn) {
            if (user.photoURL) {
                googleAvatarBtn.innerHTML = `<img src="${user.photoURL}" referrerpolicy="no-referrer" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block;">`;
                googleAvatarBtn.dataset.avatar = user.photoURL;
            } else {
                googleAvatarBtn.style.display = 'none';
                selectedAvatar = '🦁'; // default to lion if no google photo
            }
        }

        // Preview header
        const preview = document.getElementById('setup-avatar-preview');
        const updatePreview = (val) => {
             if (preview) {
                 preview.innerHTML = UIUtils.renderAvatar(val);
             }
        };
        updatePreview(selectedAvatar);

        if (avatarSelector) {
            avatarSelector.addEventListener('click', (e) => {
                const btn = e.target.closest('.avatar-option');
                if (!btn) return;
                UIUtils.playSound('click');
                avatarSelector.querySelectorAll('.avatar-option').forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedAvatar = btn.dataset.avatar;
                updatePreview(selectedAvatar);
            });
        }

        // Start button
        const startBtn = document.getElementById('setup-start-btn');
        if (startBtn) {
            const newStartBtn = startBtn.cloneNode(true);
            startBtn.parentNode.replaceChild(newStartBtn, startBtn);
            
            newStartBtn.addEventListener('click', () => {
                const username = document.getElementById('setup-username-input').value.trim();
                const classNum = document.getElementById('setup-class-select').value;

                if (!username) {
                    UIUtils.showToast('Please enter your name!', 'warning');
                    document.getElementById('setup-username-input').focus();
                    return;
                }

                // Save profile
                Storage.saveProfile({
                    username,
                    avatar: selectedAvatar,
                    classNum: parseInt(classNum),
                    xp: 0,
                    level: 1,
                    totalQuizzes: 0,
                    totalCorrect: 0,
                    totalQuestions: 0,
                    badges: [],
                    createdAt: new Date().toISOString(),
                });

                // Close modal and show app
                modal.style.display = 'none';
                const appEl = document.getElementById('app');
                const navEl = document.getElementById('navbar');
                if (appEl) appEl.style.display = '';
                if (navEl) navEl.style.display = '';

                // Update nav
                updateNavProfile();

                // Welcome toast
                UIUtils.showToast(`Welcome, ${username}!  Let's start learning!`, 'success', 4000);
                UIUtils.playSound('levelup');
            });

            // Enter key on input
            if (nameInput) {
                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') newStartBtn.click();
                });
            }
        }
    }

    // ── Update Nav Profile Info ──

    function updateNavProfile() {
        const profile = Storage.getProfile();
        const streak = Storage.getStreak();

        const xpEl = document.getElementById('nav-xp-value');
        const streakEl = document.getElementById('nav-streak-value');
        const avatarEl = document.getElementById('nav-profile-avatar');

        if (xpEl) xpEl.textContent = profile.xp || 0;
        if (streakEl) streakEl.textContent = streak.current || 0;
        if (avatarEl) {
            if (profile.username && profile.avatar) {
                avatarEl.innerHTML = UIUtils.renderAvatar(profile.avatar);
                avatarEl.style.fontSize = '18px'; // Make emoji readable
            } else {
                avatarEl.innerHTML = '<i data-feather="user"></i>';
                if (window.feather) feather.replace();
            }
        }
    }

    // ── Register Service Worker (PWA) ──
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {
                // SW not available — fine, not critical
            });
        });
    }
})();
