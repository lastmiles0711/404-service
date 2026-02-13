const express = require('express');
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
app.use(cors());
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON
const reasons = JSON.parse(fs.readFileSync('./reasons.json', 'utf-8'));

// Stats persistence
const STATS_FILE = './stats.json';
let stats = { totalFetches: 0 };

if (fs.existsSync(STATS_FILE)) {
  try {
    stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'));
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function saveStats() {
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
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
    return req.headers['cf-connecting-ip'] || req.ip; // Fallback if header missing (or for non-CF)
  },
  message: { error: "Too many requests, please try again later. (120 reqs/min/IP)" }
});

app.use(limiter);

// Serve static files from 'public'
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Config endpoint
app.get('/config', (req, res) => {
  res.json({
    baseUrl: process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  res.json(stats);
});

// Random rejection reason endpoint
app.get('/reason', (req, res) => {
  incrementCounter();
  const reason = reasons[Math.floor(Math.random() * reasons.length)];
  res.json({ reason });
});

// Redirect old /no endpoint to /reason
app.get('/no', (req, res) => {
  res.redirect('/reason');
});

// Start server — Traefik handles TLS and HTTP→HTTPS redirection
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
