# Guide de Déploiement Render - Backend AdminJS

## 🚀 Déploiement Rapide

### Étape 1 : Préparer le repository

```bash
# Assurez-vous que tous les fichiers sont commités
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Étape 2 : Créer le compte Render

1. Allez sur https://render.com
2. Créez un compte (gratuit)
3. Connectez votre compte GitHub/GitLab

### Étape 3 : Déployer avec Blueprint

1. Dashboard Render → **New** → **Blueprint**
2. Sélectionnez votre repository
3. Render détecte `render.yaml` automatiquement
4. Cliquez sur **Apply**

### Étape 4 : Configurer les variables d'environnement

Dans le dashboard, allez dans votre service et ajoutez :

#### Variables obligatoires

```bash
ADMIN_EMAIL=admin@cannesh.com
ADMIN_PASSWORD=VotreMotDePasseSecurise123!
FRONTEND_URL=https://votre-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=djgcp5ksk
CLOUDINARY_API_KEY=837212399797496
CLOUDINARY_API_SECRET=cA2ssd43S2JDmswM-GqNtBo5ZkA
RESEND_API_KEY=re_votre_cle
LYGOS_API_KEY=votre_cle_lygos
LYGOS_SECRET_KEY=votre_secret_lygos
```

### Étape 5 : Vérifier le déploiement

```bash
# Test health check
curl https://cannesh-backend-adminjs.onrender.com/api/health

# Devrait retourner :
# {"status":"ok","timestamp":"..."}
```

### Étape 6 : Accéder à l'admin

Ouvrez : `https://cannesh-backend-adminjs.onrender.com/admin`

Connectez-vous avec :
- Email : `ADMIN_EMAIL`
- Password : `ADMIN_PASSWORD`

---

## 📋 Configuration Détaillée

### Structure des fichiers

```
backend-adminjs/
├── render.yaml           # Configuration Blueprint Render
├── Dockerfile           # Image Docker (optionnel)
├── .dockerignore        # Fichiers à exclure du build
├── render-build.sh      # Script de build personnalisé
├── .env.render          # Template des variables d'env
├── README.deploy.md     # Guide complet
└── DEPLOYMENT.md        # Ce fichier
```

### render.yaml expliqué

```yaml
services:
  - type: web                    # Service web
    name: cannesh-backend-adminjs
    runtime: node                # Runtime Node.js
    region: frankfurt            # Région EU
    plan: starter                # Plan gratuit
    buildCommand: npm install && npm run db:generate && npm run build
    startCommand: npm start
    healthCheckPath: /api/health # Endpoint de santé
    autoDeploy: true            # Déploiement auto sur push

databases:
  - name: cannesh-db            # Base PostgreSQL
    region: frankfurt
    plan: starter               # Gratuit 90 jours
```

### Variables d'environnement

#### Auto-configurées par Render

- `DATABASE_URL` : Connexion PostgreSQL
- `SESSION_SECRET` : Secret de session (généré)
- `PORT` : Port du serveur (10000)
- `NODE_ENV` : Environment (production)

#### À configurer manuellement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Email admin | `admin@cannesh.com` |
| `ADMIN_PASSWORD` | Mot de passe admin | `SecurePass123!` |
| `FRONTEND_URL` | URL du frontend | `https://cannesh.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud | `djgcp5ksk` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `837212399797496` |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | `cA2ssd43S2JDmswM...` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxx` |
| `LYGOS_API_KEY` | Lygos API key | `lygosapp-xxxxx` |
| `LYGOS_SECRET_KEY` | Lygos secret | `xxxxx` |

---

## 🔧 Commandes Utiles

### Logs en temps réel

```bash
# Via dashboard Render
Dashboard → Service → Logs
```

### Shell interactif

```bash
# Via dashboard Render
Dashboard → Service → Shell
```

### Migrations manuelles

```bash
# Dans le shell Render
npm run db:migrate:deploy
```

### Seed de la base

```bash
# Dans le shell Render
npm run db:seed
```

---

## 🐛 Troubleshooting

### Problème : Service ne démarre pas

**Solution :**
1. Vérifiez les logs : Dashboard → Logs
2. Vérifiez que `DATABASE_URL` est configuré
3. Vérifiez que toutes les variables d'env sont présentes

