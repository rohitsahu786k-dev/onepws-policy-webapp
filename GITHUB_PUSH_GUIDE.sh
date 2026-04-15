#!/bin/bash
# GitHub Push Helper Script

echo "📤 Preparing to push to GitHub..."
echo "Repository: https://github.com/rohitsahu786k-dev/onepws-policy-webapp.git"
echo ""

# Check if repository exists on GitHub
echo "🔍 Verifying remote repository..."
git remote set-url origin "https://github.com/rohitsahu786k-dev/onepws-policy-webapp.git"

# Display git status
echo ""
echo "📊 Git Status:"
git status

echo ""
echo "📝 Commits to push:"
git log origin/main..main --oneline 2>/dev/null || git log --oneline -n 5

echo ""
echo "✅ Ready to push! Use one of these options:"
echo ""
echo "Option 1 - Using GitHub CLI (recommended):"
echo "  gh auth login"
echo "  git push -u origin main"
echo ""
echo "Option 2 - Using Personal Access Token:"
echo "  1. Go to: https://github.com/settings/tokens"
echo "  2. Create a token with 'repo' scope"
echo "  3. Run: git push -u origin main"
echo "  4. When prompted for password, paste the token"
echo ""
echo "Option 3 - Using SSH (if configured):"
echo "  git remote set-url origin git@github.com:rohitsahu786k-dev/onepws-policy-webapp.git"
echo "  git push -u origin main"
