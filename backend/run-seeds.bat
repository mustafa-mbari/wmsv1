@echo off
echo 🌱 WMS Database Seeding Script
echo.
echo Checking if database is accessible...
cd /d "%~dp0"

echo.
echo Generating Prisma client...
call npx prisma generate

echo.
echo Running database seeds...
call npx tsx prisma\seeds\seed.ts

echo.
echo ✅ Seeding completed!
echo.
pause
