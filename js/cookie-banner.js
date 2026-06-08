/**
 * EduQuiz — Cookie Consent Banner Logic
 * Shows a banner to the user to accept cookie policy if they haven't already.
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const banner = document.getElementById('cookie-consent-banner');
        const acceptBtn = document.getElementById('accept-cookies-btn');

        if (!banner || !acceptBtn) return;

        // Check if cookies are already accepted
        const cookiesAccepted = localStorage.getItem('eduquiz_cookies_accepted');

        if (!cookiesAccepted) {
            // Show the banner with a slight delay
            setTimeout(() => {
                banner.style.display = 'flex';
                // Trigger CSS transition
                setTimeout(() => {
                    banner.classList.add('show');
                }, 50);
            }, 1000);
        }

        // Handle Accept click
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('eduquiz_cookies_accepted', 'true');
            banner.classList.remove('show');
            
            // Wait for transition to finish before hiding display
            setTimeout(() => {
                banner.style.display = 'none';
            }, 400); // matches CSS transition time
        });
    });
})();
