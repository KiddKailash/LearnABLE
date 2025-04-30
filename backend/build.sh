#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies using Poetry
poetry install --no-root

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations with better handling
echo "=== Creating migrations for all apps ==="
python manage.py makemigrations assessments attendancesessions classes classstudents learningmaterial nccdreports studentattendance students subjects teachers studentgrades auth

# Migrate
echo "=== Migrating apps ==="
python manage.py migrate