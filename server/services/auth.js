const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, '../data/users.json');
const SESSIONS_FILE = path.join(__dirname, '../data/sessions.json');

// In-memory cache backed by file
let SESSIONS = new Map();

// Helper: Load Sessions
function loadSessions() {
    try {
        if (fs.existsSync(SESSIONS_FILE)) {
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            // Convert plain object back to Map and prune expired
            const now = Date.now();
            Object.entries(data).forEach(([token, session]) => {
                if (session.expires > now) {
                    SESSIONS.set(token, session);
                }
            });
        }
    } catch (e) {
        console.error("Error loading sessions:", e);
    }
}

// Helper: Save Sessions
function saveSessions() {
    try {
        const data = Object.fromEntries(SESSIONS);
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error saving sessions:", e);
    }
}

// Load on startup
loadSessions();

// Helper: Read users
function getUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) return [];
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        console.error("Error reading users:", e);
        return [];
    }
}

// Helper: Write users
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// 1. Password Hashing (PBKDF2)
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

// 2. Password Verification
function verifyPassword(password, storedHash) {
    const [salt, key] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return key === hash;
}

// 3. Login Logic
function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user || !verifyPassword(password, user.passwordHash)) {
        return null;
    }

    // Generate Secure Token
    const token = crypto.randomBytes(32).toString('hex');
    SESSIONS.set(token, { username: user.username, role: user.role, expires: Date.now() + 86400000 }); // 24h
    saveSessions();
    return token;
}

// 4. Register Logic (Admin Only)
function register(username, password, requesterToken) {
    // Verify requester is admin
    const session = verifyToken(requesterToken);
    if (!session /* || session.role !== 'admin' */) { // For now, allow first user creation or unrestricted
        const users = getUsers();
        if (users.length > 0 && (!session || session.role !== 'admin')) {
            throw new Error("Unauthorized");
        }
    }

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        throw new Error("User already exists");
    }

    users.push({
        id: Date.now().toString(),
        username,
        passwordHash: hashPassword(password),
        role: 'admin',
        createdAt: new Date().toISOString()
    });

    saveUsers(users);
    return true;
}

// 5. Verify Token
function verifyToken(token) {
    if (!token) return null;
    const session = SESSIONS.get(token);
    if (!session) return null;

    if (Date.now() > session.expires) {
        SESSIONS.delete(token);
        saveSessions();
        return null;
    }
    return session;
}

// Middleware
function authenticate(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    const user = verifyToken(token);
    if (!user) return res.sendStatus(403);

    req.user = user;
    next();
}

module.exports = { login, register, authenticate, getUsers };
