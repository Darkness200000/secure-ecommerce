const API = "/api";

// ── Token helpers ──────────────────────────────────────────
function getToken()   { return localStorage.getItem("token"); }
function getUser()    { return JSON.parse(localStorage.getItem("user") || "null"); }
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u = getUser(); return u && u.role === "admin"; }

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // Simple redirect — NO body transform so fixed elements stay fixed
  window.location.href = "/pages/login.html";
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

// ── Page Transition ────────────────────────────────────────
// KEY FIX: We animate a WRAPPER DIV, NOT the body.
// body transform breaks position:fixed — so we NEVER touch body transform.
function navigateTo(href) {
  const wrapper = document.getElementById("page-wrapper");
  if (wrapper) {
    wrapper.style.transition = "opacity 0.22s ease, transform 0.22s ease";
    wrapper.style.opacity    = "0";
    wrapper.style.transform  = "translateY(-10px)";
  }
  setTimeout(() => { window.location.href = href; }, 230);
}

function initPageTransitions() {
  // Wrap all body children (except fixed elements) in a div
  const wrapper = document.createElement("div");
  wrapper.id = "page-wrapper";
  wrapper.style.cssText = "opacity:0; transform:translateY(14px); transition:opacity 0.3s ease, transform 0.3s ease;";

  // Move all existing children into wrapper
  while (document.body.firstChild) {
    wrapper.appendChild(document.body.firstChild);
  }
  document.body.appendChild(wrapper);

  // Trigger fade-in
  requestAnimationFrame(() => requestAnimationFrame(() => {
    wrapper.style.opacity   = "1";
    wrapper.style.transform = "translateY(0)";
  }));

  // Intercept internal link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href]");
    if (!link) return;
    const href = link.getAttribute("href");
    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !href.startsWith("mailto") &&
      !href.startsWith("javascript") &&
      !link.hasAttribute("data-no-transition") &&
      !link.hasAttribute("target")
    ) {
      e.preventDefault();
      navigateTo(href);
    }
  });
}

