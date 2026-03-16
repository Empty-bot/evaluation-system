# ─── Stage 1 : Installation des dépendances ───────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copier uniquement les fichiers de dépendances pour profiter du cache Docker
COPY package*.json ./
RUN npm ci --only=production

# ─── Stage 2 : Image finale ────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copier les dépendances installées depuis le stage précédent
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Créer le dossier logs (utilisé par Winston)
RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

# Port d'écoute (sera surchargé par la variable PORT dans Kubernetes)
EXPOSE 3001

# Commande de démarrage
CMD ["node", "bin/www"]