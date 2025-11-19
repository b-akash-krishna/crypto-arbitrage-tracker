from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import router
import requests
from typing import Dict, List
from datetime import datetime, timedelta
import random

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crypto Arbitrage Tracker API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Market data endpoints (using CoinGecko API)
@app.get("/api/market-data")
def get_market_data():
    """Fetch real crypto prices and simulate arbitrage opportunities"""
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
        
        # Simulate multiple exchanges with price variations
        exchanges = ["Binance", "Coinbase", "Kraken", "Bitfinex"]
        market_data = []
        
        for crypto_id, crypto_name in [("bitcoin", "BTC"), ("ethereum", "ETH"), ("binancecoin", "BNB")]:
            base_price = data[crypto_id]["usd"]
            change_24h = data[crypto_id].get("usd_24h_change", 0)
            
            for exchange in exchanges:
                # Add random variation (-0.5% to +0.5%) to simulate different exchange prices
                variation = random.uniform(-0.005, 0.005)
                price = base_price * (1 + variation)
                
                market_data.append({
                    "exchange": exchange,
                    "pair": f"{crypto_name}/USDT",
                    "price": round(price, 2),
                    "change_24h": round(change_24h, 2),
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        return {"data": market_data}
    except Exception as e:
        print(f"Error fetching market data: {e}")
        return {"error": str(e), "data": []}

@app.get("/api/arbitrage-opportunities")
def get_arbitrage_opportunities():
    """Calculate arbitrage opportunities from market data"""
    market_response = get_market_data()
    if "error" in market_response:
        return {"opportunities": []}
    
    market_data = market_response["data"]
    opportunities = []
    
    # Group by crypto pair
    pairs = {}
    for item in market_data:
        pair = item["pair"]
        if pair not in pairs:
            pairs[pair] = []
        pairs[pair].append(item)
    
    # Find arbitrage opportunities
    for pair, exchanges in pairs.items():
        if len(exchanges) < 2:
            continue
        
        # Find min and max prices
        min_exchange = min(exchanges, key=lambda x: x["price"])
        max_exchange = max(exchanges, key=lambda x: x["price"])
        
        spread = ((max_exchange["price"] - min_exchange["price"]) / min_exchange["price"]) * 100
        
        if spread > 0.1:  # Only show if spread > 0.1%
            opportunities.append({
                "pair": pair,
                "buy_exchange": min_exchange["exchange"],
                "sell_exchange": max_exchange["exchange"],
                "buy_price": min_exchange["price"],
                "sell_price": max_exchange["price"],
                "spread_percentage": round(spread, 3),
                "potential_profit": round(spread, 2),
                "confidence_score": min(95, round(70 + spread * 10, 1)),
                "timestamp": datetime.utcnow().isoformat()
            })
    
    # Sort by spread (highest first)
    opportunities.sort(key=lambda x: x["spread_percentage"], reverse=True)
    
    return {"opportunities": opportunities[:10]}

# Include routes (authentication and CRUD)
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Crypto Arbitrage Tracker API", "status": "running"}
