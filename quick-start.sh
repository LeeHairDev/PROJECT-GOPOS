#!/bin/bash

# GoPOS Quick Start Script - Linux/Mac

echo "🚀 GoPOS - Quick Start"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Backend Setup
echo ""
echo "📦 Setting up Backend..."
cd Backend
npm install
echo "✅ Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gopos
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
EOF
    echo "✅ .env file created. Please update MONGODB_URI if needed."
fi

cd ..

# Frontend Setup
echo ""
echo "🎨 Setting up Frontend..."
cd Frontend
npm install
echo "✅ Frontend dependencies installed"

cd ..

# Success message
echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "📝 Next Steps:"
echo "1. Make sure MongoDB is running"
echo "2. Open two terminals"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd Backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd Frontend"
echo "  npm run dev"
echo ""
echo "🌐 Access the app at http://localhost:5173"
echo ""
echo "👤 Default Login:"
echo "  1. Create account via Register"
echo "  2. Or create admin via MongoDB"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Full documentation"
echo "  - API_TESTING.md - API testing guide"
echo "  - DEVELOPMENT.md - Development guide"
echo "  - FEATURES_SUMMARY.md - Features list"
