# Development Guide

## Getting Started

1. **Environment Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

2. **Code Style**
- Use TypeScript for all new files
- Follow DSFR design guidelines
- Build components as Vue single-file components (`.vue`) using the Composition API and `<script setup>`

## Working with Maps

### Adding New Map Interactions
1. Create interaction class in `utils/interactions`
2. Register the interaction from the Vue component or map utility that owns the OpenLayers instance
3. Add to map controls if needed

### Implementing New Features
1. Create or update a Vue component in `components/` or a view in `views/`
2. Add routes in `router.ts` when required
3. Update Pinia stores in `stores/` if needed
4. Add tests when test tooling is available

## Building for Production

```bash
# Build
npm run build

# Preview build
npm run serve
```