```bash
# Dans le shell Render
echo $DATABASE_URL
echo $ADMIN_EMAIL
```

### Problème : Erreur Prisma

**Solution :**
```bash
# Régénérer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate:deploy
```

### Problème : AdminJS ne charge pas

**Solution :**
1. Vérifiez `SESSION_SECRET` est défini
2. Essayez en navigation privée
3. Vérifiez les logs pour erreurs CSP

### Problème : CORS errors

**Solution :**
Vérifiez que `FRONTEND_URL` correspond exactement à l'URL de votre frontend :

```bash
# Mauvais
FRONTEND_URL=https://cannesh.vercel.app/

# Bon
FRONTEND_URL=https://cannesh.vercel.app
```

### Problème : 502 Bad Gateway

**Causes possibles :**
- Service en cours de redémarrage (attendez 1-2 min)
- Erreur au démarrage (vérifiez les logs)
- Base de données non connectée

---

## 📊 Monitoring

### Health Check

Render vérifie automatiquement `/api/health` toutes les 30 secondes.

### Métriques disponibles

- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

### Alertes

Configurez des alertes pour :
- Service down
- High error rate
- High memory usage

---

## 💰 Coûts

### Plan Starter (Gratuit)

**Web Service :**
- ✅ 750 heures/mois gratuites
- ⚠️ Service s'endort après 15min d'inactivité
- ⚠️ Réveil lent (~30 secondes)
- 512 MB RAM

**PostgreSQL :**
- ✅ Gratuit pendant 90 jours
- 💵 Puis $7/mois
- 1 GB stockage
- 100 connexions

### Plan Standard ($7-25/mois)

**Avantages :**
- ✅ Pas de mise en veille
- ✅ Démarrage instantané
- ✅ Plus de RAM/CPU
- ✅ Meilleure performance

---

## 🔒 Sécurité

### Checklist de sécurité

- [ ] Mot de passe admin fort et unique
- [ ] `SESSION_SECRET` généré aléatoirement (32+ caractères)
- [ ] Variables sensibles marquées comme "secret" dans Render
- [ ] HTTPS activé (automatique)
- [ ] CORS configuré pour votre domaine uniquement
- [ ] Rate limiting activé (à implémenter)
- [ ] Logs ne contiennent pas de données sensibles

### Générer un SESSION_SECRET sécurisé

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Rotation des secrets

Changez régulièrement (tous les 3-6 mois) :
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- Clés API tierces

---

## 🔄 Mises à jour

### Déploiement automatique

Chaque `git push` sur `main` déclenche un déploiement automatique.

### Déploiement manuel

```bash
# Via dashboard
Dashboard → Service → Manual Deploy → Deploy latest commit
```

### Rollback

```bash
# Via dashboard
Dashboard → Service → Events → [Sélectionner déploiement] → Rollback
```

---

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [Render Status](https://status.render.com)
- [Render Pricing](https://render.com/pricing)
- [Prisma Docs](https://www.prisma.io/docs)
- [AdminJS Docs](https://docs.adminjs.co)

---

## 🆘 Support

### Render Support
- Dashboard → Help
- Email : support@render.com
- Community : https://community.render.com

### Logs utiles

```bash
# Logs complets
Dashboard → Service → Logs

# Logs de build
Dashboard → Service → Events → [Déploiement] → Build Logs

# Logs de runtime
Dashboard → Service → Logs (temps réel)
```

---

## ✅ Checklist de déploiement

Avant de déployer :

- [ ] Code commité et pushé sur GitHub/GitLab
- [ ] `render.yaml` configuré
- [ ] Variables d'environnement préparées
- [ ] Compte Render créé
- [ ] Repository connecté à Render

Après déploiement :

- [ ] Health check répond (200 OK)
- [ ] Admin panel accessible
- [ ] Connexion admin fonctionne
- [ ] Base de données connectée
- [ ] API endpoints fonctionnent
- [ ] CORS configuré correctement
- [ ] Emails de test envoyés
- [ ] Logs vérifiés (pas d'erreurs)

---

**Bon déploiement ! 🚀**
