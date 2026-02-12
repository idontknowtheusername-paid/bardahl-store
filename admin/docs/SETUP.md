# Setup Guide - Cannesh Admin Pro

Complete installation and configuration guide for Cannesh Admin Pro.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Supabase Configuration](#supabase-configuration)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Create Admin User](#create-admin-user)
7. [Optional Services](#optional-services)
8. [Development](#development)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Supabase Account** ([Sign up free](https://supabase.com))

### Optional (for full features)

- **Resend Account** for emails ([Sign up](https://resend.com))
- **Mistral AI Account** for AI features ([Sign up](https://mistral.ai))
- **Git** for version control

### System Requirements

- **RAM**: 512MB minimum, 1GB recommended
- **Storage**: 500MB for dependencies
- **OS**: Windows, macOS, or Linux

---

## Installation

### Step 1: Extract Files

```bash
# If you downloaded a ZIP
unzip cannesh-admin-pro.zip
cd cannesh-admin-pro

# If you cloned from Git
git clone <your-repo-url>
cd cannesh-admin-pro
```

### Step 2: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install
```

This will install all required packages (~200MB).

---

## Supabase Configuration

### Step 1: Create Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: Your project name (e.g., "My Store Admin")
   - **Database Password**: Strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get API Credentials

1. In your project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **Project ID** (in Project Settings)

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_FRONTEND_URL=http://localhost:5173
```

---

## Database Setup

### Method 1: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push
```

### Method 2: Manual via Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Run migrations in order from `supabase/migrations/` folder:
   - `20260201174417_*.sql`
   - `20260201174436_*.sql`
   - `20260202000000_create_promo_codes.sql`
   - `20260202120000_update_stock_default.sql`
   - `20260202130000_update_promo_codes_types.sql`
   - `20260202140000_simplify_variants_system.sql`
   - `20260203000000_update_categories.sql`
   - `20260203100000_create_blog_system.sql`
   - `20260203110000_create_blog_cron.sql`
   - `20260203120000_enhance_user_management.sql`
   - `20260203130000_enhance_media_management.sql`
   - `20260203140000_fix_admin_access_policies.sql`
   - `20260203150000_abandoned_cart_system.sql`
   - `20260203160000_cleanup_policies.sql`

3. Click **"Run"** for each migration

### Step 3: Configure Storage

1. Go to **Storage** in Supabase Dashboard
2. Create a bucket named **`products`**
3. Set it to **Public**
4. Configure policies:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');
```

---

## Create Admin User

### Method 1: Using SQL Script (Recommended)

1. Open `create-admin.sql` in the project root
2. Edit the email and password:

```sql
-- Change these values
INSERT INTO auth.users (email, encrypted_password, ...)
VALUES ('your-email@example.com', ...);
```

3. Run in Supabase SQL Editor

### Method 2: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: your-secure-password
   - **Auto Confirm**: Yes
4. Click **"Create user"**

5. Then run this SQL to make them admin:

```sql
INSERT INTO user_roles (user_id, role, email, full_name)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your-email@example.com'),
  'admin',
  'your-email@example.com',
  'Admin User'
);
```

---

## Optional Services

### Resend (Email Notifications)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from **API Keys** section
3. Add to `.env`:

```env
RESEND_API_KEY=re_your_api_key_here
```

4. Set in Supabase Edge Function secrets:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### Mistral AI (Product Descriptions & Chatbot)

1. Sign up at [console.mistral.ai](https://console.mistral.ai)
2. Create an API key
3. Add to `.env`:

```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

4. Set in Supabase Edge Function secrets:

```bash
supabase secrets set MISTRAL_API_KEY=your_mistral_api_key_here
```

### Lygos (Payment Gateway - Optional)

If you're using Lygos for payments:

```bash
supabase secrets set LYGOS_API_KEY=your_lygos_api_key
supabase secrets set LYGOS_SECRET_KEY=your_lygos_secret_key
```

---

## Development

### Start Development Server

```bash
npm run dev
```

The admin panel will be available at: **http://localhost:5173**

### Login

Use the admin credentials you created earlier:
- **Email**: your-email@example.com
- **Password**: your-secure-password

### Hot Reload

The development server supports hot module replacement (HMR). Changes to your code will automatically reload in the browser.

---

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel deploy --prod
```

3. Set environment variables in Vercel Dashboard:
   - Go to **Settings** → **Environment Variables**
   - Add all variables from `.env`

### Netlify

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Build:

```bash
npm run build
```

3. Deploy:

```bash
netlify deploy --prod --dir=dist
```

4. Set environment variables in Netlify Dashboard

### Manual Deployment

1. Build the project:

```bash
npm run build
```

2. Upload the `dist/` folder to your hosting provider

3. Configure environment variables on your hosting platform

4. Ensure `vercel.json` rewrites are configured (for SPA routing):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Deploy Edge Functions

### Using Supabase CLI

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy admin-create-user
```

### Required Edge Functions

- `admin-create-user` - Create admin users
- `blog-generate` - AI blog generation
- `blog-auto-publish` - Auto-publish scheduled posts
- `mistral-ai` - AI chatbot
- `send-email` - Email notifications
- `abandoned-cart-recovery` - Cart recovery emails

---

## Troubleshooting

### Issue: "Cannot connect to Supabase"

**Solution:**
- Check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
- Ensure Supabase project is active (not paused)
- Check browser console for CORS errors

### Issue: "Login not working"

**Solution:**
- Verify user exists in **Authentication** → **Users**
- Check `user_roles` table has entry with `role = 'admin'`
- Ensure RLS policies are enabled

### Issue: "Images not uploading"

**Solution:**
- Check storage bucket `products` exists and is public
- Verify storage policies allow uploads
- Check browser console for errors
- Ensure file size is under 50MB

### Issue: "Edge Functions timing out"

**Solution:**
- Check function logs in Supabase Dashboard
- Verify secrets are set correctly
- Increase timeout in function settings

### Issue: "Build fails"

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Try building again
npm run build
```

### Issue: "404 on page refresh in production"

**Solution:**
- Ensure `vercel.json` exists with rewrites configuration
- For Netlify, add `_redirects` file:
```
/*    /index.html   200
```

---

## Post-Installation Checklist

- [ ] Supabase project created
- [ ] Database migrations run successfully
- [ ] Storage bucket `products` created and configured
- [ ] Admin user created and can login
- [ ] Environment variables configured
- [ ] Edge Functions deployed (if using AI/email features)
- [ ] Development server runs without errors
- [ ] Can create/edit products
- [ ] Can upload images
- [ ] Can manage orders
- [ ] Production deployment successful

---

## Next Steps

1. **Customize branding**: Update colors, logo, and site name in Settings
2. **Add products**: Start adding your product catalog
3. **Configure shipping**: Set up shipping zones and rates
4. **Test orders**: Create test orders to verify workflow
5. **Connect frontend**: Link your customer-facing store

---

## Need Help?

- 📧 **Email**: support@cannesh-admin.com
- 📚 **Docs**: Check other documentation files
- 💬 **Discord**: [Join our community](https://discord.gg/your-invite)

---

**Congratulations! Your admin panel is ready to use.** 🎉
