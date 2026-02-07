# Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
- GitHub account with the NCP repository
- Vercel account (sign up at https://vercel.com)
- Supabase project credentials
- Resend API key

### Step-by-Step Deployment

#### 1. Connect GitHub Repository to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Select the "NCP" repository from your GitHub account
5. Click "Import"

#### 2. Configure Environment Variables

In the Vercel dashboard, add the following environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration (CRITICAL - must be set)
NEXTAUTH_URL=https://ncp-alpha.vercel.app
NEXTAUTH_SECRET=your_random_secret_string

# Email Configuration
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

**⚠️ IMPORTANT - Common Issue Causing 401 Errors**

If users are getting `401 (Unauthorized)` on `/api/nurses/me` after signup or if signup "just loading", this is usually caused by:

1. **NEXTAUTH_SECRET not set or empty** — This is required for session encryption
2. **NEXTAUTH_URL mismatch** — Must match your deployed domain exactly
3. **Environment variables not redeployed** — Always redeploy after adding/changing env vars

**How to get these values:**

- **Supabase URL & Keys**: Go to your Supabase project → Settings → API
- **NEXTAUTH_SECRET**: Generate a secure random string:
  ```bash
  # On Windows (PowerShell):
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString())) | Cut-Object -First 1
  
  # Or use OpenSSL (if installed):
  openssl rand -base64 32
  
  # Or generate online: https://generate-secret.vercel.app/32
  ```
- **NEXTAUTH_URL**: Use your Vercel deploy URL (e.g., `https://ncp-alpha.vercel.app`)
- **RESEND_API_KEY**: Get from your Resend dashboard
- **FROM_EMAIL**: Your email domain

#### 3. Configure Build Settings

In the Vercel import settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### 4. Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 2-5 minutes)
3. Your application will be live at: `https://your-project-name.vercel.app`

### 5. Post-Deployment Configuration

#### Database Connection
Ensure your Supabase database allows connections from Vercel:
1. Go to Supabase project → Settings → Database
2. Under "Connection Pooling", add Vercel's IP ranges or allow all connections
3. Test the connection by accessing your application

#### Custom Domain (Optional)
1. In Vercel dashboard, go to your project → Settings → Domains
2. Add your custom domain
3. Configure DNS settings in your domain registrar

### 6. Environment Variables Management

#### Adding New Variables
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Click "Add" and enter the key-value pair
3. Click "Deploy" to apply changes

#### Updating Variables
1. Modify the existing variable value
2. Click "Deploy" to apply changes

### 7. Monitoring and Analytics

#### Vercel Analytics
- View deployment logs
- Monitor performance metrics
- Track visitor analytics
- Set up error tracking

#### Real-time Logs
1. Go to Vercel dashboard → Project → Functions
2. Click on specific functions to view logs
3. Use "Tail" for real-time log streaming

### 8. Redeployment Options

#### Automatic Deployment
- Every push to main/master branch triggers automatic deployment
- Pull requests create preview deployments

#### Manual Deployment
1. Go to Vercel dashboard → Project → Deployments
2. Click "New Deployment"
3. Select branch and deploy

### 9. Troubleshooting Common Issues

#### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure TypeScript compilation passes

#### 401 Unauthorized on `/api/nurses/me`
**Symptom**: GET request to `/api/nurses/me` returns 401 (Unauthorized)

**Root Cause**: No valid session exists (usually due to NextAuth misconfiguration)

**Solutions**:
1. **Verify NEXTAUTH_SECRET is set**:
   - Go to Vercel dashboard → Settings → Environment Variables
   - Confirm `NEXTAUTH_SECRET` exists and is not empty
   - ⚠️ It must be a non-empty string (recommended 32+ characters)

2. **Verify NEXTAUTH_URL matches your deployment**:
   - If deployed to `https://ncp-alpha.vercel.app`, set `NEXTAUTH_URL=https://ncp-alpha.vercel.app`
   - Must include `https://` and exact domain

3. **Redeploy after changing env vars**:
   - Even if env vars are set, you must trigger a new deployment
   - Go to Vercel dashboard → Deployments → Redeploy latest

4. **Test the auth flow**:
   - Clear browser cookies and localStorage
   - Test signup → auto-login → user should redirect to dashboard
   - If stuck on "loading", check browser console for errors

5. **Check diagnostics endpoint** (during development):
   - Visit `https://your-app.vercel.app/api/auth/diagnostics`
   - This shows if NEXTAUTH_SECRET is configured

#### Signup Page "Just Loading" Without Completing
**Symptom**: Signup form submits, shows loading state, but never completes

**Root Cause**: Usually the auto-login step (`signIn()`) is hanging or failing

**Solutions**:
1. **Check browser console**:
   - Open DevTools (F12)
   - Look for error messages in Console tab
   - Look for `[Register]` logs (they show signup progress)

2. **Verify database is reachable**:
   - Check Supabase project connectivity
   - Verify service role key has write permissions
   - Test query: `SELECT COUNT(*) FROM users`

3. **Check Supabase CORS settings**:
   - If registration fails at user creation, it might be CORS
   - Go to Supabase → Project Settings → API → CORS
   - Ensure your Vercel domain is allowed

4. **Verify email not already registered**:
   - If user account already exists in database, signup will fail
   - Check Supabase `users` table for duplicate email

5. **Manual workaround**:
   - If auto-login fails, user can manually navigate to `/login` and sign in

#### Runtime Errors
- Check function logs for error details
- Verify environment variables are correctly set
- Test database connectivity

#### Database Connection Issues
- Verify Supabase credentials in environment variables
- Check Supabase project settings for CORS
- Ensure database tables exist and are populated
- Test connection: Visit `https://your-app.vercel.app/api/auth/diagnostics`

### 10. Cost Management

#### Free Tier Limits
- 3 projects
- 100 GB bandwidth per month
- 10 serverless functions
- 10 build minutes per month

#### Monitoring Usage
- Check Vercel dashboard → Analytics → Usage
- Set up usage alerts
- Monitor build minutes

### 11. Security Considerations

#### Environment Variables
- Never commit sensitive data to Git
- Use Vercel's environment variable encryption
- Regularly rotate secrets

#### Access Control
- Use Vercel's team permissions
- Restrict deployment access
- Monitor deployment logs

### 12. Next Steps

#### Production Deployment
1. Test thoroughly in preview deployments
2. Ensure all environment variables are set
3. Monitor performance and errors
4. Set up custom domain if needed

#### Scaling
- Monitor usage metrics
- Upgrade to Pro plan if needed
- Consider edge functions for better performance

---

**Note**: Your deployment will be publicly accessible. For private testing, consider using Vercel's preview deployments with branch-specific URLs.