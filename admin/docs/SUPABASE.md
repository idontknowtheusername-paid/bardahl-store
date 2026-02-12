# Supabase Configuration Guide

Complete guide for setting up Supabase backend for Cannesh Admin Pro.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Migrations](#migrations)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Storage Configuration](#storage-configuration)
6. [Edge Functions](#edge-functions)
7. [Authentication](#authentication)
8. [Secrets Management](#secrets-management)
9. [Backup & Restore](#backup--restore)

---

## Overview

Cannesh Admin Pro uses Supabase as its backend, which provides:

- **PostgreSQL Database** - All data storage
- **Authentication** - User management and sessions
- **Storage** - File uploads (product images)
- **Edge Functions** - Serverless functions for AI, emails, etc.
- **Row Level Security** - Data access control

---

## Database Schema

### Core Tables

#### `products`
Main product information with variants support.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  description JSONB,
  short_description TEXT,
  sku TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  style product_style,
  available_sizes TEXT[],
  available_colors JSONB,
  available_cup_sizes TEXT[],
  composition TEXT,
  care_instructions TEXT,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `product_images`
Product image gallery with ordering.

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `product_variants`
Size/color/cup size combinations with individual stock.

```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  color_code TEXT,
  cup_size TEXT,
  stock INTEGER DEFAULT 0,
  additional_price NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `categories`
Product categories with hierarchy support.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `orders`
Customer orders with shipping and payment info.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  subtotal NUMERIC NOT NULL,
  shipping_cost NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  shipping_first_name TEXT NOT NULL,
  shipping_last_name TEXT,
  shipping_email TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `promo_codes`
Discount codes with multiple types.

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC,
  max_discount_amount NUMERIC,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  buy_quantity INTEGER,
  get_quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `user_roles`
Admin user roles and permissions.

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role app_role DEFAULT 'customer',
  email TEXT,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE app_role AS ENUM ('admin', 'customer', 'editor', 'viewer');
```

---

## Migrations

### Running Migrations

#### Option 1: Supabase CLI (Recommended)

```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

#### Option 2: Manual via Dashboard

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy content from each migration file in `supabase/migrations/`
3. Run in order (sorted by filename)

### Migration Files

Located in `supabase/migrations/`:

1. `20260201174417_*.sql` - Initial schema
2. `20260201174436_*.sql` - Base tables
3. `20260202000000_create_promo_codes.sql` - Promo codes
4. `20260202120000_update_stock_default.sql` - Stock defaults
5. `20260202130000_update_promo_codes_types.sql` - Promo types
6. `20260202140000_simplify_variants_system.sql` - Variants
7. `20260203000000_update_categories.sql` - Categories
8. `20260203100000_create_blog_system.sql` - Blog
9. `20260203110000_create_blog_cron.sql` - Blog automation
10. `20260203120000_enhance_user_management.sql` - Users
11. `20260203130000_enhance_media_management.sql` - Media
12. `20260203140000_fix_admin_access_policies.sql` - RLS
13. `20260203150000_abandoned_cart_system.sql` - Cart recovery
14. `20260203160000_cleanup_policies.sql` - Policy cleanup

### Verify Migrations

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## Row Level Security (RLS)

### Admin Access

```sql
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

### Product Policies

```sql
-- Public can view active products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage products"
ON products FOR ALL
USING (is_admin());
```

### Order Policies

```sql
-- Users can view their own orders
CREATE POLICY "Users can view their orders"
ON orders FOR SELECT
USING (
  shipping_email = auth.jwt()->>'email' 
  OR is_admin()
);

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders"
ON orders FOR ALL
USING (is_admin());
```

### User Role Policies

```sql
-- Admins can view all user roles
CREATE POLICY "Admins can view user roles"
ON user_roles FOR SELECT
USING (is_admin());

-- Admins can manage user roles
CREATE POLICY "Admins can manage user roles"
ON user_roles FOR ALL
USING (is_admin());
```

---

## Storage Configuration

### Create Bucket

```sql
-- Create products bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);
```

### Storage Policies

```sql
-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

### File Size Limits

Configure in Supabase Dashboard → Storage → Settings:
- **Max file size**: 50MB (recommended)
- **Allowed MIME types**: image/jpeg, image/png, image/webp, image/gif

---

## Edge Functions

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy admin-create-user
```

### Required Functions

#### `admin-create-user`
Creates admin users with roles.

```bash
supabase functions deploy admin-create-user
```

#### `blog-generate`
Generates blog posts with AI.

```bash
supabase functions deploy blog-generate
```

#### `blog-auto-publish`
Auto-publishes scheduled blog posts.

```bash
supabase functions deploy blog-auto-publish
```

#### `mistral-ai`
AI chatbot for admin assistance.

```bash
supabase functions deploy mistral-ai
```

#### `send-email`
Sends transactional emails.

```bash
supabase functions deploy send-email
```

#### `abandoned-cart-recovery`
Sends cart recovery emails.

```bash
supabase functions deploy abandoned-cart-recovery
```

### Function Secrets

Set required secrets for Edge Functions:

```bash
# Mistral AI (for AI features)
supabase secrets set MISTRAL_API_KEY=your_key_here

# Resend (for emails)
supabase secrets set RESEND_API_KEY=your_key_here

# Admin email
supabase secrets set ADMIN_EMAIL=admin@yourstore.com

# Optional: Payment gateway
supabase secrets set LYGOS_API_KEY=your_key_here
supabase secrets set LYGOS_SECRET_KEY=your_key_here
```

### View Secrets

```bash
supabase secrets list
```

---

## Authentication

### Email/Password Auth

Enabled by default in Supabase.

### Configure Auth Settings

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your admin panel URL
   - **Redirect URLs**: Add your deployment URLs
   - **Email Templates**: Customize if needed

### Create Admin User

```sql
-- Insert into auth.users (use Supabase Dashboard UI instead)
-- Then add role:
INSERT INTO user_roles (user_id, role, email, full_name)
VALUES (
  'user-uuid-here',
  'admin',
  'admin@example.com',
  'Admin User'
);
```

---

## Secrets Management

### Set Secrets

```bash
# Via CLI
supabase secrets set KEY=value

# Multiple secrets
supabase secrets set \
  MISTRAL_API_KEY=xxx \
  RESEND_API_KEY=yyy \
  ADMIN_EMAIL=admin@example.com
```

### View Secrets

```bash
supabase secrets list
```

### Delete Secrets

```bash
supabase secrets unset KEY
```

---

## Backup & Restore

### Manual Backup

```bash
# Backup database
supabase db dump -f backup.sql

# Backup specific table
supabase db dump -t products -f products_backup.sql
```

### Restore from Backup

```bash
# Restore database
supabase db reset
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

### Automated Backups

Supabase Pro includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention (Pro plan)

---

## Performance Optimization

### Indexes

Key indexes are created automatically by migrations:

```sql
-- Product lookups
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);

-- Order lookups
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_email ON orders(shipping_email);

-- Category lookups
CREATE INDEX idx_categories_slug ON categories(slug);
```

### Query Optimization

Use `EXPLAIN ANALYZE` to check query performance:

```sql
EXPLAIN ANALYZE
SELECT * FROM products WHERE is_active = true;
```

---

## Monitoring

### Database Stats

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Row counts
SELECT 
  schemaname,
  tablename,
  n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Logs

View logs in Supabase Dashboard:
- **Database** → **Logs**
- **Edge Functions** → **Logs**
- **Storage** → **Logs**

---

## Troubleshooting

### Issue: RLS blocking queries

```sql
-- Temporarily disable RLS for testing (NOT for production!)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Re-enable
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### Issue: Migration fails

```bash
# Reset database (WARNING: deletes all data)
supabase db reset

# Re-run migrations
supabase db push
```

### Issue: Storage upload fails

Check policies:
```sql
SELECT * FROM storage.policies WHERE bucket_id = 'products';
```

---

## Security Checklist

- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] Admin users have proper roles
- [ ] Secrets are set (not in code)
- [ ] Auth redirect URLs configured
- [ ] Database backups enabled
- [ ] SSL/TLS enforced
- [ ] API keys rotated regularly

---

## Need Help?

- 📚 **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- 💬 **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- 📧 **Our Support**: support@cannesh-admin.com

---

**Your Supabase backend is now configured!** 🚀
