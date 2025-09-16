# MongoDB Atlas Connection Fix Instructions

## Issue
The application is unable to connect to MongoDB Atlas with the error:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Root Cause
Your current IP address (103.189.135.225) is not whitelisted in MongoDB Atlas.

## Solution

### Step 1: Add Your IP to MongoDB Atlas Whitelist

1. Go to your MongoDB Atlas dashboard: https://cloud.mongodb.com
2. Select your cluster "akashshare"
3. Go to the "Network Access" section in the left sidebar
4. Click "Add IP Address"
5. Add your current IP address: 103.189.135.225
6. Click "Confirm"

### Step 2: Alternative (Development Only)
For development purposes, you can temporarily allow access from anywhere:
1. In the "Add IP Address" dialog, click "Allow Access from Anywhere"
2. This will add 0.0.0.0/0 to your whitelist
3. **Note:** This is not recommended for production environments

### Step 3: Verify Connection
After adding your IP to the whitelist, test the connection again:

```bash
cd backend
node test-mongodb.js
```

## Additional Configuration Changes Made

1. Updated Render configuration to use consistent port (5004)
2. Updated backend start script to use port 5004
3. Committed and pushed changes to GitHub repository

## Render Deployment URL
- Frontend: https://akashshare-se.onrender.com
- Backend: https://akashshare-backend.onrender.com

## GitHub Repository
The latest changes have been pushed to: https://github.com/Akashkpython/akashshare-se-app.git

## Troubleshooting

If you continue to experience connection issues:

1. Verify your MongoDB URI in `.env` file:
   ```
   MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare
   ```

2. Check that your MongoDB Atlas cluster is running and accessible

3. Ensure your firewall is not blocking the connection

4. Verify your MongoDB Atlas username and password are correct