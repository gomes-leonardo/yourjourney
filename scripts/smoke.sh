#!/usr/bin/env bash
# Boots the project for real, applies migrations and checks that the app answers.
#
# Why this exists: lint, unit tests and build never start the application against
# a database. So a pull request can be fully green and still break at runtime:
# a module that was not registered, a route that throws, or an entity with no
# matching migration. That has already happened twice in this project.
#
# The CI runs this script. It is written to never report a false pass: any step
# that cannot be proven brings the whole thing down.

set -euo pipefail
cd "$(dirname "$0")/.."

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }

cleanup() { docker compose down -v --remove-orphans >/dev/null 2>&1 || true; }

fail() {
  echo
  red "SMOKE TEST FAILED: $1"
  echo
  [ $# -gt 1 ] && { echo "$2"; echo; }
  echo "--- last lines of the API log ---"
  docker compose logs --tail 60 api 2>&1 || true
  echo "--- container status ---"
  docker compose ps 2>&1 || true
  cleanup
  exit 1
}

[ -f .env ] || cp .env.example .env
API_PORT=$(grep -E '^API_PORT=' .env | cut -d= -f2 | tr -d '[:space:]'); API_PORT=${API_PORT:-8080}
DB_USER=$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2 | tr -d '[:space:]')
DB_NAME=$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2 | tr -d '[:space:]')

# Always start from scratch. A volume left over from an earlier run hides a
# missing migration, because the table is already there from before.
echo "1/6  Cleaning up anything left over"
cleanup

# Building is deliberately separate from starting, and deliberately not on a
# timer. A cold build with new dependencies can take minutes, and in CI every
# build is cold. Timing the two together made this script fail on good code.
echo "2/6  Building the images (no time limit, a cold build is slow)"
docker compose build || fail "the images did not build"

echo "3/6  Starting the services and waiting for them to be healthy"
# --wait makes compose wait for the health checks instead of returning as soon
# as the containers start. Without it the next steps race a database that is
# still coming up. The timer here covers startup only, never the build.
docker compose up -d --wait --wait-timeout 180 \
  || fail "the services did not become healthy within 180s of starting"

# Belt and braces: even with --wait, confirm the API actually answers.
bash scripts/wait-for.sh "http://localhost:${API_PORT}/health" "the API" 120 >/dev/null \
  || fail "the API started but did not answer on /health"

echo "4/6  Applying migrations"
docker compose exec -T api npm run migration:run --silent > /tmp/yj-migrations.txt 2>&1 \
  || fail "migrations failed" "$(grep -viE '^query:' /tmp/yj-migrations.txt | tail -25)"

# Prove they really ran, instead of having failed silently.
APPLIED=$(docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" \
  -tAc 'SELECT count(*) FROM migrations;' 2>/dev/null | tr -d '[:space:]')
case "$APPLIED" in
  ''|*[!0-9]*) fail "could not read the migrations table" "Database answered: '${APPLIED}'" ;;
esac
[ "$APPLIED" -ge 1 ] || fail "no migration was applied" "The migrations table exists and is empty."
echo "     $APPLIED migration(s) applied"

echo "5/6  Checking that entities match the migrations"
OUTPUT=$(docker compose exec -T api sh -c \
  './node_modules/.bin/typeorm-ts-node-esm migration:generate -d src/database/data-source.ts src/database/migrations/__DRIFT__ 2>&1' || true)

if echo "$OUTPUT" | grep -q 'No changes in database schema were found'; then
  : # entities and migrations agree
elif echo "$OUTPUT" | grep -q 'has been generated successfully'; then
  docker compose exec -T api sh -c 'rm -f src/database/migrations/*__DRIFT__*.ts' >/dev/null 2>&1 || true
  fail "there is an entity with no migration" \
"An entity was added or changed without the matching migration.

The project runs with synchronize turned off, so TypeORM never creates a table
on its own. Without the migration the table does not exist and the query blows
up at runtime.

To generate the missing migration:

  make migration-generate NAME=CreateSomethingTable

Review the generated file and commit it together with the entity."
else
  fail "could not verify the entities" "$(echo "$OUTPUT" | grep -viE '^query:' | tail -25)"
fi

echo "6/6  Checking the /health response"
RESPONSE=$(curl -s --max-time 10 "http://localhost:${API_PORT}/health") \
  || fail "could not call /health"
echo "$RESPONSE" | grep -q '"status":"ok"' \
  || fail "unexpected response from /health" "Got: $RESPONSE"

echo
green "SMOKE TEST PASSED: services healthy, $APPLIED migration(s) applied, entities in sync, /health answering."
cleanup
