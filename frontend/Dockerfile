# ─── Stage 1 : Build de l'application React ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Argument de build : URL de l'API backend (injectée par Jenkins / Kubernetes)
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copier tout le code source et builder
COPY . .
RUN npm run build

# ─── Stage 2 : Serveur Nginx pour servir le build statique ────────────────────
FROM nginx:1.25-alpine AS runner

# Supprimer la config Nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build React depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]