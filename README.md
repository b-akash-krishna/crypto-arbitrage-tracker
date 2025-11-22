# PrimeTrade AI - Crypto Arbitrage Tracker

**Advanced Full-Stack Web Application with Real-Time AI-Powered Arbitrage Detection**

![Dashboard Preview](https://raw.githubusercontent.com/b-akash-krishna/crypto-arbitrage-tracker/main/frontend/public/hero.png)

## 🚀 Live Demo
**Frontend**: [https://crypto-arbitrage-tracker-pi.vercel.app/](https://crypto-arbitrage-tracker-pi.vercel.app/)  
**Test Credentials**:
- **Email**: `exuser@gmail.com`
- **Password**: `password`

---

## 🌟 Features

### 🧠 AI-Powered Intelligence
- **Real-Time Predictions**: Uses a **Random Forest Classifier** (Scikit-Learn) to predict the success probability of arbitrage opportunities.
- **Live Market Data**: Fetches real-time prices from **Binance, Kraken, KuCoin, and Bybit** via `ccxt` and WebSockets.
- **Smart Scoring**: Analyzes spread, volatility, and liquidity to generate a "Confidence Score" for every trade.

### 🌐 Immersive 3D Experience
- **Interactive Globe**: A fully 3D, rotating holographic globe built with **React Three Fiber** and **Three.js**.
- **Cinematic UI**: Glassmorphism design, neon accents, and smooth Framer Motion animations.
- **Simulation Mode**: Automatically switches to a "Simulation Mode" with realistic mock data when live markets are quiet, ensuring the dashboard is never empty.

### 💼 Portfolio Management
- **Virtual Trading Terminal**: Execute simulated trades to test strategies without risk.
- **PnL Tracking**: Track your portfolio's performance with real-time profit/loss updates.
- **Visual Analytics**: Interactive Area and Bar charts for spread and profit analysis.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Design System
- **3D/Graphics**: React Three Fiber, Drei, Three.js
- **Animations**: Framer Motion
- **State Management**: React Context API

### Backend
- **API**: FastAPI (Python)
- **ML Engine**: Scikit-Learn, Pandas, NumPy
- **Data Fetching**: CCXT (CryptoExchange Trading Library)
- **Database**: SQLAlchemy (SQLite for Dev, PostgreSQL ready)
- **Real-Time**: WebSockets

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.9+

### 1. Clone the Repository
```bash
git clone https://github.com/b-akash-krishna/crypto-arbitrage-tracker.git
cd crypto-arbitrage-tracker
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the application.

---

## 📄 Documentation
- [Deployment Guide](./deployment.md)
- [API-Endpoints](./API-DOCUMENTATION.md)

## 👨‍💻 Author
**B Akash Krishna**
- Mail: [b.akashkrishna27@gmail.com](mailto:b.akashkrishna27@gmail.com)
- LinkedIn: [https://www.linkedin.com/in/b-akash-krishna/](https://www.linkedin.com/in/b-akash-krishna/)
- GitHub: [https://github.com/b-akash-krishna](https://github.com/b-akash-krishna)

---

*Built for the PrimeTrade Internship Program*

