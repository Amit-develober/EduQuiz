/**
 * EduQuiz — About Page
 * Information about the platform, features, and contact.
 */

const AboutPage = (() => {
    function render() {
        return `
            <div class="about-page">
                <div class="about-hero">
                    <span class="about-hero-emoji"><i data-feather="book-open"></i></span>
                    <h1>About <span class="text-gradient">EduQuiz</span></h1>
                    <p>
                        EduQuiz is a free, interactive educational quiz platform designed to help
                        students from Class 6 to 10 practice and master their subjects through
                        engaging MCQ quizzes, gamification, and instant feedback.
                    </p>
                </div>

                <div class="about-section glass-card-static">
                    <h2><i data-feather="target"></i> Our Mission</h2>
                    <p>
                        We believe learning should be fun, engaging, and accessible to every student.
                        EduQuiz combines the excitement of gaming with the power of education,
                        making exam preparation feel less like a chore and more like an adventure.
                    </p>
                </div>

                <div class="about-section glass-card-static">
                    <h2><i data-feather="star"></i> Features</h2>
                    <div class="about-features-list">
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="pen-tool"></i></span>
                            <div class="about-feature-text">
                                <strong>3 Core Subjects</strong>
                                Maths, Science, and Social Science aligned with NCERT/CBSE curriculum
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon">Scholar</span>
                            <div class="about-feature-text">
                                <strong>5 Classes</strong>
                                Comprehensive coverage from Class 6 to Class 10
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon">XP</span>
                            <div class="about-feature-text">
                                <strong>XP & Levels</strong>
                                Earn experience points and level up as you learn
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="award"></i></span>
                            <div class="about-feature-text">
                                <strong>Leaderboard</strong>
                                Compete with other students and climb the ranks
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="award"></i>️</span>
                            <div class="about-feature-text">
                                <strong>12 Badges</strong>
                                Unlock achievements as you hit milestones
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="activity"></i></span>
                            <div class="about-feature-text">
                                <strong>Daily Streaks</strong>
                                Build a habit with daily quiz challenges
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="zap"></i></span>
                            <div class="about-feature-text">
                                <strong>Instant Feedback</strong>
                                Get explanations for every answer immediately
                            </div>
                        </div>
                        <div class="about-feature">
                            <span class="about-feature-icon"><i data-feather="smartphone"></i></span>
                            <div class="about-feature-text">
                                <strong>Mobile Friendly</strong>
                                Practice anywhere on any device
                            </div>
                        </div>
                    </div>
                </div>

                <div class="about-section glass-card-static">
                    <h2><i data-feather="shield"></i>️ Privacy</h2>
                    <p>
                        EduQuiz respects your privacy. All your data (scores, profile, progress) 
                        is stored locally on your device using your browser's localStorage. We don't 
                        collect, store, or share any personal information on external servers. Your 
                        learning journey is entirely private.
                    </p>
                </div>

                <div class="about-section glass-card-static">
                    <h2><i data-feather="mail"></i> Contact Us</h2>
                    <div class="contact-grid">
                        <div class="contact-card">
                            <span class="contact-icon"><i data-feather="mail"></i></span>
                            <div class="contact-label">Email</div>
                            <div class="contact-value">hello@eduquiz.app</div>
                        </div>
                    </div>
                </div>

                <div class="about-section glass-card-static" style="text-align: center;">
                    <h2>love Made with Love</h2>
                    <p style="font-size: var(--fs-md);">
                        Built for students, by students. EduQuiz is a free educational 
                        tool made with love️ in India.
                    </p>
                    <div style="margin-top: var(--space-xl);">
                        <button class="btn btn-primary btn-lg" onclick="Router.navigate('/class')" id="about-start-btn">
                            Start Learning
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Register route
    Router.register('/about', {
        render,
        title: 'About',
    });

    return { render };
})();
