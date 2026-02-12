# 🚀 DeadDrop - Render Deployment Guide

## Overview

This guide will help you deploy the DeadDrop frontend to Render.com using Docker.

---

## Prerequisites

✅ GitHub account with your DeadDrop repository  
✅ Render.com account (free tier available)  
✅ Smart contracts deployed to Monad Testnet  
✅ Environment variable values ready  

---

## Files Created

The following files have been created for deployment:

1. **`Dockerfile`** - Multi-stage Docker build
2. **`nginx.conf`** - Nginx configuration for React Router
3. **`.dockerignore`** - Exclude unnecessary files from Docker image
4. **`render.yaml`** - Render.com configuration (optional, for Infrastructure as Code)

---

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

#### Step 1: Push to GitHub

```bash
cd /home/voyager4/projects/DeadDrop

# Add all files
git add .

# Commit
git commit -m "Add Render deployment configuration"

# Push to your repository
git push origin main  # or master
```

#### Step 2: Connect to Render

1. Go to [https://render.com](https://render.com)
2. Sign in or create an account
3. Click **"New +"** → **"Web Service"**

#### Step 3: Connect Repository

1. Click **"Connect a repository"**
2. Authorize Render to access your GitHub
3. Select your DeadDrop repository
4. Click **"Connect"**

#### Step 4: Configure Service

**Basic Settings:**
- **Name:** `deaddrop-frontend` (or any name you prefer)
- **Region:** Choose closest to your users (e.g., Oregon, Frankfurt)
- **Branch:** `main` (or your default branch)
- **Runtime:** Select **"Docker"**

**Build Settings:**
- **Dockerfile Path:** `./Dockerfile` (auto-detected)
- **Docker Context:** `.` (root directory)

**Instance Type:**
- **Plan:** Free (or Starter for better performance)

#### Step 5: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add the following variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Production mode |
| `VITE_GEMINI_API_KEY` | `your_gemini_api_key` | Gemini API key |
| `VITE_DEAD_DROP_REGISTRY_ADDRESS` | `0xYour...Address` | Registry contract address |
| `VITE_DEAD_DROP_NFT_ADDRESS` | `0xYour...Address` | NFT contract address |

**Optional (if using Supabase for RAG):**
| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `your_supabase_url` |
| `VITE_SUPABASE_ANON_KEY` | `your_supabase_key` |

**Important:** Keep "Secret File" toggle OFF for environment variables (they're used during build)

#### Step 6: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Build the Docker image
   - Deploy to their infrastructure
3. Wait 3-5 minutes for the build to complete

#### Step 7: Access Your App

Once deployed, you'll get a URL like:
```
https://deaddrop-frontend.onrender.com
```

Visit this URL to see your live app! 🎉

---

### Option 2: Deploy via render.yaml (Infrastructure as Code)

#### Step 1: Update render.yaml

Edit `/home/voyager4/projects/DeadDrop/render.yaml`:

```yaml
services:
  - type: web
    name: deaddrop-frontend
    env: docker
    region: oregon
    plan: free
    
    dockerfilePath: ./Dockerfile
    dockerContext: .
    
    envVars:
      - key: VITE_GEMINI_API_KEY
        value: your_actual_key_here  # Or use sync: true
      
      - key: VITE_DEAD_DROP_REGISTRY_ADDRESS
        value: 0xYourActualAddress
```

#### Step 2: Connect via Blueprint

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your repository
3. Render will auto-detect `render.yaml`
4. Review settings
5. Click **"Apply"**

---

## Docker Build & Test Locally

Before deploying, test the Docker build locally:

```bash
# Build the image
docker build -t deaddrop-frontend .

# Run locally
docker run -p 8080:80 \
  -e VITE_GEMINI_API_KEY=your_key \
  -e VITE_DEAD_DROP_REGISTRY_ADDRESS=0xYour...Address \
  -e VITE_DEAD_DROP_NFT_ADDRESS=0xYour...Address \
  deaddrop-frontend

# Visit http://localhost:8080
```

**Stop the container:**
```bash
docker ps  # Get container ID
docker stop <container_id>
```

---

## How the Deployment Works

### Multi-Stage Build

**Stage 1: Builder**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build  # Creates /app/dist
```

**Stage 2: Production**
```dockerfile
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Benefits:**
- ✅ Small final image (~20MB vs 200MB+)
- ✅ Only production files included
- ✅ Nginx serves static files efficiently
- ✅ Fast startup time

### Nginx Configuration

The `nginx.conf` file:
- ✅ Serves React Router properly (all routes → index.html)
- ✅ Gzip compression for faster loading
- ✅ Cache static assets (images, CSS, JS)
- ✅ Security headers
- ✅ Health check endpoint at `/health`

---

## Environment Variables at Build Time

**Important:** Vite embeds environment variables at BUILD time!

This means:
1. When Render builds your Docker image, it reads env vars
2. Vite replaces `import.meta.env.VITE_*` with actual values
3. These values are baked into the JavaScript bundle
4. Changing env vars after deployment requires a rebuild

**To update env vars:**
1. Go to Render dashboard
2. Update environment variable
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Render will rebuild with new values

---

## Custom Domain (Optional)

### Step 1: Add Custom Domain

1. In Render dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `deaddrop.yourname.com`)

### Step 2: Update DNS

Add a CNAME record in your DNS provider:

| Type | Name | Value |
|------|------|-------|
| CNAME | deaddrop | deaddrop-frontend.onrender.com |

### Step 3: Wait for SSL

Render will automatically provision an SSL certificate (5-10 minutes).

Once done, your app will be accessible at:
```
https://deaddrop.yourname.com
```

---

## Monitoring & Logs

### View Logs

1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. See real-time deployment and runtime logs

### Health Checks

Render automatically monitors your service via the `/health` endpoint.

If the health check fails, Render will:
- Show service as "Unhealthy"
- Attempt to restart the service
- Send alerts (if configured)

---

## Troubleshooting

### Build Fails

**Error: "npm: command not found"**
- ✅ Check Dockerfile uses correct Node version
- ✅ Ensure `FROM node:18-alpine` is present

**Error: "vite: command not found"**
- ✅ Check `package.json` has vite in dependencies
- ✅ Run `npm install` locally first
- ✅ Commit `package-lock.json`

**Error: "Missing environment variable"**
- ✅ Check all `VITE_*` variables are set in Render
- ✅ Variable names match exactly (case-sensitive)
- ✅ No spaces in variable names

### App Shows 404

**Nginx not configured for React Router:**
- ✅ Check `nginx.conf` is copied to the container
- ✅ Verify `try_files $uri $uri/ /index.html;` is present

### Environment Variables Not Working

**Variables undefined in browser:**
- ✅ Must start with `VITE_` prefix
- ✅ Set during Docker build (not runtime)
- ✅ Rebuild after changing env vars

### Service Won't Start

**Port conflict:**
- ✅ Dockerfile exposes port 80
- ✅ Render automatically maps to their load balancer
- ✅ Don't change EXPOSE port

---

## Optimization Tips

### 1. Enable Caching

Render caches Docker layers. To optimize:

```dockerfile
# Copy package files first (cached if unchanged)
COPY package*.json ./
RUN npm ci

# Then copy source (changes more often)
COPY . .
RUN npm run build
```

### 2. Reduce Image Size

Current setup already uses:
- ✅ Alpine Linux (minimal)
- ✅ Multi-stage build (no build tools in final image)
- ✅ Production dependencies only

### 3. Enable CDN (Paid Plans)

Render Pro/Team plans include CDN:
- Faster global delivery
- Automatic edge caching
- DDoS protection

---

## Cost Breakdown

### Free Tier
- ✅ 750 hours/month free
- ✅ Automatic SSL
- ✅ Custom domain
- ⚠️ Spins down after 15min inactivity
- ⚠️ 100GB bandwidth/month

**Best for:** Testing, personal projects, demos

### Starter ($7/month)
- ✅ Always on (no spin down)
- ✅ 100GB bandwidth
- ✅ Faster build times

**Best for:** Production apps, hackathon submissions

### Pro ($25/month)
- ✅ Everything in Starter
- ✅ CDN included
- ✅ 500GB bandwidth
- ✅ Priority support

**Best for:** High-traffic production apps

---

## Deployment Checklist

Before deploying:

- [ ] Smart contracts deployed to Monad Testnet
- [ ] Contract addresses saved
- [ ] `.env.example` updated with all required variables
- [ ] Code committed to GitHub
- [ ] Dockerfile tested locally
- [ ] All environment variables ready

After deploying:

- [ ] Visit deployment URL
- [ ] Test wallet connection
- [ ] Generate a mystery
- [ ] Test mystery solving
- [ ] Check stats and leaderboard
- [ ] Verify contract interactions work
- [ ] Test on mobile

---

## Continuous Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Builds new Docker image
# 3. Deploys to production
# 4. Zero-downtime rollout
```

**Disable auto-deploy:**
1. Go to service settings
2. Toggle "Auto-Deploy" off
3. Use "Manual Deploy" button instead

---

## Alternative: Build Command Deployment

If you prefer not to use Docker, you can deploy with build commands:

**render.yaml (alternative):**
```yaml
services:
  - type: web
    name: deaddrop-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

**Pros:**
- Simpler setup
- No Docker knowledge needed

**Cons:**
- Larger build cache
- Less control over server config
- No nginx optimizations

---

## Support & Resources

**Render Docs:**
- https://render.com/docs/docker
- https://render.com/docs/deploy-vite

**DeadDrop Docs:**
- See `DEPLOYMENT_CHECKLIST.md`
- See `ENV_SETUP_GUIDE.md`

**Community:**
- Render Discord: https://discord.gg/render
- GitHub Issues: Your repo

---

## Summary

✅ Dockerfile created (multi-stage build)  
✅ nginx.conf created (React Router support)  
✅ .dockerignore created (optimize build)  
✅ render.yaml created (optional IaC)  

**Next Steps:**
1. Push code to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy!

**Your app will be live at:**
```
https://deaddrop-frontend.onrender.com
```

---

**Happy Deploying! 🚀**

