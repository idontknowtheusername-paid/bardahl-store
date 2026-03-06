# Plan d'implémentation — Autopassion BJ

## Vue d'ensemble
Transformer la plateforme e-commerce Bardahl actuelle en **Autopassion BJ** : plateforme automobile digitale complète (e-commerce + diagnostic IA + carnet d'entretien + CRM + espace client véhicule).

---

## PHASE 1 — Rebranding & Restructuration UI

### 1.1 Identité visuelle Autopassion
- [ ] Mettre à jour `index.css` et `tailwind.config.ts` avec la nouvelle palette :
  - Bleu principal : `#2F6FB5`
  - Orange accent : `#F59E0B`
  - Gris foncé : `#1F2937`
  - Blanc : `#FFFFFF`
- [ ] Remplacer le logo Bardahl par le logo/nom Autopassion BJ
- [ ] Mettre à jour `site_settings` en BDD (site_name, description, etc.)
- [ ] Mettre à jour les meta SEO (title, description, OG tags)

### 1.2 Nouveau menu principal
Structure cible :
```
Accueil
Assistance & Diagnostic auto
Entretien véhicule
Produits ▼
  - Huiles moteur
  - Huiles boîtes & transmission
  - Additifs
  - Liquide de refroidissement & lave-glace
  - Purifiant & désodorisant
  - Spécial atelier
Accessoires & électronique voiture
Conseils auto (Blog)
Mon espace véhicule (connexion client)
À propos
Contact
```
- [ ] Refactorer `Header.tsx` avec le nouveau menu
- [ ] Créer les nouvelles routes dans `App.tsx`
- [ ] Mettre à jour `Footer.tsx`
- [ ] Ajouter les nouvelles catégories en BDD

### 1.3 Page d'accueil repensée
- [ ] Hero section avec phrase d'accroche : « Prenez soin de votre moteur. Nous vous guidons. »
- [ ] 3 entrées principales (CTA cards) :
  1. **Trouver mon huile** → Sélecteur véhicule existant
  2. **Diagnostiquer ma voiture** → Nouveau flow diagnostic
  3. **Entretenir mon moteur** → Page entretien
- [ ] Section confiance (Paiement sécurisé Mobile Money, Livraison rapide, Produits authentiques, Support WhatsApp)
- [ ] Sections produits populaires, nouveautés, témoignages (existants, à adapter)

### 1.4 Boutons flottants latéraux
- [ ] Créer composant `FloatingActions.tsx` avec 3 boutons visibles partout :
  1. Diagnostiquer ma voiture
  2. Chat assistant
  3. Commander sur WhatsApp

---

## PHASE 2 — Diagnostic auto guidé

### 2.1 Flow diagnostic interactif
- [ ] Créer page `/diagnostic` avec UI step-by-step :
  - **Étape 1** : Sélection du symptôme (cards visuelles) :
    - Fumée noire
    - Perte de puissance
    - Consommation élevée
    - Moteur qui tremble
    - Démarrage difficile
    - Moteur bruyant
  - **Étape 2** : Questions complémentaires :
    - Diesel ou essence ?
    - Kilométrage approximatif ?
    - Année du véhicule ?
  - **Étape 3** : Résultat IA (via `bardahl-assistant` edge function) :
    - Diagnostic probable
    - Produits recommandés (liens vers boutique)
    - Suggestion garage partenaire (optionnel)
    - Bouton "Acheter maintenant"

### 2.2 Adapter l'edge function `bardahl-assistant`
- [ ] Renommer le system prompt en "Autopassion"
- [ ] Ajouter un mode "diagnostic structuré" qui accepte symptôme + infos véhicule
- [ ] Retourner des IDs produits pour lier directement aux fiches produit

---

## PHASE 3 — Section Entretien véhicule

### 3.1 Page `/entretien`
- [ ] Créer page avec sous-sections (cards/grille) :
  - Nettoyer le moteur
  - Protéger le moteur
  - Réduire consommation carburant
  - Faire la vidange moteur
  - Vidange boîte
  - Vidange radiateur
  - Réparer les fuites
  - Confort & désodorisant
- [ ] Chaque sous-section mène aux produits filtrés par catégorie correspondante

---

## PHASE 4 — Authentification client (Mon espace véhicule)

### 4.1 Schéma BDD
```sql
-- Table clients (séparée de user_roles admin)
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone text UNIQUE NOT NULL,
  email text,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table véhicules
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  license_plate text UNIQUE NOT NULL,
  brand text,
  model text,
  year integer,
  fuel_type text, -- 'diesel' | 'essence'
  mileage integer,
  vin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour login par plaque
CREATE INDEX idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX idx_customers_phone ON public.customers(phone);
```

### 4.2 Logique d'authentification
- Inscription : crée un user Supabase Auth (email = `{phone}@autopassion.local`), puis insère dans `customers`
- Connexion par téléphone : lookup `customers.phone` → récupère email fictif → `signInWithPassword`
- Connexion par plaque : lookup `vehicles.license_plate` → récupère `customer_id` → `customers.phone` → même flow
- Edge function `customer-auth` pour gérer inscription/connexion
- `src/context/CustomerAuthContext.tsx`
- Pages : `/mon-espace/inscription`, `/mon-espace/connexion`, `/mon-espace`

### 4.3 UI Mon espace véhicule
- Dashboard client après connexion : liste véhicules, ajout véhicule, carnet d'entretien, plan de lubrification, historique commandes

---

## PHASE 5 — Carnet d'entretien digital

### 5.1 Schéma BDD
```sql
CREATE TABLE public.maintenance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  maintenance_type text NOT NULL,
  last_date timestamptz,
  next_date timestamptz,
  mileage_at_service integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lubrication_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  oil_type_engine text,
  oil_type_gearbox text,
  oil_quantity_engine text,
  oil_quantity_gearbox text,
  change_frequency_km integer,
  change_frequency_months integer,
  reminder_frequency_months integer DEFAULT 6,
  recommended_product_id uuid REFERENCES public.products(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.vehicle_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  qr_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_paid boolean DEFAULT false,
  payment_id text,
  created_at timestamptz DEFAULT now()
);
```

### 5.2 Pages client
- `/mon-espace/vehicule/:id` — Détail véhicule + entretiens + plan lubrification
- `/qr/:token` — Page publique accessible via QR (carnet en lecture seule)

### 5.3 QR Code payant (1000 FCFA)
- Flow : clic "Générer QR" → paiement 1000 FCFA via KkiaPay/GeniusPay → `is_paid = true` → téléchargement QR
- Le QR pointe vers `/qr/{token}`

---

## PHASE 6 — Recommandations intelligentes

- Sur page produit : "Produits complémentaires recommandés" (basé sur catégories/product_type)
- Recherche améliorée : suggestions temps réel, recherche par symptôme, par véhicule

---

## PHASE 7 — CRM Admin enrichi

- Enrichir `Customers.tsx` : liste clients + véhicules, historique commandes/diagnostics/entretiens
- Rappels multi-canal : email (Resend), WhatsApp (lien wa.me pré-rempli)

---

## PHASE 8 — Mentions légales & Disclaimer

- Infos société : N°RCCM RB/PKO/17 A 4167, 01 BP 369 Parakou, Tél: 96786284/62216766, N°IFU: 2201501541800
- Disclaimer diagnostic : « Le diagnostic proposé est indicatif et ne remplace pas l'avis d'un mécanicien professionnel. »
- Disclaimer marque : « Bardahl est une marque déposée. Autopassion BJ est un distributeur indépendant. »

---

## PHASE 9 — WhatsApp achat direct

- Bouton "Commander sur WhatsApp" sur chaque fiche produit (message pré-rempli)
- Bouton flottant global

---

## PHASE 10 — Finalisation

- SEO, lazy loading, sitemap
- Préparation domaines autopassionbj.com / autopassion.bj
- Tests complets de tous les flows

---

## Ordre d'exécution

| Étape | Phase | Priorité |
|-------|-------|----------|
| 1 | Phase 1 — Rebranding & Menu | 🔴 Critique |
| 2 | Phase 2 — Diagnostic auto | 🔴 Critique |
| 3 | Phase 3 — Entretien véhicule | 🟡 Important |
| 4 | Phase 4 — Auth client | 🔴 Critique |
| 5 | Phase 5 — Carnet d'entretien + QR | 🔴 Critique |
| 6 | Phase 6 — Recommandations | 🟡 Important |
| 7 | Phase 7 — CRM admin | 🟡 Important |
| 8 | Phase 8 — Mentions légales | 🟢 Facile |
| 9 | Phase 9 — WhatsApp | 🟢 Facile |
| 10 | Phase 10 — Finalisation | 🟡 Important |

## Tables BDD à créer
- `customers` — Clients avec auth par téléphone
- `vehicles` — Véhicules liés aux clients
- `maintenance_records` — Entrées du carnet d'entretien
- `lubrication_plans` — Plans de lubrification par véhicule
- `vehicle_qr_codes` — QR codes payants

## Edge functions à créer/modifier
- `customer-auth` — Inscription/connexion client (téléphone ou plaque)
- `bardahl-assistant` → renommer context en "Autopassion", ajouter mode diagnostic structuré
- `oil-change-reminder` → adapter pour utiliser `maintenance_records`

## Fichiers principaux à créer
- `src/context/CustomerAuthContext.tsx`
- `src/pages/Diagnostic.tsx`
- `src/pages/Entretien.tsx`
- `src/pages/MonEspace/*.tsx` (connexion, inscription, dashboard, véhicule)
- `src/pages/QRView.tsx` (page publique QR)
- `src/components/FloatingActions.tsx`
