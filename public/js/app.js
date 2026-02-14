const LOADING_MESSAGES = [
  "Consulting the Council of 404s...",
  "Blaming the intern...",
  "Checking under the rug...",
  "Asking the server nicely...",
  "Looking for your dignity...",
  "Searching the void...",
  "Pinging the abyss...",
  "Retaining lawyers...",
];

const COPY_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

const CHECK_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline></svg>`;

const $apiUrl = document.getElementById("apiUrl");
const $fetchCount = document.getElementById("fetchCount");
const $fetchBtn = document.getElementById("fetchBtn");
const $preview = document.getElementById("preview");
const $copyBtn = document.querySelector(".copy-btn");

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

function updateStats(stats) {
  if ($fetchCount) {
    $fetchCount.innerText = stats.totalFetches.toLocaleString();
  }
}

async function loadConfig() {
  try {
    const [config, stats] = await Promise.all([
      fetchJson("/config"),
      fetchJson("/stats"),
    ]);

    const cleanUrl = config.baseUrl.replace(/\/$/, "");
    $apiUrl.innerText = `${cleanUrl}/reason`;
    updateStats(stats);
  } catch (err) {
    console.error("Failed to load initial data:", err);
    $apiUrl.innerText = `${window.location.origin}/reason`;
  }
}

async function fetchReason() {
  $fetchBtn.disabled = true;
  $preview.innerHTML = `<span class="loading-dots">${randomItem(LOADING_MESSAGES)}</span>`;

  try {
    const data = await fetchJson("/reason");

    setTimeout(() => {
      $preview.style.opacity = "0";

      setTimeout(async () => {
        $preview.innerText = `"${data.reason}"`;
        $preview.style.opacity = "1";
        $fetchBtn.disabled = false;

        try {
          const stats = await fetchJson("/stats");
          updateStats(stats);
        } catch (_) {

        }
      }, 200);
    }, 400);
  } catch (_) {
    $preview.innerText = "Error: Connection lost in transit.";
    $fetchBtn.disabled = false;
  }
}

function copyUrl() {
  navigator.clipboard.writeText($apiUrl.innerText);

  $copyBtn.innerHTML = CHECK_ICON;
  setTimeout(() => {
    $copyBtn.innerHTML = COPY_ICON;
  }, 2000);
}

loadConfig();
