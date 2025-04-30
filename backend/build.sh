#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies using Poetry
poetry install --no-root

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations (be more explicit)
python manage.py makemigrations teachers students subjects classes attendancesessions studentattendance classstudents assessments studentgrades learningmaterial nccdreports
python manage.py migrate