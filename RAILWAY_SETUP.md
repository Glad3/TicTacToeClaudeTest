# Railway.app Deployment Guide

## Quick Setup (3 Steps)

### Step 1: Create Railway Project

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **Glad3/TicTacToeClaudeTest**

### Step 2: Configure Service

Railway should auto-detect it's a PHP project, but if the build fails, configure manually:

**In Railway Dashboard:**

1. Click on your service
2. Go to **Settings** tab
3. Set these:

**Environment Variables:**
```
PORT=8000
```

**Build & Deploy:**
- Build Command: `cd backend && composer install --no-dev --optimize-autoloader`
- Start Command: `cd backend && php -S 0.0.0.0:$PORT -t public`

**Optional Settings:**
- Health Check Path: `/api/health`
- Restart Policy: `on-failure`

### Step 3: Deploy

1. Click **"Deploy"** button
2. Wait 1-2 minutes for build
3. Railway will give you a URL like: `https://tictactoe-production-xxxx.up.railway.app`

## Common Build Errors & Fixes

### Error: "No composer.json found"

**Cause:** Railway is looking in the wrong directory

**Fix:** The configuration files (railway.json, nixpacks.toml) are now in your repo root and will tell Railway to look in the `backend` directory.

### Error: "PHP version not found"

**Cause:** Railway can't detect PHP

**Fix:** The `nixpacks.toml` specifies PHP 8.3. If this fails, try adding a `.php-version` file:

```bash
# Create this file in project root
echo "8.3" > .php-version
```

### Error: "Composer install failed"

**Cause:** Missing dependencies or network issues

**Fix 1:** Check that `backend/composer.lock` exists in your repo
**Fix 2:** Try the Railway CLI and check logs:

```bash
npm install -g @railway/cli
railway login
railway link
railway logs
```

### Error: "Port binding failed"

**Cause:** PHP server not binding to Railway's PORT

**Fix:** The start command uses `$PORT` variable which Railway provides. Make sure it's: `php -S 0.0.0.0:$PORT -t public`

### Error: "Health check failed"

**Cause:** API not responding at health check endpoint

**Fix:** Disable health check temporarily:
1. Go to Settings
2. Remove Health Check Path
3. Redeploy

## Verify Deployment

Once deployed, test your API:

```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/api/health

# Should return:
{"status":"ok"}
```

Test room creation:
```bash
curl -X POST https://your-app.up.railway.app/api/rooms

# Should return something like:
{"success":true,"roomId":"room-abc123",...}
```

## Connect Frontend to Railway Backend

Once your backend is deployed, update your frontend to use it:

### Option 1: Environment Variable (Recommended for production)

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-app.up.railway.app
```

Update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

### Option 2: Direct URL (Quick test)

Update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = 'https://your-app.up.railway.app/api';
```

Then rebuild and redeploy your frontend:

```bash
cd frontend
npm run build
# Deploy to GitHub Pages
```

## Troubleshooting

### Check Build Logs

**In Railway Dashboard:**
1. Click on your service
2. Go to **"Deployments"** tab
3. Click on the latest deployment
4. View **"Build Logs"** and **"Deploy Logs"**

### Check Runtime Logs

```bash
railway logs --follow
```

Or in Railway Dashboard: **Deployments** → **Latest** → **View Logs**

### Common Issues

**Issue:** "Application failed to respond"

**Solution:**
1. Check that PHP is binding to `0.0.0.0` not `localhost`
2. Check that PORT environment variable is used
3. Verify backend/public/index.php exists

**Issue:** "Composer dependencies not found"

**Solution:**
1. Run `cd backend && composer install` locally
2. Commit `composer.lock` to git
3. Push and redeploy

**Issue:** "CORS errors in browser"

**Solution:** The backend already has CORS enabled in Router.php (lines 29-31):
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

If you still get CORS errors, it might be Railway's proxy. Check Railway settings for CORS configuration.

## Alternative: Railway CLI Deployment

If the GitHub integration isn't working, try the CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project (in your repo root)
railway init

# Link to existing project or create new
railway link

# Deploy
railway up

# View logs
railway logs
```

## Cost & Limits

**Free Tier:**
- $5 of credit per month
- ~500 hours of runtime
- Good for testing and small projects

**Pro Tier ($5/month):**
- $5 credit + $5/month
- More resources
- Custom domains

## What Gets Deployed

Railway will deploy:
- ✅ PHP backend (API endpoints)
- ✅ Room persistence (file-based storage)
- ✅ All multiplayer features
- ✅ CORS headers for frontend access

Railway does NOT deploy:
- ❌ Frontend (still hosted on GitHub Pages)
- ❌ Database (currently using file storage)

## Next Steps After Successful Deployment

1. **Test all API endpoints** using the Railway URL
2. **Update frontend** to point to Railway backend
3. **Test multiplayer** by opening two browser windows
4. **Monitor usage** in Railway dashboard
5. **Set up custom domain** (optional, Pro tier)

## Need Help?

**Check these in order:**

1. ✅ Configuration files exist (railway.json, nixpacks.toml, Procfile)
2. ✅ Composer.lock is committed to git
3. ✅ Build logs show composer install succeeded
4. ✅ Deploy logs show PHP server starting
5. ✅ Health check endpoint responds (`/api/health`)
6. ✅ Test endpoints work (create room, join room)

**Still having issues?**

Share the error message from:
- Railway build logs
- Railway deploy logs
- Browser console (if frontend errors)

And I'll help you fix it!
