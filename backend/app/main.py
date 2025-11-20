from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import router
from .ml_engine import predictor
import requests
from typing import Dict, List
from datetime import datetime
import random
import asyncio
import json
import numpy as np

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto Arbitrage Tracker API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML Model on Startup
@app.on_event("startup")
async def startup_event():
    # Run training in background to not block startup
    import threading
    threading.Thread(target=predictor.load_model).start()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

async def get_real_market_data():
    """Fetch real crypto prices and run ML predictions"""
    try:
        # Fetch real prices from CoinGecko
        response = requests.get(
            "https://api.coingecko.com/api/v3/simple/price",
            params={
                "ids": "bitcoin,ethereum,binancecoin",
                "vs_currencies": "usd",
                "include_24hr_change": "true"
            },
            timeout=5
        )
        data = response.json()
        
        exchanges = ["Binance", "Coinbase", "Kraken", "Bitfinex"]
        opportunities = []
        
        for crypto_id, crypto_name in [("bitcoin", "BTC"), ("ethereum", "ETH"), ("binancecoin", "BNB")]:
            base_price = data[crypto_id]["usd"]
            change_24h = data[crypto_id].get("usd_24h_change", 0)
            
            # Simulate exchange prices
            exchange_prices = []
            for exchange in exchanges:
                variation = random.uniform(-0.005, 0.005)
                price = base_price * (1 + variation)
                exchange_prices.append({"exchange": exchange, "price": price})
            
            # Find Arbitrage
            min_ex = min(exchange_prices, key=lambda x: x["price"])
            max_ex = max(exchange_prices, key=lambda x: x["price"])
            spread = ((max_ex["price"] - min_ex["price"]) / min_ex["price"]) * 100
            
            if spread > 0.1:
                # AI Prediction
                # Volatility proxy: abs(24h change) / 100
                volatility = abs(change_24h) / 100
                # Liquidity proxy: random log volume for demo
                liquidity = np.log(random.randint(1000, 1000000))
                
                ai_score = predictor.predict(spread, volatility, liquidity)
                
                opportunities.append({
                    "pair": f"{crypto_name}/USDT",
                    "buy_exchange": min_ex["exchange"],
                    "sell_exchange": max_ex["exchange"],
                    "buy_price": round(min_ex["price"], 2),
                    "sell_price": round(max_ex["price"], 2),
                    "spread_percentage": round(spread, 3),
                    "potential_profit": round(spread * 1000, 2), # Profit on $1000 trade
                    "confidence_score": ai_score,
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        return opportunities
    except Exception as e:
        print(f"Error in data fetch: {e}")
        return []

@app.websocket("/ws/market-data")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            opportunities = await get_real_market_data()
            if opportunities:
                await websocket.send_json({"type": "update", "data": opportunities})
            
            # Update every 3 seconds
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

# REST Endpoints (Keep for compatibility)
@app.get("/api/market-data")
def get_market_data_http():
    return {"status": "Use WebSocket /ws/market-data for live updates"}

app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Crypto Arbitrage AI API", "status": "running", "ai_model": "RandomForest"}
