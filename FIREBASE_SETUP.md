# Firebase Setup Guide

## Steps to Configure Firebase:

### 1. Create a Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project"
- Enter project name (e.g., "dti-price-monitoring")
- Click "Create project"

### 2. Register Your Web App
- Click the web icon (</> ) to register a web app
- Enter app name (e.g., "DTI Monitoring App")
- Click "Register app"
- Copy the Firebase config object

### 3. Enable Firestore Database
- In Firebase Console, go to "Build" → "Firestore Database"
- Click "Create database"
- Select "Start in test mode" (for development)
- Choose your region
- Click "Enable"

### 4. Update Configuration
- Copy your Firebase config from step 2
- Replace the placeholder values in `src/services/priceService.js`

### Your Firebase Config Should Look Like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-12345",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcd1234efgh5678"
};
```

### 5. Data Will Be Stored In:
- **Database:** Firestore
- **Collection:** `price_monitoring`
- **Documents:** Each price entry

That's it! Your app will now save monitoring data to Firebase Cloud Firestore.
