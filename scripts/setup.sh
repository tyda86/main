#!/bin/bash

echo "🎌 Setting up Anime Episode Alert..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (>=16.0.0)"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to at least v$REQUIRED_VERSION"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# iOS setup
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios && pod install && cd ..
    echo "✅ iOS setup complete"
fi

# React Native setup
echo "⚛️ Setting up React Native..."
npx react-native-asset

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To run the app:"
echo "  📱 Android: npm run android"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  🍎 iOS: npm run ios"
fi
echo ""
echo "If you encounter 'require' errors with Hermes:"
echo "  1. Clear Metro cache: npx react-native start --reset-cache"
echo "  2. Clean build: cd android && ./gradlew clean && cd .."
echo "  3. Reinstall dependencies: rm -rf node_modules && npm install"
echo ""