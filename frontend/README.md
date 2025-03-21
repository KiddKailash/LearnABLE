# LearnAble Frontend

This is the React framework frontend for the LearnAble project.

The frontend is responsible for delivering an interface for teachers to upload and have returned tailored eductional content, and track student results for streamlined NCCD reporting. It integrates with a Django backend via RESTful API's.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Documentation Standard](#documentation-standards)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Standards](#development-standards)
- [Environment Variables](#environment-variables)

---

## Getting Started

Ensure you have **Node.js (v16 or higher)** installed.

### Install Dependencies

```bash
cd frontend
npm install
```

or, if using Yarn:

```bash
cd frontend
yarn install
```

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser to view the app.

---

## Documentation Standards

### Components
All code files MUST use DocString commenting.

```bash
/**
 * A great component!
 *
 * @param {object} props
 * @param {string} props.componentName - The name of the component.
 * @returns {JSX.Element}
 */
const Component = ({ componentName }) => {
  return <p>{componentName}</p>;
};
```

### Functions
All functions must include clear documentation using DocString comments. Each function should describe its purpose, list all input parameters with their types, and specify the return type. This consistent format improves code readability and maintainability. For example:

```bash
/**
 * Adds two numbers together.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 */
function add(a, b) {
  return a + b;
}
```

### Inline Commenting
Inline comments should be used to explain complex logic or important code sections within functions or components. They must be concise and positioned above or alongside the code they describe. Avoid over-commenting trivial code. For example:

```bash
function calculateDiscount(price, discount) {
  // Ensure discount does not exceed 100%
  if (discount > 100) {
    discount = 100;
  }
  // Calculate the discounted price
  return price - (price * discount) / 100;
}
```

Consistent and clear documentation, including both DocStrings and inline comments, is critical to maintain code quality and ease onboarding for new team members.

---

## Available Scripts

**Start the app (dev mode):**

```bash
  npm run dev
```

**Build for production:**

```bash
npm run build
```

---

## Project Structure

```bash
frontend/
├── public/                 # Static files served as-is
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route-level components (views)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API handlers (fetch/axios logic)
│   ├── styles/             # Global styles, variables
│   ├── App.jsx             # Main App component
│   ├── main.jsx            # Vite entry point
│   └── router.jsx          # React Router config (if used)
├── .env                    # Environment variables
├── index.html              # Entry HTML template
├── vite.config.js          # Vite configuration
└── package.json            # Project metadata & scripts
```

---

## Development Standards

- **Framework:** React 18+
- **Bundler:** Vite
- **Language:** JavaScript (consider migrating to TypeScript for type safety)
- **Linting:** ESLint with React plugin
- **Formatting:** Prettier
- **Routing:** [React Router](https://reactrouter.com/)
- **State Management:** Context API or other tools as needed
- **Styling:** CSS Modules, Tailwind, or SCSS depending on team convention
- **Accessibility:** WCAG-compliant HTML, keyboard navigation, screen reader support

---

## Environment Variables

Environment variables should be declared in a `.env` file at the root of `frontend/`.

Common values:

```env
VITE_API_URL=http://localhost:8000/api
VITE_FEATURE_FLAG_AI=true
```

> **All environment variables MUST be prefixed with `VITE_`**.

---

## Notes

- This project uses [Vite’s official React plugin](https://github.com/vitejs/vite-plugin-react).
- API endpoints should be defined in the `services/` folder and consumed through hooks or components.

---
