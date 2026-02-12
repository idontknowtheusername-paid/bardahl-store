-- Clean up duplicate and conflicting policies for products
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Public can read active products" ON public.products;
DROP POLICY IF EXISTS "Viewers can read products" ON public.products;

-- Keep only these for products:
-- 1. "Anyone can view active products" (already exists)
-- 2. "Admins and editors can manage products" (already exists)

-- Clean up duplicate and conflicting policies for categories
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Public can read active categories" ON public.categories;
DROP POLICY IF EXISTS "Viewers can read categories" ON public.categories;

-- Keep only these for categories:
-- 1. "Anyone can view active categories" (already exists)
-- 2. "Admins and editors can manage categories" (already exists)

-- Clean up duplicate policies for contact_messages
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Viewers can read contact messages" ON public.contact_messages;

-- Keep only these for contact_messages:
-- 1. "Anyone can submit contact messages" (already exists)
-- 2. "Admins and editors can manage contact messages" (already exists)

-- Clean up duplicate policies for newsletter_subscribers
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Viewers can read newsletter" ON public.newsletter_subscribers;

-- Keep only these for newsletter_subscribers:
-- 1. "Anyone can subscribe to newsletter" (already exists)
-- 2. "Subscribers can view their own subscription" (already exists)
-- 3. "Subscribers can update their subscription" (already exists)
-- 4. "Admins and editors can manage newsletter" (already exists)

-- Clean up duplicate policies for orders
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Keep only these for orders:
-- 1. "Anyone can create orders" (already exists)
-- 2. "Customers can view their own orders" (already exists)
-- 3. "Admins can manage orders" (already exists)
-- 4. "Editors and viewers can read orders" (already exists)

-- Clean up duplicate policies for user_roles
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Keep only these for user_roles:
-- 1. "Admins can manage user roles" (already exists)
-- 2. "Users can read their own role" (already exists)
