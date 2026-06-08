/**
 * EduQuiz — Quiz Page
 * The core quiz experience — question display, option selection,
 * feedback, navigation, timer, keyboard support, and bookmarks.
 */

const QuizPage = (() => {
    let currentResult = null;
    let quizActive = false;
    let isSubmitting = false;
    let autoAdvanceTimeout = null;
    let isTransitioning = false;

    function render(params) {
        // Show loading state — init() will start the quiz
        return `
            <div class="quiz-page" id="quiz-container">
                <div class="page-loading">
                    <div class="spinner"></div>
                    <p>Loading quiz...</p>
                </div>
            </div>
        `;
    }

    async function init(params) {
        const classNum = params.classNum ? params.classNum.replace('class', '') : '8';
        const subject = params.subject || 'maths';
        const container = document.getElementById('quiz-container');
        if (!container) return;

        const subjectMeta = UIUtils.getSubjectMeta(subject);
        const settings = Storage.getSettings();

        try {
            await QuizEngine.startQuiz(classNum, subject, {
                timerEnabled: settings.timerEnabled,
                timerDuration: settings.timerDuration,
                questionCount: 10,
            });

            quizActive = true;
            isSubmitting = false;
            isTransitioning = false;
            renderQuestion(container, classNum, subject, subjectMeta, settings);

            // Keyboard support
            document.addEventListener('keydown', handleKeyboard);

            // Start timer if enabled
            if (settings.timerEnabled) {
                QuizEngine.startTimer(
                    (remaining) => updateTimerDisplay(remaining),
                    () => finishQuiz(container, classNum, subject)
                );
            }
        } catch (err) {
            container.innerHTML = `
                <div style="text-align: center; padding: 4rem 0;">
                    <h2><i data-feather="frown"></i> Could not load quiz</h2>
                    <p class="text-secondary" style="margin: 1rem 0;">There was an error loading the questions.</p>
                    <button class="btn btn-primary" onclick="Router.navigate('/subjects/class${classNum}')">
                        ← Go Back
                    </button>
                </div>
            `;
        }
    }

    function renderQuestion(container, classNum, subject, subjectMeta, settings) {
        isTransitioning = false;
        const question = QuizEngine.getCurrentQuestion();
        if (!question) return;

        const progress = QuizEngine.getProgress();
        const labels = ['A', 'B', 'C', 'D'];

        const timerHTML = settings.timerEnabled
            ? `<div class="quiz-timer" id="quiz-timer">
                   <i data-feather="clock"></i> <span id="timer-display">${UIUtils.formatTime(QuizEngine.getTimeRemaining())}</span>
               </div>`
            : '';

        container.innerHTML = `
            <!-- Quiz Header -->
            <div class="quiz-header">
                <div class="quiz-info">
                    <button class="btn btn-ghost btn-sm" onclick="confirmQuit()" id="quiz-quit-btn">
                        ← Quit
                    </button>
                    <span class="quiz-subject-badge badge badge-primary">
                        ${subjectMeta.emoji} Class ${classNum} ${subjectMeta.name}
                    </span>
                    <div class="quiz-counter">
                        <span>${question.index + 1}</span>/${question.total}
                    </div>
                </div>
                <div class="quiz-stats">
                    <div class="quiz-score">${progress.score}</div>
                    ${timerHTML}
                </div>
            </div>

            <!-- Progress Bar -->
            <div class="quiz-progress">
                <div class="quiz-progress-bar">
                    <div class="quiz-progress-fill" style="width: ${((question.index + 1) / question.total) * 100}%"></div>
                </div>
            </div>

            <!-- Question Card -->
            <div class="question-card glass-card-static" id="question-card">
                <div class="question-top">
                    <span class="question-number">Question ${question.index + 1} of ${question.total}</span>
                </div>
                <h2 class="question-text">${question.question}</h2>

                <div class="options-grid" id="options-grid">
                    ${question.options.map((opt, i) => {
                        let stateClass = '';
                        if (question.answered && question.userAnswer) {
                            if (question.userAnswer.selectedIndex === i) {
                                stateClass = question.userAnswer.isCorrect ? 'correct' : 'wrong';
                            }
                            if (opt === question.answer
                                && !question.userAnswer.isCorrect
                                && question.userAnswer.selectedIndex !== i) {
                                stateClass = 'correct';
                            }
                            stateClass += ' disabled';
                        }
                        return `
                            <button class="option-btn ${stateClass}"
                                    onclick="QuizPage.selectOption(${i})"
                                    id="option-${i}"
                                    ${question.answered ? 'disabled' : ''}>
                                <span class="option-label">${labels[i]}</span>
                                <span class="option-text">${opt}</span>
                            </button>
                        `;
                    }).join('')}
                </div>

                <!-- Feedback & Explanation (shown after answer) -->
                <div id="feedback-area"></div>
            </div>

            <!-- Navigation -->
            <div class="quiz-nav">
                <div class="quiz-nav-left">
                    <button class="btn btn-ghost btn-sm" onclick="QuizPage.prevQuestion()"
                            ${question.index === 0 ? 'disabled' : ''} id="prev-btn">
                        ← Previous
                    </button>
                </div>
                <div class="quiz-nav-right">
                    <button class="btn btn-ghost btn-sm" onclick="QuizPage.skip()"
                            ${question.answered ? 'disabled' : ''} id="skip-btn">
                        Skip ⏭️
                    </button>
                    ${question.index < question.total - 1
                        ? `<button class="btn btn-primary btn-sm" onclick="QuizPage.nextQuestion()" id="next-btn" ${!question.answered ? 'disabled' : ''}>
                               Next →
                           </button>`
                        : `<button class="btn btn-success btn-sm" onclick="QuizPage.finishQuiz()" id="finish-btn" ${!question.answered ? 'disabled' : ''}>
                               Finish Quiz <i data-feather="check-circle"></i>
                           </button>`
                    }
                </div>
            </div>
        `;

        // If already answered, show feedback
        if (question.answered && question.userAnswer && !question.userAnswer.isSkipped) {
            showAnswerFeedback(question);
        }

        if (window.feather) feather.replace();
    }

    function selectOption(optionIndex) {
        if (isTransitioning) return;
        const result = QuizEngine.submitAnswer(optionIndex);
        if (!result) return;

        UIUtils.playSound(result.isCorrect ? 'correct' : 'wrong');

        // Update option buttons
        const options = document.querySelectorAll('.option-btn');
        options.forEach((btn, i) => {
            btn.classList.add('disabled');
            btn.setAttribute('disabled', 'true');

            if (i === optionIndex) {
                btn.classList.add(result.isCorrect ? 'correct' : 'wrong');
            }
            if (i === result.correctIndex && !result.isCorrect) {
                btn.classList.add('correct');
            }
        });

        // Update score display
        const progress = QuizEngine.getProgress();
        const scoreEl = document.querySelector('.quiz-score');
        if (scoreEl) {
            scoreEl.innerHTML = `${progress.score}`;
        }

        // Show feedback
        const question = QuizEngine.getCurrentQuestion();
        showAnswerFeedback(question);

        // Enable next/finish navigation buttons, disable skip button
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) nextBtn.removeAttribute('disabled');
        const finishBtn = document.getElementById('finish-btn');
        if (finishBtn) finishBtn.removeAttribute('disabled');
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn) skipBtn.setAttribute('disabled', 'true');

        // Auto-advance after delay for correct answers
        if (result.isCorrect) {
            if (autoAdvanceTimeout) clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = setTimeout(() => {
                if (question.index < question.total - 1) {
                    QuizPage.nextQuestion();
                }
                autoAdvanceTimeout = null;
            }, 1500);
        }
    }

    function showAnswerFeedback(question) {
        const feedbackArea = document.getElementById('feedback-area');
        if (!feedbackArea) return;

        const isCorrect = question.userAnswer ? question.userAnswer.isCorrect : false;
        const motivation = UIUtils.getMotivation(isCorrect ? 'correct' : 'wrong');
        const settings = Storage.getSettings();

        let html = `
            <div class="feedback-message ${isCorrect ? 'correct' : 'wrong'}">
                ${motivation}
            </div>
        `;

        if (settings.showExplanations && question.explanation) {
            html += `
                <div class="explanation-box">
                    <div class="explanation-title"><i data-feather="zap"></i> Explanation</div>
                    <div class="explanation-text">${question.explanation}</div>
                </div>
            `;
        }

        feedbackArea.innerHTML = html;
        if (window.feather) feather.replace();
    }

    function nextQuestion() {
        if (isTransitioning) return;
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn && nextBtn.hasAttribute('disabled')) return; // Prevent double trigger
        if (nextBtn) nextBtn.setAttribute('disabled', 'true');

        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }

        isTransitioning = true;
        UIUtils.playSound('click');
        const question = QuizEngine.goToNext();
        if (question) {
            refreshQuizUI();
        }
    }

    function prevQuestion() {
        if (isTransitioning) return;
        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn && prevBtn.hasAttribute('disabled')) return;
        if (prevBtn) prevBtn.setAttribute('disabled', 'true');

        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }

        isTransitioning = true;
        UIUtils.playSound('click');
        const question = QuizEngine.goToPrevious();
        if (question) {
            refreshQuizUI();
        }
    }

    function skip() {
        if (isTransitioning) return;
        const skipBtn = document.getElementById('skip-btn');
        if (skipBtn && skipBtn.hasAttribute('disabled')) return;
        if (skipBtn) skipBtn.setAttribute('disabled', 'true');

        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }

        isTransitioning = true;
        UIUtils.playSound('click');
        QuizEngine.skipQuestion();
        const next = QuizEngine.goToNext();
        if (next) {
            refreshQuizUI();
        } else {
            // Last question — offer finish
            refreshQuizUI();
        }
    }



    function refreshQuizUI() {
        const container = document.getElementById('quiz-container');
        if (!container) return;

        const hash = window.location.hash;
        const parts = hash.replace('#/quiz/', '').split('/');
        const classNum = parts[0] ? parts[0].replace('class', '') : '8';
        const subject = parts[1] || 'maths';
        const subjectMeta = UIUtils.getSubjectMeta(subject);
        const settings = Storage.getSettings();

        renderQuestion(container, classNum, subject, subjectMeta, settings);
    }

    function finishQuiz() {
        if (isSubmitting || isTransitioning) return;
        isSubmitting = true;
        isTransitioning = true;
        
        if (autoAdvanceTimeout) {
            clearTimeout(autoAdvanceTimeout);
            autoAdvanceTimeout = null;
        }

        QuizEngine.stopTimer();
        const results = QuizEngine.getResults();

        // Process gamification
        const gamResults = Gamification.processQuizCompletion(results);

        // Store results for result page
        currentResult = {
            ...results,
            xpEarned: gamResults.xpEarned,
            xpBreakdown: gamResults.xpBreakdown,
            leveledUp: gamResults.leveledUp,
            newLevel: gamResults.newLevel,
            newBadges: gamResults.newBadges,
            streak: gamResults.streak,
        };

        // Store in sessionStorage for result page
        sessionStorage.setItem('mm_last_result', JSON.stringify(currentResult));

        // Cleanup
        quizActive = false;
        document.removeEventListener('keydown', handleKeyboard);
        QuizEngine.reset();

        // Navigate to results
        Router.navigate(`/result/class${results.classNum}/${results.subject}`);
    }

    function updateTimerDisplay(remaining) {
        const display = document.getElementById('timer-display');
        const timerEl = document.getElementById('quiz-timer');
        if (display) {
            display.textContent = UIUtils.formatTime(remaining);
        }
        if (timerEl) {
            timerEl.classList.remove('warning', 'danger');
            if (remaining <= 10) timerEl.classList.add('danger');
            else if (remaining <= 30) timerEl.classList.add('warning');
        }
    }

    function handleKeyboard(e) {
        if (!quizActive) return;
        const question = QuizEngine.getCurrentQuestion();
        if (!question) return;

        switch (e.key) {
            case '1': case 'a': case 'A':
                if (!question.answered) selectOption(0);
                break;
            case '2': case 'b': case 'B':
                if (!question.answered) selectOption(1);
                break;
            case '3': case 'c': case 'C':
                if (!question.answered) selectOption(2);
                break;
            case '4': case 'd': case 'D':
                if (!question.answered) selectOption(3);
                break;
            case 'ArrowRight':
            case 'Enter':
                e.preventDefault();
                if (question.answered) nextQuestion();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                prevQuestion();
                break;
            case 's': case 'S':
                if (!question.answered) skip();
                break;
        }
    }

    // Make confirmQuit global
    window.confirmQuit = function () {
        if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
            quizActive = false;
            if (autoAdvanceTimeout) {
                clearTimeout(autoAdvanceTimeout);
                autoAdvanceTimeout = null;
            }
            document.removeEventListener('keydown', handleKeyboard);
            QuizEngine.stopTimer();
            QuizEngine.reset();
            Router.navigate('/class');
        }
    };

    // Register route
    Router.register('/quiz/:classNum/:subject', {
        render,
        init,
        title: 'Quiz',
    });

    // Public API for onclick handlers
    return {
        selectOption,
        nextQuestion,
        prevQuestion,
        skip,
        finishQuiz,
        currentResult: () => currentResult,
    };
})();
