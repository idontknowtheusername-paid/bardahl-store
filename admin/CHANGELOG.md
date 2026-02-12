# Changelog

All notable changes to Cannesh Admin Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-03

### 🎉 Initial Release

#### Added
- Complete product management system with variants
- Drag & drop image upload with automatic WebP compression
- Multi-language support (French, English, Spanish)
- Real-time dashboard with charts and statistics
- Order management with status tracking
- Customer database from orders
- Advanced promo code system (percentage, fixed, free shipping, buy X get Y)
- Blog system with AI-powered content generation
- Newsletter subscriber management
- Contact form with admin replies
- Shipping zones and rates configuration
- User management with role-based access control
- Media library with Supabase Storage
- Category and collection management
- AI chatbot assistant for admins
- Email notifications with Resend
- SEO optimization fields for products
- Low stock alerts
- Order history tracking
- Abandoned cart recovery system

#### Features
- **Dashboard**: Revenue, orders, customers stats with charts
- **Products**: Full CRUD with variants, images, SEO
- **Orders**: Status management, tracking numbers, customer info
- **Customers**: Automatic database from orders
- **Users**: Admin, Editor, Viewer roles
- **Promo Codes**: Multiple discount types with usage tracking
- **Blog**: Markdown editor with AI generation
- **Media**: File upload and management
- **Newsletter**: Subscriber list with export
- **Contact**: Message management with replies
- **Shipping**: Zones, rates, free shipping thresholds
- **Settings**: Site configuration and language toggle

#### Technical
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + Shadcn/UI
- Supabase backend (PostgreSQL, Auth, Storage, Edge Functions)
- TanStack Query for state management
- React Router v7 for routing
- Zod for validation
- React Hook Form for forms
- Recharts for analytics
- dnd-kit for drag & drop
- browser-image-compression for image optimization

---

## [Unreleased]

### Planned Features
- [ ] Bulk product import/export (CSV)
- [ ] Advanced analytics and reports
- [ ] Customer segmentation
- [ ] Email campaign builder
- [ ] Inventory management with suppliers
- [ ] Multi-currency support
- [ ] Tax configuration
- [ ] Discount rules engine
- [ ] Product reviews moderation
- [ ] Wishlist tracking
- [ ] Gift cards
- [ ] Subscription products
- [ ] Affiliate program management
- [ ] Advanced search and filters
- [ ] Custom fields for products
- [ ] Webhook integrations
- [ ] API documentation
- [ ] Mobile app (React Native)

---

## Version History

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, minor improvements

### Support Policy
- **One-time license**: Updates for 1 year from purchase
- **Monthly subscription**: Lifetime updates while active

---

## How to Update

### For Git Users
```bash
git pull origin main
npm install
npm run build
```

### For Downloaded Versions
1. Download the latest version from your account
2. Backup your current installation
3. Replace files (keep your .env and customizations)
4. Run `npm install` to update dependencies
5. Check CHANGELOG for breaking changes
6. Test thoroughly before deploying

### Database Migrations
If a version includes database changes, run:
```bash
# Apply new migrations
supabase db push

# Or manually via SQL editor in Supabase Dashboard
```

---

## Breaking Changes

None yet (v1.0.0 is the initial release)

---

## Need Help?

- 📧 Email: support@cannesh-admin.com
- 📚 Docs: [docs/](./docs/)
- 💬 Discord: [Join our community](https://discord.gg/your-invite)

---

**Thank you for using Cannesh Admin Pro!** 🚀
