const API = "/api";

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
  document.body.classList.add("page-exit");
  setTimeout(() => { window.location.href = url; }, 260);
}

function initPageTransitions() {
  document.body.classList.add("page-enter");
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add("page-enter-active");
  }));

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      href && !href.startsWith("http") && !href.startsWith("#") &&
      !href.startsWith("mailto") && !href.startsWith("javascript") &&
      !link.hasAttribute("data-no-transition") && !link.hasAttribute("target")
    ) {
      e.preventDefault();
      navigateTo(href);
    }
  });
}

// ── Nav render ─────────────────────────────────────────────
function renderNavbar() {
  const user  = getUser();
  const count = getCartCount();
  const path  = window.location.pathname;

  const isHome     = path === "/" || path.endsWith("index.html");
  const isProducts = path.includes("products");
  const isCart     = path.includes("cart");
  const isOrders   = path.includes("orders");
  const isProfile  = path.includes("login") || path.includes("register");
  const isAdmin_   = path.includes("admin");
  const isAuth     = path.includes("login") || path.includes("register") || path.includes("otp") || path.includes("forgot");

  // Top bar
  const nav = document.getElementById("navbar");
  if (nav) {
    nav.innerHTML = `
      <div class="top-bar">
        <a href="/" class="top-bar-logo" data-no-transition>Secure<span>Shop</span></a>
        <div class="top-bar-right">
          ${user ? `<span class="top-bar-greeting">Hi, ${user.name.split(" ")[0]} 👋</span>` : ""}
          ${isAdmin() ? `<a href="/pages/admin.html" class="top-bar-admin">⚙️ Admin</a>` : ""}
        </div>
      </div>`;
  }

  // Don't show nav on auth or admin pages
  const existing = document.getElementById("app-nav");
  if (existing) existing.remove();
  if (isAuth || isAdmin_) return;

  const navItems = [
    { href: "/",                   icon: icons.home,    label: "Home",    active: isHome },
    { href: "/pages/products.html",icon: icons.shop,    label: "Shop",    active: isProducts },
    { href: "/pages/cart.html",    icon: icons.cart,    label: "Cart",    active: isCart,   badge: count },
    ...(user ? [{ href: "/pages/orders.html", icon: icons.orders, label: "Orders", active: isOrders }] : []),
    { href: user ? "#" : "/pages/login.html",
      icon: icons.user, label: user ? user.name.split(" ")[0] : "Login",
      active: isProfile, onclick: user ? "showAccountMenu(event)" : null }
  ];

  // Desktop: left sidebar
  const sidebar = document.createElement("nav");
  sidebar.id = "app-nav";
  sidebar.className = "app-nav";
  sidebar.innerHTML = `
    <div class="sidebar-nav">
      <a href="/" class="sidebar-logo" data-no-transition>Secure<span>Shop</span></a>
      <div class="sidebar-links">
        ${navItems.map(item => `
          <a href="${item.href}"
            class="sidebar-item ${item.active ? "active" : ""}"
            ${item.onclick ? `onclick="${item.onclick}"` : ""}
            data-label="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
            ${item.badge > 0 ? `<span class="sidebar-badge">${item.badge}</span>` : ""}
          </a>
        `).join("")}
      </div>
      ${user ? `
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">${user.name.charAt(0).toUpperCase()}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${user.name}</div>
            <button class="sidebar-logout" onclick="logout()">Sign out</button>
          </div>
        </div>
      </div>` : ""}
    </div>

    <!-- Mobile: floating pill nav -->
    <div class="float-nav">
      ${navItems.map(item => `
        <a href="${item.href}"
          class="float-item ${item.active ? "active" : ""}"
          ${item.onclick ? `onclick="${item.onclick}"` : ""}>
          <span class="float-icon">${item.icon}</span>
          ${item.badge > 0 ? `<span class="float-badge">${item.badge}</span>` : ""}
          <span class="float-label">${item.label}</span>
        </a>
      `).join("")}
    </div>
  `;
  document.body.appendChild(sidebar);

  // Add body class for sidebar layout
  document.body.classList.add("has-sidebar");
}

// ── SVG Icons ──────────────────────────────────────────────
const icons = {
  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  shop: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/></svg>`,
  cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  orders:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
};

// ── Account popup ──────────────────────────────────────────
function showAccountMenu(e) {
  e.preventDefault();
  const existing = document.getElementById("account-popup");
  if (existing) { existing.remove(); return; }
  const user = getUser();
  const popup = document.createElement("div");
  popup.id = "account-popup";
  popup.className = "account-popup";
  popup.innerHTML = `
    <div class="ap-header">
      <div class="ap-avatar">${user.name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="ap-name">${user.name}</div>
        <div class="ap-role">${isAdmin() ? "Admin" : "Customer"}</div>
      </div>
    </div>
    <div class="ap-divider"></div>
    <a href="/pages/orders.html" class="ap-item">📦 My Orders</a>
    ${isAdmin() ? `<a href="/pages/admin.html" class="ap-item">⚙️ Admin Panel</a>` : ""}
    <div class="ap-divider"></div>
    <button class="ap-item ap-logout" onclick="logout()">🚪 Sign Out</button>
  `;
  document.body.appendChild(popup);
  setTimeout(() => {
    document.addEventListener("click", function h(ev) {
      if (!popup.contains(ev.target)) { popup.remove(); document.removeEventListener("click", h); }
    });
  }, 10);
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = "") {
  let c = document.getElementById("toast-root");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-root";
    c.className = "toast-container";
    document.body.appendChild(c);
  }
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add("hiding"); setTimeout(() => t.remove(), 300); }, 2600);
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

// ── Auto-init ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
  window.addEventListener("scroll", () => {
    document.querySelector(".top-bar")?.classList.toggle("scrolled", window.scrollY > 10);
  });
});
