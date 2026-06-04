/**
 * EduQuiz — Subject Selection Page
 * Shows Maths, Science, SST cards for the selected class.
 */

const SubjectSelectPage = (() => {
    const SUBJECTS = [
        {
            key: 'maths',
            name: 'Mathematics',
            emoji: '<i data-feather="pen-tool"></i>',
            icon: '',
            desc: 'Numbers, Algebra, Geometry, Mensuration & more',
            difficulty: 'Medium',
            questions: 10,
            cssClass: 'maths',
        },
        {
            key: 'science',
            name: 'Science',
            emoji: '<i data-feather="search"></i>',
            icon: '',
            desc: 'Physics, Chemistry, Biology & Environmental Science',
            difficulty: 'Medium',
            questions: 10,
            cssClass: 'science',
        },
        {
            key: 'sst',
            name: 'Social Science',
            emoji: '<i data-feather="globe"></i>',
            icon: '',
            desc: 'History, Geography, Civics & Economics',
            difficulty: 'Easy',
            questions: 10,
            cssClass: 'sst',
        },
    ];

    function render(params) {
        const classNum = params.classNum ? params.classNum.replace('class', '') : '8';
        const classMeta = UIUtils.getClassMeta(classNum);

        const cardsHTML = SUBJECTS.map((subj, i) => {
            const history = Storage.getHistoryBySubject(classNum, subj.key);
            const bestScore = history.length > 0
                ? Math.max(...history.map((h) => h.percentage))
                : null;

            return `
                <div class="subject-card glass-card ${subj.cssClass}"
                     onclick="Router.navigate('/quiz/class${classNum}/${subj.key}')"
                     style="animation-delay: ${i * 0.15}s"
                     id="subject-card-${subj.key}">
                    <span class="subject-icon">${subj.emoji}</span>
                    <h3 class="subject-title">${subj.name}</h3>
                    <p class="text-secondary" style="font-size: var(--fs-sm); line-height: 1.6;">
                        ${subj.desc}
                    </p>
                    <div class="subject-meta">
                        <span class="badge badge-primary">${subj.difficulty}</span>
                        <span class="badge badge-warning">${subj.questions} Questions</span>
                        ${bestScore !== null
                            ? `<span class="badge badge-success">Best: ${bestScore}%</span>`
                            : ''
                        }
                    </div>
                    <button class="btn btn-primary subject-start-btn">
                        Start Quiz →
                    </button>
                </div>
            `;
        }).join('');

        return `
            <div class="subject-page">
                <div class="section-header">
                    <button class="btn btn-ghost btn-sm" onclick="Router.navigate('/class')" style="margin-bottom: var(--space-lg);">
                        ← Back to Classes
                    </button>
                    <h1>Class <span class="text-gradient">${classNum}</span> Subjects</h1>
                    <p>Choose a subject to start your quiz</p>
                </div>
                <div class="subject-grid">
                    ${cardsHTML}
                </div>
            </div>
        `;
    }

    function init() {
        // Removed heavy staggered animations for a smoother experience
    }

    // Register route
    Router.register('/subjects/:classNum', {
        render,
        init,
        title: 'Select Subject',
    });

    return { render, init };
})();
