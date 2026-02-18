
# Plan Complet - Livraison Dynamique, Blog Fix, Factures, Avis Produits & Hero Optimisé

## Analyse de l'existant

### Problèmes identifiés :

1. **Livraison hardcodée** : `CartModal.tsx` calcule le seuil à `59 * 655.957 FCFA` (ancien système lingerie), `Cart.tsx` utilise un seuil à `50 000 FCFA` et `5.90€`, `payment-create` a `const shippingCost = 2000` en dur.
2. **Blog - Edge Function non-2xx** : `blog-generate` référence des tables `blog_categories` et `blog_post_categories` qui n'existent **pas** en base. Il utilise aussi `blog_generation_log` qui n'existe pas non plus. Le prompt parle de "lingerie" (ancien site). C'est pour ça que ça crash.
3. **Facturation admin** : La page n'existe pas encore. À créer.
4. **Email admin sur nouvelle commande** : `payment-create` et `payment-webhook` n'envoient pas de mail à l'admin.
5. **Avis produits** : Pas de table `product_reviews` en base, pas de composant frontend.
6. **Hero** : Image 404 (Unsplash cassée), hauteur `70vh` sous-optimale pour un store (recommandé : `60-80vh` avec contenu dense), pas d'indicateur de confiance.
7. **`send-email`** : Requiert que l'appelant soit authentifié admin — bloquant pour l'envoi automatique depuis `payment-webhook` (qui tourne en service role, pas en user).

---

## Plan Technique Détaillé

### 1. Base de données - Migration SQL

**Tables à créer :**
- `product_reviews` : `id, product_id, author_name, rating (1-5), comment, is_approved (default true), created_at`
- Ajout de `admin_email` dans `site_settings`

**Pas de `blog_categories` ni `blog_post_categories`** : on simplifie le blog pour utiliser uniquement les tags déjà présents dans `blog_posts`.

RLS pour `product_reviews` :
- SELECT public : `is_approved = true`
- INSERT public : `true` (avec rate limiting géré applicativement)
- Admin : ALL

---

### 2. Livraison Dynamique

#### `CartModal.tsx`
- Supprimer le `FREE_SHIPPING_THRESHOLD` hardcodé
- Créer un hook `useShippingThreshold` qui lit le `free_shipping_threshold` depuis la première zone active en base via Supabase directement (table `shipping_rates`)
- Afficher la barre de progression dynamiquement avec la valeur DB
- Fallback : si pas de DB → ne pas afficher la barre ou afficher un message générique

#### `Cart.tsx`
- Supprimer les valeurs `80`, `5.90` hardcodées
- Indiquer que la livraison sera calculée au checkout (idem CartModal)

#### `payment-create` (Edge Function)
- Remplacer `const shippingCost = 2000` par une vraie requête aux tables `shipping_zones` / `shipping_rates` selon la ville et le pays du client
- Utiliser le même algorithme que `shipping-calculate` (déjà bien implémenté)

#### Hook `useShippingSettings`
- Nouveau hook `src/hooks/use-shipping-settings.ts`
- Lit la table `shipping_rates` pour trouver le `free_shipping_threshold` minimum actif
- Utilisé par CartModal et Cart

---

### 3. Fix Blog - Edge Function

**Problèmes à corriger dans `blog-generate/index.ts` :**
- Supprimer les références à `blog_categories`, `blog_post_categories`, `blog_generation_log` (tables inexistantes)
- Mettre à jour le prompt pour parler de **Bardahl** (lubrifiants, entretien auto) au lieu de lingerie/beauté féminine
- Générer un article directement sans catégorie externe (utiliser les tags)

**Mise à jour `BlogPosts.tsx` (admin) :**
- Corriger le lien "Voir sur le site" qui pointe sur `cannesh-lingerie-suite.vercel.app` → pointer sur le vrai domaine Bardahl
- Conserver la fonctionnalité de génération

---

### 4. Fix `send-email` - Envoi interne

Le problème : `send-email` vérifie que l'appelant est un admin authentifié. Mais `payment-webhook` l'appelle avec le **service role key**, pas un JWT user.

