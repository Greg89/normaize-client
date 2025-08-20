# Default Branch Setup Guide

This guide explains how to set the `develop` branch as the default branch for the normaize-client repository.

## 🎯 Why Change Default Branch to `develop`?

Based on our workflow and Railway deployment setup:

1. **Development Workflow**: New features should be developed against `develop` first
2. **Beta Testing**: `develop` branch deploys to beta environment for testing
3. **Pull Request Targets**: Most PRs should target `develop` by default
4. **Production Safety**: `main` remains stable for production deployments

## 🔧 How to Change the Default Branch

**⚠️ Important**: This must be done by a repository administrator through GitHub's web interface.

### Step 1: Navigate to Repository Settings

1. Go to your repository: `https://github.com/Greg89/normaize-client`
2. Click on **Settings** tab (requires admin access)
3. Scroll down to **General** section

### Step 2: Change Default Branch

1. In the **Default branch** section, click **Switch to another branch**
2. Select `develop` from the dropdown
3. Click **Update**
4. Confirm the change when prompted

### Step 3: Verify the Change

1. Visit the repository main page
2. Confirm that `develop` branch is now shown by default
3. Test cloning the repository to confirm it defaults to `develop`

## 📋 Post-Change Checklist

After changing the default branch:

- [ ] Update team documentation about the new default
- [ ] Inform contributors about the change
- [ ] Update any bookmarks or links that assume `main` as default
- [ ] Test that new clones default to `develop` branch
- [ ] Verify CI/CD workflows continue to work correctly

## 🔄 Impact on Existing Setup

### ✅ What Continues to Work

- **Railway Deployments**: No change needed
  - `develop` → Beta environment (unchanged)
  - `main` → Production environment (unchanged)
- **CI/CD Workflows**: Already configured for both branches
- **Branch Protection**: Rules remain the same
- **Deployment Flow**: `develop` → `main` flow unchanged

### 📝 What Changes

- **New Clones**: Will default to `develop` instead of `main`
- **GitHub UI**: Repository page shows `develop` by default
- **Pull Requests**: Will target `develop` by default
- **GitHub Compare**: Default comparisons will use `develop` as base

## 🚨 Important Notes

1. **No Code Changes Required**: All workflows already support both branches
2. **Production Safety**: `main` branch remains unchanged and protected
3. **Deployment Continuity**: All deployment configurations remain the same
4. **Team Communication**: Notify all contributors about this change

## 🔍 Verification Commands

After the change, team members can verify:

```bash
# Clone the repository
git clone https://github.com/Greg89/normaize-client.git
cd normaize-client

# Check current branch (should be 'develop')
git branch

# Verify remote tracking
git status
```

## 📞 Support

If you encounter any issues after changing the default branch:

1. Check that the branch protection rules are still in place
2. Verify CI/CD workflows are running on both branches
3. Confirm Railway deployments are still working
4. Contact the team if any unexpected behavior occurs

---

*This change aligns our repository default with our development workflow, making it easier for new contributors to target the correct branch for their contributions.*