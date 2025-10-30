# Technical Architecture Documentation

## Overview

This application is built using React with TypeScript and follows a feature-based architecture pattern.

## Core Technologies

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Mapping**: OpenLayers
- **UI Components**: DSFR (French Government Design System)

## Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Shared components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
│   ├── maps/           # Map-related hooks
│   └── store/          # State management hooks
├── utils/              # Utility functions
│   ├── flux/          # TMS flux utilities
│   ├── maps/          # Map utilities
│   └── interactions/  # Map interactions
└── routes/            # Application routes
```

## Key Features

### Map Interactions
- Click selection
- Polygon selection
- Hover effects
- Custom controls

### State Management
- Map state (`useMapStore`)
- Selection state (`useDalleStore`)
- UI state (modals, filters)

### Data Flow
1. TMS flux loads map tiles
2. User interacts with map
3. Selections are managed in stores
4. Download links are generated

## Performance Considerations

- Lazy loading of map features
- Optimized vector tile rendering
- Debounced map interactions
```

