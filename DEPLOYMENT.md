# Deployment Guide

## Vercel Deployment (Recommended)

Lingua is optimized for deployment on Vercel's free tier.

### Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up

### Steps

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Custom Domain** (Optional)
   - After deployment, go to Project Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

### Environment Variables

Make sure to set these in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For payments (when implemented):

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Alternative: Netlify

1. **Deploy to Netlify**

   ```bash
   npm install -g netlify-cli
   netlify login
   netlify init
   netlify deploy --prod
   ```

2. **Configure Environment Variables**
   - In Netlify dashboard: Site Settings > Build & deploy > Environment
   - Add the same variables as above

## Post-Deployment Checklist

- [ ] Test authentication (sign up, log in, log out)
- [ ] Test learning session flow
- [ ] Verify audio playback works
- [ ] Check recording functionality
- [ ] Test on mobile devices
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Configure analytics (Plausible or similar)
- [ ] Set up backups for Supabase database

## Scaling Considerations

### Free Tier Limits

- **Vercel Free**:
  - 100GB bandwidth/month
  - Serverless function execution: 100GB-hours/month
  - Build execution: 6000 minutes/month

- **Supabase Free**:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

### When to Upgrade

- Database > 400MB: Upgrade Supabase to Pro ($25/month)
- Bandwidth > 80GB/month: Upgrade Vercel to Pro ($20/month)
- Need analytics/monitoring: Add Vercel Analytics ($10/month)

## Monitoring

### Recommended Tools

- **Error tracking**: Sentry (free tier available)
- **Analytics**: Plausible Analytics (privacy-friendly)
- **Uptime monitoring**: UptimeRobot (free)
- **Performance**: Vercel Analytics or Cloudflare Web Analytics

### Health Check Endpoints

Create `/api/health` route to monitor:

- Database connectivity
- Authentication service
- External API availability
