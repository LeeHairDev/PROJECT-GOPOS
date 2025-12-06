#!/bin/bash
# GoPOS - Command Reference Guide

cat << 'EOF'

╔════════════════════════════════════════════════════════════════╗
║                    🚀 GoPOS - Command Guide                   ║
║              Hệ Thống Quản Lý Bán Hàng (POS)                   ║
╚════════════════════════════════════════════════════════════════╝

📋 TABLE OF CONTENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ⚡ QUICK START
2. 🔧 SETUP & INSTALLATION  
3. 🚀 RUNNING THE APP
4. 🧪 TESTING
5. 📦 DEPLOYMENT
6. 🆘 TROUBLESHOOTING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  ⚡ QUICK START
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Windows:
    quick-start.bat

Linux/Mac:
    chmod +x quick-start.sh
    ./quick-start.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2️⃣  🔧 SETUP & INSTALLATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prerequisites:
    - Node.js v14+ (Check: node --version)
    - MongoDB (Local or Cloud)
    - npm or yarn

Backend Setup:
    cd Backend
    npm install
    cp .env.example .env
    # Edit .env if needed

Frontend Setup:
    cd Frontend
    npm install

MongoDB Start:
    Windows:
        mongod

    Mac (Homebrew):
        brew services start mongodb-community

    Linux (Ubuntu):
        sudo systemctl start mongod

Check MongoDB:
    mongo
    db.version()  # If connected, you'll see version
    exit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3️⃣  🚀 RUNNING THE APP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Terminal 1 - Backend:
    cd Backend
    npm run dev
    # Will run on http://localhost:5000

Terminal 2 - Frontend:
    cd Frontend
    npm run dev
    # Will run on http://localhost:5173

Browser:
    🌐 Open: http://localhost:5173

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4️⃣  🧪 TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test API with cURL:

Register:
    curl -X POST http://localhost:5000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test User",
        "email": "test@example.com",
        "password": "123456"
      }'

Login:
    curl -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@example.com",
        "password": "123456"
      }'

Get All Products:
    curl -X GET http://localhost:5000/api/products

Get Categories:
    curl -X GET http://localhost:5000/api/categories

Or use Postman/Insomnia (See API_TESTING.md for examples)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5️⃣  📦 DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Build Frontend:
    cd Frontend
    npm run build
    # Output: dist/

Deploy Frontend:
    - Upload dist/ to Vercel/Netlify
    - Or serve with express

Deploy Backend:
    Heroku:
        heroku create gopos-api
        git push heroku main

    Railway:
        railway link
        railway deploy

Environment Variables (Production):
    PORT=5000
    NODE_ENV=production
    MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gopos
    JWT_SECRET=your_secret_key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6️⃣  🆘 TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Port Already in Use:
    Linux/Mac:
        lsof -i :5000
        kill -9 <PID>

    Windows:
        netstat -ano | findstr :5000
        taskkill /PID <PID> /F

MongoDB Connection Error:
    - Check MongoDB is running
    - Check MONGODB_URI in .env
    - Check MongoDB port (default: 27017)

npm install Failed:
    npm cache clean --force
    rm -rf node_modules
    npm install

CORS Error:
    - Frontend & Backend on different ports (normal)
    - CORS already configured in server.js

Token Error:
    - Clear localStorage: F12 > Application > LocalStorage > Clear
    - Login again

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📖 Main:              README.md
🚀 Getting Started:   00_START_HERE.md
🔧 Setup Guide:       SETUP_NOTES.md
🧪 API Testing:       API_TESTING.md
👨‍💻 Development:       DEVELOPMENT.md
✨ Features List:     FEATURES_SUMMARY.md
📁 File Structure:    FILE_INVENTORY.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 DATABASE RESET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Drop Database:
    mongo
    use gopos
    db.dropDatabase()
    exit

Drop Collection:
    mongo
    use gopos
    db.users.deleteMany({})
    db.products.deleteMany({})
    db.orders.deleteMany({})
    db.categories.deleteMany({})
    exit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 USEFUL LINKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Node.js:       https://nodejs.org
MongoDB:       https://www.mongodb.com
MongoDB Atlas: https://www.mongodb.com/cloud/atlas
Postman:       https://www.postman.com
VSCode:        https://code.visualstudio.com
Git:           https://git-scm.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Backend Setup:        DONE
✅ Frontend Setup:       DONE
✅ API Endpoints:        22 ENDPOINTS
✅ React Components:     9 COMPONENTS
✅ Database Models:      4 MODELS
✅ Authentication:       JWT + ROLES
✅ Documentation:        COMPLETE

🚀 Ready for: Development | Testing | Deployment

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need Help?
    1. Read SETUP_NOTES.md (Troubleshooting section)
    2. Check README.md for full documentation
    3. See API_TESTING.md for API examples
    4. Check browser console (F12) for errors

Happy Coding! 🚀

EOF
