# Interface Diffusion - Carte Téléchargement

## Description/Résumé du projet

Ce projet est une interface web permettant de visualiser et de télécharger des produites géographiques à l'aide de cartes interactives. Il utilise **React**, **Vite**, et **OpenLayers** pour offrir une expérience utilisateur fluide et performante. L'objectif principal est de fournir une interface intuitive pour sélectionner et télécharger des données géographiques.

### Fonctionnalités principales :

- Visualisation des données géographiques via une carte interactive.
- Sélection multiple de données géographiques.
- Téléchargement des données sélectionnées.

---

## Installation

### Prérequis :
- **Node.js** (version 20 ou supérieure)
- **npm** (version 8 ou supérieure)
- **Docker** (pour le déploiement)

### Étapes d'installation :
1. Clonez le dépôt :
   ```bash
   git clone https://github.com/votre-utilisateur/votre-repo.git
   cd votre-repo
   ```
2. Installez les dépendances
   ```bash
   npm install
   ```
3. Lancez l'application 
   ```bash
   npm start
   ```
4. Accédez à l'application dans votre navigateur à l'adresse:
   ```
   http://localhost:5173/
   ```

### Déploiement avec Docker
Etapes pour construire et exécuter l'image Docker :

1. Construisez l'image Docker :

   ```bash
   docker build -t interface-carte-telechargement
   ```

## Documentation développeurs

Stack technique :

- Frontend : React, Vite, TanStack Router
- Cartographie : OpenLayers, Geoportal Extensions
- Déploiement : Docker, Nginx

Scripts disponibles :

- npm run start : Lance l'application en mode développement.
- npm run build : Construit l'application pour la production.
- npm run serve : Prévisualise l'application construite.
- npm run typecheck : Vérifie les types TypeScript.


## Affichage de l'interface dans le catalogue Geonetwork-ui

Pour les instructions sur l'intégration dans les métadonnées des produits, consultez le fichier [METADATA_INTEGRATION.md](./docs/METADATA_INTEGRATION.md).

## Détails techniques sur le flux TMS utilisé pour le Téléchargement à la Carte

Ce projet utilise un flux TMS exposé par data.geopf.fr, basé sur des couches tuilées vectorielles MVT.

Trois couches sont exposées pour chaque produit :

1. `-chantier` : emprises de production
2. `-filtre` : métadonnées dynamiques pour l’interface
3. `-produit` : dalles téléchargeables

[Voir la documentation complète ici → TMS_TA_SPEC.md](./docs/TMS_TA_SPEC.md)

## L'arborescence du projet


.
├── src/                # Code source de l'application
│   ├── Components/     # Composants React
│   ├── hooks/          # Hooks personnalisés
│   ├── utils/          # Fonctions utilitaires
│   └── styles/         # Fichiers de style
├── docs/               # Documentation du projet
├── public/             # Fichiers statiques
├── .docker/            # Configuration Docker et Nginx
├── tests/              # Tests unitaires et d'intégration
├── [package.json](./package.json)        # Dépendances et scripts npm
├── Dockerfile          # Fichier Docker pour le déploiement
└── [README.md](./README.md)           # Documentation du projet

## API/flux utilisés

- **GetCapabilities flux tms** :  https://data.geopf.fr/tms/1.0.0/{layer}/


## Contribution

Comment contribuer ?

1. Forkez le depôt
2. Créez une branche pour votre fonctionnalité ou correction :
   ```bash
   git checkout -b feature/ma-fonctionnalite
   ```
3. Faites vos modfication et ajoutez un commit :
   ```bash
   git commit -m "add(localisation)Ajout de ma fonctionnalité"
   ```
4. Poussez vos modification :
   ```bash
   git push origin feature/ma-fonctionnalite
   ```

5. Ouvrez une PullRequest.

Vous pouvez également faire des issues pour discuter en amont de votre besoin.



## Contacts du projets



|Nom|Prénom|mail|fonction|
|---|---|---|---|
|Thauvin|Xavier|   |Chef de projet|
|Mohad|Mélodia|   |Conceptrice developpeuse|

## Licence

Ce projet est sous license **GNU Alfredo General Public License**. Consultez le fichier [License](./LICENSE) pour plus d'informations.

