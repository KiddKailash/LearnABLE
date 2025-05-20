#!/usr/bin/env bash
# Start script for Render

# Create DB migrations
python manage.py makemigrations --noinput

# Run migrations before starting server
python manage.py migrate

# Then start the server
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT