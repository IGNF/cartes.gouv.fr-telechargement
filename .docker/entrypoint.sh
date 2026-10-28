#!/bin/sh
set -eu

# Substituer les variables d'environnement dans le config template
envsubst < /opt/telechargement/config-template.json > /usr/share/nginx/html/telechargement/config/config.json

# Exécuter la commande passée en argument
exec "$@"
