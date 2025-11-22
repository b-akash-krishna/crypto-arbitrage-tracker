# API Documentation - PrimeTrade AI Crypto Arbitrage Tracker

## Base URL
```bash
Development: http://localhost:8000
Production: https://your-backend-url.com
```

---

## 🔐 Authentication Endpoints

### 1. User Signup
**POST** `/api/signup`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe"
}
```

---

### 2. User Login
**POST** `/api/token`

Authenticates user and returns JWT token.

**Request Body (Form Data):**
```
username: user@example.com
password: securePassword123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### 3. Get Current User
**GET** `/api/me`

Retrieves authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe"
}
```

---

## 📊 Market Data Endpoints

### 4. Real-Time Market Data (WebSocket)
**WS** `/ws/market-data`

Streams real-time arbitrage opportunities.

**Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/market-data');
```

**Message Format (JSON):**
```json
{
  "type": "update",
  "data": [
    {
      "pair": "BTC/USDT",
      "buy_exchange": "Binance",
      "sell_exchange": "Kraken",
      "buy_price": 50000.00,
      "sell_price": 50500.00,
      "spread_percentage": 1.0,
      "potential_profit": 500.00,
      "confidence_score": 85.5,
      "timestamp": "2025-11-22T10:30:00"
    }
  ]
}
```

### 5. Get Market Data (HTTP Fallback)
**GET** `/api/market-data`

Returns a message directing to the WebSocket endpoint.

**Response (200):**
```json
{
  "status": "Use WebSocket /ws/market-data for live updates"
}
```

---

## 🔔 Alert Management Endpoints

### 6. Create Alert
**POST** `/api/alerts`

Creates a new price alert.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "crypto_pair": "BTC/USDT",
  "min_spread": 0.5
}
```

**Response (200):**
```json
{
  "id": 1,
  "crypto_pair": "BTC/USDT",
  "min_spread": 0.5,
  "is_active": true
}
```

---

### 7. Get User Alerts
**GET** `/api/alerts`

Returns all alerts for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "crypto_pair": "BTC/USDT",
    "min_spread": 0.5,
    "is_active": true
  }
]
```

---

### 8. Update Alert
**PUT** `/api/alerts/{alert_id}`

Updates an existing alert.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "crypto_pair": "ETH/USDT",
  "min_spread": 0.8
}
```

---

### 9. Delete Alert
**DELETE** `/api/alerts/{alert_id}`

Deletes an alert.

**Headers:**
```
Authorization: Bearer <access_token>
```

---

## 💼 Virtual Trading Endpoints

### 10. Create Virtual Trade
**POST** `/api/trades`

Records a new virtual trade entry.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "crypto_pair": "BTC/USDT",
  "entry_price": 50000.00,
  "quantity": 0.1
}
```

**Response (200):**
```json
{
  "id": 1,
  "crypto_pair": "BTC/USDT",
  "entry_price": 50000.00,
  "exit_price": null,
  "quantity": 0.1,
  "profit_loss": null,
  "status": "OPEN"
}
```

---

### 11. Get User Trades
**GET** `/api/trades`

Returns trade history for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "crypto_pair": "BTC/USDT",
    "entry_price": 50000.00,
    "exit_price": 51000.00,
    "quantity": 0.1,
    "profit_loss": 100.00,
    "status": "CLOSED"
  }
]
```