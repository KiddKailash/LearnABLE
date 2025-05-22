# LearnABLE Backend

This is the backend application for LearnABLE, built with Django and Django REST Framework to provide API services for personalized educational content generation and NCCD reporting tools.

## Project Structure

```
backend/
├── config/             # Contains build.sh & start.sh, for production deployment
├── backend/            # Django project settings
├── classes/            # Classes app
├── learningmaterial/   # Learning materials app
├── media/              # Media files
├── nccdreports/        # NCCD reporting app
├── students/           # Students app
├── teachers/           # Teachers app
├── unitplan/           # Unitplan app
├── utils/              # Utility functions
└── urls.py             # Application API endpoint mounting
```

## Prerequisites

- [Python 3.11+](https://www.python.org/downloads/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Poetry](https://python-poetry.org/docs/#installation) (for dependency management)

## Setup

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Encryption key
FERNET_KEY=your_fernet_key

# Django
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True
 
# Langchain and AI
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT="LearnABLE"
OPENAI_API_KEY=your_openai_key
 
# Database settings
DB_NAME=LearnABLE
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
 
# CORS settings
CORS_ALLOW_ALL_ORIGINS=True
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOWED_ORIGINS=localhost,127.0.0.1

# Server settings
ALLOWED_HOSTS=localhost,127.0.0.1
 
# JWT settings
JWT_ACCESS_TOKEN_LIFETIME_HOURS=8
JWT_REFRESH_TOKEN_LIFETIME_DAYS=2
JWT_ROTATE_REFRESH_TOKENS=True
JWT_BLACKLIST_AFTER_ROTATION=True
JWT_UPDATE_LAST_LOGIN=True
JWT_ALGORITHM=HS256
```

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb LearnABLE
```

2. Configure the database connection in `.env` file

## Development

### Install Dependencies

```bash
# Install Poetry if not already installed
curl -sSL https://install.python-poetry.org | python3 -

# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

### Database Migrations

```bash
# Generate migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### Run Development Server

```bash
# Start development server
python manage.py runserver
```

The server will be available at http://127.0.0.1:8000/

## Key Dependencies

The backend uses numerous packages to deliver its functionality:

### Core Framework
- [Django](https://www.djangoproject.com/) (v5.0.3) - Python web framework
- [Django REST Framework](https://www.django-rest-framework.org/) - REST API toolkit for Django
- [djangorestframework-simplejwt](https://django-rest-framework-simplejwt.readthedocs.io/) - JWT authentication for Django REST Framework

### Database
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source relational database
- [psycopg2-binary](https://pypi.org/project/psycopg2-binary/) - PostgreSQL adapter for Python

### AI and Text Processing
- [OpenAI](https://github.com/openai/openai-python) - Official OpenAI API client
- [LangChain](https://www.langchain.com/) - Framework for developing AI-powered applications
- [PyMuPDF](https://github.com/pymupdf/PyMuPDF) - PDF processing library
- [python-docx](https://python-docx.readthedocs.io/) - Python library for Word documents
- [python-pptx](https://python-pptx.readthedocs.io/) - Python library for PowerPoint presentations

### Authentication and Security
- [django-allauth](https://django-allauth.readthedocs.io/) - Auth, registration, and account management
- [cryptography](https://cryptography.io/en/latest/) - Cryptographic recipes and primitives
- [fernet](https://github.com/fernet/spec) - Symmetric encryption
- [python-decouple](https://github.com/henriquebastos/python-decouple) - Separation of settings from code

### Testing
- [pytest](https://docs.pytest.org/) - Testing framework
- [pytest-django](https://pytest-django.readthedocs.io/) - Django plugin for pytest
- [factory-boy](https://factoryboy.readthedocs.io/) - Fixtures for testing
- [faker](https://faker.readthedocs.io/) - Fake data generation

See [pyproject.toml](./pyproject.toml) for a complete list of dependencies.

## API Endpoints

The API is available under the following endpoints:

- Admin: `/admin/`
- Teachers API: `/api/teachers/`
- Classes API: `/api/classes/`
- Students API: `/api/students/`
- NCCD Report API: `/api/nccdreports/`
- Learning Materials API: `/api/learning-materials/`
- Unit Plan API: `api/unit-plans/`

## Data Dependencies

The backend requires and manages the following data:

1. **Student Data**:
   - Personal information
   - Learning preferences
   - Performance records
   - Special needs/adjustments

2. **Teacher Data**:
   - Personal information
   - Classes and subjects taught
   - Instructional approaches

3. **Class Data**:
   - Structure and enrollment
   - Subject information
   - Term/semester configuration

4. **NCCD Data**:
   - Categories of disability
   - Adjustment levels
   - Evidence requirements
   - Reporting templates

All data is stored in PostgreSQL and managed through Django's ORM with appropriate security measures.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## Troubleshooting

If you encounter any issues:

1. Check the Django logs
2. Verify database connection
3. Ensure all environment variables are set
4. Check file permissions for media and static directories 