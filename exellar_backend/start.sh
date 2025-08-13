#!/usr/bin/env bash
set -euo pipefail

# Change to the backend directory (in case Railway starts from repo root)
cd "$(dirname "$0")"

# Pick a Python executable
if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  echo "ERROR: No python interpreter found (expected python3 or python)" >&2
  exit 1
fi

"${PYTHON_BIN}" -m pip install --upgrade pip

# Ensure runtime deps are present if Gunicorn isn't available yet (local runs)
if ! "${PYTHON_BIN}" -c "import gunicorn" >/dev/null 2>&1; then
  if [ -f requirements.txt ]; then
    "${PYTHON_BIN}" -m pip install -r requirements.txt
  fi
fi

# Apply database migrations
"${PYTHON_BIN}" manage.py migrate --noinput

# Collect static files for WhiteNoise
"${PYTHON_BIN}" manage.py collectstatic --noinput

# Start Gunicorn (module to ensure correct interpreter)
exec "${PYTHON_BIN}" -m gunicorn exellar_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-file -

