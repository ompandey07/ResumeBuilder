const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const db = new Database('resume_builder.db');
db.pragma('journal_mode = WAL');

// ── Create Tables ──────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// ── Middleware ──────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'resume-builder-super-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

// ── Helpers ────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Please login first' });
  return res.redirect('/');
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  email = email.trim().toLowerCase();
  const re = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return false;
  const [local, domain] = email.split('@');
  if (local.length < 2) return false;
  if (/^\d+$/.test(local)) return false;
  if (/^(.)\1+$/.test(local)) return false;
  const fakeDomains = ['test.com','fake.com','example.com','asdf.com','abc.com','xyz.com','temp.com','none.com','mail.com'];
  if (fakeDomains.includes(domain)) return false;
  const domainParts = domain.split('.');
  if (domainParts.some(p => p.length === 0)) return false;
  if (domainParts[domainParts.length - 1].length < 2) return false;
  return true;
}

// ── Page Routes ────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  if (req.session && req.session.userId) return res.redirect('/dashboard');
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/resume-form', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resume-form.html'));
});

app.get('/resume-view/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resume-view.html'));
});

// ── Auth API ───────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;
    if (!fullName || !email || !password || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' });
    if (fullName.trim().length < 2)
      return res.status(400).json({ error: 'Full name must be at least 2 characters' });
    if (!isValidEmail(email))
      return res.status(400).json({ error: 'Please provide a valid, real email address' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (exists) return res.status(400).json({ error: 'Email is already registered' });

    const hash = bcrypt.hashSync(password, 12);
    db.prepare('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)')
      .run(fullName.trim(), email.toLowerCase().trim(), hash);

    res.json({ success: true, message: 'Account created! Please login.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(400).json({ error: 'Invalid email or password' });

    req.session.userId = user.id;
    req.session.fullName = user.full_name;
    res.json({ success: true, message: 'Welcome back!', user: { fullName: user.full_name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, full_name, email, created_at FROM users WHERE id = ?').get(req.session.userId);
  res.json({ user });
});

// ── Resume CRUD API ────────────────────────────────────────
app.get('/api/resumes', requireAuth, (req, res) => {
  const resumes = db.prepare('SELECT id, title, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC').all(req.session.userId);
  res.json({ resumes });
});

app.get('/api/resumes/:id', requireAuth, (req, res) => {
  const resume = db.prepare('SELECT * FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  resume.data = JSON.parse(resume.data);
  res.json({ resume });
});

app.post('/api/resumes', requireAuth, (req, res) => {
  try {
    const { title, data } = req.body;
    if (!title) return res.status(400).json({ error: 'Resume title is required' });
    const r = db.prepare('INSERT INTO resumes (user_id, title, data) VALUES (?, ?, ?)').run(req.session.userId, title, JSON.stringify(data || {}));
    res.json({ success: true, id: r.lastInsertRowid, message: 'Resume created!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/resumes/:id', requireAuth, (req, res) => {
  try {
    const { title, data } = req.body;
    const exists = db.prepare('SELECT id FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
    if (!exists) return res.status(404).json({ error: 'Resume not found' });
    db.prepare('UPDATE resumes SET title = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, JSON.stringify(data), req.params.id);
    res.json({ success: true, message: 'Resume updated!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/resumes/:id', requireAuth, (req, res) => {
  try {
    const exists = db.prepare('SELECT id FROM resumes WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
    if (!exists) return res.status(404).json({ error: 'Resume not found' });
    db.prepare('DELETE FROM resumes WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Resume deleted!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Start ──────────────────────────────────────────────────
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running → http://localhost:${PORT}`));