# GitHub Pages Deployment Troubleshooting

## Current Issue: TypeScript Build Errors

### Error Message
```
'BrowserRouter' is declared but its value is never read.
Process completed with exit code 2.
```

### Status: ✅ FIXED

The unused import has been removed in commit `99eb4e0`. The next deployment should succeed.

---

## How to Check Deployment Status

1. **Go to Actions Tab**: https://github.com/Glad3/TicTacToeClaudeTest/actions
2. **Look for**: "Deploy to GitHub Pages" workflow
3. **Check Status**:
   - 🟡 Yellow = Running
   - ✅ Green = Success
   - ❌ Red = Failed

4. **Click on the workflow** to see detailed logs

---

## If Build Still Fails

### Solution 1: Clear GitHub Actions Cache

**Manually trigger workflow:**

1. Go to: https://github.com/Glad3/TicTacToeClaudeTest/actions/workflows/deploy.yml
2. Click **"Run workflow"** dropdown
3. Select **"main"** branch
4. Click **"Run workflow"**

This starts a fresh build without cache.

### Solution 2: Temporarily Disable Strict TypeScript

If the build keeps failing, temporarily relax TypeScript checking:

**Edit `frontend/tsconfig.json`:**

```json
{
  "compilerOptions": {
    // ... other options ...
    "strict": true,
    "noUnusedLocals": false,        // Changed from true
    "noUnusedParameters": false,    // Changed from true
    "noFallthroughCasesInSwitch": true
  }
}
```

**Commit and push:**
```bash
git add frontend/tsconfig.json
git commit -m "fix: relax TypeScript unused locals check for build"
git push origin main
```

### Solution 3: Build Locally and Check

Test the build locally to ensure it works:

```bash
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

If this succeeds locally but fails in GitHub Actions:
- It's likely a caching issue
- Solution 1 above should fix it

---

## Alternative: Deploy dist/ Folder Manually

If GitHub Actions continues to fail, you can deploy manually:

### Step 1: Build Locally

```bash
cd frontend
npm run build
```

This creates `frontend/dist/` folder.

### Step 2: Deploy Using gh-pages Package

```bash
cd frontend
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

### Step 3: Configure GitHub Pages

1. Go to: https://github.com/Glad3/TicTacToeClaudeTest/settings/pages
2. Under "Source", select **"Deploy from a branch"**
3. Select **"gh-pages"** branch
4. Click **"Save"**

---

## Verify Deployment

Once deployed successfully, verify:

### 1. Check GitHub Pages URL

Visit: https://glad3.github.io/TicTacToeClaudeTest/

You should see your Tic Tac Toe game.

### 2. Check Browser Console

Press F12, go to Console tab. You should see NO errors.

### 3. Test Backend Connection

In console, run:
```javascript
fetch('https://amusing-learning-root.up.railway.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should output: `{status: 'ok'}`

### 4. Test Multiplayer

1. Click "Create Online Game"
2. Open link in incognito window
3. Both should connect and see the game

---

## Common Errors After Deployment

### Error: "404 - Page Not Found"

**Cause:** Base path mismatch

**Fix:** Check `frontend/vite.config.ts`:
```typescript
base: '/TicTacToeClaudeTest/', // Must match repo name exactly
```

### Error: "Failed to fetch" or CORS

**Cause:** Backend not responding or CORS issue

**Fix:**
1. Test backend: https://amusing-learning-root.up.railway.app/api/health
2. Check Railway dashboard for errors
3. Verify CORS headers in backend (already enabled)

### Error: Blank white page

**Cause:** JavaScript errors or base path issue

**Fix:**
1. Open browser console (F12)
2. Check for error messages
3. Verify all assets loaded (Network tab)
4. Check base path in vite.config.ts

---

## Next Deployment

The fix has been committed. Next deployment should work automatically when you:

```bash
git push origin main
```

**Monitor here**: https://github.com/Glad3/TicTacToeClaudeTest/actions

---

## Contact & Support

If issues persist:

1. **Check commit**: Verify `99eb4e0` includes the fix
2. **Check file**: `frontend/src/components/JoinGame.test.tsx` line 4 should only import `MemoryRouter`
3. **Clear cache**: Use Solution 1 above
4. **Build locally**: Verify with `npm run build`

**Latest commit with fix**: `99eb4e0 - fix: remove unused BrowserRouter import in JoinGame test`

The deployment should succeed now! ✅
