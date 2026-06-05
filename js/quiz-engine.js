/**
 * EduQuiz — Quiz Engine
 * Handles question loading, shuffling, scoring, timer,
 * bookmarking, and state management for quizzes.
 */

const QuizEngine = (() => {
    // ── State ──
    let questions = [];
    let currentIndex = 0;
    let answers = []; // { selectedIndex, isCorrect, isSkipped, optionText }
    let score = 0;
    let startTime = null;
    let timerInterval = null;
    let timeRemaining = 0;
    let classNum = null;
    let subject = null;
    let isCompleted = false;
    let currentQuestionStartTime = null;
    let timerEnabled = false;
    let timedOut = false;

    // ── Question Loading ──

    /**
     * Load questions from JSON file for given class and subject.
     */
    async function loadQuestions(cls, subj) {
        classNum = cls;
        subject = subj;

        try {
            const response = await fetch(`data/class${cls}/${subj}.json`);
            if (!response.ok) {
                throw new Error(`Data not found for Class ${cls} ${subj}`);
            }
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('QuizEngine: Failed to load questions', err);
            UIUtils.showToast('Failed to load questions. Please try again.', 'error');
            throw err;
        }
    }

    /**
     * Initialize a new quiz session.
     */
    async function startQuiz(cls, subj, options = {}) {
        const rawQuestions = await loadQuestions(cls, subj);

        // Shuffle questions
        questions = UIUtils.shuffleArray(rawQuestions);

        // Optionally limit question count
        if (options.questionCount && options.questionCount < questions.length) {
            questions = questions.slice(0, options.questionCount);
        }

        // Shuffle options within each question (keep track of correct answer)
        questions = questions.map((q, idx) => {
            const shuffledOptions = UIUtils.shuffleArray([...q.options]);
            return {
                ...q,
                options: shuffledOptions,
            };
        });

        // Reset state
        currentIndex = 0;
        answers = new Array(questions.length).fill(null);
        score = 0;
        startTime = Date.now();
        currentQuestionStartTime = Date.now();
        isCompleted = false;
        timedOut = false;

        // Timer setup
        timerEnabled = !!options.timerEnabled;
        if (timerEnabled) {
            timeRemaining = (options.timerDuration || 30) * questions.length;
        }

        return {
            totalQuestions: questions.length,
            classNum,
            subject,
        };
    }

    // ── Navigation ──

    function getCurrentQuestion() {
        if (currentIndex >= questions.length) return null;
        return {
            ...questions[currentIndex],
            index: currentIndex,
            total: questions.length,
            answered: answers[currentIndex] !== null,
            answer: answers[currentIndex],
        };
    }

    function goToNext() {
        if (currentIndex < questions.length - 1) {
            currentIndex++;
            currentQuestionStartTime = Date.now();
            return getCurrentQuestion();
        }
        return null;
    }

    function goToPrevious() {
        if (currentIndex > 0) {
            currentIndex--;
            currentQuestionStartTime = Date.now();
            return getCurrentQuestion();
        }
        return null;
    }

    function goToQuestion(index) {
        if (index >= 0 && index < questions.length) {
            currentIndex = index;
            currentQuestionStartTime = Date.now();
            return getCurrentQuestion();
        }
        return null;
    }

    // ── Answer Submission ──

    /**
     * Submit an answer for the current question.
     * Returns { isCorrect, correctAnswer, explanation }
     */
    function submitAnswer(selectedOptionIndex) {
        const question = questions[currentIndex];
        if (!question || answers[currentIndex] !== null) return null;

        const selectedOption = question.options[selectedOptionIndex];
        const isCorrect = selectedOption === question.answer;

        const settings = Storage.getSettings();

        // Calculate points
        if (isCorrect) {
            score += 1;
        } else if (settings.penaltyEnabled) {
            score = Math.max(0, score - 1);
        }

        // Calculate time taken for this answer in seconds
        const timeTaken = currentQuestionStartTime
            ? (Date.now() - currentQuestionStartTime) / 1000
            : 0;

        answers[currentIndex] = {
            selectedIndex: selectedOptionIndex,
            selectedOption,
            isCorrect,
            isSkipped: false,
            timeTaken,
        };

        return {
            isCorrect,
            correctAnswer: question.answer,
            correctIndex: question.options.indexOf(question.answer),
            explanation: question.explanation,
            selectedOption,
        };
    }

    /**
     * Skip the current question.
     */
    function skipQuestion() {
        if (answers[currentIndex] !== null) return;

        answers[currentIndex] = {
            selectedIndex: -1,
            selectedOption: null,
            isCorrect: false,
            isSkipped: true,
        };
    }

    // ── Timer ──

    function startTimer(onTick, onTimeUp) {
        if (timerInterval) clearInterval(timerInterval);

        timerInterval = setInterval(() => {
            timeRemaining--;
            if (onTick) onTick(timeRemaining);

            if (timeRemaining <= 0) {
                timedOut = true;
                clearInterval(timerInterval);
                if (onTimeUp) onTimeUp();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function getTimeRemaining() {
        return timeRemaining;
    }

    // ── Results ──

    function getResults() {
        const endTime = Date.now();
        const timeTaken = Math.round((endTime - startTime) / 1000);
        const total = questions.length;

        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        answers.forEach((a) => {
            if (!a || a.isSkipped) skipped++;
            else if (a.isCorrect) correct++;
            else wrong++;
        });
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
            classNum,
            subject,
            score,
            total,
            correct,
            wrong,
            skipped,
            percentage,
            timeTaken,
            timedOut,
            answers: answers.map((a, i) => ({
                selectedIndex: a ? a.selectedIndex : -1,
                selectedOption: a ? a.selectedOption : null,
                isCorrect: a ? a.isCorrect : false,
                isSkipped: a ? a.isSkipped : true,
                timeTaken: a ? a.timeTaken : null,
                question: questions[i]?.question,
                correctAnswer: questions[i]?.answer,
                explanation: questions[i]?.explanation,
            })),
        };
    }

    function isQuizComplete() {
        return answers.every((a) => a !== null);
    }

    function getProgress() {
        const answered = answers.filter((a) => a !== null).length;
        return {
            answered,
            total: questions.length,
            percentage: Math.round((answered / questions.length) * 100),
            currentIndex,
            score,
        };
    }



    // ── Cleanup ──

    function reset() {
        questions = [];
        currentIndex = 0;
        answers = [];
        score = 0;
        startTime = null;
        currentQuestionStartTime = null;
        isCompleted = false;
        timerEnabled = false;
        timedOut = false;
        stopTimer();
    }

    // ── Public API ──
    return {
        startQuiz,
        getCurrentQuestion,
        goToNext,
        goToPrevious,
        goToQuestion,
        submitAnswer,
        skipQuestion,
        startTimer,
        stopTimer,
        getTimeRemaining,
        getResults,
        isQuizComplete,
        getProgress,
        reset,
    };
})();
