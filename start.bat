@echo off
title VartaPrime News Server & Approval System
echo ========================================================
echo   VartaPrime News - Hindi News Portal & Auto Ingestor
echo ========================================================
echo.
echo Checking dependencies...
if not exist node_modules (
    echo Installing dependencies, please wait...
    call npm install
)

echo.
echo Starting VartaPrime News Server...
echo Portal: http://localhost:3000
echo Admin:  http://localhost:3000/admin.html
echo.
start http://localhost:3000
start http://localhost:3000/admin.html
node server.js
pause
