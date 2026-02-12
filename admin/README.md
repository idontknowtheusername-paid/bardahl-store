# 🛍️ Cannesh Admin Pro - E-Commerce Admin Panel

> Modern, multilingual admin panel for e-commerce built with React, TypeScript, and Supabase

[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green.svg)](https://supabase.com/)

---

## ✨ Features

### 📦 Product Management
- **Complete CRUD** for products with variants (size, color, cup size)
- **Drag & drop image upload** with automatic compression to WebP
- **Bulk image upload** with parallel processing
- **Stock management** with low-stock alerts
- **SEO optimization** (meta titles, descriptions, slugs)
- **Product variants** with individual pricing and stock

### 🎨 Modern UI/UX
- **Fully responsive** design (mobile, tablet, desktop)
- **Dark mode** support
- **Multi-language** interface (French, English, Spanish)
- **Intuitive navigation** with sidebar and breadcrumbs
- **Real-time updates** with React Query
- **Beautiful charts** with Recharts

### 🤖 AI-Powered Features
- **Auto-generate product descriptions** with Mistral AI
- **Floating chatbot assistant** for admin help
- **Blog post generation** with AI
- **Smart content suggestions**

### 📊 Dashboard & Analytics
- **Real-time statistics** (revenue, orders, customers)
- **Sales charts** (daily, weekly, monthly)
- **Recent orders** overview
- **Low stock alerts**
- **Top products** tracking

### 🎁 Advanced Promo Codes
- **Multiple discount types**: percentage, fixed amount, free shipping
- **Buy X Get Y** promotions
- **Minimum order amount** requirements
- **Usage limits** and tracking
- **Date-based validity**
- **Product-specific** discounts

### 📧 Communication
- **Email notifications** with Resend integration
- **Newsletter management** with subscriber list
- **Contact form** with admin replies
- **Order confirmation emails**
- **Abandoned cart recovery**

### 🚚 Shipping Management
- **Multiple shipping zones** (countries, cities)
- **Flexible rate configuration**
- **Free shipping thresholds**
- **Delivery time estimates**

### 👥 User Management
- **Role-based access control** (Admin, Editor, Viewer)
- **Customer database** from orders
- **Admin user creation** via Edge Function
- **Activity tracking**

### 📝 Content Management
- **Blog system** with Markdown support
- **AI-powered content generation**
- **Scheduled publishing**
- **Media library** with Supabase Storage
- **Category management**
- **Collection management** (seasonal, featured)

### 🔒 Security
- **Row Level Security (RLS)** with Supabase
- **Role-based permissions**
- **Secure authentication**
- **Protected routes**
- **API key management**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (free tier works)
- Resend API key (optional, for emails)
- Mistral API key (optional, for AI features)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd cannesh-admin-pro

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 4. Run development server
npm run dev
```

The admin panel will be available at `http://localhost:5173`

---

## 📋 Setup Guide

### 1. Supabase Project Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the database migrations (see [SUPABASE.md](./docs/SUPABASE.md))
3. Configure storage buckets
4. Set up Edge Functions
5. Add environment secrets

**Detailed instructions**: [docs/SUPABASE.md](./docs/SUPABASE.md)

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_FRONTEND_URL=https://your-store.com
```

**Full configuration guide**: [docs/SETUP.md](./docs/SETUP.md)

### 3. Create First Admin User

```bash
# Using the provided SQL script
psql -h your-db-host -U postgres -d postgres -f create-admin.sql

# Or via Supabase Dashboard SQL Editor
# Copy content from create-admin.sql and execute
```

### 4. Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
vercel deploy

# Or Netlify
netlify deploy --prod
```

**Deployment guide**: [docs/SETUP.md#deployment](./docs/SETUP.md#deployment)

---

## 📸 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Product Management
![Products](./screenshots/products.png)

### Order Details
![Order](./screenshots/order-detail.png)

### Multi-language Support
![Languages](./screenshots/languages.png)

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Shadcn/UI, Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI**: Mistral AI
- **Email**: Resend
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: dnd-kit
- **Image Compression**: browser-image-compression

---

## 📚 Documentation

- **[Setup Guide](./docs/SETUP.md)** - Complete installation and configuration
- **[Supabase Setup](./docs/SUPABASE.md)** - Database migrations and configuration
- **[Features](./docs/FEATURES.md)** - Detailed feature documentation
- **[Customization](./docs/CUSTOMIZATION.md)** - How to customize the admin panel
- **[API Reference](./docs/API_REFERENCE.md)** - Supabase API usage examples

---

## 🎯 Use Cases

Perfect for:

- 👗 **Fashion & Apparel** stores
- 💄 **Beauty & Cosmetics** shops
- 🎁 **Gift shops**
- 📚 **Bookstores**
- 🏠 **Home decor** stores
- 🍷 **Food & Beverage** e-commerce
- 🎨 **Handmade & Crafts** marketplaces

---

## 💰 Pricing & Licensing

### One-Time Purchase
**$79** - Lifetime access + 1 year of updates

### Monthly Subscription
**$9/month** - Access + priority support + lifetime updates

### What's Included
- ✅ Full source code
- ✅ Supabase migrations & Edge Functions
- ✅ Documentation
- ✅ Email support
- ✅ Free updates for 1 year (one-time) or lifetime (subscription)
- ✅ Commercial use license

### License
This is a **commercial product**. See [LICENSE](./LICENSE) for terms.

---

## 🆘 Support

- **Email**: support@cannesh-admin.com
- **Documentation**: [docs/](./docs/)
- **Issues**: GitHub Issues (for bugs only)
- **Discord**: [Join our community](https://discord.gg/your-invite)

---

## 🔄 Updates & Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

**Current Version**: 1.0.0

---

## 🙏 Credits

Built with ❤️ using:
- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Mistral AI](https://mistral.ai/)

---

## ⚠️ Requirements

### Minimum
- Node.js 18+
- Supabase Free Tier
- 512MB RAM for deployment

### Recommended
- Node.js 20+
- Supabase Pro ($25/month)
- 1GB RAM for deployment
- CDN for static assets

---

## 🚦 Getting Started Checklist

- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Configure environment variables
- [ ] Create admin user
- [ ] Upload test products
- [ ] Configure shipping zones
- [ ] Set up email (Resend)
- [ ] Deploy to production
- [ ] Connect your frontend

---

**Ready to launch your e-commerce admin?** 🚀

[Get Started](./docs/SETUP.md) | [View Demo](https://demo.cannesh-admin.com)
