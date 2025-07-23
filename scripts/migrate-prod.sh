#!/bin/bash

# Napoleon AI Production Database Migration Script
echo "🗄️  Starting Napoleon AI database migrations..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is available
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI is not installed${NC}"
        echo -e "${BLUE}Installing Supabase CLI...${NC}"
        npm install -g supabase
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install Supabase CLI${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✅ Supabase CLI is available${NC}"
}

# Run database migrations
run_migrations() {
    echo -e "${BLUE}Running database migrations...${NC}"
    
    # Apply all migrations
    supabase db push --linked
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Database migrations failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Database migrations completed successfully${NC}"
}

# Seed initial data if needed
seed_data() {
    echo -e "${BLUE}Checking if initial data seeding is needed...${NC}"
    
    # Check if we have a seed file
    if [ -f "supabase/seed.sql" ]; then
        echo -e "${BLUE}Applying seed data...${NC}"
        supabase db push --linked --include-seed
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Seed data applied successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  Seed data may already exist or failed to apply${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No seed file found, skipping seeding${NC}"
    fi
}

# Verify database status
verify_database() {
    echo -e "${BLUE}Verifying database status...${NC}"
    
    # Get database status
    supabase status
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database is healthy and accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Database status check failed${NC}"
    fi
}

# Main migration flow
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║      NAPOLEON AI DATABASE MIGRATION      ║"
    echo "║         Production Environment          ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_supabase_cli
    run_migrations
    seed_data
    verify_database
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════╗"
    echo "║        DATABASE MIGRATION COMPLETE       ║"
    echo "║                                          ║"
    echo "║  Your Napoleon AI database is ready!     ║"
    echo "║                                          ║"
    echo "║  Next steps:                             ║"
    echo "║  1. Configure environment variables      ║"
    echo "║  2. Test API integrations                ║"
    echo "║  3. Set up monitoring                    ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Run the migration
main "$@"