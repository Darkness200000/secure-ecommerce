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
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  homeFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  shop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/></svg>`,
  shopFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  cartFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6H21l-1.5 9H8L5.82 6zM5.01 2H2v2h2l3.6 7.59L6.25 14C6.09 14.32 6 14.65 6 15c0 1.1.9 2 2 2h12v-2H8.42c-.14 0-.25-.11-.25-.25l.03-.12L9.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 5H5.21l-.2-1H2V6h2.5l.51-4z"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  tagFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  userFill: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  bot:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><line x1="8" y1="16" x2="8" y2="16" stroke-width="3"/><line x1="12" y1="16" x2="12" y2="16" stroke-width="3"/><line x1="16" y1="16" x2="16" y2="16" stroke-width="3"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
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

  // Top bar (mobile only)
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

  // Clear old nav
  document.getElementById("ss-sidebar")?.remove();
  document.getElementById("ss-bottomnav")?.remove();

  if (isAuth || isAdminP) return;

  const navItems = [
    { href: "/",                    iconOff: icons.home,    iconOn: icons.homeFill,  label: "Home",   active: isHome },
    { href: "/pages/products.html", iconOff: icons.shop,    iconOn: icons.shopFill,  label: "Shop",   active: isProducts },
    { href: "/pages/cart.html",     iconOff: icons.cart,    iconOn: icons.cartFill,  label: "Cart",   active: isCart, badge: count },
    { href: "/pages/orders.html",   iconOff: icons.tag,     iconOn: icons.tagFill,   label: "Orders", active: isOrders, hideWhenLoggedOut: true },
    {
      href: user ? "#" : "/pages/login.html",
      iconOff: icons.user, iconOn: icons.userFill,
      label: user ? "Account" : "Login",
      active: false,
      onclick: user ? "showAccountMenu(event)" : null
    },
  ].filter(item => !item.hideWhenLoggedOut || user);

  // ── DESKTOP: Left sidebar ──────────────────────────────
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
          <span class="ss-nav-icon">${item.active ? item.iconOn : item.iconOff}</span>
          <span class="ss-nav-label">${item.label}</span>
          ${item.badge > 0 ? `<span class="ss-sidebar-badge">${item.badge}</span>` : ""}
        </a>
      `).join("")}
    </div>
    ${user ? `
    <div class="ss-sidebar-footer">
      <div class="ss-sidebar-user" onclick="showAccountMenu(event)">
        <div class="ss-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div>
          <div class="ss-user-name">${user.name}</div>
          <div class="ss-user-sub">View account</div>
        </div>
      </div>
    </div>` : ""}
  `;
  document.body.appendChild(sidebar);

  // ── MOBILE: Shop.app style full-width fixed bottom bar ──
  const bottomNav = document.createElement("nav");
  bottomNav.id = "ss-bottomnav";
  bottomNav.className = "ss-bottomnav";
  bottomNav.innerHTML = navItems.map(item => `
    <a href="${item.href}"
      class="ss-bn-item ${item.active ? "active" : ""}"
      ${item.onclick ? `onclick="${item.onclick}"` : ""}>
      <span class="ss-bn-icon">${item.active ? item.iconOn : item.iconOff}</span>
      ${item.badge > 0 ? `<span class="ss-bn-badge">${item.badge}</span>` : ""}
      <span class="ss-bn-label">${item.label}</span>
    </a>
  `).join("");
  document.body.appendChild(bottomNav);

  document.body.classList.add("has-sidebar");
}

// ── Account popup ──────────────────────────────────────────
function showAccountMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  const existing = document.getElementById("ss-acct-popup");
  if (existing) { existing.remove(); return; }
  const user = getUser();
  const popup = document.createElement("div");
  popup.id = "ss-acct-popup";
  popup.className = "ss-acct-popup";
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
// CHATBOT — Enhanced Rule-Based
// ══════════════════════════════════════════════════════════
const BOT_RULES = [
  // Greetings
  {
    patterns: ["hello","hi","hey","sup","hiya","greetings","good morning","good afternoon","good evening","howdy","yo"],
    response: "Hey there! 👋 I'm ShopBot, your SecureShop assistant.\n\nI can help you with:\n• 🏷️ Discounts & deals\n• ⚠️ Low stock items\n• 📦 Orders & tracking\n• 🔐 Account & login\n• 🚚 Shipping info\n• 📞 Contact support\n\nWhat can I help you with today?"
  },
  {
    patterns: ["how are you","how r u","what's up","whats up","you good","doing well"],
    response: "I'm doing great, thanks for asking! 😊 Ready to help you find deals, track orders, or answer any questions. What do you need?"
  },

  // ── DISCOUNTS & DEALS ──────────────────────────────────
  {
    patterns: ["discount","discounts","sale","sales","deal","deals","offer","offers","promo","coupon","code","promocode","special offer","any discount","on sale","reduced","cheaper","save money","bargain"],
    response: "🏷️ Current Deals at SecureShop!\n\n✅ FREE Shipping on orders over $500\n✅ Bundle deals on headphones + accessories\n✅ Seasonal sales on latest smartphones\n✅ Student discounts available (contact support)\n\nCheck the Shop page and look for items marked with badges — those are our highlighted picks!\n\nWant to know about a specific product's price? Just ask! 😊"
  },
  {
    patterns: ["flash sale","limited time","today only","24 hour","hours left","time limited","hurry"],
    response: "⚡ Flash Sales & Limited-Time Offers!\n\nWe run occasional flash sales — the best way to catch them is:\n\n1. Check the Shop page regularly\n2. Look for the red 'Only X left' badge on products\n3. Contact us at sugamthapa@my.unt.edu to be added to our deals list!\n\nDon't miss out — some items sell out fast! 🏃"
  },
  {
    patterns: ["cheapest","budget","affordable","low price","lowest price","best price","price range","under 100","under 200","under 500"],
    response: "💰 Looking for budget-friendly options?\n\nYou can sort products by price on our Shop page:\n\n1. Go to Shop page\n2. Use the 'Sort By' filter\n3. Select 'Price: Low to High'\n\nOur most affordable picks start from under $250! Check out our Headphones and Accessories sections for great value. 🎧"
  },

  // ── LOW STOCK / ENDING SOON ────────────────────────────
  {
    patterns: ["low stock","ending soon","almost out","running out","limited stock","few left","going fast","last few","before it's gone","hurry up","sold out soon","out of stock","when restock","restock","available"],
    response: "⚠️ Items Ending Soon!\n\nOn the Shop page, watch for these badges:\n\n🟡 'Only X left' — Less than 5 units remaining, grab it fast!\n🔴 'Out of Stock' — Currently unavailable\n🟢 'In Stock' — Plenty available\n\nOur fastest-selling items are usually:\n• Latest iPhones & Samsung flagships\n• Sony WH-1000XM headphones\n• Apple Watch Series 9\n• MacBook Air M3\n\nWant to be notified when something is back? Email us at sugamthapa@my.unt.edu 📧"
  },
  {
    patterns: ["which item","what item","what product","popular","best seller","top selling","trending","most bought","recommended","suggest","recommendation","hot product","in demand"],
    response: "🔥 Most Popular Items Right Now!\n\n1. 📱 iPhone 15 Pro — Flying off shelves!\n2. 💻 MacBook Air M3 — Limited units left\n3. 🎧 Sony WH-1000XM5 — Best seller in headphones\n4. ⌚ Apple Watch Series 9 — Very popular\n5. 📱 Samsung Galaxy S24 — High demand\n\nAll marked as 'In Stock' on the Shop page. Grab them before they sell out! 🚀"
  },

  // ── CONTACT SUPPORT ────────────────────────────────────
  {
    patterns: ["contact","support","help","reach","email","phone","customer service","human","agent","representative","talk to someone","speak to","complaint","problem","issue","escalate"],
    response: "📞 Contact Our Support Team!\n\n📧 Email: sugamthapa@my.unt.edu\n\n⏰ Response Time: 1–2 business days\n\n💬 Or chat with me right here — I'm available 24/7 and can answer most questions instantly!\n\nFor urgent issues, please mention 'URGENT' in your email subject line and we'll prioritize your request. 🙏"
  },
  {
    patterns: ["email support","send email","write email","contact email","support email","email address","how to contact","get in touch"],
    response: "📧 Our support email is:\n\nsugamthapa@my.unt.edu\n\nPlease include:\n• Your registered email address\n• Order number (if applicable)\n• A brief description of your issue\n\nWe typically respond within 1–2 business days. For faster help, I'm here 24/7! 😊"
  },
  {
    patterns: ["refund","money back","chargeback","dispute","not delivered","wrong item","damaged","broken","return request"],
    response: "😔 Sorry to hear you're having an issue!\n\nFor refunds or returns:\n\n1. Email us at sugamthapa@my.unt.edu\n2. Include your order number and photos if damaged\n3. We'll process your request within 2–3 business days\n\n📋 Our Policy:\n• Returns accepted within 30 days\n• Item must be in original condition\n• Refunds processed in 5–7 business days\n\nWe want to make it right for you! 💙"
  },

  // ── OTP & LOGIN ────────────────────────────────────────
  {
    patterns: ["otp","one time password","code","verification code","not receiving","didn't receive","no email","resend"],
    response: "📬 OTP Not Arriving? Here's what to try:\n\n1. ✅ Check spam/junk folder\n2. ✅ Wait 60 seconds then check again\n3. ✅ Make sure you used the correct email\n4. ✅ Click 'Resend code' on the OTP page\n5. ✅ OTPs expire in 5 minutes — enter quickly!\n\nStill not working? Email us at sugamthapa@my.unt.edu with your registered email and we'll help! 🙏"
  },
  {
    patterns: ["forgot password","reset password","can't login","cant login","locked out","lost password","change password","password reset"],
    response: "🔑 Forgot Your Password?\n\nNo worries! Reset it in 3 easy steps:\n\n1. Go to Login page\n2. Click 'Forgot password?'\n3. Enter your email → get OTP → set new password\n\n⚠️ New password must have:\n• 8+ characters\n• 1 uppercase letter\n• 1 number\n• 1 symbol (!@#$%^&*)\n\nNeed more help? Email sugamthapa@my.unt.edu 📧"
  },
  {
    patterns: ["register","sign up","create account","new account","join"],
    response: "🎉 Create Your Free Account!\n\n1. Click Register in the navigation\n2. Enter name, email, and strong password\n3. Password needs: 8+ chars, uppercase, number & symbol\n4. Done! Log in to start shopping\n\nAlready have an account? Just log in — we'll send you a secure OTP to verify it's you! 🔐"
  },
  {
    patterns: ["login","log in","sign in","signin","account access"],
    response: "🔐 How to Log In:\n\n1. Go to Login page\n2. Enter your email + password\n3. We send a 6-digit OTP to your email\n4. Enter the OTP within 5 minutes\n5. You're in! ✅\n\nThis 2-step login keeps your account ultra-secure. Trouble logging in? Email sugamthapa@my.unt.edu"
  },

  // ── SECURITY ───────────────────────────────────────────
  {
    patterns: ["mfa","2fa","two factor","multi factor","why otp","is it safe","secure","safety","hack","hacked","account security"],
    response: "🛡️ Your Security is Our #1 Priority!\n\nSecureShop uses Multi-Factor Authentication (MFA):\n• Even if someone gets your password, they can't log in without the OTP sent to YOUR email\n• All data encrypted with HTTPS/SSL 256-bit\n• Passwords hashed with bcrypt (never stored plain)\n• Rate limiting prevents brute-force attacks\n• We NEVER store your card details\n\nYou're in very safe hands! 🔒"
  },

  // ── PRODUCTS ───────────────────────────────────────────
  {
    patterns: ["product","products","electronics","items","catalog","browse","what do you sell","what's available","collection"],
    response: "🛍️ What We Sell at SecureShop!\n\n📱 Smartphones — iPhone, Samsung Galaxy\n💻 Laptops — MacBook Air, Dell XPS\n🎧 Headphones — Sony, AirPods Pro\n⌚ Smartwatches — Apple Watch\n📟 Tablets — iPad Pro\n\nAll products are premium electronics from top brands!\n\nHead to the Shop page and use filters to find exactly what you're looking for 🔍"
  },
  {
    patterns: ["iphone","apple","macbook","ipad","airpods","apple watch"],
    response: "🍎 Apple Products at SecureShop!\n\nWe carry:\n• iPhone 15 Pro — $999.99\n• MacBook Air M3 — $1,299.99\n• iPad Pro M4 — $1,099.99\n• AirPods Pro 2 — $249.99\n• Apple Watch Series 9 — $399.99\n\nApple products sell fast! Check the Shop page for current stock levels. Low stock items show a warning badge ⚠️"
  },
  {
    patterns: ["samsung","galaxy","android","dell","xps","sony","headphone","headphones","smartwatch"],
    response: "🔥 Non-Apple Electronics at SecureShop!\n\n• Samsung Galaxy S24 — $899.99\n• Dell XPS 15 — $1,199.99\n• Sony WH-1000XM5 — $349.99 (our #1 seller!)\n\nHead to Shop → use category filter to browse by type! Each product shows real-time stock so you know what's available 🟢"
  },
  {
    patterns: ["cart","add to cart","basket","bag","checkout"],
    response: "🛒 Shopping Cart Tips!\n\n• Add items by clicking the product card\n• Your cart saves automatically\n• No login needed to browse — only at checkout\n• Cart icon shows item count in the navigation\n• Free shipping when cart total exceeds $500! 🎉\n\nReady to buy? Go to Cart → Checkout!"
  },

  // ── SHIPPING ───────────────────────────────────────────
  {
    patterns: ["shipping","delivery","how long","when will","arrive","days","free shipping","shipping cost","delivery time"],
    response: "🚚 Shipping Information!\n\n✅ FREE Shipping — orders over $500\n💰 $9.99 flat rate — orders under $500\n⏱️ Delivery Time — 3 to 5 business days\n\n📦 Track your order:\n1. Log in to your account\n2. Go to 'Orders' page\n3. View status: Pending → Paid → Shipped → Delivered\n\nQuestions about a specific order? Email sugamthapa@my.unt.edu"
  },

  // ── ORDERS ─────────────────────────────────────────────
  {
    patterns: ["order","orders","my orders","track","tracking","order status","where is my order","order history","purchase history"],
    response: "📦 Track Your Orders!\n\n1. Make sure you're logged in\n2. Click 'Orders' in the navigation\n3. See all orders and their current status\n\n🔄 Order Statuses:\n• ⏳ Pending — order received\n• 💳 Paid — payment confirmed\n• 📦 Shipped — on its way!\n• ✅ Delivered — arrived!\n• ❌ Cancelled — order cancelled\n\nOrder missing? Email sugamthapa@my.unt.edu with your order number!"
  },
  {
    patterns: ["cancel order","cancel my order","how to cancel","cancellation"],
    response: "❌ Need to Cancel an Order?\n\nTo cancel:\n1. Go to 'Orders' page\n2. Find the order you want to cancel\n3. If still 'Pending', contact us immediately\n\n⚠️ Orders already 'Shipped' cannot be cancelled — but you can return after delivery.\n\n📧 For fast cancellation: sugamthapa@my.unt.edu\nInclude your order number for faster processing!"
  },

  // ── PAYMENT ────────────────────────────────────────────
  {
    patterns: ["payment","pay","credit card","debit card","card","payment method","how to pay","accepted","visa","mastercard"],
    response: "💳 Payment at SecureShop!\n\n✅ We accept all major cards (Visa, Mastercard, etc.)\n🔒 Demo Mode — no real charges in this version\n🚫 We NEVER store your card details\n✅ SSL encrypted payment form\n\nTo pay:\n1. Add items to cart\n2. Click 'Proceed to Checkout'\n3. Fill shipping + payment details\n4. Place order!\n\nSafe, secure, simple! 🛡️"
  },

  // ── ABOUT ──────────────────────────────────────────────
  {
    patterns: ["about","who made","who are you","what is secureshop","tell me about","final year","student project","university"],
    response: "🎓 About SecureShop!\n\nSecureShop is a Final Year Computer Science project that demonstrates a real-world, production-grade e-commerce platform.\n\n🔧 Built with:\n• Node.js + Express.js (backend)\n• MySQL (database)\n• HTML/CSS/JS (frontend)\n• JWT + OTP (security)\n\n🌐 Live at: www.secure-shop.store\n\nCreated to showcase full-stack development + cybersecurity best practices! 💪"
  },

  // ── THANKS ─────────────────────────────────────────────
  {
    patterns: ["thank","thanks","thank you","thx","ty","appreciate","great","awesome","perfect","helpful","good job","nice","excellent","love it"],
    response: "You're very welcome! 😊 Happy I could help!\n\nAnything else I can assist with? Don't hesitate to ask — I'm here 24/7! 🤖"
  },
  {
    patterns: ["bye","goodbye","see you","later","cya","exit","close chat","that's all","done","no thanks"],
    response: "Goodbye! 👋 Happy shopping at SecureShop!\n\nRemember, you can always reach us at sugamthapa@my.unt.edu if you need human support. Take care! 😊"
  },
  {
    patterns: ["joke","funny","make me laugh","entertain","bored"],
    response: "😄 Here's a tech joke for you:\n\nWhy do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛\n\n...Okay back to shopping! 😂 Is there anything I can help you find?"
  },
];

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const rule of BOT_RULES) {
    if (rule.patterns.some(p => lower.includes(p))) {
      return rule.response;
    }
  }
  return "Hmm, I'm not quite sure about that one! 🤔\n\nHere's what I can help with:\n🏷️ Discounts & deals\n⚠️ Low stock / ending soon items\n📦 Orders & tracking\n🔐 Account & login issues\n🚚 Shipping info\n💳 Payment help\n📞 Contact support\n\nTry asking about any of those! Or email us at sugamthapa@my.unt.edu for human support 😊";
}

function initChatbot() {
  if (window.location.pathname.includes("admin")) return;

  const bot = document.createElement("div");
  bot.id = "ss-bot";
  bot.innerHTML = `
    <button class="ss-bot-toggle" id="ss-bot-toggle" onclick="toggleBot()" aria-label="Chat with us">
      <span class="ss-bot-toggle-icon" id="ss-bot-icon">${icons.bot}</span>
      <span class="ss-bot-badge-dot" id="ss-bot-dot"></span>
    </button>

    <div class="ss-bot-window" id="ss-bot-window">
      <div class="ss-bot-header">
        <div class="ss-bot-header-info">
          <div class="ss-bot-avatar">🤖</div>
          <div>
            <div class="ss-bot-name">ShopBot</div>
            <div class="ss-bot-status"><span class="ss-bot-online-dot"></span>Online — Always here</div>
          </div>
        </div>
        <button class="ss-bot-close" onclick="toggleBot()">${icons.close}</button>
      </div>

      <div class="ss-bot-messages" id="ss-bot-messages">
        <div class="ss-bot-msg bot">
          <div class="ss-bot-bubble">
            Hi! I'm <strong>ShopBot</strong> 🤖<br/><br/>
            I can help with <strong>deals, low stock alerts, orders, account issues</strong> and more!
          </div>
        </div>
        <div class="ss-bot-quickreplies" id="ss-bot-quick">
          <button onclick="sendQuick('What discounts are available')">🏷️ Discounts</button>
          <button onclick="sendQuick('Which items are ending soon')">⚠️ Low Stock</button>
          <button onclick="sendQuick('Track my order')">📦 My Orders</button>
          <button onclick="sendQuick('Contact support')">📞 Support</button>
          <button onclick="sendQuick('Forgot password')">🔑 Password Help</button>
          <button onclick="sendQuick('Shipping info')">🚚 Shipping</button>
        </div>
      </div>

      <div class="ss-bot-input-row">
        <input type="text" id="ss-bot-input" class="ss-bot-input"
          placeholder="Ask me anything…" maxlength="200"
          onkeydown="if(event.key==='Enter') sendBotMsg()"/>
        <button class="ss-bot-send" onclick="sendBotMsg()">${icons.send}</button>
      </div>
    </div>
  `;
  document.body.appendChild(bot);

  // Pulse dot after 4s if not opened yet
  setTimeout(() => {
    if (!localStorage.getItem("ss-bot-opened")) {
      document.getElementById("ss-bot-dot")?.classList.add("pulse");
    }
  }, 4000);
}

let botOpen = false;
function toggleBot() {
  botOpen = !botOpen;
  const win  = document.getElementById("ss-bot-window");
  const dot  = document.getElementById("ss-bot-dot");
  const icon = document.getElementById("ss-bot-icon");
  win.classList.toggle("open", botOpen);
  if (botOpen) {
    dot?.classList.remove("pulse");
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
  const typing = appendTyping();
  setTimeout(() => { typing.remove(); appendBotMsg(getBotResponse(msg)); }, 650);
}

function sendBotMsg() {
  const input = document.getElementById("ss-bot-input");
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = "";
  document.getElementById("ss-bot-quick")?.remove();
  appendUserMsg(msg);
  const typing = appendTyping();
  setTimeout(() => { typing.remove(); appendBotMsg(getBotResponse(msg)); }, 650 + Math.random() * 350);
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
  div.innerHTML = `<div class="ss-bot-bubble">${escapeHtml(text).replace(/\n/g, "<br/>")}</div>`;
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
