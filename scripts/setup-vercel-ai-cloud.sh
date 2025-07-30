#!/bin/bash

# Napoleon AI - Vercel AI Cloud Setup Script
# This script configures the complete Vercel AI Cloud environment

set -e

echo "🚀 Setting up Napoleon AI on Vercel AI Cloud..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Install Vercel CLI
install_vercel_cli() {
    print_status "Installing Vercel CLI..."
    
    if command -v vercel &> /dev/null; then
        print_warning "Vercel CLI already installed. Updating..."
        npm update -g vercel@latest
    else
        npm install -g vercel@latest
    fi
    
    print_success "Vercel CLI installed/updated successfully!"
}

# Verify Vercel authentication
verify_auth() {
    print_status "Verifying Vercel authentication..."
    
    if [ -z "$VERCEL_TOKEN" ]; then
        print_warning "VERCEL_TOKEN not found in environment variables."
        print_status "Please login to Vercel..."
        vercel login
    else
        vercel login --token "$VERCEL_TOKEN"
    fi
    
    print_success "Vercel authentication verified!"
}

# Setup project configuration
setup_project() {
    print_status "Setting up Vercel project..."
    
    # Link to existing project or create new one
    if [ ! -f ".vercel/project.json" ]; then
        print_status "Linking to Vercel project..."
        vercel link
    else
        print_status "Project already linked to Vercel."
    fi
    
    print_success "Project setup completed!"
}

# Configure environment variables
setup_environment() {
    print_status "Configuring environment variables..."
    
    # AI Gateway Configuration
    print_status "Setting up AI Gateway..."
    vercel env add VERCEL_AI_GATEWAY_ENABLED production --force || true
    vercel env add VERCEL_AI_GATEWAY_ENABLED preview --force || true
    
    # Fluid Compute Configuration
    print_status "Setting up Fluid Compute..."
    vercel env add FLUID_COMPUTE_ENABLED production --force || true
    vercel env add FLUID_COMPUTE_ENABLED preview --force || true
    vercel env add FLUID_COMPUTE_CONCURRENCY production --force || true
    vercel env add FLUID_COMPUTE_CONCURRENCY preview --force || true
    
    # Sandbox Configuration
    print_status "Setting up Sandbox..."
    vercel env add SANDBOX_ENABLED production --force || true
    vercel env add SANDBOX_ENABLED preview --force || true
    vercel env add SANDBOX_TIMEOUT production --force || true
    vercel env add SANDBOX_TIMEOUT preview --force || true
    
    # Monitoring Configuration
    print_status "Setting up Monitoring..."
    vercel env add MONITORING_ENABLED production --force || true
    vercel env add PERFORMANCE_TRACKING production --force || true
    vercel env add AI_GATEWAY_DEBUG preview --force || true
    
    print_success "Environment variables configured!"
}

# Update project configuration for AI Cloud
update_config() {
    print_status "Updating project configuration for AI Cloud..."
    
    # Create optimized vercel.json if it doesn't exist
    if [ ! -f "vercel.json" ]; then
        cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "src/app/api/ai/**/*.ts": {
      "maxDuration": 300,
      "memory": 3008,
      "runtime": "nodejs20.x",
      "fluid": true,
      "concurrency": 100
    },
    "src/app/api/integrations/**/*.ts": {
      "maxDuration": 180,
      "memory": 1024,
      "runtime": "nodejs20.x",
      "fluid": true,
      "concurrency": 50
    },
    "src/app/api/webhooks/**/*.ts": {
      "maxDuration": 60,
      "memory": 512,
      "runtime": "nodejs20.x",
      "fluid": false
    }
  },
  "compute": {
    "type": "fluid",
    "pricing": "active-cpu"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://napoleon-ai.vercel.app"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ]
}
EOF
        print_success "vercel.json created with AI Cloud optimizations!"
    else
        print_warning "vercel.json already exists. Please manually verify AI Cloud configuration."
    fi
}

# Install AI SDK dependencies
install_dependencies() {
    print_status "Installing AI SDK and dependencies..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Install AI SDK and related packages
    npm install ai@latest @vercel/ai-sdk-openai@latest @vercel/ai-sdk-anthropic@latest
    npm install --save-dev @vercel/sandbox
    
    print_success "Dependencies installed successfully!"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Type check
    if npm run type-check > /dev/null 2>&1; then
        print_success "TypeScript check passed!"
    else
        print_warning "TypeScript check failed. Please fix type errors."
    fi
    
    # Build check
    if npm run build > /dev/null 2>&1; then
        print_success "Build check passed!"
    else
        print_error "Build failed. Please fix build errors before deploying."
        exit 1
    fi
    
    print_success "Health checks completed!"
}

# Deploy to preview
deploy_preview() {
    print_status "Deploying to preview environment..."
    
    # Build and deploy
    vercel build
    PREVIEW_URL=$(vercel deploy --prebuilt)
    
    print_success "Preview deployment completed!"
    print_status "Preview URL: $PREVIEW_URL"
    
    # Basic health check on preview
    sleep 10
    if curl -f "$PREVIEW_URL" > /dev/null 2>&1; then
        print_success "Preview deployment is healthy!"
    else
        print_warning "Preview deployment health check failed."
    fi
}

# Main execution
main() {
    echo
    print_status "Starting Vercel AI Cloud setup for Napoleon AI..."
    echo
    
    check_prerequisites
    echo
    
    install_vercel_cli
    echo
    
    verify_auth
    echo
    
    setup_project
    echo
    
    install_dependencies
    echo
    
    setup_environment
    echo
    
    update_config
    echo
    
    run_health_checks
    echo
    
    # Ask user if they want to deploy preview
    read -p "Would you like to deploy to preview environment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_preview
        echo
    fi
    
    print_success "🎉 Vercel AI Cloud setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Review your environment variables in Vercel dashboard"
    echo "2. Test AI Gateway functionality with: npm run dev"
    echo "3. Monitor performance in Vercel Analytics"
    echo "4. Deploy to production when ready: vercel deploy --prod"
    echo
    echo "For production deployment, use:"
    echo "  ./scripts/deploy-production.sh"
    echo
    print_success "Napoleon AI is ready for enterprise-grade AI workloads! 👑"
}

# Run main function
main "$@"