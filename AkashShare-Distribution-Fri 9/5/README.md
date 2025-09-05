# Akash Share 🚀

**Next-generation desktop application for fast and secure file sharing**

A modern, cross-platform desktop application built with React, Electron, and cutting-edge web technologies for seamless file sharing with secure share codes.

![Akash Share](https://img.shields.io/badge/Akash-Share-blue?style=for-the-badge&logo=react)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-Audited-brightgreen?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality
- **Drag & Drop File Upload** - Intuitive file selection with visual feedback
- **Secure Share Codes** - 4-digit numeric codes for file access
- **Real-time Progress Tracking** - Animated progress bars for uploads/downloads
- **Cross-platform Support** - Windows, macOS, and Linux compatibility
- **Large File Support** - Efficient handling of files up to 10MB (configurable)

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful glass-like interface with backdrop blur
- **Dark/Light Theme** - Seamless theme switching with smooth transitions
- **Framer Motion Animations** - Smooth, professional animations throughout
- **Responsive Layout** - Optimized for all screen sizes
- **Custom Icons** - Lucide React icons for consistent design

### 📊 Advanced Features
- **Transfer History** - Complete log of all file transfers with statistics
- **File Type Recognition** - Automatic file type detection with appropriate icons
- **Search & Filter** - Advanced filtering and search capabilities
- **Statistics Dashboard** - Beautiful charts and analytics
- **Settings Management** - Comprehensive app configuration

### 🔒 Security & Performance
- **Input Validation** - Comprehensive validation for all user inputs
- **File Type Filtering** - Whitelist-based file type restrictions
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **Secure Headers** - Helmet.js for security headers
- **Auto-expiring Files** - Files automatically deleted after 24 hours
- **Error Handling** - Comprehensive error management and recovery

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Framer Motion** - Production-ready motion library for animations
- **Lucide React** - Beautiful, customizable icons
- **Recharts** - Composable charting library for data visualization

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database for file metadata
- **Multer** - File upload handling middleware
- **Helmet** - Security headers middleware
- **Express Rate Limit** - Rate limiting protection
- **Express Validator** - Input validation middleware

### Desktop Framework
- **Electron** - Cross-platform desktop application framework
- **Electron Builder** - Complete solution for packaging and building

### State Management
- **Zustand** - Lightweight state management with persistence
- **React Router** - Declarative routing for React

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatter
- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **Mocha & Chai** - Backend testing framework

## 🚀 Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git
- MongoDB (for backend)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/akash-share.git
   cd akash-share
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

3. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

### Development Setup

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   # In a new terminal
   npm start
   ```

3. **Start Electron (optional)**
   ```bash
   # In another terminal
   npm run electron-dev
   ```

## 🧪 Testing

### Frontend Testing
```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Backend Testing
```bash
# Run backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage
- **Frontend**: Jest + React Testing Library for component testing
- **Backend**: Mocha + Chai + Supertest for API testing
- **Coverage**: Comprehensive test coverage for critical paths

## 🔒 Security Measures

### Input Validation
- **File Type Validation**: Whitelist-based file type restrictions
- **File Size Limits**: Configurable maximum file size (default: 10MB)
- **Input Sanitization**: All user inputs are validated and sanitized
- **Code Validation**: Share codes are validated for format and length

### Rate Limiting
- **Request Limiting**: 100 requests per 15 minutes per IP
- **Upload Limiting**: Configurable limits for file uploads
- **DDoS Protection**: Built-in protection against abuse

### Security Headers
- **Helmet.js**: Comprehensive security headers
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Content Security Policy**: Protection against XSS attacks

### File Security
- **Secure File Names**: Sanitized file names to prevent path traversal
- **Temporary Storage**: Files automatically deleted after 24 hours
- **Access Control**: Secure share codes with proper validation

## 🚀 Building for Production

### Frontend Build
```bash
npm run build
```

### Backend Build
```bash
cd backend
npm start
```

### Desktop Application
```bash
# Package for distribution
npm run dist
```

The built application will be available in the `dist` folder.

## 📱 Usage

### Sending Files
1. Navigate to the **Send Files** page
2. Drag and drop files or click to browse
3. Click **Upload & Generate Code**
4. Share the generated 4-digit code with recipients

### Receiving Files
1. Navigate to the **Receive Files** page
2. Enter the 4-digit share code
3. Preview available files
4. Download individual files or all files at once

### Managing History
- View all transfer records in the **History** page
- Filter by type, status, or search by filename
- Clear history or export transfer data

### Customizing Settings
- Toggle between light and dark themes
- Configure file size limits and code expiry times
- Enable/disable notifications
- Set language preferences

## 🎨 Design System

### Color Palette
- **Primary**: Akash Blue (`#0ea5e9`) to Purple (`#8b5cf6`)
- **Success**: Emerald (`#10b981`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Typography
- **Headings**: Bold, gradient text with custom fonts
- **Body**: Clean, readable sans-serif fonts
- **Code**: Monospace fonts for share codes

### Components
- **Glass Cards** - Semi-transparent cards with backdrop blur
- **Gradient Buttons** - Beautiful gradient buttons with hover effects
- **Animated Progress Bars** - Smooth progress indicators
- **Toast Notifications** - Non-intrusive status messages

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/akashshare

# Server Configuration
PORT=5000
HOST=0.0.0.0

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
FILE_SIZE_LIMIT=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Environment
NODE_ENV=development
```

### Electron Configuration
The Electron configuration is in `electron/main.js` and includes:
- Window sizing and positioning
- File dialog integration
- IPC communication setup
- Security settings

## 📦 Project Structure

```
akash-share/
├── backend/                  # Backend server
│   ├── server.js            # Express server with security
│   ├── package.json         # Backend dependencies
│   ├── test/                # Backend tests
│   └── uploads/             # File upload directory
├── electron/                 # Electron main process
│   ├── main.js              # Main process file
│   └── preload.js           # Preload script for security
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # UI components
│   ├── contexts/            # React contexts
│   ├── lib/                 # Utility functions
│   ├── pages/               # Page components (lazy loaded)
│   ├── store/               # Zustand store
│   ├── App.js               # Main app component
│   ├── App.test.js          # App component tests
│   ├── index.js             # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables template
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── package.json             # Dependencies and scripts
├── tailwind.config.js       # Tailwind configuration
└── README.md               # This file
```

## 🚀 Scripts

### Frontend Scripts
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm test` - Run frontend tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

### Backend Scripts
- `cd backend && npm start` - Start backend server
- `cd backend && npm run dev` - Start backend in development mode
- `cd backend && npm test` - Run backend tests

### Desktop Scripts
- `npm run electron` - Start Electron app
- `npm run electron-dev` - Start Electron with React dev server
- `npm run dist` - Build and package for distribution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and conventions
- Add appropriate tests for new features
- Update documentation as needed
- Ensure all animations are smooth and performant
- Run linting and formatting before committing

### Code Quality
- **ESLint**: Code linting with React-specific rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety (future enhancement)
- **Testing**: Comprehensive test coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Electron Team** - For cross-platform desktop capabilities
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Lucide** - For beautiful icons
- **Express.js** - For the robust backend framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/akash-share/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/akash-share/discussions)
- **Email**: support@akashshare.com

## 🔒 Security

If you discover a security vulnerability, please report it to security@akashshare.com instead of using the issue tracker.

---

**Made with ❤️ by the Akash Share Team**

*Next-generation file sharing, reimagined with security first.*
