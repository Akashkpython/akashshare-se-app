# 🌐 Render Environment Variables Configuration

## 📋 **Environment Variables to Add in Render Dashboard**

### **Core Application Settings:**
```
NODE_ENV = production
HOST = 0.0.0.0
PORT = 5003
```

### **Database Configuration:**
```
MONGO_URI = mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare
```

### **Security Configuration:**
```
JWT_SECRET = f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
```

### **File Upload Settings:**
```
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/gif,image/webp,text/plain,application/pdf
FILE_SIZE_LIMIT = 10485760
```

### **Rate Limiting:**
```
RATE_LIMIT_MAX_REQUESTS = 100
RATE_LIMIT_WINDOW_MS = 900000
```

### **WebSocket Configuration:**
```
WS_CONNECTION_LIMIT = 10
WS_RATE_LIMIT_MAX = 5
WS_RATE_LIMIT_WINDOW = 60000
```

### **CORS & Security:**
```
CORS_ORIGIN = https://akashshare-se.onrender.com
TRUST_PROXY = true
```

### **Performance Settings:**
```
ENABLE_COMPRESSION = true
ENABLE_CACHING = true
CACHE_TTL = 3600
```

### **Logging:**
```
LOG_LEVEL = info
ENABLE_REQUEST_LOGGING = true
```

### **Health Check:**
```
HEALTH_CHECK_ENABLED = true
HEALTH_CHECK_INTERVAL = 30000
```

### **Node.js Optimization:**
```
NODE_OPTIONS = --max-old-space-size=1024
NPM_CONFIG_PRODUCTION = true
NPM_CONFIG_AUDIT = false
NPM_CONFIG_FUND = false
```

## 🚀 **How to Add These in Render:**

### **Method 1: Render Dashboard (Recommended)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `akashshare-backend` service
3. Click on **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add each variable with its value
6. Click **"Save Changes"**
7. Your service will automatically redeploy

### **Method 2: Update render.yaml (Already Done)**
Your `render.yaml` already has most of these variables configured!

## 🔒 **Security Best Practices:**

### **Sensitive Variables (Keep Private):**
- `MONGO_URI` - Database connection string
- `JWT_SECRET` - Authentication secret
- Any API keys or passwords

### **Public Variables (Can be in render.yaml):**
- `NODE_ENV`, `HOST`, `PORT`
- `ALLOWED_FILE_TYPES`, `FILE_SIZE_LIMIT`
- `RATE_LIMIT_*`, `WS_*` settings
- Performance and logging settings

## 📝 **Current Status:**

✅ **Already Configured in render.yaml:**
- All core environment variables are set
- MongoDB URI is configured
- JWT secret is set
- Rate limiting is configured
- Performance settings are optimized

## 🔄 **Next Steps:**

1. **Verify in Render Dashboard** that all variables are set
2. **Test the deployment** to ensure variables are loaded
3. **Check logs** to confirm environment variables are working
4. **Update any missing variables** if needed

## 🛠️ **Troubleshooting:**

### **If Variables Don't Load:**
1. Check variable names match exactly (case-sensitive)
2. Ensure no extra spaces in variable names or values
3. Verify the service has been redeployed after adding variables
4. Check Render logs for any environment variable errors

### **Common Issues:**
- **Missing Variables:** Add them in Render dashboard
- **Wrong Values:** Update them in the Environment tab
- **Case Sensitivity:** Ensure exact case matching
- **Special Characters:** Escape them properly in values
