# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with social providers (Google, GitHub), email verification, password reset, and profile photo uploads.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Google Cloud Console account (for Google OAuth)
- GitHub account (for GitHub OAuth)

## 1. Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be provisioned

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 3. Set Up Environment Variables

1. Copy `.env.local.example` to `.env.local`:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update the values in `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. For production, update `NEXT_PUBLIC_SITE_URL` to your deployed URL

## 4. Run Database Migrations

1. In Supabase Dashboard, go to SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste and run the SQL script
4. This will create:
   - Profiles table with avatar support
   - Storage buckets for avatars and recordings
   - Row Level Security (RLS) policies
   - Automatic profile creation trigger

## 5. Configure Email Settings

### Email Templates (Optional but Recommended)

1. Go to Authentication > Email Templates in Supabase
2. Customize the following templates:
   - **Confirm signup**: Sent when users sign up
   - **Reset password**: Sent when users request password reset
   - **Magic Link**: For passwordless login (optional)

### Email Provider (For Production)

For production, configure a custom SMTP provider:

1. Go to Settings > Auth
2. Scroll to SMTP Settings
3. Configure your email provider (SendGrid, AWS SES, etc.)

## 6. Configure Social Authentication

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth client ID
5. Select "Web application"
6. Add authorized redirect URIs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback (for local development)
   ```
7. Copy the Client ID and Client Secret
8. In Supabase Dashboard, go to Authentication > Providers
9. Enable Google provider
10. Paste your Client ID and Client Secret

### GitHub OAuth

1. Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000` (or your production URL)
   - **Authorization callback URL**: `https://your-project.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy the Client ID
6. Generate a new Client Secret and copy it
7. In Supabase Dashboard, go to Authentication > Providers
8. Enable GitHub provider
9. Paste your Client ID and Client Secret

## 7. Configure Email Verification

Email verification is enabled by default. To customize:

1. Go to Authentication > Settings in Supabase
2. Under "Email Auth", configure:
   - **Enable email confirmations**: ON (recommended)
   - **Secure email change**: ON (recommended)
   - **Double confirm email changes**: ON (optional)

## 8. Configure Storage for Profile Photos

The schema already creates the storage buckets, but verify:

1. Go to Storage in Supabase Dashboard
2. Verify these buckets exist:
   - **avatars** (public)
   - **recordings** (private)
3. The RLS policies are already set up via the schema

## 9. Install Required Dependencies

Run the following command to install the required package:

```bash
npm install @supabase/ssr
```

## 10. Test the Authentication Flow

### Test Email/Password Sign Up

1. Start your development server: `npm run dev`
2. Go to http://localhost:3000
3. Click "Get Started" or "Sign Up"
4. Enter your email and password
5. Check your email for the verification link
6. Click the link to verify your account
7. You should be redirected to the dashboard

### Test Social Login

1. Go to the login page
2. Click "Google" or "GitHub" button
3. Authorize the application
4. You should be redirected to the dashboard

### Test Password Reset

1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email
4. Check your email for the reset link
5. Click the link and set a new password

### Test Profile Photo Upload

1. Log in to your account
2. Go to Settings
3. Click on your profile photo
4. Select an image file
5. The photo should upload and display

## 11. Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SITE_URL` to your production URL
- [ ] Configure custom email SMTP provider
- [ ] Set up proper domain for email templates
- [ ] Update OAuth redirect URLs for production
- [ ] Enable rate limiting in Supabase
- [ ] Review and tighten RLS policies if needed
- [ ] Set up monitoring and alerts
- [ ] Test all authentication flows in production

## Troubleshooting

### Email verification not working

- Check SMTP settings in Supabase
- Verify email templates are properly configured
- Check spam folder
- Ensure `NEXT_PUBLIC_SITE_URL` is correct

### Social login redirect errors

- Verify OAuth redirect URIs match exactly
- Check that providers are enabled in Supabase
- Ensure Client ID and Secret are correct
- Check browser console for errors

### Profile photo upload fails

- Check storage bucket policies
- Verify RLS policies are correct
- Ensure file size is under 2MB
- Check file type is an image

### "Session not found" errors

- Clear browser cookies and try again
- Ensure middleware is properly configured
- Check that Supabase credentials are correct

## Support

For more information, refer to:

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router with Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs)
