#!/bin/sh

# Substituer les variables d'environnement dans le config template
envsubst < /app/dist/config/config-template.json > /usr/share/nginx/html/telechargement/config/config.json

# Exécuter la commande passée en argument
exec "$@"
