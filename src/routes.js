const express = require("express");
const fs = require("fs");
const path = require("path");
const geoip = require("geoip-lite");
const UAParser = require("ua-parser-js");
const storage = require("./storage");

const router = express.Router();

const reasons = JSON.parse(fs.readFileSync(path.join(process.cwd(), "reasons.json"), "utf-8"));

router.get("/reason", (req, res) => {
    const userAgent = req.headers["user-agent"] || "";
    const ip = req.headers["cf-connecting-ip"] || req.ip;

    const botPattern = /bot|crawler|spider|slurp|lighthouse|curl|python|wget|go-http-client|node-fetch|axios|headless/i;
    if (botPattern.test(userAgent)) {
        return res.status(403).json({ error: "Access denied for automated agents." });
    }

    const ua = new UAParser(userAgent);
    const browser = ua.getBrowser().name || "Other";
    const os = ua.getOS().name || "Other";

    const geo = geoip.lookup(ip || "127.0.0.1");
    const country = geo ? geo.country : "Unknown";

    storage.incrementCounter();
    storage.trackActivity();
    storage.updateAnalytics(browser, os, country);

    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    res.status(404).json({ reason });
});

router.get("/stats", (req, res) => {
    res.json(storage.getStats());
});

router.get("/activity", (req, res) => {
    res.json(storage.getActivity());
});

router.get("/analytics", (req, res) => {
    res.json(storage.getAnalytics());
});

router.get("/config", (req, res) => {
    res.json({
        baseUrl: process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`,
    });
});

module.exports = router;
