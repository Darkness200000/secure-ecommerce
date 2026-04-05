# 🛒 SecureShop — Secure E-Commerce Website
**With Multifactor Authentication & Payment Gateway**

> Final Year Project | Node.js + Express + MySQL | MFA via Email OTP | JWT Auth

---

## 📁 Project Structure

```
secure-ecommerce/
├── backend/
│   ├── app.js                    # Express server entry point
│   ├── config/db.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, OTP Verify
│   │   ├── productController.js  # Product listing & search
│   │   ├── orderController.js    # Place order, order history
│   │   └── adminController.js    # Admin management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT protect + role-based access
│   │   └── rateLimiter.js        # Brute-force protection
│   ├── routes/                   # Express routers
│   └── utils/emailService.js     # Nodemailer OTP email
├── frontend/
│   ├── index.html                # Homepage
│   ├── css/style.css             # Full stylesheet
│   ├── js/
│   │   ├── api.js                # Auth helpers + fetch wrapper
│   │   └── cart.js               # Cart (localStorage)
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── otp.html              # MFA verification page
│       ├── products.html
│       ├── cart.html
│       ├── checkout.html
│       ├── orders.html
│       └── admin.html            # Admin dashboard
├── database/schema.sql           # Tables + seed data
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Local Setup

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/secure-ecommerce.git
cd secure-ecommerce
npm install
```

### 2. Set up database
```bash
mysql -u root -p < database/schema.sql
```

### 3. Create .env file
```bash
cp .env.example .env
```
Fill in your values in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=secure_ecommerce
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
SESSION_SECRET=<run again for a different value>
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Gmail App Password:** myaccount.google.com → Security → 2-Step Verification → App Passwords

### 4. Start server
```bash
npm run dev    # development
npm start      # production
```

Visit: **http://localhost:5000**

### Demo admin account
- Email: `admin@secureshop.com`
- Password: `Admin@1234`

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (12 rounds) |
| MFA | Email OTP — 6-digit, 5 min expiry, single-use |
| Authentication | JWT (2h expiry) |
| SQL Injection prevention | Parameterized queries (mysql2) |
| Brute-force protection | express-rate-limit |
| Secure HTTP headers | Helmet.js |
| Session security | httpOnly cookies |
| Role-based access | Admin routes restricted by JWT role |
| No card data stored | Simulated payment only |

---

## 🌐 API Endpoints

### Auth
| Method | URL | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Step 1: verify password, send OTP |
| POST | /api/auth/verify-otp | Step 2: submit OTP, get JWT |
| GET  | /api/auth/profile | Get own profile (JWT required) |

### Products
| Method | URL | Description |
|---|---|---|
| GET | /api/products | All products (supports ?search= ?category=) |
| GET | /api/products/:id | Single product |

### Orders
| Method | URL | Description |
|---|---|---|
| POST | /api/orders | Place order (JWT) |
| GET  | /api/orders/my | My orders (JWT) |

### Admin
| Method | URL | Description |
|---|---|---|
| GET    | /api/admin/orders | All orders |
| PATCH  | /api/admin/orders/:id/status | Update order status |
| GET    | /api/admin/users | All users |
| POST   | /api/admin/products | Add product |
| PUT    | /api/admin/products/:id | Edit product |
| DELETE | /api/admin/products/:id | Delete product |

---

## 🚀 Deployment

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/secure-ecommerce.git
git push -u origin main
```

### Step 2 — MySQL on Railway (railway.app)
1. New Project → Provision MySQL
2. Copy host, port, user, password, database from Variables tab
3. Connect with MySQL Workbench and run `database/schema.sql`

### Step 3 — Backend on Render (render.com)
1. New → Web Service → connect GitHub repo
2. Root: `/` | Build: `npm install` | Start: `node backend/app.js`
3. Add all .env variables using Railway DB values
4. Deploy → copy your Render URL

### Step 4 — No separate frontend deployment needed!
The Express server serves the frontend directly. Your Render URL **is** your website.

---

## 👥 Team

| Member | Role |
|---|---|
| Sugam Thapa | Backend + Security (MFA, JWT, bcrypt, sessions) |
| Friend B | Frontend (HTML/CSS pages, UI/UX) |
| Friend C | Database design + integration + payment gateway |
