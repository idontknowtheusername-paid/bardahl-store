# Cannesh Lingerie - Backend AdminJS

Backend e-commerce complet avec Express, AdminJS et Prisma.

## Stack technique

- **Express.js** - Serveur HTTP
- **AdminJS** - Interface d'administration
- **Prisma** - ORM pour PostgreSQL
- **Resend** - Envoi d'emails
- **Cloudinary** - Stockage d'images
- **Lygos** - Paiements Mobile Money (MTN MoMo, Moov)

## Installation

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env

# Générer le client Prisma
npm run db:generate

# Appliquer le schéma à la base de données
npm run db:push

# Seeder les données initiales (optionnel)
npm run db:seed

# Lancer en développement
npm run dev
```

## Variables d'environnement

Configurer `.env` avec :

```env
DATABASE_URL=postgresql://...
PORT=3001
ADMIN_EMAIL=admin@cannesh.com
ADMIN_PASSWORD=mot-de-passe-secure
SESSION_SECRET=secret-32-caracteres-minimum
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=re_...
LYGOS_API_KEY=...
LYGOS_SECRET_KEY=...
```

## Structure

```
backend-adminjs/
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Données initiales
├── src/
│   ├── server.ts        # Point d'entrée Express
│   ├── admin/
│   │   └── index.ts     # Configuration AdminJS
│   ├── routes/          # API REST
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── collections.ts
│   │   ├── orders.ts
│   │   ├── shipping.ts
│   │   ├── payments.ts
│   │   ├── newsletter.ts
│   │   └── contact.ts
│   └── services/        # Services externes
│       ├── lygos.ts     # Paiements
│       ├── email.ts     # Emails
│       └── cloudinary.ts # Images
```

## API Endpoints

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/featured` - Produits vedettes
- `GET /api/products/new-arrivals` - Nouveautés
- `GET /api/products/slug/:slug` - Produit par slug
- `GET /api/products/:id/related` - Produits similaires

### Catégories
- `GET /api/categories` - Liste des catégories
- `GET /api/categories/slug/:slug` - Catégorie par slug

### Collections
- `GET /api/collections` - Liste des collections
- `GET /api/collections/slug/:slug` - Collection par slug

### Commandes
- `POST /api/orders` - Créer une commande
- `GET /api/orders/number/:orderNumber` - Détails par numéro
- `PATCH /api/orders/:id/status` - Mettre à jour le statut

### Paiements
- `POST /api/payment/create` - Créer un paiement Lygos
- `POST /api/payment/verify` - Vérifier le statut
- `POST /api/payment/webhooks/lygos` - Webhook Lygos

### Livraison
- `GET /api/shipping/cities` - Villes disponibles
- `GET /api/shipping/rates?city=Cotonou` - Tarifs par ville
- `POST /api/shipping/calculate` - Calculer les frais

### Newsletter
- `POST /api/newsletter/subscribe` - S'inscrire
- `POST /api/newsletter/unsubscribe` - Se désinscrire

### Contact
- `POST /api/contact` - Envoyer un message

## Interface Admin

Accessible à `/admin` après démarrage.

Fonctionnalités :
- ✅ Gestion produits (variantes, images, stock)
- ✅ Gestion commandes (statuts, paiements)
- ✅ Gestion catégories et collections
- ✅ Configuration livraison par zone
- ✅ Newsletter et messages de contact
- ✅ Dashboard avec statistiques

## Déploiement

Recommandé sur :
- **Railway** - Simple et rapide
- **Render** - Gratuit pour les petits projets
- **VPS** - Contrôle total

```bash
# Build pour production
npm run build

# Démarrer
npm start
```
