# Akash Share - Network Setup Instructions

This guide provides step-by-step instructions for setting up and running Akash Share on a local network so that it can be accessed from multiple devices including PCs and mobile devices.

## Prerequisites

1. Node.js installed on the host machine
2. MongoDB installed and running locally, or access to MongoDB Atlas
3. Windows Firewall configured to allow connections (see below)

## Step-by-Step Setup Instructions

### 1. Find Your Local IP Address

First, you need to determine your computer's local IP address on the network:

**Windows:**
```cmd
ipconfig
```

Look for the "IPv4 Address" under your active network connection (Wi-Fi or Ethernet). It will typically be in the format `192.168.x.x`.

**macOS/Linux:**
```bash
ifconfig
# or
ip addr show
```

### 2. Configure Environment Variables

Create a `.env` file in the root of the project with the following content:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/akashshare
# For MongoDB Atlas, use:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/akashshare

# Server Configuration
PORT=5002
HOST=0.0.0.0

# Security
JWT_SECRET=your_secure_random_string_here

# File Upload Configuration
FILE_SIZE_LIMIT=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=development
```

Note: The `REACT_APP_API_URL` is not needed in the .env file as the frontend now dynamically detects the correct URL.

### 3. Configure Windows Firewall

Run the provided PowerShell script as Administrator:

```powershell
# From the project root directory
.\configure-firewall.ps1
```

Alternatively, manually configure the firewall:

1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule..."
3. Select "Port" → TCP → Specific ports: `5002`
4. Allow the connection → All profiles → Name: "Akash Share Backend"
5. Repeat for any other ports used by the application

### 4. Start MongoDB

Ensure MongoDB is running on your system:

```bash
# If MongoDB is installed locally
mongod --dbpath "C:\data\db"
```

Or use MongoDB Atlas by updating the `MONGO_URI` in your `.env` file.

### 5. Start the Backend Server

Navigate to the backend directory and start the server:

```bash
cd backend
npm start
```

You should see output similar to:
```
✅ MongoDB Connected successfully
🚀 Server running on 0.0.0.0:5002
📁 File size limit: 10MB
🔒 Allowed file types: image/jpeg, image/png, image/gif, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
⏱️  Rate limit: 100 requests per 15 minutes
🌐 API endpoints available at: http://0.0.0.0:5002
💬 WebSocket chat available at: ws://0.0.0.0:5002/chat
```

### 6. Start the Frontend (for development)

In a separate terminal, start the React frontend:

```bash
npm start
```

### 7. Access from Other Devices

On other devices connected to the same network, access the application using:

- Frontend: `http://YOUR_LOCAL_IP:3000`
- Backend API: `http://YOUR_LOCAL_IP:5002`

Replace `YOUR_LOCAL_IP` with the IP address you found in step 1.

For example, if your local IP is `192.168.1.100`:
- Frontend: `http://192.168.1.100:3000`
- Backend API: `http://192.168.1.100:5002`

### 8. For Production/Electron Builds

When building the Electron app for distribution:

1. Build the React frontend:
   ```bash
   npm run build
   ```

2. Package the Electron app:
   ```bash
   npm run electron-pack
   ```

3. On the target machine, ensure the backend server is running on a machine accessible from the network.

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure the backend server is running and the firewall is configured correctly.

2. **CORS Errors**: The application should automatically handle CORS for local network addresses. If you encounter issues, check the backend server logs.

3. **WebSocket Connection Failed**: Make sure the WebSocket port (5002) is accessible through the firewall.

4. **MongoDB Connection Failed**: Verify MongoDB is running and the connection string in `.env` is correct.

### Testing Network Connectivity

You can test if the ports are accessible from another machine using PowerShell:

```powershell
Test-NetConnection -ComputerName YOUR_LOCAL_IP -Port 5002
```

### Logs and Debugging

Check the backend server console for detailed logs about connections, errors, and requests.

## Security Considerations

1. Never expose the backend server to the public internet without proper security measures.
2. Use strong passwords for MongoDB and JWT secrets.
3. In production, consider using HTTPS and WSS (secure WebSocket) connections.
4. Regularly update dependencies to patch security vulnerabilities.

## Mobile Device Access

To access the application from mobile devices:

1. Ensure both devices are on the same WiFi network
2. Use the computer's local IP address in the mobile browser
3. Make sure the firewall allows connections from mobile devices

Example for mobile access:
- Frontend: `http://192.168.1.100:3000`
- Backend API: `http://192.168.1.100:5002`