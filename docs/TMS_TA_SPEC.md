# 📦 Construction du flux TMS pour le Téléchargement à la Carte (TA)

## 🎯 Objectif

Ce document décrit comment configurer les flux TMS vectoriels (MVT) pour alimenter une interface de Téléchargement à la Carte (TA) basée sur des couches tuilées dynamiques.

---

## 🧭 Spécifications TMS

### 🔗 URL du flux TMS

```https://data.geopf.fr/tms/1.0.0/{layer}/{z}/{x}/{y}.{format}```

**Capabilities** :

```https://data.geopf.fr/tms/1.0.0/{layer}/```


### 📐 Paramètres

| Nom         | Description                                | Exemple                 |
|--------------|--------------------------------------------|--------------------------|
| `{layer}`    | Nom de la couche (ex: `LHD-MNS-produit`)    | `ORTHO_2022-chantier`   |
| `{z}`        | Niveau de zoom                             | `10`                    |
| `{x}`        | Index X de la tuile                        | `512`                   |
| `{y}`        | Index Y de la tuile                        | `341`                   |
| `{format}`   | Format de la tuile (`mvt`, `png`, `jpg`)   | `mvt`                   |

- **Système de projection** : EPSG:3857 (Web Mercator)
- **Tile scheme** : compatible OpenStreetMap (`z/x/y`)

---

## 🗂️ Structure des couches

Chaque produit est représenté par **trois couches** :

### `-chantier` (emprise de production)

- **Géométrie** : `Polygon`
- **Zoom recommandé** : 1 à 10
- **Objectif** : visualiser les zones couvertes

#### Attributs

| Nom           | Type      | Description                         |
|----------------|-----------|-------------------------------------|
| `id`           | `int`     | Identifiant du chantier             |
| `name`         | `string`  | Nom lisible                         |
| `timestamp`    | `date`    | Date de dernière mise à jour        |
| `legend`       | `string`  | Légende de style                    |
| `metadata`     | `string`  | URL vers la métadonnée              |
| `zoom_start`   | `int`     | Zoom min d'affichage                |
| `zoom_stop`    | `int`     | Zoom max d'affichage                |

---

### `-filtre` (paramètres dynamiques de filtrage)

- **Géométrie** : None / Placeholder
- **Objectif** : transmettre les configurations de filtres à l'UI

#### Attributs

| Nom                | Type             | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `Name`             | `string`         | Nom du produit                                   |
| `Name-chantier`    | `list(string)`   | Liste des chantiers                              |
| `Recherche`        | `boolean`        | Active la recherche géographique                 |
| `Mode de sélection`| `list(string)`   | clic, rectangle, polygone, etc.                  |
| `cartes`           | `list(string)`   | Fonds de carte activables                        |

---

### `-produit` (dalles téléchargeables)

- **Géométrie** : `Polygon`
- **Zoom recommandé** : 10 à 18
- **Objectif** : sélection des dalles et téléchargement

#### Attributs

| Nom             | Type        | Description                          |
|------------------|-------------|--------------------------------------|
| `id`             | `int`       | ID unique                            |
| `name`           | `string`    | Nom de la dalle                      |
| `url`            | `string`    | URL de téléchargement direct         |
| `id-chantier`    | `int/uuid`  | Référence vers le chantier parent    |
| `timestamp`      | `datetime`  | Date de production ou MAJ            |
| `format`         | `list`      | Liste de formats disponibles         |
| `projection`     | `string`    | EPSG du fichier source               |

---

