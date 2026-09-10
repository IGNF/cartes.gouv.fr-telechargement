# Technical Architecture Documentation

## Overview

This application is built with Vue 3 and TypeScript. It uses Vue single-file components and separates views, reusable components, Pinia stores, and OpenLayers utilities.

## Core Technologies

- **Frontend Framework**: Vue 3 with TypeScript
- **Build Tool**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **Mapping**: OpenLayers
- **UI Components**: DSFR, Vue DSFR and `cartes.gouv.fr-vue-components`

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── stores/              # Pinia stores for map, selection and filters
├── utils/               # Download, flux, map and interaction utilities
│   ├── flux/           # TMS flux utilities
│   ├── maps/           # OpenLayers layers, controls, interactions and styles
│   └── interactions/   # Selection and hover interactions
├── views/               # Route-level Vue components
├── App.vue              # Application shell
├── main.ts              # Vue, Pinia, router and DSFR initialization
└── router.ts            # Application routes
```

## Key Features

### Map Interactions
- Click selection
- Polygon selection
- Hover effects
- Custom controls

### State Management
- Map state and selection mode (`useMapStore`)
- Tile selection and history (`useDalleStore`)
- Date filtering (`useFilterStore`)

### Data Flow
1. TMS flux loads map tiles
2. User interacts with map
3. Vue components update selections and filters through Pinia stores
4. Download links are generated

## Performance Considerations

- Lazy loading of map features
- Optimized vector tile rendering
- Debounced map interactions
```

