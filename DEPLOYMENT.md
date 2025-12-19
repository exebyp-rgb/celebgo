# CELEBGO - Cloudflare Pages Deployment Guide

## Quick Start

This guide will help you deploy CELEBGO to Cloudflare Pages and configure the custom domain celebgo.com.

## Current Status

✅ Domain: celebgo.com registered via Namecheap  
✅ Nameservers: Switched to Cloudflare  
⏳ Cloudflare Status: Pending (waiting for DNS propagation, 24-48 hours)  
✅ SSL/TLS: Full mode configured  
✅ Project: Built and ready to deploy

## Prerequisites

- [x] Cloudflare account with domain added
- [x] Project built locally (`npm run build`)
- [ ] API keys ready for environment variables

## Step 1: Rebuild the Project

```bash
cd C:\Users\memfm\.gemini\antigravity\scratch\celebgo
npm run build
```

This will create/update the `dist/` directory with the production build.

## Step 2: Create Cloudflare Pages Project

### Option A: Using Wrangler CLI (Recommended)

1. Install Wrangler globally (if not already installed):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy to Cloudflare Pages:
```bash
wrangler pages deploy dist --project-name=celebgo
```

### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** → **Pages**
3. Click **Create application** → **Pages** → **Upload assets**
4. Project name: `celebgo`
5. Upload the `dist` folder
6. Click **Deploy site**

## Step 3: Configure Environment Variables

In Cloudflare Pages project settings:

1. Go to **Settings** → **Environment variables**
2. Add the following variables for **Production**:

```
PUBLIC_MAPTILER_KEY = <your_maptiler_key>
PUBLIC_TICKETMASTER_KEY = 1YZdteJmXFEEIqZJxdGWSamC9VslmP
TICKETMASTER_SECRET = tLYQO73iIGGBbNND
```

> **Note**: You'll need to provide your MapTiler API key

## Step 4: Connect Custom Domain

1. In Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `celebgo.com`
4. Click **Continue**
5. Cloudflare will automatically configure DNS records

Additionally, add `www.celebgo.com`:
1. Click **Set up a custom domain** again
2. Enter: `www.celebgo.com`
3. Click **Continue**

## Step 5: Configure DNS (if needed)

The DNS should be automatically configured, but verify:

1. Go to **DNS** → **Records** in your Cloudflare zone
2. You should see:
   - `celebgo.com` → CNAME → `celebgo.pages.dev` (Proxied)
   - `www.celebgo.com` → CNAME → `celebgo.pages.dev` (Proxied)

## Step 6: Enable Security Features

1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable:
   - ✅ **Always Use HTTPS**
   - ✅ **Automatic HTTPS Rewrites** (already enabled)
   - ✅ **Minimum TLS Version**: 1.2

## Step 7: Verify Deployment

1. Wait for domain to become Active (24-48 hours for full propagation)
2. Visit https://celebgo.com
3. Test:
   - Map loads correctly
   - Events display on map
   - Popups work
   - Filters work (Tonight, This Week)

## Troubleshooting

### Domain shows "Pending"
- This is normal, wait for DNS propagation (24-48 hours)
- You can still access via `celebgo.pages.dev` URL

### Map doesn't load
- Check that `PUBLIC_MAPTILER_KEY` is set in environment variables
- Rebuild and redeploy if you added variables after first deployment

### Events don't display
- Ensure `dist/events` directory contains all data files
- Check browser console for errors

## Performance Optimization

Cloudflare Pages automatically provides:
- ✅ Global CDN
- ✅ HTTP/3 support
- ✅ Brotli compression
- ✅ Image optimization

## Automatic Deployments (Optional)

To enable automatic deployments:

1. Push code to GitHub repository
2. In Cloudflare Pages, choose **Connect to Git**
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`
5. Environment variables will be preserved

## Support

For issues, check:
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Cloudflare Docs](https://docs.astro.build/en/guides/deploy/cloudflare/)