**Solution** : Modifier `send-email` pour accepter deux modes :
- Mode authentifié (admin depuis l'interface)
- Mode service (appelé depuis une autre Edge Function avec le `SUPABASE_SERVICE_ROLE_KEY` comme bearer token interne)

Ajouter une vérification : si le token est égal au `SUPABASE_SERVICE_ROLE_KEY`, autoriser directement.

---

### 5. Email Admin - Nouvelle commande

**Dans `payment-create`** : après création de commande en DB, envoyer un email à l'adresse admin configurée dans `site_settings`.

**Nouveau template** `new_order_admin` dans `send-email` :
- Détails complets : numéro, client, téléphone, ville, articles, total, méthode de livraison
- Couleurs Bardahl (jaune/noir)

**Dans `payment-webhook`** : idem sur confirmation de paiement, notifier l'admin.

---

### 6. Génération de Factures - Nouvelle page admin

**Nouvelle page `admin/src/pages/Invoices.tsx`** (accessible depuis la sidebar, juste après Orders) :

Fonctionnalités :
- Liste des commandes avec bouton "Générer la facture"
- Génération d'un PDF professionnel avec le logo Bardahl, les informations de commande complètes
- Téléchargement direct (PDF via la librairie `jsPDF` ou génération HTML→PDF côté client)
- Envoi par email au client
- Partage WhatsApp (lien `wa.me` avec message + lien de téléchargement)

**Format de la facture :**
```
BARDAHL - FACTURE
Logo + en-tête (jaune/noir)
Numéro de facture (FAC-XXXXX)
Date, Numéro de commande
Informations client
Tableau des articles (désignation, qté, PU, total)
Sous-total, Livraison, Total
Mentions légales en bas
```

**Note** : Utiliser `jsPDF` + `html2canvas` pour la génération PDF côté client (pas de nouvelle dépendance backend). Vérifier si déjà disponible ou ajouter aux dépendances.

---

### 7. Avis Produits - Page `ProductDetail.tsx`

**Section avis** ajoutée en bas de la page produit (avant les produits similaires) :
- Accordion **fermé par défaut** avec titre "Avis clients (N)"
- À l'ouverture : affiche les avis approuvés, notation étoiles
- Formulaire intégré dans l'accordion : Nom, Note (étoiles cliquables), Commentaire, Bouton soumettre
- Chargement depuis la table `product_reviews` (Supabase)
- Soumission directe en DB

---

### 8. Hero Optimisé

**Changements :**
- Remplacer l'image Unsplash cassée par un vrai fond Bardahl (gradient propre sans image manquante)
- Hauteur : passer de `min-h-[70vh]` à `min-h-[65vh]` (recommandation e-commerce : 55-70vh pour laisser voir le contenu en dessous)
- Ajouter des **trust badges** sous les CTA : "Livraison Bénin", "Paiement sécurisé", "Produits authentiques"
- Optimiser le texte : headline plus impactante, sous-titre plus concis
- Corriger l'animation de la flèche du bouton "Découvrir" (groupe manquant)
- Supprimer les logs de débogage dans `ProductDetail.tsx`

---

## Ordre d'exécution

```text
1. Migration DB (product_reviews table + admin_email in site_settings)
2. Hook useShippingSettings
3. CartModal.tsx + Cart.tsx (livraison dynamique)
4. payment-create (shipping dynamique)
5. send-email (fix mode service)
6. blog-generate (fix tables + prompt Bardahl)
7. BlogPosts.tsx (fix URL)
8. New template email admin + email dans payment-create/webhook
9. Invoices.tsx (admin) + sidebar update
10. ProductDetail.tsx (avis + suppression logs)
11. HeroSection.tsx (optimisation)
```

## Fichiers modifiés / créés

**Frontend :**
- `src/hooks/use-shipping-settings.ts` (nouveau)
- `src/components/cart/CartModal.tsx`
- `src/pages/Cart.tsx`
- `src/pages/ProductDetail.tsx` (avis + nettoyage logs)
- `src/components/home/HeroSection.tsx`

**Admin :**
- `admin/src/pages/Invoices.tsx` (nouveau)
- `admin/src/App.tsx` (route invoices)
- `admin/src/components/layout/AdminLayout.tsx` (nav item)
- `admin/src/pages/BlogPosts.tsx` (fix URL)
- `admin/src/pages/OrderDetail.tsx` (nettoyage console.log)

**Edge Functions :**
- `supabase/functions/payment-create/index.ts` (shipping dynamique + email admin)
- `supabase/functions/send-email/index.ts` (fix auth service + nouveau template admin)
- `supabase/functions/blog-generate/index.ts` (fix tables + prompt Bardahl)

**Migration :**
- `supabase/migrations/xxx_product_reviews_and_admin_email.sql`
