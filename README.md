<div align="center">

# 🔍 404-Service

<img src="public/assets/logo.png" alt="404-Service" width="180">

### *Creative 404 messages for your missing pages*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

**Ever needed a creative 404 page?**  
This lightweight API returns random, hilarious, and sometimes poetic reasons why a page wasn't found.

*Perfect for custom error pages, bots, dev tools, or just for laughs.* ✨

[Live Demo](https://404-service.com/reason) • [Report Bug](https://github.com/lastmiles0711/404-service/issues) • [Request Feature](https://github.com/lastmiles0711/404-service/issues)

</div>

---

## ✨ Features

- 🎭 **Random witty messages** for every 404 error
- ⚡ **Lightning fast** responses
- 🔒 **Rate limiting** built-in (120 req/min)
- 🐳 **Docker-ready** with automated HTTPS
- 📊 **Statistics endpoint** to track usage
- 🎨 **Easy to customize** and extend

---

## 🚀 Quick Start

### API Usage

#### Base Endpoint

```bash
GET https://404-service.com/reason
```

**Response:**
```json
{
  "reason": "This page took one look at your request and quietly left the building."
}
```

#### Stats Endpoint

```bash
GET https://404-service.com/stats
```

**Response:**
```json
{
  "totalFetches": 42
}
```

### 💡 Use Cases

- 🌐 Custom 404 error pages
- 🤖 Chatbots and Discord bots
- 📱 Mobile apps
- 🔗 Link shorteners
- 🎪 Fun landing pages
- 💬 Slack integrations

---

## 📦 Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/lastmiles0711/404-service.git
cd 404-service

# Install dependencies
npm install

# Start the server
npm start
```

Your API will be running at `http://localhost:3000/reason` 🎉

**Custom Port:**
```bash
PORT=5000 npm start
```

---

### Option 2: Docker + Traefik (with HTTPS)

Perfect for production deployments with automated SSL certificates!

#### 1️⃣ Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit with your details
nano .env
```

**Required variables:**
```env
DOMAIN=your-domain.com
ACME_EMAIL=your-email@example.com
```

#### 2️⃣ Launch Services

```bash
docker compose up -d
```

✨ **That's it!** Traefik will automatically:
- Obtain a Let's Encrypt certificate
- Configure HTTPS/TLS
- Route traffic to your service
- Auto-renew certificates

Your service will be live at `https://your-domain.com/reason`

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DOMAIN` | Your domain name | - |
| `ACME_EMAIL` | Email for Let's Encrypt | - |

### Rate Limiting

Built-in rate limiting: **120 requests per minute per IP**

To customize, edit the rate limit middleware in `server.js`.

---

## 📚 API Reference

### `GET /reason`

Returns a random 404 message.

**Response:**
```json
{
  "reason": "string"
}
```

**Status Codes:**
- `200` - Success
- `429` - Rate limit exceeded

---

### `GET /stats`

Returns service statistics.

**Response:**
```json
{
  "totalFetches": number
}
```

---

## 🌟 Example Integrations

### JavaScript / Fetch

```javascript
fetch('https://404-service.com/reason')
  .then(response => response.json())
  .then(data => console.log(data.reason));
```

### Python

```python
import requests

response = requests.get('https://404-service.com/reason')
print(response.json()['reason'])
```

### cURL

```bash
curl https://404-service.com/reason
```

### HTML Error Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>404 - Page Not Found</title>
</head>
<body>
  <h1>404 - Oops!</h1>
  <p id="reason">Loading...</p>
  
  <script>
    fetch('https://404-service.com/reason')
      .then(r => r.json())
      .then(data => {
        document.getElementById('reason').textContent = data.reason;
      });
  </script>
</body>
</html>
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🎉 Open a Pull Request

**Ideas for contributions:**
- Add more creative 404 messages
- Improve documentation
- Add new features
- Fix bugs
- Translate to other languages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Credits

**Created by:** [lastmiles0711](https://github.com/lastmiles0711)

**Original inspiration:** [hotheadhacker](https://github.com/hotheadhacker)

---

## 💬 Support

- 🐛 Found a bug? [Open an issue](https://github.com/lastmiles0711/404-service/issues)
- 💡 Have a feature request? [Open an issue](https://github.com/lastmiles0711/404-service/issues)
- ⭐ Like the project? Give it a star!

---

<div align="center">

**Made with ❤️ for the web**

[⬆ Back to Top](#-404-service)

</div>