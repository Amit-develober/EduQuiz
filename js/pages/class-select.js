/**
 * EduQuiz — Class Selection Page
 * Animated cards for Class 6-10 with gradients and subject badges.
 */

const ClassSelectPage = (() => {
    const CLASSES = [
        {
            num: 6,
            emoji: '<i data-feather="book"></i>',
            tagline: 'Build your foundation',
            subjects: ['<i data-feather="pen-tool"></i> Maths', '<i data-feather="search"></i> Science', '<i data-feather="globe"></i> SST'],
        },
        {
            num: 7,
            emoji: '<i data-feather="book"></i>',
            tagline: 'Strengthen your skills',
            subjects: ['<i data-feather="pen-tool"></i> Maths', '<i data-feather="search"></i> Science', '<i data-feather="globe"></i> SST'],
        },
        {
            num: 8,
            emoji: '<i data-feather="book"></i>',
            tagline: 'Level up your knowledge',
            subjects: ['<i data-feather="pen-tool"></i> Maths', '<i data-feather="search"></i> Science', '<i data-feather="globe"></i> SST'],
        },
        {
            num: 9,
            emoji: '<i data-feather="book"></i>',
            tagline: 'Journey Starts For Boards',
            subjects: ['<i data-feather="pen-tool"></i> Maths', '<i data-feather="search"></i> Science', '<i data-feather="globe"></i> SST'],
        },
        {
            num: 10,
            emoji: '<i data-feather="book"></i>',
            tagline: 'Master the finals',
            subjects: ['<i data-feather="pen-tool"></i> Maths', '<i data-feather="search"></i> Science', '<i data-feather="globe"></i> SST'],
        },
    ];

    function render() {
        const cardsHTML = CLASSES.map((cls, i) => `
            <div class="class-card glass-card" data-class="${cls.num}"
                 onclick="Router.navigate('/subjects/class${cls.num}')"
                 style="animation-delay: ${i * 0.1}s"
                 id="class-card-${cls.num}">
                <div class="class-number">${cls.num}</div>
                <div class="class-label">Class ${cls.num}</div>
                <p class="text-secondary" style="font-size: var(--fs-sm); margin-bottom: var(--space-md);">
                    ${cls.tagline}
                </p>
                <div class="class-subjects">
                    ${cls.subjects.map((s) => `<span class="chip">${s}</span>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm class-btn">
                    Start Learning →
                </button>
            </div>
        `).join('');

        return `
            <div class="class-page">
                <div class="section-header">
                    <h1>Select Your <span class="text-gradient">Class</span></h1>
                    <p>Choose your class to see available quizzes</p>
                </div>
                <div class="class-grid">
                    ${cardsHTML}
                </div>
            </div>
        `;
    }

    function init() {
        // Removed heavy staggered animations for a smoother experience
    }

    // Register route
    Router.register('/class', {
        render,
        init,
        title: 'Select Class',
    });

    return { render, init };
})();
