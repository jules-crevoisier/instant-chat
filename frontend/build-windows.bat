@echo off
echo ========================================
echo Build Instant Chat pour Windows
echo ========================================
echo.

echo [1/3] Installation des dependances...
call npm install
if errorlevel 1 (
    echo Erreur lors de l'installation des dependances
    pause
    exit /b 1
)

echo.
echo [2/3] Build de Next.js...
call npm run build:electron
if errorlevel 1 (
    echo Erreur lors du build Next.js
    pause
    exit /b 1
)

echo.
echo [3/3] Build Electron pour Windows...
call npm run build:win
if errorlevel 1 (
    echo Erreur lors du build Electron
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build termine avec succes!
echo Les fichiers sont dans le dossier dist/
echo ========================================
pause


