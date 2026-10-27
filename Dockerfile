FROM node:24-alpine AS builder

WORKDIR /app

# Installation des dépendances
COPY package.json .
COPY package-lock.json .
COPY authentification-vue-oidc-0.1.0.tgz .
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

# Vite et le routeur utilisent /telechargement/ : conserver cette arborescence.
COPY --from=builder /app/dist /usr/share/nginx/html/telechargement
COPY --from=builder /app/public/config/config-template.json /opt/telechargement/config-template.json
COPY --chmod=0755 .docker/entrypoint.sh /docker-entrypoint.d/40-app-config.sh

# Le processus nginx non privilégié doit pouvoir générer la configuration runtime.
USER root
RUN chown -R nginx:nginx /usr/share/nginx/html/telechargement/config
USER nginx

# Définir le répertoire de travail
WORKDIR /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080


# Vérification du contenu du répertoire de production
RUN ls -l /usr/share/nginx/html

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]

