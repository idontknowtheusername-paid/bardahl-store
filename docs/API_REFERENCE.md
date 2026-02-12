# Guide d'utilisation de l'API Admin

## Vue d'ensemble

Ce document décrit comment utiliser l'API backend Supabase pour interagir avec les données de la plateforme e-commerce.

## Authentification

### Connexion Admin

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xxx.supabase.co',
  'your-anon-key'
);

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'password'
});

// Vérifier le rôle admin
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', data.user.id)
  .single();

if (userRole?.role !== 'admin') {
  throw new Error('Accès refusé');
}
```

---

## Produits

### Lister les produits

```typescript
const { data: products } = await supabase
  .from('products')
  .select(`
    *,
    product_images (id, image_url, display_order),
    product_variants (id, size, color, cup_size, stock),
    product_categories (
      category:categories (id, title, slug)
    )
  `)
  .order('created_at', { ascending: false });
```

### Créer un produit

```typescript
const { data: product, error } = await supabase
  .from('products')
  .insert({
    title: 'Nouveau Produit',
    slug: 'nouveau-produit',
    price: 5000,
    stock: 100,
    is_active: true,
    is_featured: false,
    is_new: true,
    available_sizes: ['S', 'M', 'L', 'XL'],
    available_colors: [
      { name: 'Noir', code: '#000000' },
      { name: 'Rose', code: '#FFC0CB' }
    ],
    description: { content: 'Description du produit' }
  })
  .select()
  .single();
```

### Ajouter des images

```typescript
// Upload de l'image
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('products')
  .upload(`product-${productId}/${Date.now()}.jpg`, imageFile);

// Obtenir l'URL publique
const { data: urlData } = supabase.storage
  .from('products')
  .getPublicUrl(uploadData.path);

// Enregistrer dans la base
const { error } = await supabase
  .from('product_images')
  .insert({
    product_id: productId,
    image_url: urlData.publicUrl,
    display_order: 0
  });
```

### Mettre à jour un produit

```typescript
const { error } = await supabase
  .from('products')
  .update({
    title: 'Produit Mis à Jour',
    price: 6000,
    stock: 50
  })
  .eq('id', productId);
```

### Supprimer un produit

```typescript
// Les images et variantes sont supprimées automatiquement (CASCADE)
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId);
```

---

## Catégories

### Lister les catégories

```typescript
const { data: categories } = await supabase
  .from('categories')
  .select('*')
  .order('display_order');
```

### Créer une catégorie

```typescript
const { data, error } = await supabase
  .from('categories')
  .insert({
    title: 'Nouvelle Catégorie',
    slug: 'nouvelle-categorie',
    description: 'Description de la catégorie',
    is_active: true,
    display_order: 0
  })
  .select()
  .single();
```

### Associer des produits à une catégorie

```typescript
const { error } = await supabase
  .from('product_categories')
  .insert({
    product_id: productId,
    category_id: categoryId
  });
```

---

## Commandes

### Lister les commandes

```typescript
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      id, product_title, quantity, unit_price, size, color, cup_size
    )
  `)
  .order('created_at', { ascending: false });
```

### Créer une commande

```typescript
// 1. Créer la commande
const { data: order, error } = await supabase
  .from('orders')
  .insert({
    order_number: 'CMD-20240101-ABC123',
    subtotal: 15000,
    shipping_cost: 500,
    total: 15500,
    shipping_first_name: 'Jean',
    shipping_last_name: 'Dupont',
    shipping_email: 'jean@example.com',
    shipping_phone: '+221771234567',
    shipping_address: '123 Rue Example',
    shipping_city: 'Dakar',
    shipping_country: 'Sénégal',
    status: 'pending',
    payment_status: 'pending'
  })
  .select()
  .single();

// 2. Ajouter les articles
const { error: itemsError } = await supabase
  .from('order_items')
  .insert([
    {
      order_id: order.id,
      product_id: 'xxx',
      product_title: 'Produit 1',
      quantity: 2,
      unit_price: 5000,
      size: 'M',
      color: 'Noir'
    },
    {
      order_id: order.id,
      product_id: 'yyy',
      product_title: 'Produit 2',
      quantity: 1,
      unit_price: 5000
    }
  ]);
```

### Mettre à jour le statut

```typescript
const { error } = await supabase
  .from('orders')
  .update({
    status: 'shipped',
    tracking_number: 'TRACK123456'
  })
  .eq('id', orderId);

// L'historique est créé automatiquement via trigger
```

### Statuts disponibles

| Statut | Description |
|--------|-------------|
| `pending` | En attente de paiement |
| `confirmed` | Paiement confirmé |
| `processing` | En cours de préparation |
| `shipped` | Expédiée |
| `delivered` | Livrée |
| `cancelled` | Annulée |
| `refunded` | Remboursée |

---

## Codes Promo

### Types de réduction

| Type | Description |
|------|-------------|
| `percentage` | Pourcentage de réduction |
| `fixed` | Montant fixe |
| `free_shipping` | Livraison gratuite |
| `buy_x_get_y` | Achetez X, obtenez Y gratuit |

### Créer un code promo

```typescript
// Réduction de 20%
const { data, error } = await supabase
  .from('promo_codes')
  .insert({
    code: 'PROMO20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_amount: 10000,
    max_discount_amount: 5000,
    max_uses: 100,
    valid_from: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  })
  .select()
  .single();

// Livraison gratuite
const { data, error } = await supabase
  .from('promo_codes')
  .insert({
    code: 'FREESHIP',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_order_amount: 15000,
    is_active: true
  })
  .select()
  .single();

// Achetez 2, obtenez 1 gratuit
const { data, error } = await supabase
  .from('promo_codes')
  .insert({
    code: 'BUY2GET1',
    discount_type: 'buy_x_get_y',
    discount_value: 100, // 100% du produit gratuit
    buy_quantity: 2,
    get_quantity: 1,
    is_active: true
  })
  .select()
  .single();
```

