import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSPrisma from '@adminjs/prisma';

import { setupAdminResources } from './admin/index.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { shippingRoutes } from './routes/shipping.js';
import { paymentRoutes } from './routes/payments.js';
import { newsletterRoutes } from './routes/newsletter.js';
import { contactRoutes } from './routes/contact.js';
import { categoryRoutes } from './routes/categories.js';
import { collectionRoutes } from './routes/collections.js';

// Initialize Prisma
export const prisma = new PrismaClient();

// Register AdminJS adapter
AdminJS.registerAdapter({
  Database: AdminJSPrisma.Database,
  Resource: AdminJSPrisma.Resource,
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for AdminJS
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session for AdminJS
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Setup AdminJS
async function setupAdmin() {
  const adminJs = new AdminJS({
    resources: setupAdminResources(prisma),
    rootPath: '/admin',
    branding: {
      companyName: 'Cannesh Lingerie',
      logo: false,
      favicon: '/favicon.ico',
      theme: {
        colors: {
          primary100: '#d4a574',
          primary80: '#c4956a',
          primary60: '#b48560',
          primary40: '#a47556',
          primary20: '#94654c',
          accent: '#d4a574',
          love: '#d4a574',
        },
      },
    },
    locale: {
      language: 'fr',
      translations: {
        fr: {
          labels: {
            products: 'Produits',
            categories: 'Catégories',
            productCollections: 'Collections',
            orders: 'Commandes',
            users: 'Utilisateurs',
            newsletterSubscribers: 'Newsletter',
            contactMessages: 'Messages',
            shippingZones: 'Zones de livraison',
            shippingRates: 'Tarifs de livraison',
            siteSettings: 'Paramètres',
          },
          messages: {
            successfullyCreated: 'Créé avec succès',
            successfullyUpdated: 'Mis à jour avec succès',
            successfullyDeleted: 'Supprimé avec succès',
          },
        },
      },
    },
    dashboard: {
      handler: async () => {
        const [
          ordersCount,
          productsCount,
          subscribersCount,
          recentOrders,
          totalRevenue,
        ] = await Promise.all([
          prisma.order.count(),
          prisma.product.count({ where: { isActive: true } }),
          prisma.newsletterSubscriber.count({ where: { isActive: true } }),
          prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { items: true },
          }),
          prisma.order.aggregate({
            where: { paymentStatus: 'PAID' },
            _sum: { total: true },
          }),
        ]);

        return {
          ordersCount,
          productsCount,
          subscribersCount,
          recentOrders,
          totalRevenue: totalRevenue._sum.total || 0,
        };
      },
    },
  });

  // Authentication
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate: async (email: string, password: string) => {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (email === adminEmail && password === adminPassword) {
          return { email, role: 'admin' };
        }
        
        // Check database for admin users
        const user = await prisma.user.findUnique({
          where: { email },
        });
        
        if (user && user.role === 'ADMIN' && user.password === password) {
          return { email: user.email, role: 'admin', id: user.id };
        }
        
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    },
    null,
    {
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
    }
  );

  app.use(adminJs.options.rootPath, adminRouter);
  
  return adminJs;
}

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start server
async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    await setupAdmin();
    console.log('✅ AdminJS ready at /admin');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
