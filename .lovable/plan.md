# Plan Autopassion BJ — Tâches restantes

> Dernière mise à jour : 2026-03-08
> Tout ce qui est déjà implémenté (rebranding, diagnostic IA, entretien, espace client, QR code, CRM, e-commerce, chat Témi, newsletter, rappels email, mentions légales) n'est pas listé ici.

---

## 🔴 Priorité haute

### 1. Catégories produits — Aligner DB avec le cahier des charges
- [ ] Créer les catégories manquantes :
  - `liquides` → "Liquide de refroidissement & lave-glace"
  - `purifiant-desodorisant` → "Purifiant & désodorisant"
  - `special-atelier` → "Spécial atelier"
  - `packs-entretien` → "Packs entretien"
  - `accessoires-electronique` → "Accessoires & Électronique auto"
  - `filtres` → "Filtres (huile, gasoil, air)"
- [ ] Désactiver les catégories parasites (Moto, Maison & Jardin)
- [ ] Mettre à jour le menu Header et Footer

### 2. Avis clients
- [ ] Affichage des avis sur la page produit (table `product_reviews` existe)
- [ ] Formulaire de soumission d'avis (note + commentaire)
- [ ] Section avis / témoignages sur la homepage

### 3. Badge "Support WhatsApp" dans la section confiance
- [ ] Ajouter un 4ème trust badge dans le Hero

### 4. Bouton WhatsApp → "Commander sur WhatsApp"
- [ ] Renommer le label du bouton flottant
- [ ] Adapter le message pré-rempli

---

## 🟡 Priorité moyenne

### 5. Types d'entretien véhicule — Compléter
- [ ] Ajouter dans l'espace véhicule :
  - Remplacement batterie
  - Remplacement filtres
  - Freins / Pneus
  - Assurance / Visite technique / TVM

### 6. Recommandation produit intelligente
- [ ] Suggestions de produits complémentaires dans la recherche
- [ ] Logique basée sur catégories / product_type

### 7. Page Accessoires & Électronique auto
- [ ] Page dédiée ou via catégorie
- [ ] Lien dans le menu principal

### 8. Garages partenaires
- [ ] Suggestion après diagnostic
- [ ] Table `partner_garages` si nécessaire

---

## 🟠 Futur

### 9. Entretien moteur 360°
- [ ] Page placeholder ou section complète (à décider)

---

## ❌ Exclus du scope
- Décodage VIN automatique
- WhatsApp Business API (rappels auto)
- Rappels SMS
