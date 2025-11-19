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
```bash
{
"email": "user@example.com",
"username": "johndoe",
"password": "securePassword123"
}
```

**Response (200):**
```bash
{
"id": 1,
"email": "user@example.com",
"username": "johndoe",
"created_at": "2025-11-19T10:30:00"
}
```

**Validation Rules:**
- Email must be valid format
- Username: 3-50 characters
- Password: minimum 6 characters

---

### 2. User Login
**POST** `/api/token`

Authenticates user and returns JWT token.

**Request Body (Form Data):**
```bash
username: user@example.com
password: securePassword123
```

**Response (200):**
```bash
{
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"token_type": "bearer"
}
```

**Error (401):**
```bash
{
"detail": "Incorrect email or password"
}
```

---

### 3. Get Current User
**GET** `/api/me`

Retrieves authenticated user's profile.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Response (200):**
```bash
{
"id": 1,
"email": "user@example.com",
"username": "johndoe",
"created_at": "2025-11-19T10:30:00"
}
```

---

## 📊 Market Data Endpoints

### 4. Get Arbitrage Opportunities
**GET** `/api/arbitrage-opportunities`

Returns current arbitrage opportunities across exchanges.

**Headers:** None required (public endpoint)

**Response (200):**
```bash
{
"opportunities": [
{
"pair": "BTC/USDT",
"buy_exchange": "Binance",
"sell_exchange": "Coinbase",
"buy_price": 91128.85,
"sell_price": 91899.36,
"spread_percentage": 0.846,
"potential_profit": 0.85,
"confidence_score": 78.5,
"timestamp": "2025-11-19T17:15:30.123456"
}
]
}
```

---

### 5. Get Market Data
**GET** `/api/market-data`

Returns raw market prices from all exchanges.

**Response (200):**
```bash
{
"data": [
{
"exchange": "Binance",
"pair": "BTC/USDT",
"price": 91128.85,
"change_24h": 2.45,
"timestamp": "2025-11-19T17:15:30.123456"
}
]
}
```

---

## 🔔 Alert Management Endpoints

### 6. Create Alert
**POST** `/api/alerts`

Creates a new price alert.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Request Body:**
```bash
{
"crypto_pair": "BTC/USDT",
"min_spread": 0.5
}
```

**Response (200):**
```bash
{
"id": 1,
"user_id": 1,
"crypto_pair": "BTC/USDT",
"min_spread": 0.5,
"is_active": true,
"created_at": "2025-11-19T17:15:30"
}
```

---

### 7. Get User Alerts
**GET** `/api/alerts`

Returns all alerts for authenticated user.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Response (200):**
```bash
[
{
"id": 1,
"crypto_pair": "BTC/USDT",
"min_spread": 0.5,
"is_active": true,
"created_at": "2025-11-19T17:15:30"
}
]
```

---

### 8. Update Alert
**PUT** `/api/alerts/{alert_id}`

Updates an existing alert.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Request Body:**
```bash
{
"crypto_pair": "ETH/USDT",
"min_spread": 0.8,
"is_active": true
}
```

**Response (200):**
```bash
{
"id": 1,
"crypto_pair": "ETH/USDT",
"min_spread": 0.8,
"is_active": true,
"updated_at": "2025-11-19T18:00:00"
}
```

---

### 9. Delete Alert
**DELETE** `/api/alerts/{alert_id}`

Deletes an alert.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Response (200):**
```bash
{
"message": "Alert deleted successfully"
}
```

---

## 💼 Virtual Trading Endpoints

### 10. Create Virtual Trade
**POST** `/api/trades`

Records a virtual trade.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Request Body:**
```bash
{
"crypto_pair": "BTC/USDT",
"buy_exchange": "Binance",
"sell_exchange": "Coinbase",
"buy_price": 91128.85,
"sell_price": 91899.36,
"amount": 0.1,
"profit": 77.05
}
```

**Response (200):**
```bash
{
"id": 1,
"user_id": 1,
"crypto_pair": "BTC/USDT",
"profit": 77.05,
"created_at": "2025-11-19T17:15:30"
}
```

---

### 11. Get User Trades
**GET** `/api/trades`

