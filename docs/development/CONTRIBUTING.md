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
- Use functional components with hooks

## Working with Maps

### Adding New Map Interactions
1. Create interaction class in `utils/interactions`
2. Register in `hooks/maps/useInteractions.ts`
3. Add to map controls if needed

### Implementing New Features
1. Create feature component in `components/features`
2. Add necessary hooks in `hooks/`
3. Update stores if needed
4. Add tests

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## Building for Production

```bash
# Build
npm run build

# Preview build
npm run preview
```