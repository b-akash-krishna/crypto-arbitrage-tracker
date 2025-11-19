from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    alerts = relationship("Alert", back_populates="owner")
    trades = relationship("VirtualTrade", back_populates="owner")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crypto_pair = Column(String, nullable=False)  # e.g., "BTC/USDT"
    min_spread = Column(Float, nullable=False)  # Minimum spread percentage
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="alerts")

class VirtualTrade(Base):
    __tablename__ = "virtual_trades"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    crypto_pair = Column(String, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float)
    quantity = Column(Float, nullable=False)
    profit_loss = Column(Float)
    status = Column(String, default="open")  # open, closed
    created_at = Column(DateTime, default=datetime.utcnow)
    closed_at = Column(DateTime)
    
    owner = relationship("User", back_populates="trades")
