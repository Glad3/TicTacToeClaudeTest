# Deployment Guide

## Quick Setup for GitHub Pages (Frontend Only)

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/Glad3/TicTacToeClaudeTest
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under "Source", select **GitHub Actions**

### Step 2: The deployment is automatic!

Since you just pushed the code with the GitHub Actions workflow, it's already deploying.

**Check deployment progress:**
- Go to the **Actions** tab: https://github.com/Glad3/TicTacToeClaudeTest/actions
- You should see a "Deploy to GitHub Pages" workflow running
- Wait 1-2 minutes for it to complete

### Step 3: Access Your Game

Once deployed, your game will be available at:

**https://Glad3.github.io/TicTacToeClaudeTest/**

## What Works on GitHub Pages

✅ **Local Game Mode** - Single player (play against yourself)
✅ **All UI features** - Board, game status, reset
✅ **Responsive design** - Works on mobile and desktop

❌ **Multiplayer features** - Create/Join game (requires backend server)
❌ **Real-time sync** - Player connections (requires backend server)

## Why Multiplayer Doesn't Work

GitHub Pages only serves **static files** (HTML, CSS, JavaScript). Your Tic Tac Toe game has:
- **Frontend (React)** - ✅ Works on GitHub Pages
- **Backend (PHP API)** - ❌ Needs a PHP server

## Option 2: Full Deployment (With Multiplayer)

If you want multiplayer to work, you need to deploy the backend somewhere. Here are free/cheap options:

### Railway.app (Recommended - Free Tier)

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect the PHP backend
5. Set environment: `ROOT` = `/backend/public`
6. Deploy!
7. Railway gives you a URL like: `https://tictactoe-production-xxx.up.railway.app`

Then update your frontend to use this backend:

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = 'https://your-railway-url.railway.app/api';
```

### Render.com (Free Tier)

1. Create account at https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Environment**: PHP
   - **Build Command**: `cd backend && composer install`
   - **Start Command**: `php -S 0.0.0.0:$PORT -t backend/public`
5. Deploy!

### Heroku (Free Tier)

```bash
# Install Heroku CLI first
cd TicTacToeClaudeTest
heroku create your-tictactoe-app
git push heroku main
```

Add a `Procfile` in project root:
```
web: cd backend && php -S 0.0.0.0:$PORT -t public
```

## Option 3: Simple Full Deployment

Deploy everything together using **Vercel** or **Netlify**:

Both support deploying from GitHub automatically but you'd need to:
1. Convert backend to serverless functions (Node.js/Python)
2. Or use a different backend approach

## Recommended Approach

**For learning/portfolio:**
- Deploy frontend to GitHub Pages (it's free and automatic)
- Deploy backend to Railway.app (free tier)
- Link them together

**For production:**
- Use a full hosting service like DigitalOcean, AWS, or a VPS
- This gives you full control and better performance

## Testing Local Deployment Build

Before deploying, test the production build locally:

```bash
cd frontend
npm run build
npm run preview
```

This runs the production build locally so you can verify everything works.

## Troubleshooting

### Issue: "404 Not Found" on GitHub Pages

**Solution:** Make sure you selected "GitHub Actions" as the source in Settings → Pages, not "Deploy from a branch"

### Issue: CSS/JS not loading

**Solution:** Check that `base: '/TicTacToeClaudeTest/'` in `vite.config.ts` matches your repository name exactly

### Issue: Multiplayer doesn't work

**Expected:** GitHub Pages only serves static files. Deploy the backend separately (see Option 2)

### Issue: Build failing in Actions

**Solution:** Check the Actions tab for error messages. Usually it's missing dependencies or build errors.

## Need Help?

- Check the Actions tab for deployment logs
- Read the error messages in the workflow
- Make sure all tests pass locally before deploying

## Current Status

Your project is now set up to automatically deploy to GitHub Pages on every push to `main`!

Just go to https://Glad3.github.io/TicTacToeClaudeTest/ in a few minutes to see your game live.
