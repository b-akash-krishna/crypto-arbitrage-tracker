from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import router
from .ml_engine import predictor
import ccxt.async_support as ccxt
from typing import Dict, List
from datetime import datetime
import asyncio
import json
import numpy as np

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto Arbitrage Tracker API")

# CORS middleware - configurable for production
import os
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "https://crypto-arbitrage-tracker-pi.vercel.app"],
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

# Initialize exchanges
exchanges = {
    'binance': ccxt.binance(),
    'kraken': ccxt.kraken(),
    'kucoin': ccxt.kucoin(),
    'bybit': ccxt.bybit(),
}

# Top 20 Crypto Pairs to Scan (Standardized to CCXT format)
TARGET_PAIRS = [
    'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT', 
    'DOGE/USDT', 'AVAX/USDT', 'DOT/USDT', 'MATIC/USDT', 'LTC/USDT',
    'SHIB/USDT', 'TRX/USDT', 'LINK/USDT', 'ATOM/USDT', 'UNI/USDT',
    'XLM/USDT', 'ETC/USDT', 'BCH/USDT', 'FIL/USDT', 'APT/USDT'
]

async def fetch_prices(name, exchange):
    try:
        # Fetch all tickers to be efficient
        # Note: Not all exchanges support fetching specific list of tickers, 
        # so we might fetch all and filter, or fetch one by one if needed.
        # Binance supports list.
        if exchange.has['fetchTickers']:
            tickers = await exchange.fetch_tickers(TARGET_PAIRS)
        else:
            tickers = await exchange.fetch_tickers()
        return {'exchange': name, 'tickers': tickers}
    except Exception as e:
        print(f"Error fetching from {name}: {e}")
        return {'exchange': name, 'tickers': {}}

async def get_real_market_data():
    """
    Fetches real-time prices from multiple exchanges using CCXT.
    Finds arbitrage opportunities by comparing prices.
    """
    opportunities = []
    
    # Fetch prices asynchronously
    tasks = []
    for name, exchange in exchanges.items():
        tasks.append(fetch_prices(name, exchange))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process results
    market_prices = {} # { 'BTC/USDT': { 'binance': 50000, 'kraken': 50100 } }
    
    for result in results:
        if isinstance(result, dict):
            exchange_name = result.get('exchange')
            tickers = result.get('tickers', {})
            
            for pair in TARGET_PAIRS:
                if pair in tickers:
                    if pair not in market_prices:
                        market_prices[pair] = {}
                    market_prices[pair][exchange_name] = tickers[pair]['last']

    # Find Arbitrage
    for pair, prices in market_prices.items():
        if len(prices) < 2:
            continue
            
        # Find min and max prices
        sorted_prices = sorted(prices.items(), key=lambda x: x[1])
        min_exchange, min_price = sorted_prices[0]
        max_exchange, max_price = sorted_prices[-1]
        
        spread = max_price - min_price
        spread_percentage = (spread / min_price) * 100
        
        # Filter for profitable spreads (e.g., > 0.1% to cover fees)
        # In real world, > 0.5% is rare and good.
        if spread_percentage > 0.05: 
            # Predict success with AI
            # Feature engineering for model: [volatility, spread, liquidity]
            # Simplified for now: using spread as proxy for volatility
            # We need 3 features as per ml_engine.py: [volatility, spread, liquidity]
            # Volatility: approximated by spread for now (or random small noise)
            # Liquidity: approximated by log price
            features = np.array([[spread_percentage, spread_percentage, np.log(min_price * 100)]])
            confidence = predictor.predict(features)
            
            opportunities.append({
                "pair": pair,
                "buy_exchange": min_exchange,
                "sell_exchange": max_exchange,
                "buy_price": min_price,
                "sell_price": max_price,
                "spread_percentage": spread_percentage,
                "potential_profit": spread * 100, # Assuming $100 trade
                "confidence_score": confidence,
                "timestamp": datetime.utcnow().isoformat()
            })
            
    return sorted(opportunities, key=lambda x: x['spread_percentage'], reverse=True)

@app.websocket("/ws/market-data")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            opportunities = await get_real_market_data()
            if opportunities:
                await websocket.send_json({"type": "update", "data": opportunities})
            else:
                # Send empty update to keep connection alive and show "No Opps" state
                await websocket.send_json({"type": "update", "data": []})
            
            # Update every 5 seconds to avoid rate limits
            await asyncio.sleep(5)
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
    return {"message": "Crypto Arbitrage AI API", "status": "running", "ai_model": "RandomForest", "mode": "Real-World Data"}
