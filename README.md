# LearnABLE - Inclusive Learning Support Platform
Visit the [Production Website](https://learn-able.vercel.app/).

LearnABLE is a comprehensive educational platform designed to support inclusive learning environments by providing personalized educational content and automated NCCD (Nationally Consistent Collection of Data) reporting tools for teachers and students.

## Project Overview

LearnABLE is designed to support inclusive education by dynamically tailoring learning materials, adjustments, and differentiation strategies to individual student needs. Aligned with Universal Design for Learning (UDL) and Version 9 of the Australian Curriculum, it assists teachers with NCCD evidence collation and reporting, integrating intelligent automation and secure data management.

The platform consists of two main components:

1. **Frontend**: A React-based web application that provides the user interface for both teachers and students
2. **Backend**: A Django REST API that handles data management, authentication, and business logic

## Key Features

- Personalized learning content generation based on individual learning needs
- UDL-aligned differentiation supporting multiple representation modes
- Automated NCCD reporting tools and evidence collection
- Student performance tracking and analytics
- Teacher dashboard with comprehensive reporting features
- AI-driven recommendations for tailored interventions
- Secure data handling and privacy compliance
- Role-based access control

## Tech Stack

### Frontend
- [React](https://reactjs.org/) (v19.0.0) - JavaScript library for building user interfaces
- [Material-UI](https://mui.com/) (v7.1.0) - React UI framework
- [React Router](https://reactrouter.com/) (v7.4.0) - Navigation for React applications
- [PDFTron WebViewer](https://www.pdftron.com/webviewer/) - Document viewing and manipulation
- Additional libraries for document processing (mammoth, pptxgenjs)

### Backend
- [Django](https://www.djangoproject.com/) (v5.0.3) & [Django REST Framework](https://www.django-rest-framework.org/) - Python web framework
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Poetry](https://python-poetry.org/) - Dependency management
- [LangChain](https://www.langchain.com/) & [OpenAI](https://openai.com/) - AI integration
- [Python 3.11+](https://www.python.org/)

## Getting Started

### Prerequisites

- Node.js (14+)
- Python 3.11+
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
cd frontend                     # Navigate into Backend Directory
npm install                     # Install Frontend Dependencies
npm start                       # Begin the Server
```

3. Set up the backend:
```bash
cd /backend                     # Navigate into Backend Directory
poetry install                  # Install Backend Dependencies
eval "$(poetry env activate)"   # Activate Virtual Environment
python manage.py runserver      # Begin the Server
```

For detailed setup instructions, please refer to the README files in the respective directories:
- [Frontend Setup](frontend/README.md)
- [Backend Setup](backend/README.md)

## Development

The project follows a standard development workflow:

1. Frontend development server runs on http://localhost:3000
2. Backend development server runs on http://localhost:8000

## Data Dependencies

This application requires:
- Student data (managed in the system database)
- Teacher information (managed in the system database)
- Class and subject structures (managed in the system database)
- NCCD reporting requirements (built into the system logic)

All data is stored in PostgreSQL and managed through the Django ORM.
