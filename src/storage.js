const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Stats
const STATS_FILE = path.join(DATA_DIR, "stats.json");
let stats = { totalFetches: 0 };

if (fs.existsSync(STATS_FILE)) {
    try {
        const loaded = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
        if (typeof loaded.totalFetches === "number") {
            stats.totalFetches = loaded.totalFetches;
        }
    } catch (err) {
        console.error("Error loading stats:", err);
    }
}

function saveStats() {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function incrementCounter() {
    stats.totalFetches++;
    saveStats();
}

function getStats() {
    return stats;
}

// Activity
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");
let activity = {};

if (fs.existsSync(ACTIVITY_FILE)) {
    try {
        activity = JSON.parse(fs.readFileSync(ACTIVITY_FILE, "utf-8"));
    } catch (err) {
        console.error("Error loading activity:", err);
    }
}

function saveActivity() {
    fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(activity, null, 2));
}

function trackActivity() {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}`;

    if (!activity[key]) activity[key] = 0;
    activity[key]++;

    if (Math.random() < 0.01) cleanupOldActivity();
    saveActivity();
}

function cleanupOldActivity() {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days
    let changed = false;

    Object.keys(activity).forEach(key => {
        const [y, m, d, h] = key.split("-").map(Number);
        const date = new Date(y, m - 1, d, h);
        if (date < cutoff) {
            delete activity[key];
            changed = true;
        }
    });

    if (changed) saveActivity();
}

function getActivity() {
    return activity;
}

// Analytics
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
let analytics = {
    browser: {},
    os: {},
    country: {}
};

if (fs.existsSync(ANALYTICS_FILE)) {
    try {
        analytics = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
        if (!analytics.browser) analytics.browser = {};
        if (!analytics.os) analytics.os = {};
        if (!analytics.country) analytics.country = {};
    } catch (err) {
        console.error("Error loading analytics:", err);
    }
}

function saveAnalytics() {
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
}

function updateAnalytics(browser, os, country) {
    if (!analytics.browser[browser]) analytics.browser[browser] = 0;
    analytics.browser[browser]++;

    if (!analytics.os[os]) analytics.os[os] = 0;
    analytics.os[os]++;

    if (!analytics.country[country]) analytics.country[country] = 0;
    analytics.country[country]++;

    saveAnalytics();
}

function getAnalytics() {
    return analytics;
}

module.exports = {
    incrementCounter,
    getStats,
    trackActivity,
    getActivity,
    updateAnalytics,
    getAnalytics
};
