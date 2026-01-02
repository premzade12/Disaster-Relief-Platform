@echo off
echo 🚀 Pushing Disaster Relief Platform to GitHub
echo.

echo Step 1: Initialize Git repository...
git init

echo Step 2: Add all files...
git add .

echo Step 3: Create initial commit...
git commit -m "Initial commit: Disaster Relief Platform with AI, Maps, and NGO Coordination"

echo Step 4: Add remote repository...
echo Please create a new repository on GitHub first, then run:
echo git remote add origin https://github.com/premzade12/Disaster-Relief-Platform.git
echo.

echo Step 5: Push to GitHub...
echo git branch -M main
echo git push -u origin main
echo.

echo 📋 Manual Steps Required:
echo 1. Go to https://github.com/new
echo 2. Create a new repository named "Disaster-Relief-Platform"
echo 3. Copy the repository URL
echo 4. Run: git remote add origin [YOUR_REPO_URL]
echo 5. Run: git branch -M main
echo 6. Run: git push -u origin main
echo.

pause