# LearnABLE Backend

This is the backend for the LearnABLE application, built with Django and Django REST Framework.

## Prerequisites

- Python 3.12+
- PostgreSQL
- Poetry (for dependency management)

## Setup

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DJANGO_SECRET_KEY=your_secret_key
DEBUG=True  # Set to False in production
OPENAI_API_KEY=your_openai_api_key  # If using OpenAI services
```

### Database Setup

The project uses PostgreSQL. Make sure you have a database named `LearnABLE` set up:

```bash
# Create database (using psql)
createdb LearnABLE
```

## Development

### Install Dependencies

```bash
# Install dependencies using Poetry
poetry install

# Activate the virtual environment
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

### API Endpoints

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

## Production Deployment

For production deployment, use Gunicorn as the WSGI server:

```bash
# Set DEBUG=False in .env file
# Configure proper ALLOWED_HOSTS in settings.py

# Run with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Static and Media Files

For production, you'll need to configure static and media file serving:

```bash
# Collect static files
python manage.py collectstatic
```

Configure a web server like Nginx to serve static and media files.

### Security Considerations

- Set `DEBUG=False` in production
- Use a strong, unique `SECRET_KEY`
- Configure proper `ALLOWED_HOSTS`
- Use HTTPS
- Review and configure Django's security settings

## Testing

```bash
# Run tests
pytest
```

## Backup and Restore

```bash
# Backup database
python manage.py dbbackup

# Restore database
python manage.py dbrestore
``` 