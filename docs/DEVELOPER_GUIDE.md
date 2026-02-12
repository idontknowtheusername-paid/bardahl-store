# E-Commerce Platform - Complete Developer Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Frontend (Customer-Facing)](#frontend-customer-facing)
5. [Admin Panel](#admin-panel)
6. [Backend (Supabase)](#backend-supabase)
7. [Database Schema](#database-schema)
8. [Edge Functions](#edge-functions)
9. [Authentication & Authorization](#authentication--authorization)
10. [File Storage](#file-storage)
11. [Internationalization (i18n)](#internationalization-i18n)
12. [Deployment](#deployment)
13. [Environment Variables](#environment-variables)
14. [API Reference](#api-reference)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

This is a full-stack e-commerce platform built with:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Shadcn/UI
- **Admin Panel**: Separate React application with the same stack
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7

### Key Features

- Product catalog with variants (size, color, cup size)
- Category and collection management
- Order management with status tracking
- Promo codes (percentage, fixed, free shipping, buy X get Y)
- Customer management
- Newsletter subscriptions
- Contact form with admin replies
- Blog with AI generation
- Multi-language admin panel (FR, EN, ES)
- Floating chatbot assistant for admins

---

## Architecture

```
project/
├── src/                    # Frontend (customer-facing)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── lib/
│   └── integrations/
├── admin/                  # Admin panel
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── i18n/           # Translations
│   │   ├── pages/
│   │   └── lib/
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
└── docs/                   # Documentation
```

### Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Supabase  │◀───│   Admin     │
│   (React)   │    │  (Backend)  │    │   Panel     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │
                   ┌──────┴──────┐
                   ▼             ▼
            ┌───────────┐  ┌───────────┐
            │ PostgreSQL│  │  Storage  │
            │    DB     │  │  (Media)  │
            └───────────┘  └───────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or npm
- Supabase account (or Lovable Cloud)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd <project-name>

# Install frontend dependencies
npm install

# Install admin dependencies
cd admin && npm install
```

### Development

```bash
# Start frontend (port 8080)
npm run dev

# Start admin (port 5174 by default)
cd admin && npm run dev
```

---

## Frontend (Customer-Facing)

### Structure

```
src/
├── components/
│   ├── home/           # Homepage sections
│   ├── layout/         # Header, Footer
│   ├── product/        # Product cards, galleries
│   └── ui/             # Shadcn components
├── hooks/
│   ├── use-cart.tsx    # Cart state management
│   ├── use-promo-code.ts
│   └── use-supabase-api.ts
├── pages/
│   ├── Index.tsx       # Homepage
│   ├── ProductDetail.tsx
│   ├── Checkout.tsx
│   └── ...
└── lib/
    ├── supabase.ts     # Supabase client
    ├── utils.ts        # Utility functions
    └── api-payment.ts  # Payment integration
```

### Key Hooks

#### `useCart`

Manages cart state with localStorage persistence.

```typescript
const { items, addToCart, removeFromCart, updateQuantity, total, clearCart } = useCart();
```

#### `usePromoCode`

Validates and applies promo codes.

```typescript
const { applyPromoCode, removePromoCode, discount, promoCode } = usePromoCode();
```

#### `useSupabaseApi`

Fetches data from Supabase with React Query.

```typescript
const { products, categories, collections, isLoading } = useSupabaseApi();
```

### Payment Integration

The payment system uses the Lygos API through edge functions:

```typescript
// src/lib/api-payment.ts
export async function initiatePayment(orderData: OrderData): Promise<PaymentResponse>
export async function verifyPayment(transactionId: string): Promise<VerificationResult>
```

---

## Admin Panel

### Structure

```
admin/src/
├── components/
│   ├── layout/
│   │   └── AdminLayout.tsx    # Main layout with sidebar
│   ├── ChatWidget.tsx         # AI assistant
│   └── ProtectedRoute.tsx     # Auth guard
├── context/
│   ├── AuthContext.tsx        # Authentication
│   └── LanguageContext.tsx    # i18n
├── i18n/
│   ├── translations/
│   │   ├── fr.ts              # French (default)
│   │   ├── en.ts              # English
│   │   └── es.ts              # Spanish
│   └── index.ts
├── pages/
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── ProductEdit.tsx
│   ├── Categories.tsx
│   ├── Collections.tsx
│   ├── Orders.tsx
│   ├── OrderDetail.tsx
│   ├── Customers.tsx
│   ├── Users.tsx
│   ├── PromoCodes.tsx
│   ├── BlogPosts.tsx
│   ├── Media.tsx
│   ├── Newsletter.tsx
│   ├── ContactMessages.tsx
│   ├── Shipping.tsx
│   ├── Settings.tsx
│   └── Login.tsx
└── lib/
    ├── supabase.ts
    ├── utils.ts
    └── types.ts
```

### Pages Overview

| Page | Description |
|------|-------------|
| Dashboard | Overview with stats, charts, recent orders |
| Products | CRUD for products with variants and images |
| Categories | Manage product categories |
| Collections | Seasonal/thematic product groupings |
| Orders | Order management with status updates |
| Customers | Customer list from orders |
| Users | Admin user management with roles |
| PromoCodes | Create/manage discount codes |
| BlogPosts | Blog with AI content generation |
| Media | File library (Supabase Storage) |
| Newsletter | Subscriber management |
| ContactMessages | Customer inquiries with replies |
| Shipping | Zones and rates configuration |
| Settings | Site settings + language toggle |

### Admin Roles

```typescript
type AppRole = 'admin' | 'editor' | 'viewer' | 'customer';
```

- **admin**: Full access to all features
- **editor**: Can edit content but not manage users/settings
- **viewer**: Read-only access
- **customer**: No admin access

---

## Backend (Supabase)

### Database Schema

#### Products

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
  meta_image_url TEXT,
  enable_variants BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Product Images

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

#### Product Variants

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

#### Categories

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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  payment_method TEXT,
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
  shipping_postal_code TEXT,
  customer_note TEXT,
  admin_note TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enums
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 
  'shipped', 'delivered', 'cancelled', 'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'failed', 'refunded'
);
```

#### Promo Codes

```sql
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage', 'fixed', 'free_shipping', 'buy_x_get_y'
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC,
  max_discount_amount NUMERIC,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  applies_to_product_ids TEXT[],
  buy_quantity INTEGER, -- For buy X get Y
  get_quantity INTEGER, -- For buy X get Y
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### User Roles

```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role app_role DEFAULT 'customer',
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE app_role AS ENUM ('admin', 'customer', 'editor', 'viewer');
```

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

```sql
-- Public read access for products
CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT USING (is_active = true);

-- Admin write access
CREATE POLICY "Admins can manage products"
ON products FOR ALL USING (is_admin());

-- Orders: customers see their own
CREATE POLICY "Users can view their orders"
ON orders FOR SELECT USING (
  shipping_email = auth.jwt()->>'email' OR is_admin()
);
```

### Database Functions

```sql
-- Check if user is admin
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$ LANGUAGE sql SECURITY DEFINER;

-- Generate order number
CREATE FUNCTION generate_order_number() RETURNS TEXT AS $$
BEGIN
  RETURN 'CMD-' || upper(to_char(now(), 'YYYYMMDD')) || '-' || 
         upper(substr(md5(random()::text), 1, 6));
END;
$$ LANGUAGE plpgsql;
```

---

## Edge Functions

### Available Functions

| Function | Purpose | Method |
|----------|---------|--------|
| `initiate-payment` | Start Lygos payment | POST |
| `verify-payment` | Check payment status | POST |
| `calculate-shipping` | Get shipping rates | POST |
| `blog-generate` | Generate blog with AI | POST |
| `blog-auto-publish` | Auto-publish scheduled posts | POST |
| `mistral-ai` | AI chat for admin assistant | POST |
| `admin-create-user` | Create admin users | POST |
| `send-email` | Send transactional emails | POST |
| `abandoned-cart-recovery` | Send recovery emails | POST |

### Example: Payment Initiation

```typescript
// supabase/functions/initiate-payment/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  const { orderId, amount, customerEmail, customerPhone } = await req.json();
  
  const response = await fetch('https://api.lygos.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LYGOS_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      currency: 'XOF',
      customer_email: customerEmail,
      customer_phone: customerPhone,
      order_id: orderId,
      callback_url: `${Deno.env.get('FRONTEND_URL')}/checkout/callback`
    })
  });
  
  return new Response(JSON.stringify(await response.json()), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

---

## Authentication & Authorization

### Flow

1. User signs in via Supabase Auth
2. Check `user_roles` table for role
3. Admin panel requires `admin` or `editor` role
4. RLS policies enforce data access

### Creating Admin Users

```typescript
// Via Edge Function
const response = await supabase.functions.invoke('admin-create-user', {
  body: {
    email: 'admin@example.com',
    password: 'securepassword',
    role: 'admin',
    fullName: 'Admin User'
  }
});
```

### Protected Routes (Admin)

```tsx
// admin/src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  const { user, isAdmin, isLoading } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user || !isAdmin) return <Navigate to="/login" />;
  
  return children;
}
```

---

## File Storage

### Buckets

- `products` - Product images and media (public)

### Upload Example

```typescript
const uploadImage = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('products')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};
```

### Image Optimization

For uploads, the admin panel includes client-side compression:

```typescript
const compressImage = async (file: File): Promise<Blob> => {
  const maxWidth = 1920;
  const quality = 0.85;
  // ... compression logic
};
```

---

## Internationalization (i18n)

### Supported Languages

- French (fr) - Default
- English (en)
- Spanish (es)

### Usage

```tsx
// In components
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t.dashboard.title}</h1>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

### Adding New Translations

1. Add keys to `admin/src/i18n/translations/fr.ts`
2. Copy to `en.ts` and `es.ts` with translations
3. TypeScript ensures all keys are present

---

## Deployment

### Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Environment variables needed:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FRONTEND_URL=https://yoursite.com
```

### Admin Panel (Vercel/Netlify)

```bash
cd admin
npm run build

# Environment variables:
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FRONTEND_URL=https://yoursite.com
```

### Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function-name
```

---

## Environment Variables

### Frontend (.env)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FRONTEND_URL=https://yoursite.com
```

### Admin (.env)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_FRONTEND_URL=https://yoursite.com
```

### Supabase Secrets

```bash
# Required secrets for edge functions
supabase secrets set LYGOS_API_KEY=xxx
supabase secrets set RESEND_API_KEY=xxx
supabase secrets set MISTRAL_API_KEY=xxx
```

---

## API Reference

### Products

```typescript
// Fetch all products
const { data } = await supabase
  .from('products')
  .select(`
    *,
    product_images(*),
    product_variants(*),
    product_categories(category:categories(*))
  `)
  .eq('is_active', true);

// Fetch single product by slug
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('slug', 'product-slug')
  .single();
```

### Orders

```typescript
// Create order
const { data } = await supabase
  .from('orders')
  .insert({
    order_number: 'CMD-20240101-ABC123',
    subtotal: 10000,
    total: 10500,
    shipping_first_name: 'John',
    shipping_email: 'john@example.com',
    shipping_phone: '+221771234567',
    shipping_city: 'Dakar'
  })
  .select()
  .single();

// Update order status
const { data } = await supabase
  .from('orders')
  .update({ status: 'shipped', tracking_number: 'XXX123' })
  .eq('id', orderId);
```

### Promo Codes

```typescript
// Validate promo code
const { data } = await supabase
  .from('promo_codes')
  .select('*')
  .eq('code', 'DISCOUNT20')
  .eq('is_active', true)
  .gte('valid_until', new Date().toISOString())
  .single();
```

---

## Troubleshooting

### Common Issues

#### 1. Admin Login Not Working

- Ensure user exists in `auth.users`
- Check `user_roles` table has entry with `role = 'admin'`
- Verify RLS policies are correct

#### 2. Images Not Uploading

- Check storage bucket `products` exists
- Verify storage policies allow uploads
- Check file size limits

#### 3. Edge Functions Timing Out

- Increase timeout in function settings
- Check for infinite loops
- Verify external API responses

#### 4. i18n Not Working

- Ensure `LanguageProvider` wraps the app
- Check localStorage for saved language
- Verify translation keys exist in all language files

### Debug Queries

```sql
-- Check user roles
SELECT * FROM user_roles WHERE email = 'admin@example.com';

-- Check recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check storage files
SELECT * FROM storage.objects WHERE bucket_id = 'products';
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
