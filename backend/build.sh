#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies using Poetry
poetry install --no-root

# Activate the virtual environment
python -m poetry env info -p > /dev/null && source "$(poetry env info -p)/bin/activate" || true

# Collect static files
python manage.py collectstatic --no-input

# Apply database migrations
python manage.py migrate