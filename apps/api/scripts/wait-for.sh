#!/usr/bin/env bash
# Waits for a service to be up before moving on.
#
# 'docker compose up' finishes when the containers HAVE BEEN STARTED, not when
# they are already answering. Starting the API takes a few more seconds than
# that. Without this wait, whoever runs 'make up' opens the browser too early,
# sees a connection error and thinks something broke, when all that was missing
# was a little patience.
#
# Usage:
#   wait-for.sh http://localhost:8080/health  "the API"   [seconds]
#   wait-for.sh localhost:5432                "the database" [seconds]

set -euo pipefail

TARGET="${1:?pass a URL or host:port}"
NAME="${2:-$TARGET}"
LIMIT="${3:-90}"

red()   { printf '\033[31m%s\033[0m\n' "$1"; }
green() { printf '\033[32m%s\033[0m\n' "$1"; }

answers() {
  if [[ "$TARGET" == http://* || "$TARGET" == https://* ]]; then
    curl --silent --fail --max-time 2 --output /dev/null "$TARGET"
  else
    local host="${TARGET%%:*}"
    local port="${TARGET##*:}"
    # /dev/tcp is a bash feature: opening that "file" attempts a TCP connection.
    # It lets us test a port without depending on nc or telnet.
    (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null
  fi
}

printf 'Waiting for %s (up to %ss)' "$NAME" "$LIMIT"

elapsed=0
while ! answers; do
  if [ "$elapsed" -ge "$LIMIT" ]; then
    echo
    red "$NAME did not answer within ${LIMIT}s."
    echo
    echo "What to do:"
    echo "  1. 'make ps'    -- check whether the container is up"
    echo "  2. 'make logs'  -- see the error that stopped it from starting"
    exit 1
  fi
  printf '.'
  sleep 2
  elapsed=$((elapsed + 2))
done

echo
green "$NAME is answering."
