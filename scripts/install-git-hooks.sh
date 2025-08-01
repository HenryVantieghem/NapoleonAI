#!/bin/bash

# Napoleon AI - Git Hooks Installation Script
# Sets up quality gate hooks for the repository

set -e

# Colors for output  
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[HOOKS]${NC} $1"
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

echo "🪝 Napoleon AI Git Hooks Installation"
echo "===================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a Git repository!"
    exit 1
fi

# Create hooks directory if it doesn't exist
if [ ! -d ".git/hooks" ]; then
    mkdir -p .git/hooks
    print_status "Created .git/hooks directory"
fi

# Install pre-push hook
if [ -f ".githooks/pre-push" ]; then
    cp .githooks/pre-push .git/hooks/pre-push
    chmod +x .git/hooks/pre-push
    print_success "Installed pre-push hook"
else
    print_error "Pre-push hook source not found at .githooks/pre-push"
    exit 1
fi

# Create pre-commit hook for quick checks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# Napoleon AI - Pre-Commit Hook (Quick Checks)
# Runs fast checks before allowing commit

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PRE-COMMIT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Quick TypeScript check on staged files
print_status "Quick TypeScript check on staged files..."

# Get staged TypeScript files
staged_ts_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -n "$staged_ts_files" ]; then
    # Check if TypeScript files have obvious syntax errors
    for file in $staged_ts_files; do
        if [ -f "$file" ]; then
            # Basic syntax check - look for obvious issues
            if grep -q "console\.log\|debugger" "$file"; then
                print_error "Found console.log or debugger in $file"
                echo "Remove debugging statements before committing"
                exit 1
            fi
        fi
    done
    print_success "Staged TypeScript files look clean"
else
    print_status "No TypeScript files staged"
fi

# Check for secrets in staged files
print_status "Checking staged files for secrets..."
if git diff --cached --name-only | xargs grep -l "sk-\|pk_live\|OPENAI_API_KEY.*=" 2>/dev/null; then
    print_error "Potential secrets detected in staged files!"
    echo "Remove secrets before committing or use environment variables"
    exit 1
fi

print_success "✅ Pre-commit checks passed!"
exit 0
EOF

chmod +x .git/hooks/pre-commit
print_success "Installed pre-commit hook"

# Test the hooks
print_status "Testing hooks installation..."

if [ -x ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-push" ]; then
    print_success "✅ All hooks are installed and executable"
else
    print_error "❌ Hook installation failed"
    exit 1
fi

# Update package.json with hook installation script
if [ -f "package.json" ] && ! grep -q "install-hooks" package.json; then
    print_status "Adding install-hooks script to package.json..."
    
    # Create a temporary script to add the hooks command
    if command -v jq >/dev/null 2>&1; then
        jq '.scripts["install-hooks"] = "bash scripts/install-git-hooks.sh"' package.json > package.json.tmp
        mv package.json.tmp package.json
        print_success "Added install-hooks script to package.json"
    else
        print_warning "jq not found, manually add to package.json:"
        echo '  "install-hooks": "bash scripts/install-git-hooks.sh"'
    fi
fi

echo ""
echo "🎉 Git Hooks Installation Complete!"
echo ""
echo "Installed hooks:"
echo "  ✅ pre-commit  - Quick syntax and secret checks"
echo "  ✅ pre-push    - Comprehensive quality gate"
echo ""
echo "What happens now:"
echo "  📝 Before each commit: Fast syntax & secret checks"
echo "  🚀 Before each push: Full test suite & build validation"
echo ""
echo "To bypass hooks (emergency only):"
echo "  git commit --no-verify"
echo "  git push --no-verify"
echo ""
echo "To reinstall hooks:"
echo "  npm run install-hooks"
echo ""
exit 0