### Valider un code promo

```typescript
const validatePromoCode = async (code: string, cartTotal: number) => {
  const { data: promo, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !promo) {
    throw new Error('Code promo invalide');
  }

  // Vérifier les dates
  if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
    throw new Error('Code promo expiré');
  }

  // Vérifier le montant minimum
  if (promo.min_order_amount && cartTotal < promo.min_order_amount) {
    throw new Error(`Montant minimum: ${promo.min_order_amount} FCFA`);
  }

  // Vérifier les utilisations
  if (promo.max_uses && promo.uses_count >= promo.max_uses) {
    throw new Error('Code promo épuisé');
  }

  return promo;
};
```

---

## Newsletter

### Ajouter un abonné

```typescript
const { data, error } = await supabase
  .from('newsletter_subscribers')
  .insert({
    email: 'user@example.com',
    name: 'Jean Dupont',
    source: 'website',
    status: 'active'
  })
  .select()
  .single();
```

### Sources disponibles

| Source | Description |
|--------|-------------|
| `website` | Formulaire du site |
| `checkout` | Pendant le checkout |
| `manual` | Ajout manuel |
| `import` | Import CSV |

### Exporter les abonnés

```typescript
const { data: subscribers } = await supabase
  .from('newsletter_subscribers')
  .select('email, name, status, source, subscribed_at')
  .eq('status', 'active')
  .csv();
```

---

## Livraison

### Créer une zone

```typescript
const { data: zone, error } = await supabase
  .from('shipping_zones')
  .insert({
    name: 'Dakar',
    countries: ['Sénégal'],
    cities: ['Dakar', 'Pikine', 'Guédiawaye'],
    is_active: true
  })
  .select()
  .single();
```

### Ajouter des tarifs

```typescript
const { data, error } = await supabase
  .from('shipping_rates')
  .insert({
    shipping_zone_id: zone.id,
    name: 'Livraison Standard',
    price: 1500,
    delivery_time: '2-3 jours',
    free_shipping_threshold: 20000,
    is_active: true
  })
  .select()
  .single();
```

### Calculer les frais de livraison

```typescript
const calculateShipping = async (city: string, cartTotal: number) => {
  // Trouver la zone
  const { data: zones } = await supabase
    .from('shipping_zones')
    .select(`
      id,
      shipping_rates (*)
    `)
    .contains('cities', [city])
    .eq('is_active', true);

  if (!zones?.length) {
    throw new Error('Zone de livraison non disponible');
  }

  const rates = zones[0].shipping_rates
    .filter((r: any) => r.is_active)
    .map((rate: any) => ({
      ...rate,
      finalPrice: rate.free_shipping_threshold && cartTotal >= rate.free_shipping_threshold
        ? 0
        : rate.price
    }));

  return rates;
};
```

---

## Messages de Contact

### Lister les messages

```typescript
const { data: messages } = await supabase
  .from('contact_messages')
  .select('*')
  .order('created_at', { ascending: false });
```

### Répondre à un message

```typescript
const { error } = await supabase
  .from('contact_messages')
  .update({
    admin_reply: 'Merci pour votre message...',
    status: 'replied',
    replied_at: new Date().toISOString()
  })
  .eq('id', messageId);
```

### Statuts disponibles

| Statut | Description |
|--------|-------------|
| `new` | Nouveau message |
| `in_progress` | En cours de traitement |
| `replied` | Répondu |
| `closed` | Fermé |

---

## Utilisateurs Admin

### Créer un utilisateur

```typescript
// Via Edge Function (recommandé)
const { data, error } = await supabase.functions.invoke('admin-create-user', {
  body: {
    email: 'editor@example.com',
    password: 'securepassword123',
    role: 'editor',
    fullName: 'Éditeur'
  }
});
```

### Modifier un rôle

```typescript
const { error } = await supabase
  .from('user_roles')
  .update({ role: 'admin' })
  .eq('user_id', userId);
```

---

## Blog

### Créer un article

```typescript
const { data, error } = await supabase
  .from('blog_posts')
  .insert({
    title: 'Mon Article',
    slug: 'mon-article',
    content: '# Contenu Markdown',
    excerpt: 'Résumé court',
    author: 'Admin',
    status: 'draft',
    tags: ['mode', 'lingerie']
  })
  .select()
  .single();
```

### Publier un article

```typescript
const { error } = await supabase
  .from('blog_posts')
  .update({
    status: 'published',
    published_at: new Date().toISOString()
  })
  .eq('id', postId);
```

### Générer avec l'IA

```typescript
const { data, error } = await supabase.functions.invoke('blog-generate', {
  body: {
    prompt: 'Écris un article sur les tendances lingerie 2024',
    style: 'informatif',
    length: 'medium'
  }
});
```

---

## Erreurs Courantes

### Code d'erreur Supabase

| Code | Description | Solution |
|------|-------------|----------|
| `PGRST116` | Aucun résultat trouvé | Vérifier les filtres |
| `23505` | Violation de contrainte unique | Slug/email existe déjà |
| `42501` | Permission refusée | Vérifier les politiques RLS |
| `22P02` | Type de données invalide | Vérifier le format des données |

### Exemple de gestion d'erreur

```typescript
const { data, error } = await supabase
  .from('products')
  .insert(productData);

if (error) {
  if (error.code === '23505') {
    throw new Error('Un produit avec ce slug existe déjà');
  }
  if (error.code === '42501') {
    throw new Error('Permission refusée');
  }
  throw new Error(`Erreur: ${error.message}`);
}
```
