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

// ── Auth fetch ─────────────────────────────────────────────
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

// ── Auth API ───────────────────────────────────────────────
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

// ── Page Transitions ───────────────────────────────────────
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

// ── SVG Icons ──────────────────────────────────────────────
const icons = {
  home:   `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  shop:   `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/></svg>`,
  cart:   `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  orders: `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  user:   `<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bot:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="5" r="1" fill="currentColor"/><line x1="8" y1="16" x2="8" y2="16" stroke-width="3" stroke-linecap="round"/><line x1="12" y1="16" x2="12" y2="16" stroke-width="3" stroke-linecap="round"/><line x1="16" y1="16" x2="16" y2="16" stroke-width="3" stroke-linecap="round"/></svg>`,
  close:  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
};

// ── Render Nav ─────────────────────────────────────────────
function renderNavbar() {
  const user  = getUser();
  const count = getCartCount();
  const path  = window.location.pathname;

  const isHome     = path === "/" || path.endsWith("index.html");
  const isProducts = path.includes("products");
  const isCart     = path.includes("cart");
  const isOrders   = path.includes("orders");
  const isAuth     = path.includes("login") || path.includes("register") || path.includes("otp") || path.includes("forgot");
  const isAdminP   = path.includes("admin");

  // Minimal top bar
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

  // Remove old nav
  document.getElementById("ss-sidebar")?.remove();
  document.getElementById("ss-floatnav")?.remove();

  // Don't show nav on auth/admin pages
  if (isAuth || isAdminP) return;

  const navItems = [
    { href: "/",                    icon: icons.home,   label: "Home",   active: isHome },
    { href: "/pages/products.html", icon: icons.shop,   label: "Shop",   active: isProducts },
    { href: "/pages/cart.html",     icon: icons.cart,   label: "Cart",   active: isCart, badge: count },
    ...(user ? [{ href: "/pages/orders.html", icon: icons.orders, label: "Orders", active: isOrders }] : []),
    {
      href: user ? "#" : "/pages/login.html",
      icon: icons.user,
      label: user ? user.name.split(" ")[0] : "Login",
      active: false,
      onclick: user ? "showAccountMenu(event)" : null,
    },
  ];

  // ── DESKTOP: Left sidebar (position:fixed, independent of scroll) ──
  const sidebar = document.createElement("nav");
  sidebar.id = "ss-sidebar";
  sidebar.className = "ss-sidebar";
  sidebar.innerHTML = `
    <a href="/" class="ss-sidebar-logo" data-no-transition>Secure<span>Shop</span></a>
    <div class="ss-sidebar-links">
      ${navItems.map(item => `
        <a href="${item.href}"
          class="ss-sidebar-item ${item.active ? "active" : ""}"
          ${item.onclick ? `onclick="${item.onclick}"` : ""}>
          <span class="ss-nav-icon">${item.icon}</span>
          <span class="ss-nav-label">${item.label}</span>
          ${item.badge > 0 ? `<span class="ss-sidebar-badge">${item.badge}</span>` : ""}
        </a>
      `).join("")}
    </div>
    ${user ? `
    <div class="ss-sidebar-footer">
      <div class="ss-sidebar-user" onclick="showAccountMenu(event)" style="cursor:pointer;">
        <div class="ss-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="ss-user-name">${user.name}</div>
          <div class="ss-user-sub">Tap to manage</div>
        </div>
      </div>
    </div>` : ""}
  `;
  document.body.appendChild(sidebar);

  // ── MOBILE: Floating pill nav (position:fixed, independent of scroll) ──
  const floatNav = document.createElement("nav");
  floatNav.id = "ss-floatnav";
  floatNav.className = "ss-floatnav";
  floatNav.innerHTML = navItems.map(item => `
    <a href="${item.href}"
      class="ss-float-item ${item.active ? "active" : ""}"
      ${item.onclick ? `onclick="${item.onclick}"` : ""}>
      <span class="ss-float-icon">${item.icon}</span>
      ${item.badge > 0 ? `<span class="ss-float-badge">${item.badge}</span>` : ""}
      <span class="ss-float-label">${item.label}</span>
    </a>
  `).join("");
  document.body.appendChild(floatNav);

  // Add body class so content shifts for sidebar
  document.body.classList.add("has-sidebar");
}

// ── Account popup ──────────────────────────────────────────
function showAccountMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const existing = document.getElementById("ss-account-popup");
  if (existing) { existing.remove(); return; }
  const user = getUser();
  const popup = document.createElement("div");
  popup.id = "ss-account-popup";
  popup.className = "ss-account-popup";
  popup.innerHTML = `
    <div class="ss-ap-header">
      <div class="ss-ap-avatar">${user.name.charAt(0).toUpperCase()}</div>
      <div>
        <div class="ss-ap-name">${user.name}</div>
        <div class="ss-ap-role">${isAdmin() ? "Admin" : "Customer"}</div>
      </div>
    </div>
    <div class="ss-ap-divider"></div>
    <a href="/pages/orders.html" class="ss-ap-item">📦 My Orders</a>
    ${isAdmin() ? `<a href="/pages/admin.html" class="ss-ap-item">⚙️ Admin Panel</a>` : ""}
    <div class="ss-ap-divider"></div>
    <button class="ss-ap-item ss-ap-logout" onclick="logout()">🚪 Sign Out</button>
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
  let c = document.getElementById("ss-toast-root");
  if (!c) {
    c = document.createElement("div");
    c.id = "ss-toast-root";
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

// ══════════════════════════════════════════════════════════
// CHATBOT — Rule-based
// ══════════════════════════════════════════════════════════
const BOT_RULES = [
  {
    patterns: ["hello","hi","hey","sup","hiya","greetings","good morning","good afternoon"],
    response: "Hey there! 👋 I'm ShopBot, your SecureShop assistant. I can help with orders, products, account issues, delivery info, and more. What can I help you with?"
  },
  {
    patterns: ["how are you","how r u","what's up","whats up"],
    response: "I'm doing great, thanks for asking! 😊 Ready to help you with anything SecureShop-related. What do you need?"
  },
  {
    patterns: ["otp","one time password","code","verification code","not receiving","didn't receive","no email"],
    response: "OTP issues? Here's what to try:\n\n1. Check your spam/junk folder\n2. Wait 30 seconds and check again\n3. Make sure you used the correct email address\n4. Click 'Resend code' on the OTP page\n\nOTPs expire in 5 minutes, so enter it quickly!"
  },
  {
    patterns: ["forgot password","reset password","can't login","cant login","locked out","lost password"],
    response: "No worries! To reset your password:\n\n1. Go to the Login page\n2. Click 'Forgot password?'\n3. Enter your email — we'll send a reset code\n4. Enter the code and your new password\n\nNeed me to take you there? 👉 /pages/forgot-password.html"
  },
  {
    patterns: ["register","sign up","create account","new account"],
    response: "Creating an account is free and easy! 🎉\n\n1. Go to Register page\n2. Enter your name, email, and a strong password\n3. Password must have: 8+ chars, uppercase, number, and a symbol (!@#$%^&*)\n4. Once registered, you can log in and start shopping!"
  },
  {
    patterns: ["login","log in","sign in","signin"],
    response: "To log in:\n\n1. Go to the Login page\n2. Enter your email and password\n3. We'll send a 6-digit OTP to your email\n4. Enter the OTP to complete login\n\nThis two-step login keeps your account super secure! 🔐"
  },
  {
    patterns: ["mfa","2fa","two factor","multi factor","security","why otp"],
    response: "Great question! 🔐 SecureShop uses Multi-Factor Authentication (MFA) to protect your account.\n\nEven if someone steals your password, they still can't log in without the OTP sent to your email. It's an extra lock on your account!"
  },
  {
    patterns: ["product","products","electronics","buy","shop","browse","items","stock"],
    response: "We carry a wide range of premium electronics! 📱💻\n\n• Smartphones (iPhone, Samsung, etc.)\n• Laptops (MacBook, Dell XPS, etc.)\n• Headphones (Sony, AirPods, etc.)\n• Smartwatches & Tablets\n\nHead to our Shop page to browse everything with filters and search!"
  },
  {
    patterns: ["cart","add to cart","basket","bag"],
    response: "Adding items to your cart is easy:\n\n1. Go to Products page\n2. Click on any product to view details\n3. Click 'Add to Cart' button\n4. Your cart count updates in the nav bar\n\nYou don't need to be logged in to add to cart — but you'll need to log in at checkout!"
  },
  {
    patterns: ["checkout","payment","pay","card","purchase","buy now","order now"],
    response: "To checkout:\n\n1. Add items to your cart\n2. Click the Cart icon → 'Proceed to Checkout'\n3. Enter your shipping address\n4. Enter payment details (demo mode — no real charge!)\n5. Place your order!\n\n🔒 SecureShop never stores your card details."
  },
  {
    patterns: ["order","orders","my orders","track","tracking","order status","where is my"],
    response: "To check your orders:\n\n1. Make sure you're logged in\n2. Click 'Orders' in the navigation\n3. View all your past orders and their status\n\nOrder statuses: Pending → Paid → Shipped → Delivered\n\nNeed help with a specific order? Let me know!"
  },
  {
    patterns: ["shipping","delivery","how long","when will","arrive","days"],
    response: "📦 Shipping Info:\n\n• Standard Delivery: 3–5 business days\n• FREE shipping on orders over $500!\n• Orders under $500: flat $9.99 shipping\n\nOnce shipped, your order status updates in your Orders page."
  },
  {
    patterns: ["return","refund","exchange","money back"],
    response: "🔄 Return Policy:\n\n• Returns accepted within 30 days of delivery\n• Item must be in original condition\n• Contact support to initiate a return\n\nRefunds are processed within 5–7 business days after we receive the item."
  },
  {
    patterns: ["price","cost","how much","expensive","cheap","affordable","discount","sale","offer"],
    response: "💰 Pricing at SecureShop:\n\n• We offer competitive prices on all electronics\n• Check the Shop page for current prices\n• Prices shown are in USD\n• No hidden fees — what you see is what you pay!\n\nLooking for something specific? Head to the Shop and use the price sort filter!"
  },
  {
    patterns: ["contact","support","help","email","phone","customer service","reach"],
    response: "Need to reach us? 📬\n\nFor support, you can:\n• Chat with me right here! I'm available 24/7 🤖\n• Email us at: support@secure-shop.store\n\nWe typically respond within 1–2 business days. I can answer most questions instantly though — ask away!"
  },
  {
    patterns: ["secure","safe","privacy","data","encryption","ssl","https"],
    response: "Your security is our top priority! 🛡️\n\n• All data encrypted with HTTPS/SSL\n• Passwords hashed with bcrypt (never stored as plain text)\n• OTP login prevents unauthorized access\n• Card details are NEVER stored on our servers\n• Rate limiting protects against brute force attacks\n\nSecureShop was built with security as the #1 feature!"
  },
  {
    patterns: ["admin","dashboard","manage"],
    response: "The Admin Panel is for store managers only. If you're an admin:\n\n1. Log in with your admin account\n2. The Admin option appears in the navigation\n3. Manage products, orders, and users\n\nNot an admin? You don't need it to shop! 😊"
  },
  {
    patterns: ["about","who","what is secureshop","what are you","tell me about"],
    response: "SecureShop is a premium electronics store built with security in mind! 🏪\n\n• Built by CS students as a final year project\n• Full-stack web app: Node.js + MySQL backend\n• Features Multi-Factor Authentication (MFA)\n• Clean, modern UI inspired by top e-commerce platforms\n• Live at: www.secure-shop.store\n\nWe sell smartphones, laptops, headphones, smartwatches, and tablets!"
  },
  {
    patterns: ["thank","thanks","thank you","thx","ty","great","awesome","perfect","helpful"],
    response: "You're very welcome! 😊 Happy to help anytime. Is there anything else I can assist you with?"
  },
  {
    patterns: ["bye","goodbye","see you","later","cya","exit","close"],
    response: "Goodbye! 👋 Happy shopping at SecureShop. Come back anytime if you need help!"
  },
];

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const rule of BOT_RULES) {
    if (rule.patterns.some(p => lower.includes(p))) {
      return rule.response;
    }
  }
  return "Hmm, I'm not sure about that one! 🤔\n\nHere's what I can help with:\n• Account & login issues\n• OTP / MFA help\n• Products & pricing\n• Orders & tracking\n• Shipping & returns\n• Security & privacy\n\nTry asking about any of those topics!";
}

