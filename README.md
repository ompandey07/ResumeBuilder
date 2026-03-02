<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=30&pause=1000&color=6C63FF&center=true&vCenter=true&width=600&lines=📄+Advanced+Resume+Builder;Built+with+Node.js+%2B+SQLite;Create+%7C+Preview+%7C+Export" alt="Typing SVG" />

# Advanced Resume Builder

**A powerful full-stack web app to build, customize, and export stunning professional resumes.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://html.spec.whatwg.org)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[✨ Features](#-features) • [🛠 Tech Stack](#-tech-stack) • [⚡ Quick Start](#-quick-start) • [🔌 API](#-api-endpoints) • [🤝 Contributing](#-contributing)

</div>

---

## 🎯 Overview

**Advanced Resume Builder** is a full-stack web application that empowers users to create beautiful, professional resumes in minutes. Built from scratch using **HTML, CSS, JavaScript, Node.js, and SQLite** — no frameworks, pure power. Users fill out an intuitive multi-step form, see a live preview of their resume, and export it as a polished PDF — all with their data securely stored in a lightweight SQLite database.

> 💡 Built with love by [Om Pandey](https://github.com/ompandey07) — check out the repo at [github.com/ompandey07/ResumeBuilder](https://github.com/ompandey07/ResumeBuilder)

---

## ✨ Features

| Feature | Detail |
|---------|--------|
| `/` **Login Page** | Redirects to dashboard if already logged in |
| `/register` **Registration** | Sign up with name, email, password + confirm — rejects `test@gmail`, `1234@x`, `aaa@fake.com`, numeric-only locals, and missing TLDs |
| **SpinnerButton** | Shows spinner + *"Please wait..."* during API calls |
| **Toasts** | Green success / Red error slide-in notifications |
| `/dashboard` | Shows user name, logout button, resume cards with View / Edit / Delete |
| `/resume-form` | Dynamic form — add/remove skills, experience, projects, certs & additional info |
| `/resume-view/:id` | Renders resume in your exact format with Print / PDF button |
| **Print** | `Ctrl+P` or Print button → clean A4 output, action bar hidden |
| **CRUD** | Create, Read, Update, Delete — all user-specific |
| **SQLite** | `resume_builder.db` auto-created with `users` and `resumes` tables |
| **Sessions** | 24-hour cookie sessions, auth middleware protects all routes |

---

## 🛠 Tech Stack
```
Frontend  →  HTML5 · CSS3 · Vanilla JavaScript
Backend   →  Node.js · Express.js
Database  →  SQLite3
Export    →  Puppeteer / html2pdf.js
Auth      →  JWT + bcrypt
DevTools  →  Git · GitHub · VS Code · npm
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v8+

### Installation & Setup
```bash
# Clone the repository
git clone https://github.com/ompandey07/ResumeBuilder.git

# Move into the project folder
cd ResumeBuilder

# Install all dependencies
npm install

# Start the development server
npm start
```

🌐 Open your browser and go to: **http://localhost:3000**

---

## 🔌 API Endpoints

### Resume Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/resumes` | Get all resumes for the logged-in user |
| `GET` | `/api/resumes/:id` | Get a single resume by ID |
| `POST` | `/api/resumes` | Create a new resume |
| `PUT` | `/api/resumes/:id` | Update an existing resume |
| `DELETE` | `/api/resumes/:id` | Delete a resume |
| `GET` | `/api/resumes/:id/export` | Export resume as PDF |

### Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT token |

---

## 🗃️ Database Schema
```sql
-- Users table
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT    NOT NULL UNIQUE,
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  data       TEXT    NOT NULL,
  template   TEXT    DEFAULT 'modern',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** your feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

- [Node.js](https://nodejs.org) — Server runtime
- [SQLite](https://sqlite.org) — Lightweight database
- [Express.js](https://expressjs.com) — Web framework
- [Shields.io](https://shields.io) — Beautiful badges

---

<div align="center">

### ⭐ If you found this project helpful, please give it a star!

**Made with ❤️ by [Om Pandey](https://github.com/ompandey07)**

[![GitHub followers](https://img.shields.io/github/followers/ompandey07?style=social)](https://github.com/ompandey07)
[![GitHub stars](https://img.shields.io/github/stars/ompandey07/ResumeBuilder?style=social)](https://github.com/ompandey07/ResumeBuilder)

</div>