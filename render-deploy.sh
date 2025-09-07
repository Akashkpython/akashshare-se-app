#!/bin/bash

# Production Deployment Script for Render
# This script sets up the Akash Share application for production deployment

echo "🚀 Starting Akash Share Production Deployment..."

# Set production environment variables
export NODE_ENV=production
export HOST=0.0.0.0
export PORT=${PORT:-5002}

# MongoDB Atlas Configuration
export MONGO_URI="mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare"

# Security Configuration
export JWT_SECRET="f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09"

# File Upload Configuration
export ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,text/plain,application/pdf"
export FILE_SIZE_LIMIT="10485760"

# Rate Limiting Configuration
export RATE_LIMIT_MAX_REQUESTS="100"
export RATE_LIMIT_WINDOW_MS="900000"

# WebSocket Configuration
export WS_CONNECTION_LIMIT="10"
export WS_RATE_LIMIT_MAX="5"
export WS_RATE_LIMIT_WINDOW="60000"

# Production Security Settings
export CORS_ORIGIN="https://akashshare-se.onrender.com"
export TRUST_PROXY="true"

# Performance Settings
export ENABLE_COMPRESSION="true"
export ENABLE_CACHING="true"
export CACHE_TTL="3600"

# Logging Configuration
export LOG_LEVEL="info"
export ENABLE_REQUEST_LOGGING="true"

# Health Check Configuration
export HEALTH_CHECK_ENABLED="true"
export HEALTH_CHECK_INTERVAL="30000"

echo "✅ Environment variables configured for production"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Build the React application
echo "🏗️ Building React application..."
npm run build

echo "🎉 Production deployment setup complete!"
echo "🚀 Starting the production server..."

# Start the backend server
cd backend && npm start
