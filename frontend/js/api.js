const API = 'https://www.secure-shop.store/api'

// ── Token helpers ──────────────────────────────────────────
function getToken()   { return localStorage.getItem("token"); }
function getUser()    { return JSON.parse(localStorage.getItem("user") || "null"); }
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u = getUser(); return u && u.role === "admin"; }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigateTo("/pages/login.html");
}

// ── Auth fetch wrapper ─────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res;
}

// ── Auth API calls ─────────────────────────────────────────
async function apiRegister(name, email, password) {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

async function apiLogin(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

async function apiVerifyOTP(otp) {
  const res = await fetch(`${API}/auth/verify-otp`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp }),
  });
  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

// ── Page Transition ────────────────────────────────────────
function navigateTo(url) {
  // Fade out current page
  document.body.classList.add("page-exit");
  setTimeout(() => {
    window.location.href = url;
  }, 280);
}

// Intercept all internal link clicks for smooth transitions
function initPageTransitions() {
  // Fade in on page load
  document.body.classList.add("page-enter");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add("page-enter-active");
    });
  });

  // Intercept clicks on internal links
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    // Only intercept internal links (not external, not anchors, not mailto)
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("mailto") &&
      !href.startsWith("javascript") &&
      !link.hasAttribute("data-no-transition")
    ) {
      e.preventDefault();
      navigateTo(href);
    }
  });
}

// ── Bottom Navigation ──────────────────────────────────────
function renderNavbar() {
  const user  = getUser();
  const count = getCartCount();
  const path  = window.location.pathname;

  // Determine active tab
  const isHome     = path === "/" || path === "/index.html";
  const isProducts = path.includes("products");
  const isCart     = path.includes("cart");
  const isOrders   = path.includes("orders");
  const isAccount  = path.includes("login") || path.includes("register") || path.includes("otp");

  // Top navbar (minimal — just logo)
  const nav = document.getElementById("navbar");
  if (nav) {
    nav.innerHTML = `
      <div class="navbar">
        <a href="/" class="logo" data-no-transition>Secure<span>Shop</span></a>
        <div class="navbar-right">
          ${user ? `<span class="navbar-greeting">Hi, ${user.name.split(" ")[0]} 👋</span>` : ""}
          ${isAdmin() ? `<a href="/pages/admin.html" class="navbar-admin-btn">⚙️ Admin</a>` : ""}
        </div>
      </div>`;
  }

  // Remove existing bottom nav if any
  const existing = document.getElementById("bottom-nav");
  if (existing) existing.remove();

  // Don't show bottom nav on auth pages or admin
  if (path.includes("admin") || path.includes("login") || path.includes("register") || path.includes("otp")) {
    return;
  }

  // Create bottom nav
  const bottomNav = document.createElement("nav");
  bottomNav.id = "bottom-nav";
  bottomNav.className = "bottom-nav";
  bottomNav.innerHTML = `
    <a href="/" class="bottom-nav-item ${isHome ? "active" : ""}">
      <span class="bottom-nav-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </span>
      <span class="bottom-nav-label">Home</span>
    </a>

    <a href="/pages/products.html" class="bottom-nav-item ${isProducts ? "active" : ""}">
      <span class="bottom-nav-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="7" height="7"/>
          <rect x="15" y="3" width="7" height="7"/>
          <rect x="15" y="14" width="7" height="7"/>
          <rect x="2" y="14" width="7" height="7"/>
        </svg>
      </span>
      <span class="bottom-nav-label">Shop</span>
    </a>

    <a href="/pages/cart.html" class="bottom-nav-item ${isCart ? "active" : ""}">
      <span class="bottom-nav-icon" style="position:relative;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        ${count > 0 ? `<span class="bottom-nav-badge">${count}</span>` : ""}
      </span>
      <span class="bottom-nav-label">Cart</span>
    </a>

    ${user ? `
    <a href="/pages/orders.html" class="bottom-nav-item ${isOrders ? "active" : ""}">
      <span class="bottom-nav-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      </span>
      <span class="bottom-nav-label">Orders</span>
    </a>
    ` : ""}

    <a href="${user ? "#" : "/pages/login.html"}"
       class="bottom-nav-item ${isAccount ? "active" : ""}"
       ${user ? 'onclick="showAccountMenu(event)"' : ""}>
      <span class="bottom-nav-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </span>
      <span class="bottom-nav-label">${user ? user.name.split(" ")[0] : "Login"}</span>
    </a>
  `;

  document.body.appendChild(bottomNav);

  // Add padding to body so content doesn't hide behind bottom nav
  document.body.style.paddingBottom = "80px";
}

// ── Account popup menu ─────────────────────────────────────
function showAccountMenu(e) {
  e.preventDefault();
  const existing = document.getElementById("account-popup");
  if (existing) { existing.remove(); return; }

  const user = getUser();
  const popup = document.createElement("div");
  popup.id = "account-popup";
  popup.className = "account-popup";
  popup.innerHTML = `
    <div class="account-popup-header">
      <div class="account-avatar">${user.name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="account-name">${user.name}</div>
        <div class="account-email">${user.email || ""}</div>
      </div>
    </div>
    <div class="account-popup-divider"></div>
    <a href="/pages/orders.html" class="account-popup-item">
      📦 My Orders
    </a>
    ${isAdmin() ? `<a href="/pages/admin.html" class="account-popup-item">⚙️ Admin Panel</a>` : ""}
    <div class="account-popup-divider"></div>
    <button class="account-popup-item account-logout" onclick="logout()">
      🚪 Logout
    </button>
  `;
  document.body.appendChild(popup);

  // Close on outside click
  setTimeout(() => {
    document.addEventListener("click", function handler(ev) {
      if (!popup.contains(ev.target)) {
        popup.remove();
        document.removeEventListener("click", handler);
      }
    });
  }, 10);
}

// ── Alert helpers ──────────────────────────────────────────
function showAlert(id, msg, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.textContent = msg;
  el.style.display = "block";
}
function hideAlert(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

// ── Auto-init transitions on every page ───────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
});
