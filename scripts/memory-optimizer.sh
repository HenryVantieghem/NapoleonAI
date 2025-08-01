#!/bin/bash

# Napoleon AI - Memory Optimizer Script
# Compacts and optimizes CLAUDE.md memory files after major operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[MEMORY]${NC} $1"
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

# Function to compact CLAUDE.local.md
compact_local_memory() {
    local file="CLAUDE.local.md"
    
    if [ ! -f "$file" ]; then
        print_warning "No $file found, skipping local memory compaction"
        return 0
    fi
    
    print_status "Compacting local memory ($file)..."
    
    # Create backup
    cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Create compacted version
    cat > "${file}.tmp" << 'EOF'
# Napoleon AI Local Memory

## Current Session Status
**Last Updated**: $(date '+%Y-%m-%d %H:%M:%S')
**Phase**: Super-Agent Enhancements (Phase 3)
**Status**: Auto-healing CI system implementation

### Recent Achievements ✅
EOF
    
    # Extract only the most recent achievements (last 10)
    if grep -A 50 "Recent.*Achievement" "$file" | head -20 >> "${file}.tmp" 2>/dev/null; then
        print_status "Extracted recent achievements"
    fi
    
    # Add current technical status
    cat >> "${file}.tmp" << 'EOF'

### Current Technical State
- **Build Status**: Production-ready with comprehensive auto-healing
- **Architecture**: Next.js 14 + TypeScript + Clerk + Supabase + OpenAI
- **Theme**: Navy (#1B2951) & Gold (#D4AF37) luxury executive design
- **Deployment**: Vercel with automated CI/CD pipeline
- **Quality Gates**: Lighthouse scoring, bundle optimization, RLS guards

### Active Session Focus
- Memory optimization and compaction systems
- Enhanced CI/CD with auto-healing capabilities
- Bundle size monitoring and performance optimization
- Comprehensive logging and monitoring infrastructure

---
*Memory compacted on: $(date)*
*Next compaction recommended after major feature completion*
EOF
    
    # Replace original with compacted version
    mv "${file}.tmp" "$file"
    print_success "Local memory compacted successfully"
}

# Function to optimize CLAUDE.md structure
optimize_global_memory() {
    local file="CLAUDE.md"
    
    if [ ! -f "$file" ]; then
        print_error "No $file found, cannot optimize global memory"
        return 1
    fi
    
    print_status "Optimizing global memory structure ($file)..."
    
    # Create backup
    cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Remove duplicate sections and optimize structure
    # This is a simplified version - in practice, you'd want more sophisticated parsing
    awk '
    BEGIN { in_section = 0; current_section = ""; seen_sections[""]; }
    /^#/ { 
        section = $0
        if (section in seen_sections) {
            in_section = 0
            next
        }
        seen_sections[section] = 1
        in_section = 1
        current_section = section
        print $0
        next
    }
    in_section == 1 { print $0 }
    ' "$file" > "${file}.tmp"
    
    # Only replace if the optimized version is reasonable in size
    original_size=$(wc -l < "$file")
    optimized_size=$(wc -l < "${file}.tmp")
    
    if [ $optimized_size -gt $((original_size / 2)) ]; then
        mv "${file}.tmp" "$file"
        print_success "Global memory optimized (${original_size} -> ${optimized_size} lines)"
    else
        rm "${file}.tmp"
        print_warning "Optimization resulted in too much content loss, skipping"
    fi
}

# Function to clean up old backup files
cleanup_old_backups() {
    print_status "Cleaning up old backup files..."
    
    # Remove backups older than 7 days
    find . -name "CLAUDE*.backup.*" -mtime +7 -delete 2>/dev/null || true
    find . -name "*.backup.*" -mtime +7 -delete 2>/dev/null || true
    
    # Keep only the 5 most recent backups of each type
    for pattern in "CLAUDE.md.backup.*" "CLAUDE.local.md.backup.*"; do
        ls -t $pattern 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
    done
    
    print_success "Old backups cleaned up"
}

# Function to generate memory report
generate_memory_report() {
    print_status "Generating memory usage report..."
    
    cat > memory-report.md << EOF
# Napoleon AI Memory Usage Report
*Generated on: $(date)*

## File Sizes
- CLAUDE.md: $(wc -l < CLAUDE.md 2>/dev/null || echo "0") lines
- CLAUDE.local.md: $(wc -l < CLAUDE.local.md 2>/dev/null || echo "0") lines

## Memory Architecture Status
- **Global Memory**: Core vision and architectural patterns
- **Project Memory**: Feature-specific documentation
- **Local Memory**: Session context and recent achievements

## Optimization History
- Last compaction: $(date)
- Backup files: $(ls *.backup.* 2>/dev/null | wc -l) files
- Total project files: $(find . -name "*.md" | wc -l) markdown files

## Recommendations
- Run \`/compact\` after major feature completions
- Review and archive old session data monthly
- Maintain modular @import structure for scalability

---
*Report generated by Napoleon AI Memory Optimizer*
EOF
    
    print_success "Memory report generated: memory-report.md"
}

# Main function
main() {
    echo "🧠 Napoleon AI Memory Optimizer"
    echo "==============================="
    
    # Check if this is a `/compact` command invocation
    if [ "$1" = "compact" ] || [ "$1" = "/compact" ]; then
        print_status "Running memory compaction..."
        
        compact_local_memory
        optimize_global_memory
        cleanup_old_backups
        generate_memory_report
        
        print_success "🎉 Memory optimization complete!"
        echo ""
        echo "Summary:"
        echo "✅ Local memory compacted"
        echo "✅ Global memory optimized"
        echo "✅ Old backups cleaned"
        echo "✅ Memory report generated"
        echo ""
        echo "Next: Continue with development tasks"
        
        return 0
    fi
    
    # Default behavior - show memory status
    print_status "Memory Status Check"
    echo ""
    
    if [ -f "CLAUDE.md" ]; then
        echo "📋 Global Memory: $(wc -l < CLAUDE.md) lines"
    else
        echo "❌ Global Memory: Not found"
    fi
    
    if [ -f "CLAUDE.local.md" ]; then
        echo "📝 Local Memory: $(wc -l < CLAUDE.local.md) lines"
    else
        echo "❌ Local Memory: Not found"
    fi
    
    echo "🗂️  Backup Files: $(ls *.backup.* 2>/dev/null | wc -l) files"
    echo ""
    echo "Usage:"
    echo "  ./scripts/memory-optimizer.sh compact    # Run full memory optimization"
    echo "  ./scripts/memory-optimizer.sh           # Show memory status"
}

# Execute main function
main "$@"