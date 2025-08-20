# Railway Dual Environment Setup

This guide explains how to set up separate beta and production environments on Railway.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Feature       │    │    develop      │    │     main        │
│   Branch        │───▶│   (Beta)        │───▶│  (Production)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌─────────┐            ┌─────────┐            ┌─────────┐
   │ CI/CD   │            │ Railway │            │ Railway │
   │ Tests   │            │ Beta    │            │Production│
   └─────────┘            └─────────┘            └─────────┘
```

## 🚀 Railway Setup

### 1. Create Two Railway Projects

#### Beta Environment:
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Name it: `normaize-beta` (or similar)
6. Set environment variables:
   ```
   NODE_ENV=production
   VITE_API_URL=https://your-beta-backend.railway.app
   ```

#### Production Environment:
1. Create another project
2. Name it: `normaize-production` (or similar)
3. Set environment variables:
   ```
   NODE_ENV=production
   VITE_API_URL=https://your-production-backend.railway.app
   ```

### 2. Configure Branch Deployments

#### Beta Project (Primary Development Environment):
- **Branch**: `develop` (Default repository branch)
- **Auto-deploy**: ✅ Enabled
- **Health check**: `/`
- **Purpose**: Continuous deployment of latest features for testing

#### Production Project (Stable Release Environment):
- **Branch**: `main` (Stable release branch)
- **Auto-deploy**: ✅ Enabled
- **Health check**: `/`
- **Purpose**: Stable releases after thorough testing in beta

## 🔐 GitHub Secrets Setup

Add these secrets to your GitHub repository:

### Required Secrets:
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_BETA_SERVICE_NAME=normaize-beta
RAILWAY_PRODUCTION_SERVICE_NAME=normaize-production
```

### How to Get Railway Token:
1. Go to Railway Dashboard
2. Click your profile → "Account Settings"
3. Go to "Tokens" tab
4. Click "New Token"
5. Copy the token

### How to Add GitHub Secrets:
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret above

## 🌿 Branch Strategy

### Workflow:
1. **Feature Development** (Start from default branch):
   ```bash
   git checkout develop  # Default branch for new development
   git pull origin develop
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create PR to develop (default target)
   ```

2. **Beta Testing**:
   ```bash
   # Merge to develop
   git checkout develop
   git merge feature/new-feature
   git push origin develop
   # Automatically deploys to beta
   ```

3. **Production Release**:
   ```bash
   # Merge to main (after beta testing)
   git checkout main
   git merge develop
   git push origin main
   # Automatically deploys to production
   ```

## 🔒 Branch Protection Rules

### For `develop` branch (Primary Development Branch):
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require pull request reviews (1 approval)
- ✅ Include administrators

### For `main` branch (Production Release Branch):
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require pull request reviews (1 approval)
- ✅ Require conversation resolution
- ✅ Include administrators

## 📋 Environment Variables

### Beta Environment:
```env
NODE_ENV=production
VITE_API_URL=https://your-beta-backend.railway.app
VITE_APP_ENV=beta
```

### Production Environment:
```env
NODE_ENV=production
VITE_API_URL=https://your-production-backend.railway.app
VITE_APP_ENV=production
```

## 🎯 Benefits of This Setup

### For Development:
- **Rapid iteration** - Deploy to beta quickly
- **Safe testing** - Test features without affecting production
- **Easy rollback** - Revert develop branch if needed

### For Production:
- **Stable releases** - Only tested code reaches production
- **Zero downtime** - No broken builds
- **Audit trail** - All changes tracked through PRs

### For Users:
- **Beta users** get latest features for testing
- **Production users** get stable, reliable experience
- **Clear separation** between testing and live environments

## 🚨 Troubleshooting

### Common Issues:

1. **Deployment not triggering**:
   - Check branch names match exactly
   - Verify Railway token is correct
   - Ensure secrets are properly set

2. **Environment variables not working**:
   - Check Railway project settings
   - Verify variable names match code
   - Restart deployment after changes

3. **CI/CD failing**:
   - Check GitHub Actions logs
   - Verify all required checks pass
   - Review branch protection rules

## 📊 Monitoring

### Beta Environment:
- Monitor for new feature issues
- Track performance regressions
- Collect user feedback

### Production Environment:
- Monitor uptime and performance
- Track error rates
- Monitor user experience metrics

## 🔄 Deployment Flow Example

```
1. Developer pushes to feature branch
   ↓
2. CI/CD runs tests
   ↓
3. PR created to develop
   ↓
4. Code review and approval
   ↓
5. Merge to develop
   ↓
6. Auto-deploy to beta
   ↓
7. Beta testing and validation
   ↓
8. PR created to main
   ↓
9. Code review and approval
   ↓
10. Merge to main
    ↓
11. Auto-deploy to production
```

This setup gives you a professional, scalable deployment pipeline with proper separation between development, testing, and production environments. 