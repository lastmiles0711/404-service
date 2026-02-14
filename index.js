const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const app = express();
app.use(cors());
app.set("trust proxy", true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON
const reasons = JSON.parse(fs.readFileSync("./reasons.json", "utf-8"));

// Stats persistence
const STATS_FILE = "./stats.json";
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
const ACTIVITY_FILE = "./activity.json";
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

// Random rejection reason endpoint — returns HTTP 404
app.get("/reason", (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const ip = req.headers["cf-connecting-ip"] || req.ip;

  // Logging for investigation
  console.log("[%s] Request from %s: %s", new Date().toISOString(), ip, userAgent);

  // Basic bot filtering (Googlebot, Bingbot, YandexBot, etc.)
  const botPattern = /bot|crawler|spider|slurp|lighthouse|curl|python/i;
  const isBot = botPattern.test(userAgent);

  if (!isBot) {
    incrementCounter();
    trackActivity();
  } else {
    console.log("[%s] Bot detected, skipping counter increment: %s", new Date().toISOString(), userAgent);
  }

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
