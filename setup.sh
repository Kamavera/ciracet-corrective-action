#!/bin/bash

# Corrective Action Form - Automated Setup Script
# This script will install NVM, Node v18, and build the project

set -e  # Exit on error

echo "=========================================="
echo "Corrective Action Form - Setup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if NVM is installed
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo -e "${GREEN}✓ NVM is already installed${NC}"
    source "$HOME/.nvm/nvm.sh"
else
    echo -e "${YELLOW}Installing NVM...${NC}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

    # Load NVM
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    echo -e "${GREEN}✓ NVM installed successfully${NC}"
fi

# Load NVM (in case it wasn't loaded)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check current Node version
CURRENT_NODE_VERSION=$(node --version 2>/dev/null || echo "none")
echo ""
echo "Current Node version: $CURRENT_NODE_VERSION"

# Install Node v18
echo -e "${YELLOW}Installing Node.js v18...${NC}"
nvm install 18
nvm use 18

# Verify Node version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION is now active${NC}"

# Navigate to project directory
cd "$(dirname "$0")"

echo ""
echo -e "${YELLOW}Installing project dependencies...${NC}"
npm install

echo ""
echo -e "${YELLOW}Building the project...${NC}"
npm run build

echo ""
echo -e "${GREEN}=========================================="
echo "✓ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Update your SharePoint site URL:"
echo "   Edit: config/serve.json"
echo ""
echo "2. Start development server:"
echo "   npm run serve"
echo ""
echo "3. Or create production package:"
echo "   npm run package"
echo ""
echo "NOTE: When opening a new terminal, run 'nvm use 18' first"
echo ""
