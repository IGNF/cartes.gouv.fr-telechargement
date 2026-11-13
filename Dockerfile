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
COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html/telechargement
# Garder le modèle hors de la racine publique, mais accessible à l'entrypoint.
COPY --from=builder /app/public/config/config-template.json /opt/telechargement/config-template.json
COPY --chmod=0755 .docker/entrypoint.sh /entrypoint.sh

# L'entrypoint génère config.json en tant qu'utilisateur nginx et lance ensuite Nginx.
USER nginx

# Définir le répertoire de travail
WORKDIR /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080


# Vérification du contenu du répertoire de production
RUN ls -l /usr/share/nginx/html

# Démarrer Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

