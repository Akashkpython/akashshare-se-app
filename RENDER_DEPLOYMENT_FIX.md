# 🚀 Render Deployment Fix Guide

## ❌ Current Issue
Render is failing to find `express-rate-limit` package with error:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '/opt/render/project/src/backend/node_modules/express-rate-limit/'
```

## ✅ Solution: Manual Render Service Update

Since Render is not automatically using the `render.yaml` file, you need to manually update your service settings:

### Step 1: Access Render Dashboard
1. Go to [render.com](https://render.com) and log in
2. Navigate to your backend service: `akashshare-backend` or `srv-d2th99vfte5s73a8fpi0`

### Step 2: Update Build & Start Commands
In your Render service settings, update these fields:

#### **Build Command:**
```bash
cd backend && npm install --production && npm list express-rate-limit
```

#### **Start Command:**
```bash
cd backend && npm start
```

### Step 3: Add Environment Variables
Add these environment variables in the Render dashboard:

```bash
NODE_ENV=production
HOST=0.0.0.0
PORT=5002
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare
JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
CORS_ORIGIN=https://akashshare-se.onrender.com
```

### Step 4: Save and Deploy
1. Click **"Save Changes"**
2. Go to **"Deploys"** tab
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 🔧 Alternative: Use Render Blueprint

If you want to use the `render.yaml` file:

1. In Render dashboard, go to **"Blueprints"**
2. Click **"New Blueprint"**
3. Connect your GitHub repository
4. Select the `render.yaml` file
5. Deploy the blueprint

## 📋 What We Fixed

1. **Added `postinstall` script** to ensure `express-rate-limit` is installed
2. **Updated `start` script** with proper environment variables
3. **Added dependency verification** in build process
4. **Simplified module resolution** path

## 🎯 Expected Results

After applying these fixes:
- ✅ Dependencies will be properly installed
- ✅ `express-rate-limit` will be found and loaded
- ✅ Server will start with correct environment variables
- ✅ No more `ERR_MODULE_NOT_FOUND` errors

## 🚨 Important Notes

- The `render.yaml` file is only used with Render Blueprints
- Manual service configuration is required for existing services
- Make sure to use the exact build and start commands provided above
- Environment variables must be set in the Render dashboard

## 📞 Support

If you continue to have issues:
1. Check the deployment logs in Render dashboard
2. Verify all environment variables are set correctly
3. Ensure the build command completes successfully
4. Check that the start command runs without errors