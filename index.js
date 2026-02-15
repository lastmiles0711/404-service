const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");
const routes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.set("trust proxy", true);

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    keyGenerator: (req) => req.headers["cf-connecting-ip"] || req.ip,
    message: { error: "Too many requests. (120 reqs/min/IP)" },
});

app.use(limiter);
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/", routes);

// HTML Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/index.html"));
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/stats.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
