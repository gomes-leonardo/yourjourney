#!/usr/bin/env bash
# Checks everything that has to be in place BEFORE trying to start the project.
#
# The idea is to fail here, with a message that says what to do, instead of
# failing ten lines later with a Docker error that explains nothing.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }

fail() {
  red "SOMETHING IS MISSING: $1"
  echo
  echo "How to fix it:"
  echo "  $2"
  exit 1
}

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is not installed." \
       "Install Docker Desktop: https://docs.docker.com/get-started/get-docker/"
fi

if ! docker info >/dev/null 2>&1; then
  fail "Docker is installed but not running." \
       "Open Docker Desktop, wait for it to finish starting, then run 'make up' again."
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "the 'docker compose' plugin was not found." \
       "Update Docker Desktop, which ships with it. Careful: 'docker-compose' with a hyphen is the old version."
fi

if [ ! -f "$ROOT/.env" ]; then
  fail "the .env file does not exist." \
       "Run 'make setup' (or 'cp .env.example .env') and fill in what you need."
fi

green "Prerequisites OK: Docker running, compose available, .env in place."
