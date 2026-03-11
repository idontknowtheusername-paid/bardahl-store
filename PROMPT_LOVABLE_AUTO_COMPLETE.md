# Prompt pour Lovable : Auto-complétion du plan de lubrification

## Contexte
La migration SQL `supabase/migrations/20260310200000_create_vehicle_specifications.sql` a déjà été créée avec la table `vehicle_specifications` qui contient les spécifications techniques des véhicules (huiles, liquides, nettoyants, fréquences).

## Objectif
Implémenter l'auto-complétion du formulaire de plan de lubrification dans `src/pages/VehicleDetail.tsx` en utilisant les données de `vehicle_specifications`.

## Tâches à réaliser

### 1. Exécuter la migration
- Exécuter la migration `supabase/migrations/20260310200000_create_vehicle_specifications.sql` qui crée la table `vehicle_specifications`
- La table contient : brand, model, year_start, year_end, engine_type, oil_type_engine, oil_quantity_engine, recommended_viscosity_tropical, oil_type_gearbox, oil_quantity_gearbox, coolant_type, brake_fluid_type, engine_cleaner, gearbox_cleaner, radiator_cleaner, change_frequency_km, change_frequency_months

### 2. Mettre à jour les types TypeScript
- Mettre à jour `src/integrations/supabase/types.ts` pour inclure le type `vehicle_specifications`
- Ajouter les types Row, Insert, Update pour cette table

### 3. Modifier VehicleDetail.tsx

#### A. Ajouter la logique d'auto-complétion
Quand l'utilisateur clique sur "Configurer" ou "Modifier" le plan de lubrification :

1. **Récupérer les infos du véhicule** depuis `customer_vehicles` :
   - `vehicle.brand` (ex: "Toyota")
   - `vehicle.model` (ex: "Corolla")
   - `vehicle.year` (ex: 2015)
   - `vehicle.fuel_type` (ex: "Essence")

2. **Chercher dans `vehicle_specifications`** :
   ```typescript
   const { data: spec } = await supabase
     .from('vehicle_specifications')
     .select('*')
     .eq('brand', vehicle.brand)
     .eq('model', vehicle.model)
     .lte('year_start', vehicle.year)
     .gte('year_end', vehicle.year)
     .maybeSingle();
   ```

3. **Si trouvé** : Pré-remplir automatiquement tous les champs du formulaire :
   - `setPlanEngine(spec.oil_type_engine || '')`
   - `setPlanGearbox(spec.oil_type_gearbox || '')`
   - `setPlanQtyEngine(spec.oil_quantity_engine?.toString() || '')`
   - `setPlanQtyGearbox(spec.oil_quantity_gearbox?.toString() || '')`
   - `setPlanCoolant(spec.coolant_type || '')`
   - `setPlanBrakeFluid(spec.brake_fluid_type || '')`
   - `setPlanEngineCleaner(spec.engine_cleaner || '')`
   - `setPlanGearboxCleaner(spec.gearbox_cleaner || '')`
   - `setPlanRadiatorCleaner(spec.radiator_cleaner || '')`
   - `setPlanFreqKm(spec.change_frequency_km?.toString() || '')`
   - `setPlanFreqMonths(spec.change_frequency_months?.toString() || '')`

4. **Si pas trouvé** : Laisser le formulaire vide (saisie manuelle)

#### B. Ajouter un badge visuel
- Si les données ont été pré-remplies automatiquement, afficher un badge au-dessus du formulaire :
  ```tsx
  {autoFilled && (
    <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 flex items-center gap-2">
      <span className="text-sm">✨ Pré-rempli automatiquement pour {vehicle.brand} {vehicle.model} ({vehicle.year})</span>
    </div>
  )}
  ```

#### C. Ajouter un bouton "Réinitialiser"
- À côté du bouton "Annuler", ajouter un bouton "🔄 Réinitialiser" qui :
  - Vide tous les champs du formulaire
  - Permet à l'utilisateur de saisir manuellement si les données auto-complétées sont incorrectes

#### D. État de chargement
- Afficher un loader pendant la recherche dans `vehicle_specifications`
- Message : "Recherche des spécifications..."

### 4. Gestion des erreurs
- Si la requête échoue, afficher un toast d'erreur mais permettre la saisie manuelle
- Ne pas bloquer l'utilisateur si l'auto-complétion ne fonctionne pas

### 5. UX/UI
- Le formulaire doit rester éditable même après auto-complétion
- L'utilisateur peut modifier n'importe quel champ pré-rempli
- Le badge "✨ Pré-rempli automatiquement" doit être visible mais discret
- Utiliser les composants UI existants (Button, Input, etc.)

## Notes importantes
- La table `vehicle_specifications` sera seedée plus tard avec ~50-100 véhicules populaires au Bénin
- Le champ `recommended_viscosity_tropical` est spécifique au climat béninois (10W40, 20W50)
- L'auto-complétion doit être transparente : si ça marche, super ; sinon, l'utilisateur peut saisir manuellement
- Ne pas casser le fonctionnement actuel du formulaire

## Résultat attendu
Quand un utilisateur avec une Toyota Corolla 2015 clique sur "Configurer" :
1. Le système cherche dans `vehicle_specifications`
2. Si trouvé : Tous les champs sont pré-remplis + badge "✨ Pré-rempli automatiquement"
3. L'utilisateur peut modifier les valeurs ou cliquer "🔄 Réinitialiser"
4. Il clique "Sauvegarder" pour enregistrer dans `lubrication_plans`

Si le véhicule n'est pas dans la base : formulaire vide, saisie manuelle normale.
