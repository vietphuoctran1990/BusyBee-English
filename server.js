
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'kidlingo_db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Helpers
const loadDb = () => {
    if (!fs.existsSync(DB_FILE)) return { users: {}, auth: {} };
    try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { return { users: {}, auth: {} }; }
};
const saveDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    const userId = authHeader.split(' ')[1].replace('token_', '');
    req.userId = userId;
    next();
};

// Routes
app.post('/api/register', (req, res) => {
    const { email, password, profile } = req.body;
    const db = loadDb();
    if (db.auth[email]) return res.status(400).json({ error: 'Email exists' });
    const userId = 'user_' + Date.now();
    db.auth[email] = { password, userId };
    db.users[userId] = { items: [], stories: [], stats: { stars: 0, unlockedStickers: [] }, profile: { ...profile, id: userId, email } };
    saveDb(db);
    res.json({ success: true, userId });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = loadDb();
    const auth = db.auth[email];
    if (!auth || auth.password !== password) return res.status(401).json({ error: 'Invalid' });
    const user = db.users[auth.userId];
    res.json({ success: true, token: 'token_' + auth.userId, user: user.profile, data: user });
});

app.post('/api/sync', authenticate, (req, res) => {
    const db = loadDb();
    if (db.users[req.userId]) {
        db.users[req.userId] = { ...db.users[req.userId], ...req.body };
        saveDb(db);
    }
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
