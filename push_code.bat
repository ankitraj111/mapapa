@echo off
echo ========================================================
echo   Mounting Z: drive and Pushing Code to GitHub...
echo ========================================================

subst Z: /d >nul 2>&1
subst Z: "C:\Users\ankit\CrossDevice\realme 15 Pro 5G\storage\New folder (2)"

cd /d "%~dp0"

echo [1/3] Adding files to git...
git add .

echo [2/3] Committing changes...
git commit -m "Update live command center 3D globe and telemetry"

echo [3/3] Pushing to https://github.com/ankitraj111/mapapa ...
git branch -M main
git push -u origin main

echo ========================================================
echo   DONE! Code successfully pushed to GitHub.
echo ========================================================
pause
