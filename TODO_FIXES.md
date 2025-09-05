# TODO: Post-Audit Fixes & Improvements

## 🔴 CRITICAL (Fix before next release)

### Frontend Tests
- [ ] **Fix App.test.js react-router-dom mock issue**
  - Add proper jest configuration for react-router-dom
  - Ensure test coverage includes routing
  - File: `src/App.test.js:16`

### Backend Tests  
- [ ] **Fix download test response parsing**
  - Expected string but got object in download test
  - File: `backend/test/server.test.js:142`
  
- [ ] **Fix rate limiting test undefined property**
  - Cannot read properties of undefined (reading 'status')
  - File: `backend/test/server.test.js:163`

## 🟡 IMPORTANT (Next Sprint)

### Security
- [ ] **Resolve 9 frontend vulnerabilities**
  - Run `npm audit fix --force` (test thoroughly)
  - Vulnerabilities in: nth-check, postcss, webpack-dev-server
  - Only affects development, not production builds

### Branding
- [ ] **Replace default React PWA logos**
  - Replace `public/logo192.png` with Akash Share logo
  - Replace `public/logo512.png` with Akash Share logo  
  - Update `public/manifest.json` accordingly

### MongoDB Warnings
- [ ] **Remove deprecated MongoDB connection options**
  - Remove `useNewUrlParser: true` from connection
  - Remove `useUnifiedTopology: true` from connection
  - File: `backend/server.js:64-67`

## 🟢 ENHANCEMENTS (Future Releases)

### Major Dependencies (Breaking Changes)
- [ ] **React 18 → 19 upgrade**
  - Test all components for compatibility
  - Update testing libraries
  
- [ ] **Tailwind CSS 3 → 4 upgrade**  
  - Review breaking changes in v4
  - Update custom configurations
  
- [ ] **ESLint 8 → 9 upgrade**
  - Update configuration for new version
  - Test all linting rules
  
- [ ] **Electron 28 → 37 upgrade**
  - Test desktop functionality
  - Update build configurations

### Testing Improvements
- [ ] **Add Component Integration Tests**
  - Test drag & drop functionality
  - Test file upload/download flow
  - Test theme switching
  
- [ ] **Add E2E Tests**
  - Complete file sharing workflow
  - Cross-platform desktop tests
  - Error handling scenarios
  
- [ ] **Add Electron Main Process Tests**
  - Window management tests  
  - File system operations tests
  - IPC communication tests

### Code Quality
- [ ] **TypeScript Migration**
  - Convert JavaScript files to TypeScript
  - Add type definitions
  - Update build process
  
- [ ] **Add CI/CD Pipeline**
  - GitHub Actions workflow
  - Automated testing
  - Automated builds and releases

### Features
- [ ] **Add File Preview**
  - Image thumbnails
  - PDF preview
  - Text file preview
  
- [ ] **Add Bulk Operations**
  - Multiple file downloads
  - Batch delete from history
  - Folder compression
  
- [ ] **Add User Authentication** 
  - User accounts
  - File ownership
  - Access controls

## 📝 NOTES

### Fixed in This Audit
✅ 35 unused imports/variables removed  
✅ 3 waste files removed (4.8KB saved)  
✅ All lint errors fixed  
✅ Dependencies updated (safe versions)  
✅ Build process verified  
✅ Code formatting standardized  

### Environment Setup
```bash
# To reproduce audit results:
npm install
cd backend && npm install
npm run lint           # Should show 0 errors
npm run build          # Should succeed
cd backend && npm test # Should show 7/9 passing
```

### Commands to Fix Critical Issues
```bash
# Fix frontend test
npm test -- --coverage --watchAll=false

# Fix backend MongoDB warnings  
# Edit server.js line 64-67, remove deprecated options

# Check security issues
npm audit
npm audit fix --force  # Use with caution
```