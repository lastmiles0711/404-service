<div align="center">
# 🚫 404-as-a-Service 🚫

<img src="public/no.png" alt="404-as-a-Service" width="128">

**Ever needed a creative 404 page?**  

This tiny API returns random, hilarious, and sometimes poetic reasons why a page wasn't found.  

*Perfectly suited for custom error pages, bots, dev tools, or just for laughs.*


Built for **missing pages**, **abroken links**, and **humor**.

---

**Based on the original [No-as-a-Service](https://github.com/hotheadhacker/no-as-a-service) by [hotheadhacker](https://github.com/hotheadhacker)**.  
A huge thank you for the inspiration and the groundwork! 🙏

</div>

---

## 🚀 API Usage

**Base URL**
```
https://404-service.com/reason
```

**Method:** `GET`  
**Rate Limit:** `120 requests per minute per IP`

### 🔄 Example Request
```http
GET https://404-service.com/reason
```

### ✅ Example Response
```json
{
  "reason": "This page took one look at your request and quietly left the building."
}
```

### 📊 Stats Endpoint
**URL:** `/stats`  
Returns the total number of reasons served by this instance.
```json
{
  "totalFetches": 42
}
```

Use it in custom 404 pages, bots, landing pages, Slack integrations, or wherever you need a witty explanation for a missing page.

---

## 🛠️ Self-Hosting

Want to run it yourself? It's lightweight and simple.

### 1. Clone this repository
```bash
git clone https://github.com/lastmiles0711/404-service.git
cd 404-service
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

The API will be live at:
```
http://localhost:3000/reason
```

You can also change the port using an environment variable:
```bash
PORT=5000 npm start
```

---

## 🔒 Docker + Traefik (Automated HTTPS)
This repository uses **Traefik** for fully automated HTTPS/TLS management.

**Steps to enable HTTPS:**

1. Create a `.env` file from the example:
```bash
cp .env.example .env
nano .env
```
Fill in your `DOMAIN` and `ACME_EMAIL`.

2. Start the stack:
```bash
docker compose up -d
```

Traefik will automatically obtain a Let's Encrypt certificate and serve your site over HTTPS.

---

## 📁 Project Structure

```
404-service/
├── index.js            # Express API & persistence logic
├── reasons.json        # 1000+ creative 404 reasons
├── stats.json          # Persistent fetch counter (auto-generated)
├── public/             # Frontend assets
│   ├── index.html      # Landing page & previewer
│   └── no.png          # Logo
├── package.json
├── .devcontainer.json  # VS Code / Github devcontainer setup
└── README.md
```

---

## 📦 package.json

For reference, here's the package config:

```json
{
  "name": "404-as-a-service",
  "version": "1.0.0",
  "description": "A lightweight API that returns random 404 reasons.",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "lastmiles0711",
  "license": "MIT",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.0.0"
  }
}
```



<div align="center">
👤 Credits


Created by [lastmiles0711](https://github.com/lastmiles0711).  
Special thanks to the original creator, [hotheadhacker](https://github.com/hotheadhacker), for the inspiration and foundation.
