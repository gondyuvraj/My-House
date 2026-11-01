@echo off
title My House - Launcher
echo ============================================================
echo Starting 'My House' Platform (Backend + Frontend)
echo ============================================================

start "My House - Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

start "My House - Frontend (React + Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [OK] Both servers have been launched in separate windows!
echo - Frontend UI:  http://127.0.0.1:5173
echo - Backend API:  http://127.0.0.1:8000/docs
echo.