function initChatbot() {
  // Don't show chatbot on admin page
  if (window.location.pathname.includes("admin")) return;

  const bot = document.createElement("div");
  bot.id = "ss-bot";
  bot.innerHTML = `
    <!-- Toggle Button -->
    <button class="ss-bot-toggle" id="ss-bot-toggle" onclick="toggleBot()" aria-label="Chat with us">
      <span class="ss-bot-toggle-icon" id="ss-bot-icon">${icons.bot}</span>
      <span class="ss-bot-badge" id="ss-bot-badge" style="display:none;">1</span>
    </button>

    <!-- Chat Window -->
    <div class="ss-bot-window" id="ss-bot-window">
      <div class="ss-bot-header">
        <div class="ss-bot-header-info">
          <div class="ss-bot-avatar">🤖</div>
          <div>
            <div class="ss-bot-name">ShopBot</div>
            <div class="ss-bot-status">● Online — Always here to help</div>
          </div>
        </div>
        <button class="ss-bot-close" onclick="toggleBot()">${icons.close}</button>
      </div>

      <div class="ss-bot-messages" id="ss-bot-messages">
        <!-- Welcome message -->
        <div class="ss-bot-msg bot">
          <div class="ss-bot-bubble">
            Hey there! 👋 I'm <strong>ShopBot</strong>, your SecureShop assistant.<br/><br/>
            I can help with <strong>orders, products, login, OTP, delivery</strong> and more. What can I help you with?
          </div>
        </div>
        <!-- Quick replies -->
        <div class="ss-bot-quickreplies" id="ss-bot-quick">
          <button onclick="sendQuick('Track my order')">📦 Track Order</button>
          <button onclick="sendQuick('Forgot password')">🔑 Forgot Password</button>
          <button onclick="sendQuick('OTP not received')">📧 OTP Issues</button>
          <button onclick="sendQuick('Shipping info')">🚚 Shipping</button>
        </div>
      </div>

      <div class="ss-bot-input-row">
        <input type="text" id="ss-bot-input" class="ss-bot-input"
          placeholder="Type a message…" maxlength="200"
          onkeydown="if(event.key==='Enter') sendBotMsg()"/>
        <button class="ss-bot-send" onclick="sendBotMsg()">${icons.send}</button>
      </div>
    </div>
  `;
  document.body.appendChild(bot);

  // Show badge after 3 seconds to draw attention
  setTimeout(() => {
    const badge = document.getElementById("ss-bot-badge");
    if (badge && !localStorage.getItem("ss-bot-opened")) {
      badge.style.display = "flex";
    }
  }, 3000);
}

