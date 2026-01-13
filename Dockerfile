FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances
COPY package.json .
COPY package-lock.json .
RUN npm ci --loglevel verbose

# Vérifier que les dépendances sont installées
RUN npm list --depth=0

# Copie du reste du code
COPY . .

# Construction de l'application avec Vite
RUN npm run build

# Vérification du contenu du répertoire de construction
RUN ls -l /app/dist

FROM nginxinc/nginx-unprivileged:stable-alpine AS production

# Copie de la configuration Nginx
COPY .docker/nginx-default.conf /etc/nginx/conf.d/default.conf

# Copie des fichiers construits
COPY --from=builder /app/dist /usr/share/nginx/html

# Définir le répertoire de travail
WORKDIR /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080


# Vérification du contenu du répertoire de production
RUN ls -l /usr/share/nginx/html

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

