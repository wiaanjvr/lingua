# Quick Setup: Google & GitHub OAuth

## Current Status

✅ Code is already implemented  
❌ OAuth providers not configured in Supabase

## Setup Instructions

### Google OAuth Setup (5 minutes)

#### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - User Type: **External**
   - App name: **Lingua** (or your app name)
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through the rest

#### 2. Configure OAuth Client

1. Application type: **Web application**
2. Name: **Lingua Web App**
3. **Authorized redirect URIs** - Add this URL:
   ```
   https://gvywexphfrcavyzdmyul.supabase.co/auth/v1/callback
   ```
4. Click **Create**
5. **Copy the Client ID and Client Secret** (you'll need these next)

#### 3. Add to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** in the list
5. Toggle it **ON**
6. Paste your **Client ID**
7. Paste your **Client Secret**
8. Click **Save**

✅ **Google login is now active!**

---

### GitHub OAuth Setup (3 minutes)

#### 1. Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: Lingua
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**:
     ```
     https://gvywexphfrcavyzdmyul.supabase.co/auth/v1/callback
     ```
4. Click **Register application**

#### 2. Get Credentials

1. Copy the **Client ID**
2. Click **Generate a new client secret**
3. **Copy the Client Secret** (you won't see it again!)

#### 3. Add to Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **GitHub** in the list
5. Toggle it **ON**
6. Paste your **Client ID**
7. Paste your **Client Secret**
8. Click **Save**

✅ **GitHub login is now active!**

---

## Testing

### Test Google Login

1. Go to http://localhost:3000/auth/login
2. Click the **Google** button
3. Sign in with your Google account
4. You should be redirected to the dashboard
5. Check Settings page - your Google photo should appear as your avatar

### Test GitHub Login

1. Go to http://localhost:3000/auth/login
2. Click the **GitHub** button
3. Authorize the application
4. You should be redirected to the dashboard

---

## For Production

When you deploy to production, you'll need to:

### Update Google OAuth

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add production redirect URI:
   ```
   https://your-domain.com/auth/callback
   https://gvywexphfrcavyzdmyul.supabase.co/auth/v1/callback
   ```

### Update GitHub OAuth

1. Go back to GitHub OAuth Apps
2. Edit your application
3. Update **Homepage URL** to your production domain
4. Keep the Supabase callback URL the same

---

## Troubleshooting

**"Redirect URI mismatch" error**

- Make sure the callback URL is exactly: `https://gvywexphfrcavyzdmyul.supabase.co/auth/v1/callback`
- No trailing slashes
- Must use HTTPS (except localhost)

**"Access blocked" on Google**

- Make sure OAuth consent screen is configured
- Add your test email to test users if using External user type

**GitHub authorization fails**

- Verify callback URL matches exactly
- Check that OAuth app is not suspended

**Social login works but no avatar**

- This is normal - the avatar will sync on next login or profile update
- OAuth providers automatically set the avatar_url in the profile

---

## What Happens When Users Log In?

1. User clicks Google/GitHub button
2. Redirected to provider for authentication
3. User authorizes the app
4. Provider redirects back to Supabase with auth code
5. Supabase exchanges code for user info
6. Database trigger automatically creates profile with:
   - Email from provider
   - Full name from provider
   - Avatar URL from provider
7. User redirected to dashboard

All automatic! 🎉
