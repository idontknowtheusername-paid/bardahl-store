import crypto from 'crypto'

const email = 'adminlingerie.maxiimarket.com'
const password = 'BEyondLingerie@22'

// Générer salt
const salt = crypto.randomBytes(16).toString('hex')

// Hasher le mot de passe avec le salt
const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')

console.log(`
-- SQL pour ajouter l'admin
INSERT INTO users (email, hash, salt, created_at, updated_at)
VALUES (
  '${email}',
  '${hash}',
  '${salt}',
  NOW(),
  NOW()
);

-- Ajouter le rôle admin
INSERT INTO users_roles ("order", parent_id, value)
SELECT 0, id, 'admin'
FROM users
WHERE email = '${email}';
`)
