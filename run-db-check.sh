#!/bin/bash

# Script pour exécuter les vérifications de la base de données
# Usage: ./run-db-check.sh

# Charger les variables d'environnement
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep DATABASE_URL | xargs)
fi

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Vérification de la base de données ===${NC}\n"

# Vérifier si psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé. Installez PostgreSQL client."
    exit 1
fi

# Exécuter le script SQL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL n'est pas définie dans backend/.env"
    exit 1
fi

echo -e "${GREEN}✓ Connexion à la base de données...${NC}\n"

psql "$DATABASE_URL" -f check-database.sql

echo -e "\n${GREEN}✓ Vérification terminée${NC}"
