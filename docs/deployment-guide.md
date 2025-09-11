# GitHub Pages Deployment Guide

## Overview

This guide explains how to deploy the LabDojo Learning Platform to GitHub Pages, making it accessible via a public URL like `https://yourusername.github.io/your-repo-name`.

## Prerequisites

- GitHub account
- Git installed on your computer
- Project repository on GitHub
- Local development environment set up (see `local-development.md`)

## Deployment Methods

### Method 1: Automated GitHub Actions (Recommended)

This method automatically builds and deploys your site whenever you push changes to the main branch.

#### Step 1: Configure Vite for GitHub Pages

Update `vite.config.ts` to include the correct base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/your-repo-name/', // Replace with your actual repository name
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
```

#### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

#### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

#### Step 4: Deploy

Push your changes to the main branch:

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically build and deploy your site.

### Method 2: Manual Deployment

If you prefer manual control over deployments:

#### Step 1: Install gh-pages

```bash
npm install --save-dev gh-pages
```

#### Step 2: Add Deploy Script

Add to your `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

#### Step 3: Configure Vite Base Path

Update `vite.config.ts` as shown in Method 1.

#### Step 4: Deploy

```bash
npm run deploy
```

## Configuration Details

### Base Path Configuration

The `base` option in `vite.config.ts` must match your repository structure:

- For `https://username.github.io/repo-name/` use `base: '/repo-name/'`
- For custom domain use `base: '/'`
- For user/organization pages use `base: '/'`

### Router Configuration

Update your router to handle GitHub Pages base path:

```typescript
// src/App.tsx
import { BrowserRouter as Router } from 'react-router-dom';

const App = () => (
  <Router basename={import.meta.env.BASE_URL}>
    {/* Your routes */}
  </Router>
);
```

## Custom Domain Setup

### Step 1: Configure Domain

1. Create `public/CNAME` file with your domain:
```
your-domain.com
```

2. Configure DNS with your domain provider:
```
Type: CNAME
Name: www (or @)
Value: yourusername.github.io
```

### Step 2: Update Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // Use root path for custom domain
  // ... other config
});
```

### Step 3: Enable HTTPS

1. Go to repository Settings > Pages
2. Check "Enforce HTTPS"
3. Wait for SSL certificate provisioning

## Environment Variables

For production environment variables, use GitHub Secrets:

1. Go to repository Settings > Secrets and Variables > Actions
2. Add your secrets (e.g., `VITE_API_URL`)
3. Reference in GitHub Actions:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

## Monitoring Deployment

### Check Deployment Status

1. Go to **Actions** tab in your repository
2. View the latest workflow run
3. Check for any errors in the build process

### Access Your Site

After successful deployment:
- Visit `https://yourusername.github.io/repo-name/`
- Or your custom domain if configured

## Best Practices

### Pre-deployment Checklist

- [ ] Test build locally with `npm run build`
- [ ] Verify all routes work correctly
- [ ] Check all assets load properly
- [ ] Test on different devices/browsers
- [ ] Validate HTML and accessibility
- [ ] Check console for errors
- [ ] Verify meta tags and SEO

### Performance Optimization

```typescript
// Enable compression and optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    minify: 'terser',
    sourcemap: false, // Disable for production
  },
});
```

### SEO Configuration

Ensure proper meta tags in `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LabDojo Learning Platform</title>
  <meta name="description" content="Master tech skills with comprehensive learning paths" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="LabDojo Learning Platform" />
  <meta property="og:description" content="Transform your career with expert-designed tech courses" />
  <meta property="og:image" content="https://yourdomain.com/og-image.png" />
  <meta property="og:url" content="https://yourdomain.com" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="LabDojo Learning Platform" />
  <meta name="twitter:description" content="Master tech skills with comprehensive learning paths" />
  <meta name="twitter:image" content="https://yourdomain.com/twitter-image.png" />
</head>
```

## Troubleshooting Deployment

### Common Issues

**Build Fails**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build error messages in Actions tab

**404 Errors**
- Verify `base` path in `vite.config.ts`
- Check router configuration
- Ensure all routes are properly defined

**Assets Not Loading**
- Check asset paths are relative
- Verify public folder structure
- Check browser network tab for failed requests

**Slow Loading**
- Enable build optimizations
- Implement code splitting
- Optimize images and assets
- Enable compression

For more troubleshooting help, see `troubleshooting.md`.

## Maintenance

### Regular Updates

1. Keep dependencies updated
2. Monitor security vulnerabilities
3. Update Node.js version in GitHub Actions
4. Review and update documentation

### Backup Strategy

1. Regular git commits
2. Tag releases for important versions
3. Keep local backups of important data
4. Document deployment procedures

Your LabDojo Learning Platform is now ready for the world! 🚀