// ── SVG Icons ──────────────────────────────────────────────
const icons = {
  home:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  homeFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  shop:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="7" height="7"/><rect x="15" y="3" width="7" height="7"/><rect x="15" y="14" width="7" height="7"/><rect x="2" y="14" width="7" height="7"/></svg>`,
  shopFill:`<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="3" width="7" height="7" rx="1"/><rect x="15" y="3" width="7" height="7" rx="1"/><rect x="15" y="14" width="7" height="7" rx="1"/><rect x="2" y="14" width="7" height="7" rx="1"/></svg>`,
  cart:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  cartFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03L21 5H5.21L4.27 2H1v2h2l3.6 7.59-1.35 2.44C5.09 14.32 5 14.65 5 15c0 1.1.9 2 2 2h12v-2H8.42c-.13 0-.25-.11-.25-.25z"/></svg>`,
  orders:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  ordersFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  user:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  userFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  bot:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="16.5" r="1.5" fill="currentColor" stroke="none"/><circle cx="15.5" cy="16.5" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  close:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send:    `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
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

  // Minimal top bar (mobile only — desktop has sidebar)
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

  // Remove old navs
  document.getElementById("ss-sidebar")?.remove();
  document.getElementById("ss-bottomnav")?.remove();

  if (isAuth || isAdminP) return;

  const navItems = [
    { href: "/",                    iconOff: icons.home,    iconOn: icons.homeFill,   label: "Home",   active: isHome },
    { href: "/pages/products.html", iconOff: icons.shop,    iconOn: icons.shopFill,   label: "Shop",   active: isProducts },
    { href: "/pages/cart.html",     iconOff: icons.cart,    iconOn: icons.cartFill,   label: "Cart",   active: isCart, badge: count },
    { href: "/pages/orders.html",   iconOff: icons.orders,  iconOn: icons.ordersFill, label: "Orders", active: isOrders, requireLogin: true },
    {
      href: user ? "#" : "/pages/login.html",
      iconOff: icons.user, iconOn: icons.userFill,
      label: user ? "Account" : "Login",
      active: false,
      onclick: user ? "showAccountMenu(event)" : null,
    },
  ].filter(item => !item.requireLogin || user);

  // ══════════════════════════════════════════════
  // DESKTOP: Left sidebar — position:fixed
  // ══════════════════════════════════════════════
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
        </a>`).join("")}
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
  // Append DIRECTLY to body (not wrapper) so it stays fixed
  document.body.appendChild(sidebar);

  // ══════════════════════════════════════════════
  // MOBILE: Full-width fixed bottom nav
  // Appended to BODY directly — NOT inside page-wrapper
  // This is the KEY — fixed elements must be direct children of body
  // ══════════════════════════════════════════════
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
    </a>`).join("");
  // Append DIRECTLY to body — never inside page-wrapper
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
// CHATBOT
// ══════════════════════════════════════════════════════════
const BOT_RULES = [
  {
    patterns: ["hello","hi","hey","sup","hiya","greetings","good morning","good afternoon","good evening","howdy","yo","salam","assalam"],
    response: "Hey there! 👋 I'm ShopBot — your SecureShop assistant!\n\nI can help you with:\n🏷️ Discounts & current deals\n⚠️ Low stock alerts\n📦 Orders & tracking\n🔐 Login & account issues\n🚚 Shipping & delivery\n💳 Payment help\n📞 Contact support\n\nWhat can I help you with? 😊"
  },
  {
    patterns: ["how are you","you good","doing well","what's up","whats up"],
    response: "I'm always ready to help! 😄 What can I do for you today?"
  },
  // ── DISCOUNTS ──
  {
    patterns: ["discount","discounts","sale","deal","deals","offer","offers","promo","coupon","code","on sale","reduced","save money","any discount","what discount"],
    response: "🏷️ Current Deals at SecureShop!\n\n✅ FREE Shipping on orders over $500\n✅ Headphones bundle discounts available\n✅ Latest smartphones — check for seasonal offers\n✅ Student discounts (contact us!)\n\nPro tip: Use Sort by 'Price: Low to High' on Shop page to find the best value items!\n\n📧 For exclusive deals: sugamthapa@my.unt.edu"
  },
  {
    patterns: ["flash sale","limited time","today only","hurry","time limited","24 hours","hours left"],
    response: "⚡ Flash Sales & Limited Offers!\n\nTo catch flash deals:\n• Check the Shop page regularly\n• Items with 🟡 'Only X left' badge are almost gone!\n• Email sugamthapa@my.unt.edu to join our deals list\n\nSome items sell out within hours — don't wait! 🏃"
  },
  {
    patterns: ["cheapest","budget","affordable","low price","best price","under 100","under 200","under 500","cheap"],
    response: "💰 Budget-Friendly Options!\n\nGo to Shop page → Sort by 'Price: Low to High'\n\nOur most affordable picks:\n🎧 AirPods Pro 2 — $249.99\n🎧 Sony WH-1000XM5 — $349.99\n⌚ Apple Watch — $399.99\n\nAll quality electronics at great prices! 🔥"
  },
  {
    patterns: ["free shipping","shipping free","no shipping cost","free delivery"],
    response: "🚚 FREE Shipping!\n\nYou get FREE shipping when your order total is over $500!\n\nOrders under $500 = flat $9.99 shipping fee.\n\nTip: Add multiple items to get past $500 and save on shipping! 😊"
  },
  // ── LOW STOCK ──
  {
    patterns: ["low stock","ending soon","almost out","running out","limited stock","few left","going fast","last few","before gone","sold out soon","which item end","ending","finish soon","khatam","stock khatam"],
    response: "⚠️ Items Running Low on Stock!\n\nOn the Shop page, check these badges:\n🟡 'Only X left' = Less than 5 units — grab fast!\n🔴 'Out of Stock' = Gone for now\n🟢 'In Stock' = Plenty available\n\nFastest selling items right now:\n📱 iPhone 15 Pro (very low stock!)\n💻 MacBook Air M3 (limited units)\n🎧 Sony WH-1000XM5 (popular!)\n⌚ Apple Watch Series 9\n\nWant restock alerts? Email: sugamthapa@my.unt.edu 📧"
  },
  {
    patterns: ["popular","best seller","top","trending","most bought","recommended","hot","in demand","which is best","what should i buy","suggest","suggestion"],
    response: "🔥 Our Most Popular Products!\n\n1. 📱 iPhone 15 Pro — $999.99 ⭐ Top seller\n2. 🎧 Sony WH-1000XM5 — $349.99 ⭐ Best headphones\n3. 💻 MacBook Air M3 — $1,299.99 ⭐ Best laptop\n4. ⌚ Apple Watch Series 9 — $399.99 ⭐ Hot pick\n5. 📱 Samsung Galaxy S24 — $899.99 ⭐ Android fav\n\nAll available on the Shop page! Don't wait — stock is limited 🚀"
  },
  {
    patterns: ["new","latest","new arrival","just added","new product","recent","newly added"],
    response: "✨ New Arrivals!\n\nCheck the 'New Arrivals' section on our Home page for the latest additions!\n\nWe regularly update our inventory with the newest electronics from top brands. Enable notifications by emailing sugamthapa@my.unt.edu to be the first to know! 🔔"
  },
  // ── CONTACT ──
  {
    patterns: ["contact","support","help","email","phone","customer service","human","agent","talk to someone","speak to","complaint","problem","issue","reach","get in touch","contact email"],
    response: "📞 Contact Our Support Team!\n\n📧 Email: sugamthapa@my.unt.edu\n\n📝 When emailing, please include:\n• Your registered email\n• Order number (if applicable)\n• Description of your issue\n\n⏰ Response: 1–2 business days\n💬 Or keep chatting with me — I answer instantly! 🤖"
  },
  {
    patterns: ["refund","money back","return","chargeback","not delivered","wrong item","damaged","broken"],
    response: "😔 Sorry to hear that! Here's how to get help:\n\n📧 Email: sugamthapa@my.unt.edu\nInclude: order number + photos if item is damaged\n\n📋 Return Policy:\n• Returns within 30 days of delivery\n• Item must be in original condition\n• Refunds in 5–7 business days after we receive it\n\nWe'll make it right for you! 💙"
  },
  {
    patterns: ["cancel order","cancel my order","how to cancel","cancellation"],
    response: "❌ Want to Cancel?\n\n• Go to 'Orders' page\n• Find your order\n• If status is 'Pending' — email us immediately!\n\n⚠️ Once 'Shipped' — cannot cancel but you can return after delivery.\n\n📧 Fast cancellation: sugamthapa@my.unt.edu\nMention your order number! ⚡"
  },
  // ── OTP & LOGIN ──
  {
    patterns: ["otp","one time password","verification code","not receiving","didn't receive","no email","resend","code not coming","code nahi aya"],
    response: "📬 OTP Not Arriving? Try these:\n\n1. ✅ Check spam/junk folder first!\n2. ✅ Wait 60 seconds then check again\n3. ✅ Make sure email address is correct\n4. ✅ Click 'Resend code' on the OTP page\n5. ✅ OTP expires in 5 minutes — enter it quickly!\n\nStill stuck? Email: sugamthapa@my.unt.edu 🙏"
  },
  {
    patterns: ["forgot password","reset password","can't login","cant login","locked out","lost password","change password","password nahi yaad","pasword bhol gya"],
    response: "🔑 Forgot Password? Easy fix!\n\n1. Go to Login page\n2. Click 'Forgot password?'\n3. Enter your email\n4. Get OTP → Enter it\n5. Set new password\n\nNew password must have:\n• 8+ characters\n• 1 uppercase letter (A-Z)\n• 1 number (0-9)\n• 1 symbol (!@#$%^&*)\n\n📧 Still can't access? sugamthapa@my.unt.edu"
  },
  {
    patterns: ["register","sign up","create account","new account","join","account banana"],
    response: "🎉 Create Your Free Account!\n\n1. Click Register in the menu\n2. Enter your name, email\n3. Create a strong password\n4. You're in! 🚀\n\nPassword rules:\n✅ 8+ characters\n✅ 1 uppercase\n✅ 1 number\n✅ 1 symbol\n\nAlready have an account? Just log in! 😊"
  },
  {
    patterns: ["login","log in","sign in","how to login","login nahi ho raha","login problem"],
    response: "🔐 How to Log In:\n\n1. Click 'Login' in the menu\n2. Enter email + password\n3. We send a 6-digit OTP to your email\n4. Enter OTP within 5 minutes\n5. Done! ✅\n\nThis 2-step login keeps your account super secure 🛡️\n\nProblems? Email: sugamthapa@my.unt.edu"
  },
  // ── SECURITY ──
  {
    patterns: ["mfa","2fa","two factor","secure","safe","security","hack","account safety","why otp","encryption","ssl"],
    response: "🛡️ Your Security = Our Priority!\n\n✅ Multi-Factor Authentication (MFA) — even with stolen password, no access without OTP\n✅ 256-bit SSL encryption — all data encrypted\n✅ bcrypt password hashing — never stored plain\n✅ Rate limiting — blocks brute force attacks\n✅ Zero card storage — we never keep your card\n\nSecureShop is built security-first! You're in safe hands 🔒"
  },
  // ── PRODUCTS ──
  {
    patterns: ["product","products","electronics","items","catalog","browse","what do you sell","what's available","collection","kya milta","kya hai"],
    response: "🛍️ What We Sell!\n\n📱 Smartphones — iPhone 15 Pro, Samsung Galaxy S24\n💻 Laptops — MacBook Air M3, Dell XPS 15\n🎧 Headphones — Sony WH-1000XM5, AirPods Pro 2\n⌚ Smartwatches — Apple Watch Series 9\n📟 Tablets — iPad Pro M4\n\nAll premium electronics from top brands!\nGo to Shop page to browse with filters 🔍"
  },
  {
    patterns: ["iphone","apple","macbook","ipad","airpods","apple watch","mac"],
    response: "🍎 Apple Products at SecureShop!\n\n📱 iPhone 15 Pro — $999.99\n💻 MacBook Air M3 — $1,299.99\n📟 iPad Pro M4 — $1,099.99\n🎧 AirPods Pro 2 — $249.99\n⌚ Apple Watch Series 9 — $399.99\n\n⚠️ Apple products sell fast — check stock badges on Shop page!"
  },
  {
    patterns: ["samsung","galaxy","android","dell","xps","sony","headphone","headphones","smartwatch","watch"],
    response: "🔥 Non-Apple Electronics!\n\n📱 Samsung Galaxy S24 — $899.99\n💻 Dell XPS 15 — $1,199.99\n🎧 Sony WH-1000XM5 — $349.99 (🏆 Best seller!)\n\nAll available on Shop page — use category filters to browse! Each product shows real-time stock 🟢"
  },
  {
    patterns: ["cart","add to cart","basket","bag","how to add","cart mein kaise"],
    response: "🛒 Adding to Cart is Easy!\n\n1. Go to Shop page\n2. Click any product card\n3. View details in the popup\n4. Click 'Add to Cart' button\n5. Cart count updates in the nav!\n\n✅ No login needed to browse\n✅ Login required at checkout\n✅ FREE shipping over $500 🎉"
  },
  // ── SHIPPING & ORDERS ──
  {
    patterns: ["shipping","delivery","how long","arrive","days","shipping cost","delivery time","kitne din","kab ayega"],
    response: "🚚 Shipping Info!\n\n✅ FREE — orders over $500\n💰 $9.99 — orders under $500\n⏱️ 3–5 business days delivery\n\nTrack your order:\n1. Log in\n2. Go to 'Orders' page\n3. See live status updates\n\nQuestions? sugamthapa@my.unt.edu 📧"
  },
  {
    patterns: ["order","orders","my orders","track","tracking","order status","where is my order","mera order","order kahan"],
    response: "📦 Track Your Orders!\n\n1. Log in to your account\n2. Click 'Orders' in the menu\n3. See all orders + status\n\n🔄 Status flow:\n⏳ Pending → 💳 Paid → 📦 Shipped → ✅ Delivered\n\nOrder missing or late? Email: sugamthapa@my.unt.edu with your order number!"
  },
  // ── PAYMENT ──
  {
    patterns: ["payment","pay","card","credit card","how to pay","payment method","visa","mastercard","payment nahi ho raha"],
    response: "💳 Payment is Simple & Secure!\n\n✅ All major cards accepted (Visa, Mastercard, etc.)\n🔒 Demo mode — no real charges in this version\n🚫 We NEVER store card details\n✅ SSL encrypted form\n\nCheckout steps:\n1. Cart → Proceed to Checkout\n2. Enter shipping address\n3. Enter card details\n4. Place order! 🎉"
  },
  // ── ABOUT ──
  {
    patterns: ["about","who made","what is secureshop","final year","student project","university","kaisa project","kis ne banaya"],
    response: "🎓 About SecureShop!\n\nThis is a Final Year Computer Science project demonstrating a real, production-grade secure e-commerce platform!\n\n🔧 Tech Stack:\n• Node.js + Express (backend)\n• MySQL (database)\n• HTML/CSS/JS (frontend)\n• JWT + OTP = MFA security\n\n🌐 Live at: www.secure-shop.store\n\nBuilt to showcase full-stack + cybersecurity skills! 💪"
  },
  // ── FUN ──
  {
    patterns: ["joke","funny","make me laugh","bored","entertain","mazak","hasao"],
    response: "😄 Here's one for you!\n\nWhy do programmers prefer dark mode?\n\nBecause light attracts bugs! 🐛\n\n...Okay okay, back to shopping! 😂 How can I help?"
  },
  {
    patterns: ["thank","thanks","thank you","thx","ty","shukriya","shukria","helpful","great","awesome","perfect"],
    response: "You're welcome! 😊 Happy to help anytime!\n\nAnything else? I'm here 24/7 🤖"
  },
  {
    patterns: ["bye","goodbye","see you","later","cya","khuda hafiz","allah hafiz","done","that's all"],
    response: "Goodbye! 👋 Happy shopping at SecureShop!\n\nNeed human support? Email: sugamthapa@my.unt.edu\nTake care! 😊"
  },
  // Urdu/Hinglish support
  {
    patterns: ["kya hai","kya","samjhao","batao","help karo","help chahiye","madad","mujhe help","kaise"],
    response: "Bilkul! 😊 Main aapki madad kar sakta hun:\n\n🏷️ Discounts & deals\n⚠️ Low stock items\n📦 Orders track karna\n🔐 Login problems\n🚚 Delivery info\n💳 Payment help\n📞 Support contact\n\nKya jaanna chahte hain? 🙏"
  },
];

function getBotResponse(input) {
  const lower = input.toLowerCase().trim();
  for (const rule of BOT_RULES) {
    if (rule.patterns.some(p => lower.includes(p))) return rule.response;
  }
  return "Hmm, mujhe yeh samajh nahi aaya! 🤔\n\nMain in topics mein help kar sakta hun:\n🏷️ Discounts / deals\n⚠️ Low stock / ending soon\n📦 Orders & tracking\n🔐 Login / OTP help\n🚚 Shipping info\n💳 Payment\n📞 Contact support\n\nOr email karein: sugamthapa@my.unt.edu 😊";
}

// ══════════════════════════════════════════════════════════
// CHATBOT INIT — appended to BODY directly (not wrapper)
// ══════════════════════════════════════════════════════════
function initChatbot() {
  if (window.location.pathname.includes("admin")) return;

  const bot = document.createElement("div");
  bot.id = "ss-bot";

  bot.innerHTML = `
    <!-- Greeting bubble — appears above toggle button -->
    <div class="ss-bot-greeting" id="ss-bot-greeting">
      <button class="ss-bot-greeting-close" onclick="closeGreeting()">×</button>
      <span>👋 Hi! How can I help you today?</span>
      <div class="ss-bot-greeting-arrow"></div>
    </div>

    <!-- Toggle button -->
    <button class="ss-bot-toggle" id="ss-bot-toggle" onclick="toggleBot()" aria-label="Open chat">
      <span class="ss-bot-toggle-icon" id="ss-bot-icon">${icons.bot}</span>
    </button>

    <!-- Chat window -->
    <div class="ss-bot-window" id="ss-bot-window">
      <div class="ss-bot-header">
        <div class="ss-bot-header-info">
          <div class="ss-bot-avatar">🤖</div>
          <div>
            <div class="ss-bot-name">ShopBot</div>
            <div class="ss-bot-status"><span class="ss-online-dot"></span> Online — Always here</div>
          </div>
        </div>
        <button class="ss-bot-close" onclick="toggleBot()">${icons.close}</button>
      </div>

      <div class="ss-bot-messages" id="ss-bot-messages">
        <div class="ss-bot-msg bot">
          <div class="ss-bot-bubble">
            Hi there! I'm <strong>ShopBot</strong> 🤖<br/><br/>
            Ask me about <strong>deals, stock, orders, login</strong> or anything else!
          </div>
        </div>
        <div class="ss-bot-quickreplies" id="ss-bot-quick">
          <button onclick="sendQuick('What discounts are available')">🏷️ Discounts</button>
          <button onclick="sendQuick('Which items are ending soon')">⚠️ Low Stock</button>
          <button onclick="sendQuick('Track my order')">📦 Orders</button>
          <button onclick="sendQuick('Contact support')">📞 Support</button>
          <button onclick="sendQuick('Forgot password')">🔑 Password</button>
          <button onclick="sendQuick('Free shipping')">🚚 Shipping</button>
        </div>
      </div>

      <div class="ss-bot-input-row">
        <input type="text" id="ss-bot-input" class="ss-bot-input"
          placeholder="Type your question…" maxlength="200"
          onkeydown="if(event.key==='Enter') sendBotMsg()"/>
        <button class="ss-bot-send" onclick="sendBotMsg()">${icons.send}</button>
      </div>
    </div>
  `;

  // Append directly to body — NEVER inside page-wrapper
  document.body.appendChild(bot);

  // Show greeting bubble after 2 seconds if not seen before
  setTimeout(() => {
    const greeting = document.getElementById("ss-bot-greeting");
    if (greeting && !localStorage.getItem("ss-bot-opened") && !botOpen) {
      greeting.classList.add("show");
    }
  }, 2000);
}

function closeGreeting() {
  document.getElementById("ss-bot-greeting")?.classList.remove("show");
}

let botOpen = false;

function toggleBot() {
  botOpen = !botOpen;
  const win     = document.getElementById("ss-bot-window");
  const icon    = document.getElementById("ss-bot-icon");
  const greeting= document.getElementById("ss-bot-greeting");

  win.classList.toggle("open", botOpen);
  greeting?.classList.remove("show");

  if (botOpen) {
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
  setTimeout(() => { typing.remove(); appendBotMsg(getBotResponse(msg)); }, 600 + Math.random() * 400);
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

function escapeHtml(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// ── Auto-init ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initPageTransitions();
  initChatbot();
  window.addEventListener("scroll", () => {
    document.querySelector(".top-bar")?.classList.toggle("scrolled", window.scrollY > 10);
  });
});
