# Netlify Blank Screen Fix

## Issue Description
Deployment succeeds but the site shows a blank white screen with no content.

## Root Causes and Fixes

### 1. Environment Variables Not Set

**Problem**: Supabase credentials missing during build

**Fix**:
1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Add these variables:
   ```
   VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Important**: These must be set BEFORE deployment
4. Redeploy after adding variables

### 2. Build Command Issue

**Problem**: Dependencies not installing correctly due to React 19 peer dependency conflicts

**Fix Applied**:
Updated `netlify.toml`:
```toml
[build]
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"
```

### 3. Routing Issues (SPA)

**Problem**: Direct URLs (e.g., /services) return 404 when page is refreshed

**Fix**: Already configured in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Missing Index.html

**Problem**: Build succeeds but dist folder is empty or missing files

**Check**:
1. In Netlify deploy log, look for:
   ```
   ✓ built in Xs
   ```
2. Verify dist folder is created
3. Check build output shows files being copied

**Fix**:
- Ensure `package.json` has correct build script
- Our build script: `"build": "vite build"`

## Step-by-Step Debugging

### Step 1: Check Deploy Log

1. Go to Netlify Dashboard
2. Click on your site
3. Go to "Deploys" tab
4. Click on the latest deploy
5. Click "Deploy log"

**Look for**:
- ✅ `npm install` success
- ✅ `npm run build` success
- ✅ "Site is live" message
- ❌ Any error messages

### Step 2: Check Environment Variables

1. Go to Site settings → Environment variables
2. Verify these exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. If missing, add them and redeploy

### Step 3: Check Browser Console

1. Open your Netlify site
2. Press F12 (Developer Tools)
3. Go to Console tab

**Common errors**:
- `Failed to fetch` → Environment variables not set
- `404 Not Found` → Routing issue (check netlify.toml)
- `Unexpected token '<'` → Wrong MIME type (check assets)

### Step 4: Test Local Build

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build
npm run build

# Test locally
npm run preview
```

Visit http://localhost:4173 - if it works locally but not on Netlify, it's an environment variable issue.

## Quick Fix Checklist

Run through these steps:

- [ ] Environment variables added in Netlify UI
- [ ] Build command includes `--legacy-peer-deps`
- [ ] Redeploy triggered after env var changes
- [ ] Check deploy log for errors
- [ ] Check browser console for JavaScript errors
- [ ] Verify dist folder is published (not root)
- [ ] Check redirects configuration

## Manual Deployment Test

If automatic deployment keeps failing:

1. **Build locally**:
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

2. **Manual deploy**:
   ```bash
   npx netlify-cli deploy --prod --dir=dist
   ```

3. If this works, the issue is with automatic build environment.

## Environment Variable Configuration

### In Netlify UI:

**Site settings → Environment variables → Add a variable**

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://0ec90b57d6e95fcbda19832f.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NODE_VERSION` | `20` |
| `NPM_FLAGS` | `--legacy-peer-deps` |

**Important**: Click "Save" then go to Deploys → "Trigger deploy" → "Deploy site"

## Verification After Fix

### 1. Site Loads
Visit: https://permiscode.netlify.app
- [ ] Homepage loads
- [ ] Content visible (not blank)
- [ ] Images load
- [ ] Navigation works

### 2. All Pages Work
Test these URLs:
- [ ] https://permiscode.netlify.app/services
- [ ] https://permiscode.netlify.app/pricing
- [ ] https://permiscode.netlify.app/contact
- [ ] https://permiscode.netlify.app/testimonials

### 3. No Console Errors
- [ ] Open DevTools (F12)
- [ ] Check Console tab
- [ ] Should have no red errors
- [ ] API calls to Supabase work

### 4. Assets Load
- [ ] Check Network tab in DevTools
- [ ] All CSS files load (200 status)
- [ ] All JS files load (200 status)
- [ ] All images load (200 status)

## Still Not Working?

### Check These:

1. **Clear Netlify Cache**:
   - Deploys → Trigger deploy → "Clear cache and deploy site"

2. **Check Node Version**:
   - In netlify.toml: `NODE_VERSION = "20"`
   - Match your local version

3. **Verify Build Output**:
   - In deploy log, look for file sizes
   - Should see: `dist/index.html`, `dist/assets/...`

4. **Test Different Branch**:
   - Create a new branch
   - Push changes
   - Deploy from that branch

### Contact Support:

If still not working after all fixes:

1. **Netlify Support**:
   - Go to https://app.netlify.com → Support
   - Include:
     - Deploy log URL
     - Browser console screenshot
     - List of env vars (without values)

2. **Application Support**:
   - Email: permiscode2025@gmail.com
   - Include: Netlify site URL, error description

## Prevention

### Before Next Deployment:

1. **Test build locally first**:
   ```bash
   npm run build
   npm run preview
   ```

2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix: deployment configuration"
   git push
   ```

3. **Monitor deploy**:
   - Watch deploy log in real-time
   - Check for errors immediately

4. **Keep env vars synced**:
   - Document all required env vars
   - Update Netlify UI when they change

---

## Summary of Fixes Applied

| Issue | Fix | Status |
|-------|-----|--------|
| Missing env vars | Added in Netlify UI | ✅ Configured |
| Peer dependency errors | `--legacy-peer-deps` flag | ✅ Fixed |
| Routing issues | Proper redirects in netlify.toml | ✅ Fixed |
| Build command | Updated to install then build | ✅ Fixed |

**Expected Result**: Site loads with full content, no blank screen

---

**Last Updated**: October 5, 2025
**Version**: 1.0.0
