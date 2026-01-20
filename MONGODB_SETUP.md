# MongoDB Setup Guide

## Option 1: Local MongoDB (Easiest for Development)

### Install MongoDB
- **Windows:** Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Mac:** `brew install mongodb-community`
- **Linux:** `sudo apt-get install mongodb`

### Start MongoDB
```bash
# Windows (PowerShell)
mongod

# Mac/Linux
brew services start mongodb-community
# or
mongod
```

### Connection String
```
mongodb://localhost:27017/dti-price-monitoring
```

---

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Steps:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Set up network access (whitelist your IP)
5. Create database user
6. Copy connection string
7. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dti-price-monitoring
   ```

---

## Install Dependencies

```bash
cd c:\Users\Admin\Documents\4th YEAR\ITD112\Lab1Practice

# Install server dependencies
npm install express mongoose cors dotenv

# Or install all at once
npm install express mongoose cors dotenv
```

---

## Run the Project

### Terminal 1: Start Backend Server
```bash
cd c:\Users\Admin\Documents\4th YEAR\ITD112\Lab1Practice
node server.js
# Should show: ✅ Connected to MongoDB
```

### Terminal 2: Start Frontend Dev Server
```bash
cd c:\Users\Admin\Documents\4th YEAR\ITD112\Lab1Practice\filipino-emigrants-app
npm run dev
# Visit: http://localhost:5173
```

---

## Data Structure in MongoDB

**Collection:** `pricdatas`
**Fields:**
- `_id` - MongoDB auto-generated ID
- `commodity` - String
- `store` - String
- `municipality` - String
- `price` - Number
- `prevPrice` - Number
- `srp` - Number
- `timestamp` - Date
- `createdAt` - Date (auto)
- `updatedAt` - Date (auto)

---

## Troubleshooting

**"Cannot find module 'express'"**
→ Run: `npm install express mongoose cors dotenv`

**"MongoDB connection refused"**
→ Make sure MongoDB server is running (check step above)

**API not responding**
→ Make sure backend is running on http://localhost:5000
