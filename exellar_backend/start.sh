#!/usr/bin/env bash
set -euo pipefail

# Change to the backend directory (in case Railway starts from repo root)
cd "$(dirname "$0")"

python -m pip install --upgrade pip

# Apply database migrations
python manage.py migrate --noinput

# Collect static files for WhiteNoise
python manage.py collectstatic --noinput

# Start Gunicorn
exec gunicorn exellar_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-file -

