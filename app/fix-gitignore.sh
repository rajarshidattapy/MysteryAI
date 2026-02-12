#!/bin/bash
# Fix node_modules in git - Run this script to remove node_modules from git tracking

echo "🔧 Removing node_modules from git tracking..."

# Remove node_modules from git index (staging area)
git rm -r --cached node_modules

# Add the changes
git add .gitignore

# Commit the fix
git commit -m "fix: Remove node_modules from git tracking"

echo "✅ Done! node_modules is now ignored by git"
echo ""
echo "Next steps:"
echo "1. Push your changes: git push"
echo "2. The .gitignore file will now properly ignore node_modules"

