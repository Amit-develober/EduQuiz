/**
 * EduQuiz — SPA Router
 * Hash-based routing with animated page transitions.
 * Supports parameterized routes like #/quiz/class8/maths
 */

const Router = (() => {
    // Route registry: pattern → { page, title }
    const routes = {};
    let currentPage = null;
    let appContainer = null;

    /**
     * Register a route.
     * @param {string} pattern — e.g., '/home', '/quiz/:classNum/:subject'
     * @param {object} config — { render: Function, title: string }
     */
    function register(pattern, config) {
        routes[pattern] = config;
    }

    /**
     * Match a hash path against registered route patterns.
     * Supports :param syntax.
     */
    function matchRoute(path) {
        // Direct match first
        if (routes[path]) {
            return { config: routes[path], params: {} };
        }

        // Pattern matching with params
        for (const pattern in routes) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');

            if (patternParts.length !== pathParts.length) continue;

            const params = {};
            let match = true;

            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    params[patternParts[i].slice(1)] = pathParts[i];
                } else if (patternParts[i] !== pathParts[i]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return { config: routes[pattern], params };
            }
        }

        return null;
    }

    /**
     * Navigate to a new route.
     */
    function navigate(path) {
        window.location.hash = '#' + path;
    }

    /**
     * Update the active nav link.
     */
    function updateNavActive(path) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link) => {
            link.classList.remove('active');
            const route = link.getAttribute('data-route');
            if (route && path.startsWith('/' + route)) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Handle route change.
     */
    async function handleRouteChange() {
        if (!appContainer) {
            appContainer = document.getElementById('app');
        }

        const hash = window.location.hash || '#/home';
        const path = hash.slice(1) || '/home'; // Remove '#'

        const result = matchRoute(path);

        if (!result) {
            // 404 — redirect to home
            navigate('/home');
            return;
        }

        const { config, params } = result;

        // Animate out current page
        if (currentPage) {
            appContainer.classList.add('page-exit');
            await new Promise((r) => setTimeout(r, 200));
        }

        document.title = config.title
            ? `${config.title} — EduQuiz`
            : 'EduQuiz — Interactive Quiz for Class 6-10';

        // Render new page
        try {
            const html = await config.render(params);
            appContainer.innerHTML = `<div class="page container">${html}</div>`;
            appContainer.classList.remove('page-exit');
            if (typeof feather !== 'undefined') feather.replace();

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Run page init if provided
            if (config.init) {
                config.init(params);
            }

            currentPage = path;
        } catch (err) {
            console.error('Router render error:', err);
            appContainer.innerHTML = `
                <div class="page container" style="text-align:center; padding: 4rem 0;">
                    <h2><i data-feather="alert-triangle"></i>️ Oops!</h2>
                    <p style="color: var(--text-secondary); margin: 1rem 0;">Something went wrong loading this page.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/home')">Go Home</button>
                </div>
            `;
        }

        // Update nav
        updateNavActive(path);

        // Close mobile menu if open
        const navLinks = document.getElementById('nav-links');
        const hamburger = document.getElementById('nav-hamburger');
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('active');

        // Hide footer on quiz page for cleaner experience
        const footer = document.getElementById('footer');
        if (footer) {
            footer.style.display = path.startsWith('/quiz/') ? 'none' : '';
        }
    }

    /**
     * Initialize the router — listen for hash changes.
     */
    function init() {
        appContainer = document.getElementById('app');
        window.addEventListener('hashchange', handleRouteChange);

        // Handle initial load
        if (!window.location.hash) {
            window.location.hash = '#/home';
        } else {
            handleRouteChange();
        }
    }

    /**
     * Get current route path.
     */
    function getCurrentPath() {
        return (window.location.hash || '#/home').slice(1);
    }

    // ── Public API ──
    return {
        register,
        navigate,
        init,
        getCurrentPath,
        handleRouteChange,
    };
})();
