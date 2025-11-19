from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
from pydantic import BaseModel, EmailStr
from . import models, auth, database

router = APIRouter()

# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AlertCreate(BaseModel):
    crypto_pair: str
    min_spread: float

class AlertResponse(BaseModel):
    id: int
    crypto_pair: str
    min_spread: float
    is_active: bool
    
    class Config:
        from_attributes = True

class TradeCreate(BaseModel):
    crypto_pair: str
    entry_price: float
    quantity: float

class TradeResponse(BaseModel):
    id: int
    crypto_pair: str
    entry_price: float
    exit_price: float | None
    quantity: float
    profit_loss: float | None
    status: str
    
    class Config:
        from_attributes = True

# Authentication endpoints
@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(database.get_db)):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create new user
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# Alert CRUD endpoints
@router.post("/alerts", response_model=AlertResponse)
def create_alert(alert: AlertCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_alert = models.Alert(
        user_id=current_user.id,
        crypto_pair=alert.crypto_pair,
        min_spread=alert.min_spread
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.get("/alerts", response_model=List[AlertResponse])
def get_alerts(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    alerts = db.query(models.Alert).filter(models.Alert.user_id == current_user.id).all()
    return alerts

@router.put("/alerts/{alert_id}", response_model=AlertResponse)
def update_alert(alert_id: int, alert: AlertCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id, models.Alert.user_id == current_user.id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db_alert.crypto_pair = alert.crypto_pair
    db_alert.min_spread = alert.min_spread
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id, models.Alert.user_id == current_user.id).first()
    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(db_alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

# Virtual Trade endpoints
@router.post("/trades", response_model=TradeResponse)
def create_trade(trade: TradeCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    new_trade = models.VirtualTrade(
        user_id=current_user.id,
        crypto_pair=trade.crypto_pair,
        entry_price=trade.entry_price,
        quantity=trade.quantity
    )
    db.add(new_trade)
    db.commit()
    db.refresh(new_trade)
    return new_trade

@router.get("/trades", response_model=List[TradeResponse])
def get_trades(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(database.get_db)):
    trades = db.query(models.VirtualTrade).filter(models.VirtualTrade.user_id == current_user.id).all()
    return trades