let botOpen = false;
function toggleBot() {
  botOpen = !botOpen;
  const win   = document.getElementById("ss-bot-window");
  const badge = document.getElementById("ss-bot-badge");
  const icon  = document.getElementById("ss-bot-icon");
  win.classList.toggle("open", botOpen);
  if (botOpen) {
    badge.style.display = "none";
    localStorage.setItem("ss-bot-opened", "1");
    icon.innerHTML = icons.close;
    setTimeout(() => document.getElementById("ss-bot-input")?.focus(), 300);
  } else {
    icon.innerHTML = icons.bot;
  }
}

function sendQuick(msg) {
  document.getElementById("ss-bot-quick")?.remove();
  appendUserMsg(msg);
  setTimeout(() => appendBotMsg(getBotResponse(msg)), 600);
}

function sendBotMsg() {
  const input = document.getElementById("ss-bot-input");
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = "";
  document.getElementById("ss-bot-quick")?.remove();
  appendUserMsg(msg);
  // Typing indicator
  const typing = appendTyping();
  setTimeout(() => {
    typing.remove();
    appendBotMsg(getBotResponse(msg));
  }, 700 + Math.random() * 400);
}

function appendUserMsg(text) {
  const msgs = document.getElementById("ss-bot-messages");
  const div  = document.createElement("div");
  div.className = "ss-bot-msg user";
  div.innerHTML = `<div class="ss-bot-bubble">${escapeHtml(text)}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendBotMsg(text) {
  const msgs = document.getElementById("ss-bot-messages");
  const div  = document.createElement("div");
  div.className = "ss-bot-msg bot";
  // Convert newlines to <br>
  const html = escapeHtml(text).replace(/\n/g, "<br/>");
  div.innerHTML = `<div class="ss-bot-bubble">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function appendTyping() {
  const msgs = document.getElementById("ss-bot-messages");
  const div  = document.createElement("div");
  div.className = "ss-bot-msg bot";
  div.innerHTML = `<div class="ss-bot-bubble ss-bot-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Auto-init ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
  initChatbot();
  window.addEventListener("scroll", () => {
    document.querySelector(".top-bar")?.classList.toggle("scrolled", window.scrollY > 10);
  });
});
