import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timedelta

class ArbitragePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.model_path = "arbitrage_model.joblib"
        self.scaler_path = "scaler.joblib"

    def fetch_historical_data(self):
        """Fetch historical data for major cryptos to simulate arbitrage conditions"""
        tickers = ["BTC-USD", "ETH-USD", "BNB-USD"]
        data = yf.download(tickers, period="1mo", interval="1h", progress=False)
        
        # Flatten MultiIndex columns if necessary
        if isinstance(data.columns, pd.MultiIndex):
            data = data.stack(level=1).reset_index()
            data.rename(columns={"level_1": "Ticker"}, inplace=True)
        
        return data

    def prepare_features(self, data):
        """Generate features: Volatility, Spread (Simulated), Liquidity (Volume)"""
        df = data.copy()
        
        # Calculate Volatility (Standard Deviation of returns)
        df['Returns'] = df.groupby('Ticker')['Close'].pct_change()
        df['Volatility'] = df.groupby('Ticker')['Returns'].transform(lambda x: x.rolling(window=24).std())
        
        # Simulate "Spread" based on high-low difference (proxy for market inefficiency)
        df['Spread_Proxy'] = (df['High'] - df['Low']) / df['Low'] * 100
        
        # Liquidity proxy (Log Volume)
        df['Liquidity'] = np.log(df['Volume'] + 1)
        
        # Target: 1 if Spread > 0.5% AND positive return (Profitable), else 0
        df['Target'] = ((df['Spread_Proxy'] > 0.5) & (df['Returns'] > 0)).astype(int)
        
        # Drop NaN
        df.dropna(inplace=True)
        
        return df[['Spread_Proxy', 'Volatility', 'Liquidity', 'Target']]

    def train_model(self):
        """Train the Random Forest model"""
        print("Fetching historical data from yfinance...")
        raw_data = self.fetch_historical_data()
        
        print("Preparing features...")
        processed_data = self.prepare_features(raw_data)
        
        X = processed_data[['Spread_Proxy', 'Volatility', 'Liquidity']]
        y = processed_data['Target']
        
        if len(X) < 100:
            print("Not enough data to train. Using fallback logic.")
            return

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        accuracy = self.model.score(self.scaler.transform(X_test), y_test)
        print(f"Model trained with accuracy: {accuracy:.2f}")
        
        self.is_trained = True
        
        # Save model
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

    def load_model(self):
        """Load trained model if exists"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.is_trained = True
            print("Loaded existing ML model.")
        else:
            print("No existing model found. Training new one...")
            self.train_model()

    def predict(self, spread, volatility, liquidity):
        """Predict probability of arbitrage success"""
        if not self.is_trained:
            # Fallback rule-based logic if model fails
            score = 50 + (spread * 10) - (volatility * 100)
            return min(max(score, 0), 99)
        
        features = np.array([[spread, volatility, liquidity]])
        features_scaled = self.scaler.transform(features)
        
        # Get probability of class 1 (Success)
        probability = self.model.predict_proba(features_scaled)[0][1]
        return round(probability * 100, 2)

# Singleton instance
predictor = ArbitragePredictor()
