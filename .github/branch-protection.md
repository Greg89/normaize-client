# Branch Protection Setup

To prevent bad deployments, set up branch protection rules in your GitHub repository:

## 🔒 Required Branch Protection Rules

### For `main` branch:

1. **Go to Settings > Branches**
2. **Add rule for `main` branch**
3. **Configure the following settings:**

#### ✅ Require status checks to pass before merging
- **Status checks that are required:**
  - `lint-and-type-check`
  - `build-and-test`
  - `security-audit`
  - `performance-check`

#### ✅ Require branches to be up to date before merging
- Ensures PRs are based on the latest main branch

#### ✅ Require pull request reviews before merging
- **Required approving reviews:** 1
- **Dismiss stale PR approvals when new commits are pushed:** ✅
- **Require review from code owners:** ✅ (if you have CODEOWNERS)

#### ✅ Require conversation resolution before merging
- Ensures all review comments are addressed

#### ✅ Require signed commits
- **Require signed commits:** ✅
- **Require linear history:** ✅

#### ✅ Include administrators
- **Include administrators:** ✅
- Ensures even repo admins follow the rules

### For `develop` branch (if using):

Apply similar rules but with fewer restrictions:
- Require status checks
- Require PR reviews (1 approval)
- Require branches to be up to date

## 🚫 What This Prevents

1. **Broken builds** - Code that doesn't compile
2. **Linting errors** - Code style violations
3. **Type errors** - TypeScript compilation issues
4. **Security vulnerabilities** - Known security issues
5. **Performance regressions** - Significant performance drops
6. **Direct pushes to main** - All changes must go through PRs
7. **Unreviewed code** - All code must be reviewed

## 🔧 Railway Integration

With these protections in place:

### Beta Environment (`develop` branch):
1. **Railway beta service deploys from `develop` branch**
2. **All code must pass CI checks before merging to develop**
3. **All code must be reviewed before merging to develop**
4. **No direct pushes to develop are allowed**

### Production Environment (`main` branch):
1. **Railway production service deploys from `main` branch**
2. **All code must pass CI checks before merging to main**
3. **All code must be reviewed before merging to main**
4. **No direct pushes to main are allowed**

### Deployment Flow:
```
Feature Branch → develop (Beta) → main (Production)
     ↓              ↓              ↓
   CI Tests    Beta Deploy   Production Deploy
```

This ensures that:
- **Beta gets latest features** for testing
- **Production gets stable, tested code**
- **No broken builds** reach either environment

## 📋 Setup Checklist

- [ ] Configure branch protection rules
- [ ] Set up required status checks
- [ ] Configure PR review requirements
- [ ] Test the workflow with a PR
- [ ] Verify Railway deployment only happens from main
- [ ] Document the process for your team

## 🎯 Benefits

- **Zero-downtime deployments** - No broken builds
- **Code quality** - Consistent standards
- **Security** - Vulnerabilities caught early
- **Performance** - Regressions prevented
- **Team collaboration** - Code review enforced
- **Audit trail** - All changes tracked 