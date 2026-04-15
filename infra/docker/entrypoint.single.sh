#!/bin/sh
set -e

cd /srv/backend

alembic -c alembic.ini upgrade head

if [ "${SEED_ON_START:-true}" = "true" ]; then
  python -m app.scripts.seed
fi

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
