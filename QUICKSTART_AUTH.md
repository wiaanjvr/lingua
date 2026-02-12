# Quick Start Guide - Supabase Authentication

## Before You Begin

1. **Install the required package**:

   ```bash
   npm install @supabase/ssr
   ```

   ✅ Already installed!

2. **Create a Supabase account**: https://supabase.com

## 5-Minute Setup

### Step 1: Create Supabase Project

- Go to https://app.supabase.com
- Click "New Project"
- Fill in details and wait for provisioning

### Step 2: Get Credentials

In Supabase Dashboard → Settings → API, copy:

- Project URL
- anon/public key

### Step 3: Configure Environment

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Run Database Migration

1. In Supabase Dashboard → SQL Editor
2. Copy ALL contents of `supabase/schema.sql`
3. Paste and click "Run"

### Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and test:

- ✅ Sign up with email (check inbox for verification)
- ✅ Sign in
- ✅ Password reset
- ✅ Profile settings
- ✅ Upload profile photo

## Optional: Social Login Setup

### Google OAuth (5 minutes)

1. Google Cloud Console → Create OAuth Client
2. Add redirect: `https://xxxxx.supabase.co/auth/v1/callback`
3. Copy Client ID & Secret
4. Supabase Dashboard → Auth → Providers → Google
5. Paste credentials

### GitHub OAuth (3 minutes)

1. GitHub Settings → Developer Settings → OAuth Apps
2. Create app with callback: `https://xxxxx.supabase.co/auth/v1/callback`
3. Copy Client ID & Secret
4. Supabase Dashboard → Auth → Providers → GitHub
5. Paste credentials

## What You Get

✅ **Email/Password Authentication**

- Secure signup and login
- Email verification required
- Password strength validation

✅ **Password Recovery**

- Self-service password reset
- Secure time-limited tokens
- Email delivery

✅ **Social Login** (when configured)

- Google Sign-In
- GitHub Sign-In
- Automatic profile creation

✅ **User Profiles**

- Customizable profile information
- Profile photo uploads (up to 2MB)
- Language preferences
- Proficiency level tracking
- Learning interests

✅ **Security**

- Row Level Security (RLS) on all tables
- Secure file storage policies
- Cookie-based session management
- Server-side authentication checks

## File Structure

```
Authentication Files:
├── src/
│   ├── lib/supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── middleware.ts      # Session handler
│   ├── app/
│   │   ├── auth/
│   │   │   ├── actions.ts     # Server actions
│   │   │   ├── login/         # Login page
│   │   │   ├── signup/        # Signup page
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   ├── callback/      # OAuth/Email callback
│   │   │   └── auth-code-error/
│   │   └── settings/          # Profile management
│   └── middleware.ts          # Root middleware
├── supabase/
│   └── schema.sql             # Database schema
├── .env.local                 # Your credentials
└── .env.local.example         # Template

Documentation:
├── SUPABASE_SETUP.md          # Detailed setup guide
├── AUTHENTICATION_SUMMARY.md  # Implementation details
└── QUICKSTART_AUTH.md         # This file
```

## Testing Checklist

After setup, test these flows:

- [ ] Sign up with email
- [ ] Check email and verify account
- [ ] Sign in with verified account
- [ ] Sign out
- [ ] Request password reset
- [ ] Check email for reset link
- [ ] Set new password
- [ ] Sign in with new password
- [ ] Navigate to Settings
- [ ] Upload profile photo
- [ ] Update profile information
- [ ] Sign in with Google (if configured)
- [ ] Sign in with GitHub (if configured)

## Common Issues

### "Invalid API key"

→ Double-check your `.env.local` credentials match Supabase dashboard

### "Email not verified"

→ Check spam folder or resend verification email

### Social login not working

→ Verify OAuth redirect URIs match exactly in provider console

### Profile photo upload fails

→ Ensure database migration ran successfully (check storage buckets exist)

### Type errors with @supabase/ssr

→ Restart your IDE/TypeScript server

## Production Deployment

Before deploying:

1. Update `NEXT_PUBLIC_SITE_URL` to your production URL
2. Update OAuth redirect URLs in Google/GitHub
3. Configure custom SMTP for emails (Supabase Settings)
4. Review RLS policies for your use case
5. Set up monitoring and error tracking

## Need Help?

- 📖 Full setup guide: `SUPABASE_SETUP.md`
- 📋 Implementation details: `AUTHENTICATION_SUMMARY.md`
- 🌐 Supabase docs: https://supabase.com/docs
- 💬 Supabase Discord: https://discord.supabase.com

---

**Ready to go?** Run `npm run dev` and visit http://localhost:3000 to get started!