Returns trade history for authenticated user.

**Headers:**
```bash
Authorization: Bearer <access_token>
```

**Response (200):**
```bash
[
{
"id": 1,
"crypto_pair": "BTC/USDT",
"buy_exchange": "Binance",
"sell_exchange": "Coinbase",
"profit": 77.05,
"created_at": "2025-11-19T17:15:30"
}
]
```

---

## 🧪 Postman Collection

### Import Instructions

1. Open Postman
2. Click **Import** button
3. Paste the JSON below
4. Collection will be imported with all endpoints

### Postman Collection JSON
```bash
{
"info": {
"name": "PrimeTrade AI - Crypto Arbitrage Tracker",
"description": "Complete API collection for PrimeTrade AI application",
"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
},
"auth": {
"type": "bearer",
"bearer": [
{
"key": "token",
"value": "{{jwt_token}}",
"type": "string"
}
]
},
"variable": [
{
"key": "base_url",
"value": "http://localhost:8000",
"type": "string"
},
{
"key": "jwt_token",
"value": "",
"type": "string"
}
],
"item": [
{
"name": "Authentication",
"item": [
{
"name": "Signup",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n "email": "test@example.com",\n "username": "testuser",\n "password": "password123"\n}"
},
"url": {
"raw": "{{base_url}}/api/signup",
"host": ["{{base_url}}"],
"path": ["api", "signup"]
}
}
},
{
"name": "Login",
"event": [
{
"listen": "test",
"script": {
"exec": [
"pm.test("Status code is 200", function () {",
" pm.response.to.have.status(200);",
"});",
"",
"var jsonData = pm.response.json();",
"pm.environment.set("jwt_token", jsonData.access_token);"
]
}
}
],
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/x-www-form-urlencoded"
}
],
"body": {
"mode": "urlencoded",
"urlencoded": [
{
"key": "username",
"value": "test@example.com"
},
{
"key": "password",
"value": "password123"
}
]
},
"url": {
"raw": "{{base_url}}/api/token",
"host": ["{{base_url}}"],
"path": ["api", "token"]
}
}
},
{
"name": "Get Current User",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{base_url}}/api/me",
"host": ["{{base_url}}"],
"path": ["api", "me"]
}
}
}
]
},
{
"name": "Market Data",
"item": [
{
"name": "Get Arbitrage Opportunities",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{base_url}}/api/arbitrage-opportunities",
"host": ["{{base_url}}"],
"path": ["api", "arbitrage-opportunities"]
}
}
},
{
"name": "Get Market Data",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{base_url}}/api/market-data",
"host": ["{{base_url}}"],
"path": ["api", "market-data"]
}
}
}
]
},
{
"name": "Alerts",
"item": [
{
"name": "Create Alert",
"request": {
"method": "POST",
"header": [
{
"key": "Content-Type",
"value": "application/json"
}
],
"body": {
"mode": "raw",
"raw": "{\n "crypto_pair": "BTC/USDT",\n "min_spread": 0.5\n}"
},
"url": {
"raw": "{{base_url}}/api/alerts",
"host": ["{{base_url}}"],
"path": ["api", "alerts"]
}
}
},
{
"name": "Get Alerts",
"request": {
"method": "GET",
"header": [],
"url": {
"raw": "{{base_url}}/api/alerts",
"host": ["{{base_url}}"],
"path": ["api", "alerts"]
}
}
},
{
"name": "Delete Alert",
"request": {
"method": "DELETE",
"header": [],
"url": {
"raw": "{{base_url}}/api/alerts/1",
"host": ["{{base_url}}"],
"path": ["api", "alerts", "1"]
}
}
}
]
}
]
}
```

---

## 📝 Testing Workflow

1. **Create User:** Use Signup endpoint
2. **Login:** Get JWT token (automatically saved in Postman)
3. **Test Protected Routes:** Token auto-included in headers
4. **Create Alerts:** Test CRUD operations
5. **Check Market Data:** View live opportunities

---

## ⚠️ Error Codes

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## 🔒 Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- CORS enabled for localhost:3000
- Protected routes require Bearer token

---

**Happy Testing! 🧪**