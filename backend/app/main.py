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
