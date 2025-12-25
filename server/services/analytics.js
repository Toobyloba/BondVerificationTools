const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/analytics.json');
let stats = {
    total_visits: 0,
    unique_visitors: 0,
    bots: 0,
    humans: 0,
    page_views: {},
    referrers: {},
    user_agents: {},
    hourly_stats: new Array(24).fill(0),
    calculation_events: 0,
    errors: 0
};

// Load initial data
try {
    if (fs.existsSync(DATA_FILE)) {
        const fileData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        stats = { ...stats, ...fileData };
    }
} catch (e) {
    console.error("Failed to load analytics:", e);
}

// Periodic Save (Every 60 seconds)
setInterval(() => {
    saveStats();
}, 60000);

function saveStats() {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2));
        stats.last_save_error = null; // Clear error on success
    } catch (e) {
        console.error("Error saving analytics:", e);
        stats.last_save_error = e.message; // Expose error to API
    }
}

// Bot Detection Patterns
const BOTS = [
    'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'baiduspider',
    'twitterbot', 'facebookexternalhit', 'rogerbot', 'linkedinbot',
    'embedly', 'quora link preview', 'showyoubot', 'outbrain',
    'pinterest/0.', 'developers.google.com/+/web/snippet', 'slackbot',
    'vkshare', 'w3c_validator', 'redditbot', 'applebot', 'whatsapp',
    'flipboard', 'tumblr', 'bitlybot', 'skypeuripreview', 'nuzzel',
    'discordbot', 'google page speed', 'qwantify', 'pinterest',
    'btwebclient', 'ninenius', 'mint', 'iiit'
];

function isBot(userAgent) {
    if (!userAgent) return false;
    const lower = userAgent.toLowerCase();
    return BOTS.some(bot => lower.includes(bot));
}

function trackRequest(req) {
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || 'Direct';
    const path = req.path;

    // 1. Basic Counts
    stats.total_visits++;

    // 2. Bot vs Human
    if (isBot(userAgent)) {
        stats.bots++;
    } else {
        stats.humans++;

        // 3. User Agent Stats (Human only)
        // Simplified device detection
        let device = 'Desktop';
        if (/mobile/i.test(userAgent)) device = 'Mobile';
        if (/tablet/i.test(userAgent)) device = 'Tablet';

        stats.user_agents[device] = (stats.user_agents[device] || 0) + 1;
    }

    // 4. Page Views
    stats.page_views[path] = (stats.page_views[path] || 0) + 1;

    // 5. Referrers
    if (referrer !== 'Direct') {
        try {
            const domain = new URL(referrer).hostname;
            stats.referrers[domain] = (stats.referrers[domain] || 0) + 1;
        } catch (e) {
            stats.referrers[referrer] = (stats.referrers[referrer] || 0) + 1;
        }
    } else {
        stats.referrers['Direct'] = (stats.referrers['Direct'] || 0) + 1;
    }

    // 6. Hourly Stats (UTC)
    const hour = new Date().getUTCHours();
    stats.hourly_stats[hour]++;
}

function trackEvent(type) {
    if (type === 'calculation') stats.calculation_events++;
    if (type === 'error') stats.errors++;
}

module.exports = {
    track: (req, res, next) => {
        // Only track HTML pages or root
        if (req.path.endsWith('.html') || req.path === '/') {
            trackRequest(req);
            console.log(`Analytics: Tracked visit to ${req.path}`);
        }
        next();
    },
    trackEvent,
    getStats: () => stats
};
