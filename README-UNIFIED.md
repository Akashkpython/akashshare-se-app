# Akash Share - Unified Frontend & Backend

This is the unified version of Akash Share that combines both frontend and backend into a single project structure.

## 🚀 Quick Start

### Install Dependencies
```bash
npm run install:all
```

### Development Mode
```bash
# Start both frontend and backend together
npm run dev

# Start frontend, backend, and Electron together
npm run dev:full
```

### Individual Services
```bash
# Start only backend
npm run backend

# Start only frontend
npm start

# Start only Electron (requires backend to be running)
npm run electron
```

## 📁 Project Structure

```
akashshare-se/
├── src/                    # Frontend React application
├── backend/               # Backend Node.js server
├── electron/              # Electron main process
├── scripts/               # Unified startup scripts
│   ├── start-unified.js   # Start frontend + backend
│   └── electron-unified.js # Start backend + Electron
├── package.json           # Unified dependencies and scripts
└── README-UNIFIED.md      # This file
```

## 🔧 Available Scripts

### Unified Scripts
- `npm run dev` - Start frontend + backend (web development)
- `npm run dev:full` - Start frontend + backend + Electron
- `npm run install:all` - Install all dependencies

### Backend Scripts
- `npm run backend` - Start backend server
- `npm run backend:dev` - Start backend with nodemon (auto-restart)
- `npm run backend:install` - Install backend dependencies

### Frontend Scripts
- `npm start` - Start React development server
- `npm run build` - Build React app for production

### Electron Scripts
- `npm run electron` - Start Electron app
- `npm run electron:build` - Build Electron app for distribution

## 🌐 Ports

- **Frontend (React)**: http://localhost:5004
- **Backend (API)**: http://127.0.0.1:5004
- **WebSocket**: ws://127.0.0.1:5004/chat

## 🔄 Development Workflow

1. **First Time Setup**:
   ```bash
   npm run install:all
   ```

2. **Daily Development**:
   ```bash
   # For web development
   npm run dev
   
   # For Electron development
   npm run dev:full
   ```

3. **Testing Individual Components**:
   ```bash
   # Test backend only
   npm run backend
   
   # Test frontend only (requires backend running)
   npm start
   ```

## 🚨 Troubleshooting

### Backend Issues
- Ensure MongoDB is accessible
- Check if port 5004 is available
- Verify environment variables are set

### Frontend Issues
- Ensure backend is running on port 5004
- Check if port 5004 is available
- Clear browser cache if needed

### Electron Issues
- Ensure both frontend and backend are running
- Check Electron dependencies are installed
- Verify file paths in electron/main.js

## 📦 Production Build

```bash
# Build for web deployment
npm run build

# Build Electron app
npm run electron:build

# Create Windows installer
npm run build:win
```

## 🔗 Integration Points

The unified setup automatically handles:
- Backend server startup on port 5004
- Frontend development server on port 5004
- Electron app loading from frontend server
- Process management and cleanup
- Environment variable configuration

All components are configured to work together seamlessly!
