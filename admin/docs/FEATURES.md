# Features Documentation

Complete guide to all features in Cannesh Admin Pro.

---

## Table of Contents

1. [Dashboard](#dashboard)
2. [Product Management](#product-management)
3. [Order Management](#order-management)
4. [Customer Management](#customer-management)
5. [Promo Codes](#promo-codes)
6. [Blog System](#blog-system)
7. [Media Library](#media-library)
8. [Newsletter](#newsletter)
9. [Contact Messages](#contact-messages)
10. [Shipping Configuration](#shipping-configuration)
11. [User Management](#user-management)
12. [Settings](#settings)
13. [AI Features](#ai-features)

---

## Dashboard

### Overview

The dashboard provides a real-time overview of your e-commerce business.

### Key Metrics

- **Total Revenue**: Sum of all confirmed orders
- **Total Orders**: Count of all orders
- **Total Customers**: Unique customers from orders
- **Average Order Value**: Revenue / Orders

### Charts

- **Revenue Chart**: Daily/weekly/monthly revenue trends
- **Orders Chart**: Order volume over time
- **Top Products**: Best-selling products by quantity

### Recent Activity

- **Recent Orders**: Last 5 orders with status
- **Low Stock Alerts**: Products with stock ≤ 5 units
- **Quick Actions**: Shortcuts to common tasks

---

## Product Management

### Product List

View all products with:
- Thumbnail image
- Title and SKU
- Price (with compare-at price if set)
- Stock level
- Status badges (Active, New, Featured)
- Quick actions (Edit, Duplicate, Delete, View on site)

### Search & Filter

- **Search**: By product title
- **Filter**: By status, category, stock level
- **Sort**: By date, price, stock

### Create/Edit Product

#### Basic Information

- **Title**: Product name (required)
- **Slug**: URL-friendly identifier (auto-generated)
- **Short Description**: Brief summary (1-2 sentences)
- **Description**: Full product description (supports rich text)
- **SKU**: Stock Keeping Unit (optional)

#### Pricing

- **Price**: Regular price in FCFA (required)
- **Compare at Price**: Original price for showing discounts
- **Stock**: Global stock quantity

#### Images

- **Upload**: Drag & drop or click to upload
- **Multiple**: Upload multiple images at once
- **Reorder**: Drag to change order (first = main image)
- **Compression**: Automatic WebP conversion
- **Delete**: Remove unwanted images

#### Variants

- **Sizes**: Select available sizes (XS, S, M, L, XL, XXL)
- **Colors**: Choose colors with hex codes
- **Cup Sizes**: For lingerie (A, B, C, D, E, F)
- **Individual Stock**: Track stock per variant (optional)

#### Categories & Collections

- **Categories**: Assign to one or more categories
- **Collections**: Add to seasonal/featured collections

#### SEO

- **Meta Title**: Page title for search engines
- **Meta Description**: Page description for search results
- **Meta Image**: Social sharing image

#### Product Details

- **Composition**: Fabric composition (e.g., "85% Polyamide, 15% Élasthanne")
- **Care Instructions**: Washing and care guidelines
- **Style**: Product style (classique, moderne, etc.)

#### Status Flags

- **Active**: Show on frontend
- **Featured**: Display in featured sections
- **New**: Show "New" badge

### AI-Powered Descriptions

When creating a product, AI automatically generates:
- **Short description** (after 10 seconds)
- **Long description** (after 10 seconds)

You can edit or regenerate these at any time.

### Bulk Actions

- **Duplicate**: Create a copy of a product
- **Delete**: Remove product (with confirmation)
- **Export**: Export product data (coming soon)

---

## Order Management

### Order List

View all orders with:
- Order number
- Customer name and email
- Total amount
- Status (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
- Payment status
- Date

### Order Details

#### Customer Information

- Name, email, phone
- Shipping address
- Customer note (if provided)

#### Order Items

- Product name, image
- Variant (size, color, cup size)
- Quantity
- Unit price
- Subtotal

#### Order Summary

- Subtotal
- Shipping cost
- Promo code discount (if applied)
- Total

#### Order Status

Update order status:
- **Pending**: Awaiting payment
- **Confirmed**: Payment received
- **Processing**: Being prepared
- **Shipped**: On the way (add tracking number)
- **Delivered**: Received by customer
- **Cancelled**: Order cancelled
- **Refunded**: Payment refunded

#### Payment Status

- **Pending**: Awaiting payment
- **Paid**: Payment confirmed
- **Failed**: Payment failed
- **Refunded**: Payment refunded

#### Order History

Automatic timeline of status changes with timestamps.

#### Admin Actions

- **Add tracking number**: For shipped orders
- **Add admin note**: Internal notes
- **Send email**: Notify customer
- **Print invoice**: Generate PDF (coming soon)

---

## Customer Management

### Customer List

Automatically populated from orders:
- Name
- Email
- Phone
- Total orders
- Total spent
- Last order date

### Customer Details

- Order history
- Contact information
- Lifetime value
- Average order value

### Export

Export customer list to CSV for marketing campaigns.

---

## Promo Codes

### Discount Types

#### 1. Percentage Discount

Example: 20% off

```
Code: PROMO20
Type: Percentage
Value: 20
Min Order: 10,000 FCFA (optional)
Max Discount: 5,000 FCFA (optional)
```

#### 2. Fixed Amount

Example: 2,000 FCFA off

```
Code: SAVE2000
Type: Fixed
Value: 2000
Min Order: 15,000 FCFA (optional)
```

#### 3. Free Shipping

Example: Free delivery

```
Code: FREESHIP
Type: Free Shipping
Min Order: 20,000 FCFA (optional)
```

#### 4. Buy X Get Y

Example: Buy 2, get 1 free

```
Code: BUY2GET1
Type: Buy X Get Y
Buy Quantity: 2
Get Quantity: 1
```

### Configuration

- **Code**: Unique promo code (uppercase recommended)
- **Valid From**: Start date
- **Valid Until**: End date (optional)
- **Max Uses**: Usage limit (optional)
- **Min Order Amount**: Minimum cart value
- **Product Specific**: Apply to specific products only
- **Active**: Enable/disable code

### Usage Tracking

- **Uses Count**: Number of times used
- **Remaining Uses**: Max uses - uses count

---

## Blog System

### Post Management

Create and manage blog posts:
- Title and slug
- Content (Markdown editor)
- Excerpt
- Featured image
- Author
- Tags
- Status (Draft, Published, Scheduled)
- SEO fields

### AI Content Generation

Generate blog posts with AI:
1. Click "Generate with AI"
2. Enter prompt (e.g., "Write about lingerie trends 2024")
3. Choose style (Informative, Casual, Professional)
4. Choose length (Short, Medium, Long)
5. AI generates complete post with title, content, excerpt

### Scheduled Publishing

- Set **Published At** date in the future
- Post automatically publishes at that time
- Cron job runs every hour to check scheduled posts

### Categories & Tags

- Organize posts by category
- Add multiple tags for better discovery
- Filter posts by category/tag

---

## Media Library

### File Management

- **Upload**: Drag & drop or click
- **Multiple**: Upload multiple files
- **Preview**: View images before uploading
- **Delete**: Remove files
- **Copy URL**: Get public URL for use

### Supported Formats

- Images: JPEG, PNG, WebP, GIF
- Max size: 50MB per file

### Organization

- Search by filename
- Filter by type
- Sort by date

### Usage

- Product images
- Blog featured images
- Category images
- Collection images

---

## Newsletter

### Subscriber Management

- **Add**: Manually add subscribers
- **Import**: Bulk import from CSV
- **Export**: Export list to CSV
- **Status**: Active, Unsubscribed, Bounced

### Subscriber Sources

- Website signup form
- Checkout opt-in
- Manual addition
- CSV import

### Send Campaign

- **Subject**: Email subject line
- **Content**: Email body (HTML supported)
- **Recipients**: All active subscribers
- **Preview**: Test before sending

### Analytics

- Total subscribers
- Growth rate
- Unsubscribe rate
- Open rate (if using email service)

---

## Contact Messages

### Message List

View all customer inquiries:
- Name and email
- Subject
- Message
- Status (New, In Progress, Replied, Closed)
- Date

### Reply to Messages

- **Admin Reply**: Type your response
- **Send Email**: Automatically email customer
- **Status**: Update to "Replied"
- **Close**: Mark as resolved

### Message Status

- **New**: Unread message
- **In Progress**: Being handled
- **Replied**: Response sent
- **Closed**: Issue resolved

---

## Shipping Configuration

### Shipping Zones

Define delivery areas:
- **Name**: Zone name (e.g., "Dakar")
- **Countries**: List of countries
- **Cities**: List of cities
- **Active**: Enable/disable zone

### Shipping Rates

Configure rates per zone:
- **Name**: Rate name (e.g., "Standard Delivery")
- **Price**: Delivery cost
- **Delivery Time**: Estimated time (e.g., "2-3 days")
- **Free Shipping Threshold**: Min cart value for free shipping
- **Active**: Enable/disable rate

### Example Configuration

**Zone: Dakar**
- Countries: Sénégal
- Cities: Dakar, Pikine, Guédiawaye

**Rate: Standard**
- Price: 1,500 FCFA
- Delivery: 2-3 days
- Free above: 20,000 FCFA

**Rate: Express**
- Price: 3,000 FCFA
- Delivery: Same day
- Free above: 50,000 FCFA

---

## User Management

### User Roles

#### Admin
- Full access to all features
- Can manage users
- Can change settings

#### Editor
- Can manage content (products, blog, etc.)
- Cannot manage users or settings

#### Viewer
- Read-only access
- Can view but not edit

#### Customer
- No admin access
- Can only view their own orders (frontend)

### Create User

1. Click "Create User"
2. Enter email and password
3. Select role
4. Enter full name
5. User receives email invitation

### Manage Users

- **Edit**: Change role or details
- **Deactivate**: Disable access without deleting
- **Delete**: Remove user permanently
- **Reset Password**: Send password reset email

---

## Settings

### Site Settings

- **Site Name**: Your store name
- **Site Description**: Brief description
- **Contact Email**: Support email
- **Contact Phone**: Support phone
- **Address**: Physical address

### Language

Switch admin interface language:
- **French** (Français)
- **English**
- **Spanish** (Español)

Saved per user in localStorage.

### Email Settings

- **From Name**: Sender name for emails
- **From Email**: Sender email address
- **Admin Email**: Receive notifications

### Payment Settings

- **Payment Gateway**: Lygos, Stripe, etc.
- **API Keys**: Configure payment credentials
- **Currency**: FCFA, EUR, USD, etc.

### Tax Settings

- **Tax Rate**: Percentage
- **Tax Included**: In prices or added at checkout

---

## AI Features

### Product Description Generation

Automatically generates:
- **Short description**: 1-2 sentences
- **Long description**: 3-4 paragraphs

Uses Mistral AI with product title as context.

### Chatbot Assistant

Floating chatbot in admin panel:
- **Ask questions**: About how to use features
- **Get help**: Troubleshooting
- **Learn**: Best practices

Powered by Mistral AI.

### Blog Post Generation

Generate complete blog posts:
- **Title**: SEO-optimized
- **Content**: Well-structured Markdown
- **Excerpt**: Compelling summary
- **Tags**: Relevant keywords

### Content Suggestions

AI suggests:
- Product titles
- SEO meta descriptions
- Email subject lines
- Blog topics

---

## Keyboard Shortcuts

- **Ctrl/Cmd + K**: Quick search
- **Ctrl/Cmd + S**: Save (in forms)
- **Esc**: Close modals
- **?**: Show shortcuts help

---

## Mobile Support

All features work on mobile devices:
- Responsive design
- Touch-friendly interface
- Mobile-optimized tables
- Swipe gestures

---

## Performance

- **Fast loading**: Optimized bundle size
- **Lazy loading**: Components load on demand
- **Image optimization**: Automatic WebP conversion
- **Caching**: React Query caching
- **Real-time**: Instant updates

---

## Security

- **Row Level Security**: Supabase RLS
- **Role-based access**: Granular permissions
- **Secure auth**: Supabase Auth
- **HTTPS**: Encrypted connections
- **API keys**: Secure secret management

---

**Explore all features and build your perfect e-commerce admin!** 🚀
