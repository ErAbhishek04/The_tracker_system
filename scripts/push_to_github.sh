#!/usr/bin/env bash
# Turnkey script to push the complete FleetPulse codebase to https://github.com/ErAbhishek04/The_tracker

set -e

REPO_URL="https://github.com/ErAbhishek04/The_tracker.git"
BRANCH="main"

echo "=================================================="
echo " Pushing FleetPulse to $REPO_URL"
echo "=================================================="

# 1. Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    git config user.name "ErAbhishek04"
    git config user.email "takawaneabhishek04@gmail.com"
fi

# 2. Add all project files
git add fleetpulse/ scripts/ tests/ .github/ requirements.txt pyproject.toml Dockerfile docker-compose.yml README.md .gitignore || true

# 3. Commit
git commit -m "feat: complete FleetPulse sub-6ms XGBoost + Vector RAG + LLM trajectory predictor" || echo "No new changes to commit"

# 4. Set branch to main
git branch -M "$BRANCH"

# 5. Ensure remote is configured
if git remote | grep -q "origin"; then
    git remote set-url origin "$REPO_URL"
else
    git remote add origin "$REPO_URL"
fi

# 6. Push to remote
echo ""
echo "Attempting git push to $REPO_URL on branch $BRANCH..."
echo "If prompted, enter your GitHub Username and Personal Access Token (PAT) as password."
echo ""

git push -u origin "$BRANCH"
