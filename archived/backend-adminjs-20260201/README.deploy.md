# Déploiement sur Render

Ce guide explique comment déployer le backend AdminJS sur Render.

## Prérequis

- Compte Render (https://render.com)
- Repository Git avec le code
- Variables d'environnement prêtes

## Option 1 : Déploiement avec render.yaml (Recommandé)

### 1. Connecter le repository

1. Allez sur https://dashboard.render.com
2. Cliquez sur "New" → "Blueprint"
3. Connectez votre repository GitHub/GitLab
4. Render détectera automatiquement le fichier `render.yaml`

### 2. Configurer les variables d'environnement

Dans le dashboard Render, configurez ces variables **avant** le premier déploiement :

```bash
# Admin credentials
ADMIN_EMAIL=admin@cannesh.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!

# Frontend URL
FRONTEND_URL=https://votre-frontend.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=djgcp5ksk
CLOUDINARY_API_KEY=837212399797496
CLOUDINARY_API_SECRET=cA2ssd43S2JDmswM-GqNtBo5ZkA

# Resend (Email)
RESEND_API_KEY=re_votre_cle_resend

# Lygos (Payment)
LYGOS_API_KEY=votre_cle_lygos
LYGOS_SECRET_KEY=votre_secret_lygos
```

### 3. Déployer

1. Cliquez sur "Apply" pour créer les services
2. Render va :
   - Créer la base de données PostgreSQL
   - Déployer le service web
   - Exécuter les migrations Prisma
   - Démarrer l'application

### 4. Accéder à l'application

Une fois déployé :
- API : `https://cannesh-backend-adminjs.onrender.com/api`
- Admin Panel : `https://cannesh-backend-adminjs.onrender.com/admin`
- Health Check : `https://cannesh-backend-adminjs.onrender.com/api/health`

## Option 2 : Déploiement manuel

### 1. Créer la base de données

1. Dashboard Render → "New" → "PostgreSQL"
2. Nom : `cannesh-db`
3. Database : `cannesh`
4. User : `cannesh_user`
5. Region : Frankfurt (ou proche de vos utilisateurs)
6. Plan : Starter (gratuit) ou Standard
7. Créer la base

### 2. Créer le Web Service

1. Dashboard Render → "New" → "Web Service"
2. Connectez votre repository
3. Configuration :
   - **Name** : `cannesh-backend-adminjs`
   - **Region** : Frankfurt
   - **Branch** : `main`
   - **Root Directory** : `backend-adminjs`
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run db:generate && npm run build`
   - **Start Command** : `npm start`
   - **Plan** : Starter (gratuit) ou Standard

### 3. Variables d'environnement

Ajoutez toutes les variables listées ci-dessus, plus :

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=[Auto-rempli depuis la base de données]
SESSION_SECRET=[Généré automatiquement]
```

### 4. Connecter la base de données

1. Dans les paramètres du Web Service
2. Section "Environment"
3. Ajoutez `DATABASE_URL` en sélectionnant votre base PostgreSQL

## Post-déploiement

### 1. Vérifier le déploiement

```bash
# Health check
curl https://cannesh-backend-adminjs.onrender.com/api/health

# Devrait retourner :
# {"status":"ok","timestamp":"2024-01-30T..."}
```

### 2. Seed initial (optionnel)

Si vous voulez peupler la base avec des données de test :

```bash
# Via Render Shell
npm run db:seed
```

### 3. Configurer le CORS

Assurez-vous que `FRONTEND_URL` pointe vers votre frontend déployé pour autoriser les requêtes CORS.

## Monitoring

### Logs

- Dashboard Render → Votre service → "Logs"
- Logs en temps réel de l'application

### Métriques

- Dashboard Render → Votre service → "Metrics"
- CPU, mémoire, requêtes HTTP

### Alertes

Configurez des alertes pour :
- Service down
- Erreurs 5xx
- Utilisation mémoire élevée

## Mise à jour

### Déploiement automatique

Chaque push sur la branche `main` déclenche un nouveau déploiement automatiquement.

### Déploiement manuel

1. Dashboard Render → Votre service
2. Cliquez sur "Manual Deploy" → "Deploy latest commit"

### Rollback

1. Dashboard Render → Votre service → "Events"
2. Trouvez le déploiement précédent
3. Cliquez sur "Rollback"

## Migrations de base de données

### Appliquer une migration

Les migrations Prisma sont appliquées automatiquement au build via `db:generate`.

Pour des migrations manuelles :

```bash
# Via Render Shell
npx prisma migrate deploy
```

### Créer une migration

En local :

```bash
npm run db:migrate -- --name nom_de_la_migration
```

Puis commit et push pour déployer.

## Troubleshooting

### Service ne démarre pas

1. Vérifiez les logs : Dashboard → Logs
2. Vérifiez que `DATABASE_URL` est correctement configuré
3. Vérifiez que toutes les variables d'environnement sont présentes

### Erreur de connexion DB

```bash
# Vérifier la connexion
npx prisma db pull
```

Si échec :
- Vérifiez que la base de données est active
- Vérifiez le format de `DATABASE_URL`
- Vérifiez les règles de firewall

### AdminJS ne charge pas

1. Vérifiez que `SESSION_SECRET` est défini
2. Vérifiez les logs pour erreurs CSP
3. Essayez en navigation privée (problème de cookies)

### Erreurs 502/503

- Le service redémarre (normal après déploiement)
- Attendez 1-2 minutes
- Si persiste, vérifiez les logs

## Coûts

### Plan Starter (Gratuit)

- Web Service : Gratuit (750h/mois)
- PostgreSQL : Gratuit (90 jours, puis $7/mois)
- Limitations :
  - Service s'endort après 15min d'inactivité
  - Réveil lent (~30s)
  - 512MB RAM

### Plan Standard ($7-25/mois)

- Pas de mise en veille
- Plus de RAM/CPU
- Meilleure performance

## Sécurité

### Checklist

- [ ] `ADMIN_PASSWORD` fort et unique
- [ ] `SESSION_SECRET` généré aléatoirement
- [ ] Variables sensibles marquées comme "secret"
- [ ] HTTPS activé (automatique sur Render)
- [ ] CORS configuré correctement
- [ ] Rate limiting activé (à implémenter)

### Rotation des secrets

Changez régulièrement :
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- Clés API tierces

## Support

- Documentation Render : https://render.com/docs
- Support Render : https://render.com/support
- Issues GitHub : [Votre repo]

## Ressources

- Dashboard : https://dashboard.render.com
- Status : https://status.render.com
- Pricing : https://render.com/pricing
