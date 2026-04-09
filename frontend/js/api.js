const API = 'https://www.secure-shop.store/api'

// ── Token helpers ──────────────────────────────────────────
function getToken()   { return localStorage.getItem("token"); }
function getUser()    { return JSON.parse(localStorage.getItem("user") || "null"); }
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u = getUser(); return u && u.role === "admin"; }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/pages/login.html";
}

// ── Auth fetch wrapper (adds Bearer token) ─────────────────
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

// ── Navbar render ──────────────────────────────────────────
function renderNavbar() {
  const user  = getUser();
  const count = getCartCount();
  const nav   = document.getElementById("navbar");
  if (!nav) return;
  nav.innerHTML = `
    <div class="navbar">
      <a href="/" class="logo">Secure<span>Shop</span></a>
      <div class="nav-links">
        <a href="/pages/products.html">Products</a>
        ${user ? `<a href="/pages/orders.html">My Orders</a>` : ""}
        ${isAdmin() ? `<a href="/pages/admin.html">Admin</a>` : ""}
        <a href="/pages/cart.html" class="cart-icon">
          🛒 Cart
          <span class="cart-badge" id="cart-count" ${count === 0 ? 'style="display:none"' : ''}>${count}</span>
        </a>
        ${user
          ? `<span style="color:#aaa;font-size:.9rem">Hi, ${user.name.split(" ")[0]}</span>
             <button class="btn-nav" onclick="logout()">Logout</button>`
          : `<a href="/pages/login.html"><button class="btn-nav">Login</button></a>`}
      </div>
    </div>`;
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
