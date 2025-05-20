# LearnABLE Frontend

This is the frontend application for LearnABLE, built with React and Material-UI to provide personalized educational content and NCCD reporting tools.

## Prerequisites

- [Node.js](https://nodejs.org/) (14+)
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
├── layout/         # Page layout components
├── pages/          # Page components
├── services/       # API and other services
├── store/          # Global state storage
├── styles/         # Global styles and themes
├── utils/          # Utility functions
├── App.jsx         # Application Routing
└── index.js        # Application Entry Point
```

## Dependencies

This project uses the following major dependencies:

### Core Framework
- [React](https://reactjs.org/) (v19.0.0) - JavaScript library for building user interfaces
- [React DOM](https://reactjs.org/docs/react-dom.html) (v19.0.0) - React package for working with the DOM
- [React Router](https://reactrouter.com/) (v7.4.0) - Navigation library for React

### UI Components and Styling
- [Material UI](https://mui.com/) (v7.1.0) - React UI framework based on Material Design
- [@emotion/react](https://emotion.sh/docs/introduction) (v11.14.0) - CSS-in-JS library
- [@emotion/styled](https://emotion.sh/docs/styled) (v11.14.0) - Styled component API for Emotion

### Document Processing
- [@pdftron/webviewer](https://www.pdftron.com/webviewer/) (v8.1.0) - Document viewing and manipulation
- [mammoth](https://github.com/mwilliamson/mammoth.js) (v1.9.0) - Word to HTML converter
- [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) (v4.0.0) - PowerPoint presentation generator

### Development and Testing
- [react-scripts](https://create-react-app.dev/) (v5.0.1) - Configuration and scripts for Create React App
- [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) (v16.2.0) - React testing utilities
- [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) (v6.6.3) - Custom Jest matchers
- [@testing-library/user-event](https://github.com/testing-library/user-event) (v13.5.0) - Simulate user events
- [web-vitals](https://web.dev/vitals/) (v2.1.4) - Library for measuring performance metrics

See [package.json](./package.json) for a complete list of dependencies.

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

The frontend is configured for deployment on Vercel. The production build is automatically deployed when changes are pushed to the main branch.

## Connecting with the Backend

The frontend connects to the LearnABLE backend API. Make sure the backend server is running on the URL specified in your `.env` file.

## Troubleshooting

If you encounter any issues:

1. Clear the npm cache: `npm cache clean --force`
2. Delete node_modules and reinstall: `rm -rf node_modules && rm package-lock.json && npm install`
3. Check the console for error messages
4. Ensure all environment variables are properly set
