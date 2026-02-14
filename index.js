const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const geoip = require("geoip-lite");

const app = express();
app.use(cors());
app.set("trust proxy", true);
const PORT = process.env.PORT || 3000;

// ensure data directory exists
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// Load reasons from JSON
const reasons = JSON.parse(fs.readFileSync("./reasons.json", "utf-8"));

// Stats persistence
const STATS_FILE = "./data/stats.json";
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

// Activity persistence
const ACTIVITY_FILE = "./data/activity.json";
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

// Analytics persistence
const ANALYTICS_FILE = "./data/analytics.json";
let analytics = {
  browser: {},
  os: {},
  country: {},
  referrer: {}
};

const BOT_PATTERN = /bot|crawler|spider|slurp|lighthouse|curl|python|wget|go-http-client|node-fetch|axios|headless/i;

if (fs.existsSync(ANALYTICS_FILE)) {
  try {
    analytics = JSON.parse(fs.readFileSync(ANALYTICS_FILE, "utf-8"));
    // Ensure structure
    if (!analytics.browser) analytics.browser = {};
    if (!analytics.os) analytics.os = {};
    if (!analytics.country) analytics.country = {};
    if (!analytics.referrer) analytics.referrer = {};
  } catch (err) {
    console.error("Error loading analytics:", err);
  }
}

function saveAnalytics() {
  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
}

function trackActivity() {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}`;

  if (!activity[key]) activity[key] = 0;
  activity[key]++;

  // Cleanup old data occasionally (e.g. every 100 requests to avoid spamming FS)
  if (Math.random() < 0.01) cleanupOldActivity();

  saveActivity();
}

function cleanupOldActivity() {
  const now = new Date();
  const keys = Object.keys(activity);
  const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 14 days ago

  let changed = false;
  keys.forEach(key => {
    // Key format: YYYY-MM-DD-HH
    // We can loosely parse it or just compare string dates if format is consistent
    // Let's parse strictly to be safe
    const [y, m, d, h] = key.split("-").map(Number);
    const date = new Date(y, m - 1, d, h);

    if (date < cutoff) {
      delete activity[key];
      changed = true;
    }
  });

  if (changed) saveActivity();
}

function incrementCounter() {
  stats.totalFetches++;
  saveStats();
}

function updateAnalytics(req) {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const referer = req.headers["referer"] || "Direct";
  const ip = req.headers["cf-connecting-ip"] || req.ip || "127.0.0.1";

  // 1. Bot Detection
  // Basic bot filtering (Googlebot, Bingbot, YandexBot, etc. + scripts like curl/python)
  if (BOT_PATTERN.test(userAgent)) {
    browser = "Bot";
    os = "Bot";
  } else {
    // Standard Browser & OS Detection (Primitive)
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    else if (userAgent.includes("MSIE") || userAgent.includes("Trident")) browser = "IE";

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac OS")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) os = "iOS";
  }

  // 2. Country Lookup
  const geo = geoip.lookup(ip);
  const country = geo ? geo.country : "Unknown";

  // 3. Referrer Clean-up (Domain only)
  let referrerDomain = "Direct";
  if (referer !== "Direct") {
    try {
      const url = new URL(referer);
      referrerDomain = url.hostname;
    } catch (e) {
      referrerDomain = "Other";
    }
  }

  // 4. Update Counts
  if (!analytics.browser[browser]) analytics.browser[browser] = 0;
  analytics.browser[browser]++;

  if (!analytics.os[os]) analytics.os[os] = 0;
  analytics.os[os]++;

  if (!analytics.country[country]) analytics.country[country] = 0;
  analytics.country[country]++;

  if (!analytics.referrer[referrerDomain]) analytics.referrer[referrerDomain] = 0;
  analytics.referrer[referrerDomain]++;

  saveAnalytics();
}

// Rate limiter: 120 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  keyGenerator: (req, res) => {
    return req.headers["cf-connecting-ip"] || req.ip; // Fallback if header missing (or for non-CF)
  },
  message: {
    error: "Too many requests, please try again later. (120 reqs/min/IP)",
  },
});

app.use(limiter);

// Serve static files from 'public'
app.use(express.static("public"));

// Root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/index.html");
});

// Stats page route
app.get("/dashboard", (req, res) => {
  res.sendFile(__dirname + "/public/html/stats.html");
});

// Config endpoint
app.get("/config", (req, res) => {
  res.json({
    baseUrl: process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`,
  });
});

// Stats endpoint
app.get("/stats", (req, res) => {
  res.json(stats);
});

// Activity endpoint
app.get("/activity", (req, res) => {
  res.json(activity);
});

// Analytics endpoint
app.get("/analytics", (req, res) => {
  res.json(analytics);
});

// Map to track bot requests: IP -> { count, startTime }
const botRequests = new Map();

function checkBotLimit(ip) {
  const limit = 5;
  const timeWindow = 60 * 1000; // 1 minute
  const now = Date.now();

  if (!botRequests.has(ip)) {
    botRequests.set(ip, { count: 1, startTime: now });
    return false;
  }

  const requestData = botRequests.get(ip);

  if (now - requestData.startTime > timeWindow) {
    // Reset window
    botRequests.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (requestData.count >= limit) {
    return true; // Limit exceeded
  }

  requestData.count++;
  botRequests.set(ip, requestData);
  return false;
}

// Random rejection reason endpoint — returns HTTP 404
app.get("/reason", (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["cf-connecting-ip"] || req.ip;

  const isBot = BOT_PATTERN.test(userAgent);

  if (isBot) {
    if (checkBotLimit(ip)) {
      return res.status(403).json({ error: "Access denied for automated agents." });
    }
  }

  // Only log and count legitimate (non-bot) requests
  console.log("[%s] Request from %s: %s", new Date().toISOString(), ip, userAgent);
  incrementCounter();
  trackActivity();
  updateAnalytics(req);

  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  res.status(404).json({ reason });
});

// Redirect old /no endpoint to /reason
app.get("/no", (req, res) => {
  res.redirect("/reason");
});

// Start server — Traefik handles TLS and HTTP→HTTPS redirection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
