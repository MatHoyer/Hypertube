#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Define multiple i18n directories to check
I18N_DIRS=(
    "apps/client/src/lib/i18n"
    "apps/server/src/lib/i18n"
)

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed${NC}"
    exit 1
fi

echo -e "${GREEN}Checking translation completeness across multiple directories...${NC}"
echo

# Function to get all keys from JSON recursively
get_all_keys() {
    local file=$1
    jq -r 'paths(scalars) as $p | $p | join(".")' "$file" | sort
}

# Check each i18n directory
overall_missing_found=false

for I18N_DIR in "${I18N_DIRS[@]}"; do
    # Check if directory exists
    if [ ! -d "$I18N_DIR" ]; then
        echo -e "${YELLOW}⚠ Skipping $I18N_DIR - directory not found${NC}"
        echo
        continue
    fi
    
    ENGLISH_FILE="$I18N_DIR/en.json"
    
    # Check if English file exists in this directory
    if [ ! -f "$ENGLISH_FILE" ]; then
        echo -e "${YELLOW}⚠ Skipping $I18N_DIR - no en.json found${NC}"
        echo
        continue
    fi
    
    echo -e "${GREEN}=== Checking directory: ${YELLOW}$I18N_DIR${NC} ${GREEN}===${NC}"
    echo -e "Reference file: ${YELLOW}$ENGLISH_FILE${NC}"
    
    # Get all keys from English file
    echo "Extracting keys from reference file..."
    english_keys=$(get_all_keys "$ENGLISH_FILE")
    english_count=$(echo "$english_keys" | wc -l)
    echo -e "Found ${GREEN}$english_count${NC} keys in English file"
    echo
    
    # Check all other JSON files in the current i18n directory
    missing_found=false
    
    for file in "$I18N_DIR"/*.json; do
        # Skip the English file itself
        if [ "$file" = "$ENGLISH_FILE" ]; then
            continue
        fi
        
        filename=$(basename "$file")
        echo -e "Checking ${YELLOW}$filename${NC}..."
        
        # Get keys from current file
        current_keys=$(get_all_keys "$file")
        current_count=$(echo "$current_keys" | wc -l)
        
        # Find missing keys
        missing_keys=$(comm -23 <(echo "$english_keys") <(echo "$current_keys"))
        missing_count=$(echo "$missing_keys" | grep -c .)
        
        # Find extra keys (keys in current file but not in English)
        extra_keys=$(comm -13 <(echo "$english_keys") <(echo "$current_keys"))
        extra_count=$(echo "$extra_keys" | grep -c .)
        
        if [ -n "$missing_keys" ] && [ "$missing_count" -gt 0 ]; then
            echo -e "  ${RED}✗ Missing $missing_count keys:${NC}"
            echo "$missing_keys" | sed 's/^/    /'
            missing_found=true
            overall_missing_found=true
        else
            echo -e "  ${GREEN}✓ All keys present${NC}"
        fi
        
        if [ -n "$extra_keys" ] && [ "$extra_count" -gt 0 ]; then
            echo -e "  ${YELLOW}⚠ Extra $extra_count keys (not in English):${NC}"
            echo "$extra_keys" | sed 's/^/    /'
        fi
        
        echo -e "  Keys: $current_count/$english_count"
        echo
    done
    
    if [ "$missing_found" = false ]; then
        echo -e "${GREEN}✅ All translations complete in $I18N_DIR${NC}"
    else
        echo -e "${RED}❌ Missing translations found in $I18N_DIR${NC}"
    fi
    echo
done

# Summary
echo -e "${GREEN}=== FINAL SUMMARY ===${NC}"
if [ "$overall_missing_found" = true ]; then
    echo -e "${RED}❌ Translation check failed - missing keys found${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All translation files are complete across all directories${NC}"
fi
