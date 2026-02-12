# Customization Guide

Learn how to customize Cannesh Admin Pro to match your brand and needs.

---

## Table of Contents

1. [Branding](#branding)
2. [Colors & Theme](#colors--theme)
3. [Logo & Favicon](#logo--favicon)
4. [Typography](#typography)
5. [Layout](#layout)
6. [Adding Custom Pages](#adding-custom-pages)
7. [Modifying Existing Pages](#modifying-existing-pages)
8. [Custom Fields](#custom-fields)
9. [Translations](#translations)
10. [Email Templates](#email-templates)

---

## Branding

### Site Name

Edit `src/lib/constants.ts`:

```typescript
export const SITE_CONFIG = {
  name: 'Your Store Admin',
  description: 'Manage your e-commerce store',
  url: 'https://admin.yourstore.com'
};
```

### Metadata

Update `index.html`:

```html
<head>
  <title>Your Store Admin</title>
  <meta name="description" content="Your store admin panel" />
</head>
```

---

## Colors & Theme

### Primary Colors

Edit `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Your brand colors
        primary: {
          DEFAULT: '#E91E63', // Rose
          foreground: '#FFFFFF'
        },
        // Or use CSS variables
        rose: 'hsl(var(--rose))',
      }
    }
  }
}
```

### CSS Variables

Edit `src/index.css`:

```css
:root {
  /* Your brand colors */
  --rose: 340 82% 52%;
  --rose-foreground: 0 0% 100%;
  
  /* Background */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  
  /* Accent */
  --accent: 340 82% 52%;
  --accent-foreground: 0 0% 100%;
}

/* Dark mode */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Component Styling

Override Shadcn components in `src/components/ui/`:

```typescript
// src/components/ui/button.tsx
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "bg-rose text-white hover:bg-rose/90",
        // Add custom variants
        brand: "bg-gradient-to-r from-rose to-pink-500"
      }
    }
  }
)
```

---

## Logo & Favicon

### Logo

1. Add your logo to `public/logo.svg` or `public/logo.png`

2. Update `src/components/layout/AdminLayout.tsx`:

```tsx
<div className="flex items-center gap-2">
  <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
  <span className="font-bold">Your Store</span>
</div>
```

### Favicon

Replace `public/favicon.ico` with your favicon.

For multiple sizes, add to `index.html`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## Typography

### Fonts

#### Using Google Fonts

1. Add to `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. Update `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    }
  }
}
```

#### Using Custom Fonts

1. Add font files to `public/fonts/`

2. Define in `src/index.css`:

```css
@font-face {
  font-family: 'YourFont';
  src: url('/fonts/YourFont.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
```

3. Update Tailwind config as above

---

## Layout

### Sidebar

Edit `src/components/layout/AdminLayout.tsx`:

#### Add/Remove Menu Items

```tsx
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Products', path: '/products' },
  // Add your custom item
  { icon: YourIcon, label: 'Your Feature', path: '/your-feature' },
];
```

#### Change Sidebar Width

```tsx
<aside className="w-64"> {/* Change from w-64 to w-72, w-80, etc. */}
```

#### Collapsible Sidebar

Add state and toggle:

```tsx
const [collapsed, setCollapsed] = useState(false);

<aside className={collapsed ? 'w-16' : 'w-64'}>
  <button onClick={() => setCollapsed(!collapsed)}>
    <Menu />
  </button>
</aside>
```

### Header

Edit header in `AdminLayout.tsx`:

```tsx
<header className="h-16 border-b bg-white">
  <div className="flex items-center justify-between px-6">
    {/* Add custom header content */}
    <YourComponent />
  </div>
</header>
```

---

## Adding Custom Pages

### Step 1: Create Page Component

Create `src/pages/YourFeature.tsx`:

```tsx
export default function YourFeature() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Your Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

### Step 2: Add Route

Edit `src/App.tsx`:

```tsx
import YourFeature from './pages/YourFeature';

<Routes>
  {/* Existing routes */}
  <Route path="/your-feature" element={<YourFeature />} />
</Routes>
```

### Step 3: Add to Sidebar

Edit `AdminLayout.tsx`:

```tsx
import { YourIcon } from 'lucide-react';

const menuItems = [
  // ...
  { icon: YourIcon, label: 'Your Feature', path: '/your-feature' },
];
```

---

## Modifying Existing Pages

### Example: Add Field to Product Form

Edit `src/pages/ProductEdit.tsx`:

1. **Add to schema**:

```typescript
const productSchema = z.object({
  // Existing fields...
  custom_field: z.string().optional(),
});
```

2. **Add form field**:

```tsx
<div className="space-y-2">
  <Label htmlFor="custom_field">Custom Field</Label>
  <Input id="custom_field" {...form.register('custom_field')} />
</div>
```

3. **Update database**:

```sql
ALTER TABLE products ADD COLUMN custom_field TEXT;
```

---

## Custom Fields

### Product Custom Fields

#### Add to Database

```sql
-- Add custom fields to products table
ALTER TABLE products ADD COLUMN brand TEXT;
ALTER TABLE products ADD COLUMN material TEXT;
ALTER TABLE products ADD COLUMN country_of_origin TEXT;
```

#### Update Type Definitions

Edit `src/lib/types.ts`:

```typescript
export interface Product {
  // Existing fields...
  brand?: string;
  material?: string;
  country_of_origin?: string;
}
```

#### Add to Form

Edit `ProductEdit.tsx` as shown above.

### Order Custom Fields

Same process for orders:

```sql
ALTER TABLE orders ADD COLUMN gift_message TEXT;
ALTER TABLE orders ADD COLUMN delivery_instructions TEXT;
```

---

## Translations

### Add New Language

1. **Create translation file**:

Create `src/i18n/translations/de.ts` (German):

```typescript
export const de = {
  common: {
    save: 'Speichern',
    cancel: 'Abbrechen',
    // ... translate all keys
  },
  dashboard: {
    title: 'Dashboard',
    // ...
  },
  // ... all sections
};
```

2. **Register language**:

Edit `src/i18n/index.ts`:

```typescript
import { de } from './translations/de';

export const translations = {
  fr,
  en,
  es,
  de, // Add new language
};

export type Language = 'fr' | 'en' | 'es' | 'de';
```

3. **Add to language selector**:

Edit `Settings.tsx`:

```tsx
<Select value={language} onValueChange={setLanguage}>
  <SelectItem value="fr">Français</SelectItem>
  <SelectItem value="en">English</SelectItem>
  <SelectItem value="es">Español</SelectItem>
  <SelectItem value="de">Deutsch</SelectItem>
</Select>
```

### Modify Existing Translations

Edit files in `src/i18n/translations/`:

```typescript
// src/i18n/translations/en.ts
export const en = {
  dashboard: {
    title: 'Control Panel', // Changed from 'Dashboard'
  }
};
```

---

## Email Templates

### Customize Email Content

Edit `supabase/functions/send-email/index.ts`:

```typescript
const emailTemplates = {
  orderConfirmation: (order) => `
    <h1>Thank you for your order!</h1>
    <p>Order #${order.order_number}</p>
    <!-- Customize HTML -->
  `,
  
  orderShipped: (order) => `
    <h1>Your order has shipped!</h1>
    <p>Tracking: ${order.tracking_number}</p>
  `,
};
```

### Email Styling

Use inline CSS for email compatibility:

```typescript
const emailHTML = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #E91E63; color: white; padding: 20px;">
      <h1 style="margin: 0;">Your Store</h1>
    </div>
    <div style="padding: 20px;">
      ${content}
    </div>
  </div>
`;
```

---

## Advanced Customization

### Custom Dashboard Widgets

Create `src/components/dashboard/CustomWidget.tsx`:

```tsx
export function CustomWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Custom Widget</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Your content */}
      </CardContent>
    </Card>
  );
}
```

Add to `Dashboard.tsx`:

```tsx
import { CustomWidget } from '@/components/dashboard/CustomWidget';

<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* Existing widgets */}
  <CustomWidget />
</div>
```

### Custom Hooks

Create `src/hooks/use-your-feature.ts`:

```typescript
export function useYourFeature() {
  const [data, setData] = useState();
  
  // Your logic
  
  return { data, /* ... */ };
}
```

### Custom API Endpoints

Add Edge Function in `supabase/functions/your-endpoint/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  // Your logic
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

Deploy:

```bash
supabase functions deploy your-endpoint
```

---

## Build & Deploy Custom Version

### Build

```bash
npm run build
```

### Environment Variables

Set custom env vars in `.env`:

```env
VITE_CUSTOM_FEATURE=enabled
VITE_BRAND_NAME=Your Store
```

Access in code:

```typescript
const brandName = import.meta.env.VITE_BRAND_NAME;
```

### Deploy

Follow deployment guide in [SETUP.md](./SETUP.md#deployment).

---

## Best Practices

1. **Keep original files**: Copy before modifying
2. **Use environment variables**: For configuration
3. **Document changes**: Comment your customizations
4. **Test thoroughly**: After each change
5. **Version control**: Use Git to track changes
6. **Backup database**: Before schema changes

---

## Need Help?

- 📧 **Email**: support@cannesh-admin.com
- 💬 **Discord**: [Join our community](https://discord.gg/your-invite)
- 📚 **Docs**: Check other documentation files

---

**Make it yours!** 🎨
