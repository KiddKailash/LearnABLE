# LearnABLE Frontend

This is the frontend application for LearnABLE, built with React and Material-UI.

## Prerequisites

- Node.js (14+)
- npm (comes with Node.js)

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENV=development
```

### Development

To start the development server:

```bash
npm start
```

The application will be available at http://localhost:3000

### Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── layouts/        # Page layout components
├── pages/          # Page components
├── services/       # API and other services
├── styles/         # Global styles and themes
├── utils/          # Utility functions
├── tests/          # Test files
├── App.jsx         # Application Routing
└── index.js        # Application Entry Point
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## Code Style

This project uses ESLint and Prettier for code formatting. The configuration is in `.eslintrc` and `.prettierrc`.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## Deployment

The frontend is configured for deployment on Netlify. The production build is automatically deployed when changes are pushed to the main branch.

## Troubleshooting

If you encounter any issues:

1. Clear the npm cache: `npm cache clean --force`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check the console for error messages
4. Ensure all environment variables are properly set
