# Dishvana Colombo 🍕🔥
> **Premium Artisanal Pizza & Sri Lankan Fusion Dining**

Dishvana Colombo is a high-end, responsive web application designed for a premium dining experience. It features a realistic interactive 3D menu book, a checkout ordering wizard, PayHere payment integration, automated PDF invoice receipt generation, and a real-time Shop Owner Dashboard simulator.

---

## 🌟 Key Features

### 📖 1. Realistic 3D Menu Book View
*   **Realistic Page-Turning**: Users can toggle between standard grid view and a custom 3D booklet. Pages feature hover curl effects and realistic double-page flip transitions on click.
*   **Dynamic Viewport Centering**: Automatically calculates viewport alignments (`translateX`) based on page width (`offsetWidth`) to keep closed covers, open pages, and back covers centered on all screens.
*   **Thumbnails**: Rich food image previews inside the pages.

### 💳 2. Checkout & Payment Gateway
*   **Delivery Order Form**: Inputs for Customer Name, Email, Phone, and Address.
*   **PayHere Sandbox Integration**: Complete checkout wrapper calling the PayHere SDK. Securely processes card details with dynamic MD5 signature hashes computed on the server side to protect secrets.
*   **Cash on Delivery (COD)**: Alternate payment option.

### 📄 3. Dynamic PDF Invoice Downloader
*   **Auto-Download**: Generates and downloads a branded PDF receipt automatically upon order completion.
*   **Premium Layout**: Features dark/gold brand headers, formatted tables, subtotal listings, and delivery details without text overlapping.

### 📊 4. Shop Owner simulator Dashboard (`admin.html`)
*   **Real-Time Order Ledger**: Live transaction feed showing customer details, cart items, paid totals, and payment status.
*   **Simulated Email Client**: Interactive email inbox rendering HTML transaction emails.
*   **Simulated SMS Mobile Mockup**: Virtual phone screen displaying SMS logs.
*   **Nodemailer Integration**: Automatically sends test emails (fallback to Ethereal accounts with preview URLs).
*   **Twilio SMS Fallback**: Natively supports Twilio API integration.

### ✨ 5. Premium UI/UX Details
*   **Custom Spoon Cursor**: A custom angled-spoon cursor with a smooth follower.
*   **Organic Steam Trails**: Mouse cursor movement spawns floating steam particles simulating food aroma.
*   **Hero slideshow Carousel**: Smooth Ken Burns slow-zooming background slideshow.
*   **Light/Dark Mode toggle**: Premium custom themes with matching brand logos.

---

## 🛠️ Tech Stack
*   **Frontend**: HTML5, Vanilla CSS3 (custom variables, HSL colors, 3D transforms), JavaScript (ES6).
*   **Libraries**: [jsPDF](https://github.com/parallax/jsPDF) (PDF receipt generation), [PayHere JS SDK](https://www.payhere.lk/) (Payment processing).
*   **Backend**: Node.js (native `http` server - lightweight and zero-dependency).
*   **Modules**: `dotenv` (environment configuration), `nodemailer` (email notification transport).

---

## 🚀 How to Run Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### 3. Setup Environment Variables
Configure your credentials in the `.env` file (see `.env.example` for reference):
```ini
PAYHERE_MERCHANT_ID=1211149
PAYHERE_MERCHANT_SECRET=your_payhere_secret
SHOP_OWNER_EMAIL=owner@dishvanacolombo.lk
```

### 4. Start the Server
```bash
node server.js
```

### 5. Access the Web Pages
*   **Customer Web App**: [http://localhost:8000/](http://localhost:8000/)
*   **Owner Portal Simulator**: [http://localhost:8000/admin.html](http://localhost:8000/admin.html)

---

## 🧑‍💻 Creator
Designed and Developed by **M.P.B.Kalpana**.
