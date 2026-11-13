# Interface de Diffusion - Carte de Téléchargement

## 🌟 Fonctionnalités

- Carte interactive pour la visualisation des données
- Multiples méthodes de sélection (clic, polygone, import)
- Options de filtrage avancées
- Capacités de téléchargement direct

## 🚀 Démarrage Rapide

```bash
# Cloner le dépôt
git clone <url-du-depot>

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## 📚 Documentation

- [Architecture Technique](./docs/architecture/TECHNICAL.md)
- [Guide de Développement](./docs/development/CONTRIBUTING.md)
- [Spécifications TMS](./docs/TMS_TA_SPEC.md)
- [Intégration des Métadonnées](./docs/METADATA_INTEGRATION.md)

## 🧪 Tests

```bash
# Exécuter tous les tests
npm run test

# Exécuter un fichier de test spécifique
npm run test -- <nom-du-fichier-test>
```

## 📦 Déploiement

```bash
# Construction pour la production
npm run build

# Construction de l'image Docker
docker build -t interface-carte-telechargement .
```

## Tester l'image docker en local avec vpn
```bash
# Construit l'image en utilisant le réseau de l'hôte. Nécessaire ici pour que
# Docker puisse accéder au DNS/proxy du VPN pendant le téléchargement des dépendances.
# --progress=plain affiche les étapes et les erreurs de construction en clair ;
# -t donne un nom à l'image, réutilisé ensuite avec docker run.
docker build --no-cache --network=host --progress=plain -t telechargement-local .

# Charge la configuration locale en interprétant correctement les guillemets
# du fichier dotenv (ne pas le passer directement avec --env-file).
set -a
. ./.env.localhost
set +a

# Démarre l'application avec sa configuration IAM runtime et publie le port 8080.
# --rm supprime le conteneur à son arrêt ; Ctrl+C l'arrête.
docker run --rm --network host --name telechargement-local \
  -e BASE_URL -e IAM_DISABLE -e IAM_AUTHORITY -e IAM_URL -e IAM_REALM \
  -e IAM_CLIENT_ID -e IAM_REDIRECT_URI -e IAM_POST_LOGOUT_REDIRECT_URI \
  -e IAM_SILENT_REDIRECT_URI -e IAM_SCOPE -e IAM_STORAGE -e IAM_DEBUG \
  -e IAM_ENTREPOT_API_URL \
  telechargement-local
```

Une fois le conteneur démarré, ouvrir http://localhost:8080/telechargement/ dans le navigateur.
La commande `docker build` construit l'image ; c'est `docker run` qui lance réellement l'application.

## 🤝 Contribution

Consultez notre [Guide de Contribution](./docs/development/CONTRIBUTING.md) pour plus de détails.

## 📝 Licence

Licence GNU Affero General Public

