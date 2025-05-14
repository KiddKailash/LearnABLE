# LearnABLE - Inclusive Learning Support Platform

LearnABLE is a comprehensive educational platform designed to support inclusive learning environments by providing personalized educational content and automated NCCD (Nationally Consistent Collection of Data) reporting tools.

## Project Overview

LearnABLE consists of two main components:

1. **Frontend**: A React-based web application that provides the user interface for both teachers and students
2. **Backend**: A Django REST API that handles data management, authentication, and business logic

## Key Features

- Personalized learning content generation
- Automated NCCD reporting tools
- Student performance tracking
- Teacher dashboard with analytics
- Secure data handling and privacy compliance
- Role-based access control

## Tech Stack

### Frontend
- React
- Material-UI (MUI)
- REST API integration
- Modern JavaScript (ES6+)

### Backend
- Django & Django REST Framework
- PostgreSQL
- Poetry for dependency management
- Python 3.12+

## Getting Started

### Prerequisites

- Node.js (14+)
- Python 3.12+
- PostgreSQL
- Poetry (Python package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KiddKailash/LearnABLE.git
cd LearnABLE
```

2. Set up the frontend:
```bash
cd frontend
npm install
npm start
```

3. Set up the backend:
```bash
cd ../backend
poetry install
poetry shell
make migrate
make runserver
```

For detailed setup instructions, please refer to the README files in the respective directories:
- [Frontend Setup](frontend/README.md)
- [Backend Setup](backend/README.md)

## Development

The project follows a standard development workflow:

1. Frontend development server runs on http://localhost:3000
2. Backend development server runs on http://localhost:8000
3. API documentation is available at http://localhost:8000/api/docs/

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is in active development. License terms will be provided later.

## Support

For support, please open an issue in the GitHub repository.
