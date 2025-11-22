# Deployment Guide

This guide covers how to deploy the **PrimeTrade** application to production.

## Prerequisites
- GitHub Account
- [Vercel Account](https://vercel.com) (for Frontend)
- [Render Account](https://render.com) (for Backend)

---

## 1. Backend Deployment (Render)

We will deploy the FastAPI backend to Render as a Web Service.

1.  **Push Code to GitHub**: Ensure your latest code is pushed to your GitHub repository.
2.  **Create New Web Service**:
    - Go to [Render Dashboard](https://dashboard.render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.
3.  **Configure Settings**:
    - **Name**: `primetrade-backend`
    - **Region**: Choose one close to you (e.g., Singapore, Frankfurt).
    - **Branch**: `main`
    - **Root Directory**: `backend` (Important!)
    - **Runtime**: `Python 3`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
4.  **Environment Variables**:
    - Add the following variables in the "Environment" tab:
        - `PYTHON_VERSION`: `3.9.0` (or your local version)
        - `SECRET_KEY`: (Generate a random string)
        - `DATABASE_URL`: (Add your PostgreSQL connection string if using a real DB, or leave blank for SQLite in ephemeral storage)
5.  **Deploy**: Click **Create Web Service**. Render will build and deploy your API.
6.  **Copy URL**: Once live, copy your backend URL (e.g., `https://primetrade-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

We will deploy the Next.js frontend to Vercel.

1.  **Create New Project**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New...** -> **Project**.
    - Import your GitHub repository.
2.  **Configure Project**:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: Click "Edit" and select `frontend`.
3.  **Environment Variables**:
    - Add the following variable:
        - `NEXT_PUBLIC_API_URL`: Your Render Backend URL (e.g., `https://primetrade-backend.onrender.com`)
        - **Note**: Do NOT add `/api` at the end if your frontend code appends it automatically (check `frontend/app/context/AuthContext.tsx`). Our code appends `/api`, so just the base URL is fine.
4.  **Deploy**: Click **Deploy**. Vercel will build your site.

---

## 3. Final Configuration

1.  **Update Backend CORS**:
    - Once the Frontend is deployed, get its URL (e.g., `https://primetrade-frontend.vercel.app`).
    - Go back to Render -> Environment.
    - You might want to restrict `allow_origins` in `backend/app/main.py` to this specific URL for security, or keep it as `["*"]` for now.

2.  **Verify Connection**:
    - Open your Vercel URL.
    - Check the "Live Feed" indicator in the Dashboard.
    - If it's green, your Frontend is successfully talking to your Backend!

## Troubleshooting

-   **WebSocket Connection Failed**: Ensure your `NEXT_PUBLIC_API_URL` is correct. If using `https`, the WebSocket will automatically use `wss`.
-   **No Opportunities**: Remember, we are now using **Real Data**. If the market is calm, you might see "Scanning market data..." for a while. This is normal!
