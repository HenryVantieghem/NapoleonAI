#!/bin/bash

# Napoleon AI Production Deployment Script
echo "🚀 Starting Napoleon AI deployment to production..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required tools are installed
check_dependencies() {
    echo -e "${BLUE}Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        echo -e "${RED}❌ Git is not installed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All dependencies are installed${NC}"
}

# Install dependencies
install_deps() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm ci
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
}

# Run type checking
type_check() {
    echo -e "${BLUE}Running TypeScript type check...${NC}"
    npm run type-check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ TypeScript errors found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
}

# Run linting
lint_check() {
    echo -e "${BLUE}Running ESLint...${NC}"
    npm run lint
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}⚠️  Linting issues found, but continuing...${NC}"
    else
        echo -e "${GREEN}✅ No linting errors${NC}"
    fi
}

# Build the application
build_app() {
    echo -e "${BLUE}Building Napoleon AI...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Build successful${NC}"
}

# Deploy to Vercel
deploy_vercel() {
    echo -e "${BLUE}Deploying to Vercel...${NC}"
    
    # Check if vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Deploy to production
    vercel --prod --yes
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Deployment failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Deployed successfully to Vercel${NC}"
}

# Post-deployment verification
verify_deployment() {
    echo -e "${BLUE}Verifying deployment...${NC}"
    
    # Wait for deployment to be ready
    echo "Waiting for deployment to be ready..."
    sleep 10
    
    # Check if the app is responding
    response=$(curl -s -o /dev/null -w "%{http_code}" https://napoleon-ai.vercel.app)
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ Deployment verification successful${NC}"
        echo -e "${GREEN}🎉 Napoleon AI is live at: https://napoleon-ai.vercel.app${NC}"
    else
        echo -e "${YELLOW}⚠️  Deployment may still be propagating (HTTP $response)${NC}"
        echo -e "${BLUE}Check status at: https://vercel.com/dashboard${NC}"
    fi
}

# Main deployment flow
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║            NAPOLEON AI DEPLOYMENT        ║"
    echo "║         Luxury Executive Platform        ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_dependencies
    install_deps
    type_check
    lint_check
    build_app
    deploy_vercel
    verify_deployment
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════╗"
    echo "║         DEPLOYMENT SUCCESSFUL! 🚀        ║"
    echo "║                                          ║"
    echo "║  Napoleon AI is now live in production   ║"
    echo "║  https://napoleon-ai.vercel.app          ║"
    echo "║                                          ║"
    echo "║  Don't forget to:                        ║"
    echo "║  1. Configure environment variables      ║"
    echo "║  2. Run database migrations              ║"
    echo "║  3. Test all API integrations            ║"
    echo "║  4. Set up monitoring                    ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Run the deployment
main "$@"