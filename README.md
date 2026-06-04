# EduQuiz 🎓

> An interactive quiz platform for Class 6–10 students covering Maths, Science, and Social Science (NCERT/CBSE).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-6c5ce7?style=for-the-badge)](https://amit-develober.github.io/EduQuiz/#/home)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=for-the-badge&logo=github)](https://amit-develober.github.io/EduQuiz)

---

## 📖 About

EduQuiz is a free, gamified MCQ quiz web app built for Indian school students. Students can practise chapter-wise questions, earn XP, maintain daily streaks, unlock badges, and compete on a leaderboard — all without downloading anything.

> ⚠️ **Note:** This is currently a temporary demo hosted on GitHub Pages. A permanent domain and backend are planned for a future release.

---

## ✨ Features

- 📚 **Chapter-wise MCQ Quizzes** — Maths, Science, SST for Class 6 to 10
- 🏆 **Gamification** — Earn XP points, maintain daily streaks, and unlock achievement badges
- 📊 **Leaderboard** — Compete with other students in real time
- 👤 **User Profiles** — Sign in with Google or Email/Password via Firebase Auth
- 📱 **PWA Support** — Installable on mobile like a native app
- 🎨 **Animated UI** — Particle background, confetti on results, smooth page transitions
- 🔊 **Sound Effects** — Toggle-able audio feedback during quizzes
- 📡 **SPA Architecture** — Hash-based routing, no page reloads

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Auth & Database | Firebase (Authentication + Firestore) |
| Hosting | GitHub Pages (temporary) |
| Icons | Feather Icons |
| Fonts | Google Fonts (Outfit, Inter) |
| PWA | Web App Manifest + Service Worker |

---

## 📁 Project Structure

```
EduQuiz/
├── index.html              # Main entry point (SPA shell)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (offline support)
├── assets/                 # Images, logo
├── css/
│   └── style.css           # All styles
├── data/
│   └── questions.js        # MCQ question bank
└── js/
    ├── firebase-config.js  # Firebase setup
    ├── auth.js             # Login / signup logic
    ├── router.js           # Hash-based SPA router
    ├── quiz-engine.js      # Core quiz logic
    ├── gamification.js     # XP, streaks, badges
    ├── storage.js          # Local data handling
    ├── ui-utils.js         # Shared UI helpers
    ├── share.js            # Share quiz results
    └── pages/              # Individual page renderers
        ├── home.js
        ├── class-select.js
        ├── subject-select.js
        ├── quiz.js
        ├── result.js
        ├── leaderboard.js
        ├── profile.js
        └── about.js
```

---

## 🚀 Running Locally

No build tools or npm required. Just clone and open.

```bash
# 1. Clone the repository
git clone https://github.com/Amit-develober/EduQuiz.git

# 2. Open in browser
cd EduQuiz
# Open index.html directly in your browser
# OR use VS Code Live Server extension for best results
```

> **Tip:** Use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code to avoid CORS issues with local JS modules.

---

## 📸 Screenshots

| Home Page | Quiz Screen | Results |
|---|---|---|
| *(coming soon)* | *(coming soon)* | *(coming soon)* |

---

## 🗺️ Roadmap

- [ ] Add Class 11 & 12 questions (Physics, Chemistry, Maths)
- [ ] Timed quiz mode
- [ ] Chapter-wise performance analytics
- [ ] Teacher dashboard
- [ ] Permanent domain deployment
- [ ] Dark / Light theme toggle

---

## 🙋 Author

**Amit** — [@Amit-develober](https://github.com/Amit-develober)

Built as a personal project to help Indian school students practise NCERT topics in a fun, gamified way.

---

## 📄 License

This project is open source. Feel free to fork and improve it.

---

*Made with ❤️ for students of India.*
