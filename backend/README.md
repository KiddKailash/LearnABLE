# LearnABLE Backend

This is the backend application for LearnABLE, built with Django and Django REST Framework.

## Prerequisites

- Python 3.12+
- PostgreSQL
- Poetry (for dependency management)

## Setup

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
# Encryption key
FERNET_KEY=your_fernet_key

export DJANGO_SECRET_KEY=your_django_secret_key
export DEBUG=True
 
 # Langchain and AI
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_PROJECT="LearnABLE"
OPENAI_API_KEY=your_openai_key
 
 # Database settings
DB_NAME=LearnABLE
DB_USER=postgres
DB_PASSWORD=new_password
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
make makemigrations

# Apply migrations
make migrate
```

### Create Superuser

```bash
# Create an admin user
make superuser
```

### Run Development Server

```bash
# Start development server
make runserver
```

The server will be available at http://127.0.0.1:8000/

## API Endpoints

The API is available under the following endpoints:

- Admin: `/admin/`
- Teachers API: `/api/teachers/`
- Classes API: `/api/classes/`
- Subjects API: `/api/subjects/`
- Students API: `/api/students/`
- Assessments API: `/api/assessments/`
- Attendance Sessions API: `/api/attendancesessions/`
- Class Students API: `/api/classstudents/`
- Student Attendance API: `/api/studentattendance/`
- Student Grades API: `/api/studentgrades/`
- NCCD Reports API: `/api/nccdreports/`
- Learning Materials API: `/api/learning-materials/`

## Project Structure

```
backend/
├── backend/           # Main Django project settings
├── students/          # Students app
├── teachers/          # Teachers app
├── classes/           # Classes app
├── nccdreports/       # NCCD reporting app
├── learningmaterial/  # Learning materials app
├── utils/             # Utility functions
└── media/             # Media files
```

## Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov
```

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Configure proper `ALLOWED_HOSTS` in settings.py
3. Use Gunicorn as the WSGI server:
```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Static and Media Files

```bash
# Collect static files
python manage.py collectstatic
```

Configure a web server like Nginx to serve static and media files.

## Security Considerations

- Set `DEBUG=False` in production
- Use a strong, unique `SECRET_KEY`
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS
- Review and configure Django's security settings

## Backup and Restore

```bash
# Backup database
python manage.py dbbackup

# Restore database
python manage.py dbrestore
```

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