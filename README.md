# Akash Share - Professional File Sharing Application

Akash Share is a modern, secure, and efficient file sharing application built with Electron, React, and Node.js. It allows users to easily share files across devices with a simple 4-digit share code system.

## Features

- **Secure File Transfer**: Share files securely with 4-digit codes
- **Group Chat**: Real-time messaging with WebSocket support
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Dark theme interface with smooth animations
- **Auto-Updates**: Seamless application updates
- **File Validation**: Comprehensive file type and size validation

## Prerequisites

- Node.js v16 or higher
- npm v7 or higher
- MongoDB Atlas account (for production)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd akashshare-se
   ```

2. Install dependencies:
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Update `MONGO_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure secret key

## Development

### Starting the Development Environment

For Electron development, use the new unified script that starts both frontend and backend in the correct order:

```bash
# Using the new script (recommended)
npm run electron-dev

# Or using the batch file on Windows
start-electron-dev.bat
```

This will:
1. Start the backend server on port 5003
2. Start the frontend development server on port 5002
3. Ensure proper synchronization between both services

### Traditional Development Commands

```bash
# Start frontend only (port 5002)
npm start

# Start backend only (port 5003)
cd backend
node server.js
```

### Port Configuration

- **Frontend**: http://localhost:5002
- **Backend API**: http://localhost:5003
- **WebSocket Chat**: ws://localhost:5003/chat

## Building for Production

```bash
# Build React frontend
npm run build

# Build Electron app
npm run electron-build
```

## Running the Production App

After building, you can run the production app:

```bash
npm run electron
```

## Project Structure

```
akashshare-se/
├── backend/              # Node.js backend server
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── utils/            # Utility functions
│   └── server.js         # Main server file
├── electron/             # Electron main and preload processes
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/                  # React frontend
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   ├── pages/            # Page components
│   ├── store/            # Zustand store
│   └── App.js            # Main App component
└── tests/                # Test files
```

## Key Components

### File Sharing
- Upload files with drag & drop or file selection
- Generate 4-digit share codes
- Download files using share codes
- Automatic file expiration (24 hours)

### Group Chat
- Real-time WebSocket-based messaging
- Online user tracking
- Message history
- Responsive design

### Settings
- Theme customization
- Performance monitoring
- Connection management

## Environment Variables

### Backend (.env)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5003)
- `HOST`: Server host (default: localhost)

### Frontend
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5003)

## Troubleshooting

### Port Conflicts
If you encounter port conflicts:
1. Check if services are already running:
   ```bash
   # Windows
   netstat -ano | findstr :5002
   netstat -ano | findstr :5003
   ```
2. Kill conflicting processes:
   ```bash
   taskkill /PID <process-id> /F
   ```

### MongoDB Connection Issues
1. Verify your `MONGO_URI` in `backend/.env`
2. Ensure your IP is whitelisted in MongoDB Atlas
3. Check your network connection

### Electron App Issues
1. Clear Electron cache:
   ```bash
   npm run electron-builder -- --reset-cache
   ```
2. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.

## Author

Akash Share Team
