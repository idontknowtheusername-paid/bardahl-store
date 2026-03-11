# 📘 Guide Complet — Autopassion BJ

## Plateforme E-commerce & Gestion de Flotte Automobile

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Espace Client — Inscription & Connexion](#2-espace-client)
3. [Gestion des véhicules](#3-gestion-des-véhicules)
4. [Plan de lubrification](#4-plan-de-lubrification)
5. [Carnet d'entretien numérique](#5-carnet-dentretien-numérique)
6. [QR Code du carnet d'entretien](#6-qr-code-du-carnet-dentretien)
7. [Boutique — Acheter des produits](#7-boutique)
8. [Packs d'entretien](#8-packs-dentretien)
9. [Administration — Vue d'ensemble](#9-administration)
10. [Admin — Gestion des clients](#10-admin-gestion-des-clients)
11. [Admin — Validation des entretiens](#11-admin-validation-des-entretiens)
12. [Admin — Gestion des produits](#12-admin-gestion-des-produits)
13. [Rappels automatiques de vidange](#13-rappels-automatiques)
14. [Système de recommandation de produits](#14-recommandation-de-produits)
15. [FAQ](#15-faq)

---

## 1. Présentation générale

**Autopassion BJ** est une plateforme complète qui combine :
- 🛒 **E-commerce** : vente de produits Bardahl (huiles, additifs, nettoyants, filtres)
- 🚗 **Gestion de flotte** : suivi des véhicules, plans de lubrification personnalisés
- 📋 **Carnet d'entretien numérique** : historique complet de maintenance avec QR code
- 🔔 **Rappels automatiques** : notifications de vidange par email

---

## 2. Espace Client

### Inscription
1. Aller sur le site → **Mon Espace** ou **Connexion**
2. Saisir votre **numéro de téléphone** (format : +229XXXXXXXX)
3. Un mot de passe temporaire vous est envoyé
4. Connectez-vous et accédez à votre tableau de bord

### Tableau de bord client
Une fois connecté, vous voyez :
- Vos **véhicules** enregistrés
- Un bouton **Ajouter un véhicule**
- L'accès rapide au **carnet d'entretien** de chaque véhicule

---

## 3. Gestion des véhicules

### Ajouter un véhicule
1. Depuis **Mon Espace** → cliquer **+ Ajouter un véhicule**
2. Remplir les informations :
   - **Plaque d'immatriculation** (obligatoire)
   - **Marque** (ex: Toyota, Hyundai, Mercedes)
   - **Modèle** (ex: Corolla, Tucson, C200)
   - **Année** (ex: 2018)
   - **Type de carburant** (Essence, Diesel, Hybride)
   - **Kilométrage actuel** (optionnel)
   - **Numéro VIN** (optionnel)
3. Cliquer **Enregistrer**

### Accéder au détail d'un véhicule
- Cliquer sur la carte du véhicule → page de détail avec 4 onglets :
  - **Entretien** : carnet d'entretien + tableau de santé
  - **Lubrification** : plan technique détaillé
  - **Alertes** : gestion des rappels de vidange
  - **QR Code** : génération et paiement du QR

---

## 4. Plan de lubrification

### Qu'est-ce que c'est ?
Le plan de lubrification est une fiche technique personnalisée pour chaque véhicule. Il contient :

| Champ | Description | Exemple |
|-------|-------------|---------|
| Huile moteur | Type d'huile recommandé | 5W-30 Synthétique |
| Quantité moteur | Volume nécessaire | 4.5L |
| Huile boîte | Type d'huile de transmission | 75W-90 |
| Quantité boîte | Volume pour la boîte | 2.5L |
| Fréquence (km) | Intervalle de vidange en km | 10 000 km |
| Fréquence (mois) | Intervalle en mois | 6 mois |
| Liquide refroidissement | Type de liquide | G12+ Rose |
| Liquide de frein | Type | DOT 4 |
| Nettoyant moteur | Produit recommandé | Bardahl Engine Flush |
| Nettoyant boîte | Produit recommandé | ATF Flush |
| Nettoyant radiateur | Produit recommandé | Radiator Flush |

### Auto-complétion intelligente 🌟
Le système contient une **base de données de spécifications** par marque, modèle et année. Quand vous ajoutez un véhicule :
- Si une correspondance existe → les 11 champs sont **pré-remplis automatiquement**
- Un badge **✨ Pré-rempli automatiquement** apparaît
- Vous pouvez modifier les valeurs ou **réinitialiser** aux valeurs d'usine

### Comment configurer manuellement
1. Aller dans la page du véhicule → onglet **Lubrification**
2. Cliquer **Modifier le plan**
3. Remplir les champs souhaités
4. Cliquer **Sauvegarder**

---

## 5. Carnet d'entretien numérique

### Types d'entretien suivis

**Mécanique :**
- Vidange moteur
- Vidange boîte
- Remplacement batterie
- Remplacement filtres
- Freins
- Pneus

**Administratif :**
- Assurance (date d'expiration)
- Visite technique
- TVM (Taxe sur les Véhicules à Moteur)

### Ajouter un entretien
1. Page du véhicule → onglet **Entretien**
2. Cliquer **+ Ajouter**
3. Remplir :
   - **Type d'entretien** (sélectionner dans la liste)
   - **Dernière date** (quand l'entretien a été fait)
   - **Prochaine date** (prochaine échéance)
   - **Kilométrage** au moment de l'entretien
   - **Notes** (optionnel : garage, références...)
4. Cliquer **Enregistrer**

### Modifier un entretien
- Cliquer l'icône ✏️ sur la ligne de l'entretien
- Modifier les valeurs
- Sauvegarder

### Tableau de santé du véhicule
En haut de l'onglet Entretien, un **dashboard visuel** montre :
- 🟢 Éléments à jour (entretien fait récemment)
- 🟡 Éléments bientôt à renouveler
- 🔴 Éléments en retard ou expirés

---

## 6. QR Code du carnet d'entretien

### Fonctionnement
1. Sur la page du véhicule → onglet **QR Code**
2. Cliquer **Générer le QR Code**
3. **Payer l'activation** via KkiaPay (le prix est configurable par l'admin)
4. Une fois payé, le QR code est **actif** et scannable par n'importe qui
5. Scanner le QR → affiche le **carnet d'entretien complet** du véhicule (même sans compte)

### Carte QR personnalisée
Le QR code est généré sous forme de **carte haute résolution** (PNG) avec :
- Logo Autopassion BJ
- Informations du véhicule (marque, modèle, plaque)
- QR code scannable
- Téléchargeable et imprimable

---

## 7. Boutique

### Navigation
- **Accueil** → produits phares, nouveautés, catégories
- **Catégories** → Huiles moteur, Additifs, Nettoyants, Filtres, Graisses, Packs entretien...
- **Page produit** → détail, prix, ajout au panier

### Achat
1. Ajouter au panier
2. Vérifier le panier
3. Remplir les informations de livraison
4. Appliquer un **code promo** (si disponible)
5. Payer via **KkiaPay** (Mobile Money, carte bancaire)
6. Recevoir la **confirmation** par email

---

## 8. Packs d'entretien

### Comment créer un pack (Admin)
1. Admin → **Produits** → **Ajouter un produit**
2. Configurer :
   - **Titre** : ex. "Pack Vidange Essence Complet"
   - **Type de produit** : `pack-entretien`
   - **Catégorie** : sélectionner "Packs entretien"
   - **Prix** : prix du pack (ex. 25 000 FCFA)
   - **Prix barré** (Compare at price) : prix si achetés séparément (ex. 32 000 FCFA)
3. Le site affiche automatiquement :
   - ✅ Le prix du pack
   - ✅ Le prix barré
   - ✅ Le badge de réduction (ex. "-22%")
4. Dans la **description**, lister le contenu :
   - Huile moteur (type, viscosité)
   - Additif (essence ou diesel)
   - Nettoyant pré-vidange
   - Filtre (si inclus)

### Conseils
- Créer **2 packs séparés** : un Essence et un Diesel
- Ou un pack "Entretien Complet" qui inclut tout

---

## 9. Administration

### Accès
- URL : `votre-domaine.com/admin` (ou URL de l'admin déployé)
- **Connexion** : email + mot de passe (rôle admin requis)

### Tableau de bord
- Chiffre d'affaires, commandes, clients actifs
- Graphiques de tendance
- Alertes sur les commandes en attente

### Sections principales
| Section | Description |
|---------|-------------|
| Produits | Ajouter/modifier/supprimer des produits |
| Commandes | Gérer les commandes, statuts, notes |
| Clients | Voir tous les clients + détail véhicules |
| Codes promo | Créer des réductions |
| Blog | Publier des articles |
| Médias | Galerie d'images |
| Livraison | Zones et tarifs de livraison |
| Rappels | Gestion des rappels de vidange |
| Finances | Dépenses et revenus |
| Paramètres | Configuration du site |

---

## 10. Admin — Gestion des clients

### Liste des clients
- Recherche par nom, téléphone ou email
- Voir le nombre de véhicules, commandes et total dépensé
- **Cliquer sur un client** → ouvre sa **fiche détaillée**

### Fiche client détaillée
La page affiche :
1. **Informations personnelles** : nom, téléphone, email, ville, date d'inscription
2. **Statistiques** : véhicules, commandes, CA, QR codes actifs
3. **Sélecteur de véhicule** : onglets pour basculer entre les véhicules
4. Pour chaque véhicule :
   - **Infos** : plaque, marque, modèle, année, carburant, kilométrage, VIN
   - **QR Code** : statut payé/non payé
   - **Plan de lubrification** : tous les 11 champs (modifiable par l'admin)
   - **Carnet d'entretien** : historique complet avec statut de validation
5. **Commandes** du client avec liens directs

### Actions admin sur un véhicule
- ✏️ **Modifier** le plan de lubrification
- ✏️ **Modifier** un entretien
- ➕ **Ajouter** un entretien manuellement
- ✅ **Valider** un entretien (confirmer qu'il a bien été effectué)
- ❌ **Annuler** une validation

---

## 11. Admin — Validation des entretiens

### Pourquoi valider ?
- Le client saisit ses entretiens lui-même
- L'admin peut **confirmer** qu'un entretien a bien été réalisé (ex: après passage à l'atelier)
- Un badge **"Validé"** apparaît avec la date de validation

### Statuts d'un entretien
| Statut | Badge | Signification |
|--------|-------|---------------|
| Prévu | 🔵 Prévu | Entretien planifié mais pas encore effectué |
| En retard | 🔴 En retard | Date prévue dépassée |
| Validé | 🟢 Validé | Confirmé par l'admin |

### Comment valider
1. Admin → Clients → cliquer sur le client
2. Sélectionner le véhicule
3. Dans le carnet d'entretien, cliquer **Valider** sur l'entretien concerné
4. Le statut passe à "Validé" avec la date

---

## 12. Admin — Gestion des produits

### Créer un produit
1. Admin → Produits → **Ajouter un produit**
2. Remplir :
   - Titre, slug, description
   - Prix, prix barré (optionnel pour les promotions)
   - Type de produit (huile-moteur, additif, nettoyant-moteur, etc.)
   - Catégorie(s)
   - Stock, SKU
   - Images (galerie multiple)
3. Options :
   - **En vedette** : apparaît dans la section "Produits phares"
   - **Nouveau** : badge "Nouveau" affiché
   - **Actif** : visible sur le site

### Types de produits
- `huile-moteur` — Huiles moteur
- `huile-transmission` — Huiles de boîte/transmission
- `additif` — Additifs carburant
- `nettoyant-moteur` — Nettoyants pré-vidange
- `nettoyant-transmission` — Flush boîte auto
- `filtre` — Filtres
- `liquide-refroidissement` — Liquides de refroidissement
- `graisse` — Graisses
- `pack-entretien` — Packs d'entretien
- `accessoire` — Accessoires

---

## 13. Rappels automatiques

### Fonctionnement
- Quand un client achète une huile moteur → un **rappel de vidange** est créé
- Le système envoie des notifications :
  - À la **moitié** de l'intervalle
  - **1 semaine** avant l'échéance
  - **1 jour** avant l'échéance
- L'intervalle par défaut est **6 mois** (modifiable)

### Configuration client
Chaque client peut personnaliser :
- L'intervalle de rappel (3, 6, 9 ou 12 mois)
- Les types de notification activés

---

## 14. Recommandation de produits

### Logique de recommandation
Sur chaque page produit, deux sections de recommandation :

**"Souvent achetés ensemble"** — Produits complémentaires :
| Si le client regarde... | On recommande... |
|------------------------|-------------------|
| Huile moteur | Nettoyants moteur, additifs, filtres |
| Additif | Huiles, nettoyants, filtres |
| Nettoyant moteur | Huiles, additifs, filtres |
| Huile transmission | Nettoyants transmission |
| Filtre | Huiles, additifs, nettoyants |

**Règle d'or** : On ne recommande **JAMAIS** un produit du même type que celui consulté (ex: pas d'huile moteur sur une page d'huile moteur).

---

## 15. FAQ

**Q: Comment récupérer mon mot de passe ?**
R: Utilisez la fonctionnalité "Mot de passe oublié" sur la page de connexion.

**Q: Le QR code est-il valable à vie ?**
R: Oui, une fois payé, le QR code reste actif indéfiniment.

**Q: Puis-je ajouter plusieurs véhicules ?**
R: Oui, il n'y a pas de limite.

**Q: Comment contacter l'assistance ?**
R: Via le bouton WhatsApp sur le site ou via la page Contact.

**Q: Les données de mon véhicule sont-elles sécurisées ?**
R: Oui, chaque utilisateur ne voit que ses propres véhicules. L'accès est protégé par authentification et des règles de sécurité au niveau de la base de données.

---

*Document généré le 11 mars 2026 — Autopassion BJ*
*Pour toute question, contactez l'équipe technique.*
