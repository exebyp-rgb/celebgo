# Quick Deployment Script for CELEBGO

## Prerequisites
- Wrangler CLI installed ✅
- Project built ✅
- Cloudflare API Token (needed)

## Step 1: Create Cloudflare API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers" or create custom with:
   - Permissions: `Account > Cloudflare Pages > Edit`
   - Account Resources: Include > Your Account
4. Copy the token

## Step 2: Set Environment Variable

**Option A: Temporary (for this session only)**
```powershell
$env:CLOUDFLARE_API_TOKEN="your_token_here"
```

**Option B: Permanent**
1. Open System Properties → Environment Variables
2. Add new User variable:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: `your_token_here`

## Step 3: Deploy to Cloudflare Pages

Run from project directory:

```powershell
cd C:\Users\memfm\.gemini\antigravity\scratch\celebgo
wrangler pages deploy dist --project-name=celebgo
```

## Step 4: Configure Custom Domain

After deployment, Wrangler will output a URL like: `https://celebgo.pages.dev`

To add custom domain:

```powershell
wrangler pages domain add celebgo.com --project-name=celebgo
```

## Step 5: Set Environment Variables in Production

```powershell
# MapTiler Key (you need to provide this)
wrangler pages secret put PUBLIC_MAPTILER_KEY --project-name=celebgo

# Ticketmaster Keys
wrangler pages secret put PUBLIC_TICKETMASTER_KEY --project-name=celebgo
# Enter: 1YZdteJmXFEEIqZJxdGWSamC9VslmP

wrangler pages secret put TICKETMASTER_SECRET --project-name=celebgo  
# Enter: tLYQO73iIGGBbNND
```

## Alternative: Deploy via Dashboard

If you prefer GUI:

1. Go to https://dash.cloudflare.com
2. Navigate to "Workers & Pages"
3. Click "Upload assets"
4. Drag and drop the `dist` folder
5. Name: `celebgo`
6. Deploy

Then add environment variables in Settings → Environment Variables.

## Verify Deployment

After deployment, visit:
- Production: https://celebgo.com (once domain is active)
- Preview: https://celebgo.pages.dev

## Next Steps

1. Wait for domain DNS to propagate (24-48 hours)
2. Enable "Always Use HTTPS" in Cloudflare SSL/TLS settings
3. Test all functionality
4. Monitor performance in Cloudflare Analytics
