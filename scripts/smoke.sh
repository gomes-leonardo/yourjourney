#!/usr/bin/env bash
# Sobe o projeto de verdade, aplica as migrações e confere que a aplicação responde.
#
# Por que isto existe: lint, teste unitário e build não sobem a aplicação contra
# um banco. Então um Pull Request pode deixar tudo verde e mesmo assim quebrar
# em execução, por módulo não registrado, rota que estoura, ou entidade sem a
# migração correspondente. Foi o que aconteceu no PR #50.

set -euo pipefail
cd "$(dirname "$0")/.."

vermelho() { printf '\033[31m%s\033[0m\n' "$1"; }
verde()    { printf '\033[32m%s\033[0m\n' "$1"; }

falhar() { echo; vermelho "SMOKE TEST FALHOU: $1"; echo; [ $# -gt 1 ] && echo "$2"; docker compose logs --tail 40 api || true; docker compose down -v >/dev/null 2>&1 || true; exit 1; }

[ -f .env ] || cp .env.example .env
API_PORT=$(grep -E '^API_PORT=' .env | cut -d= -f2)
API_PORT=${API_PORT:-8080}

echo "1/4  Subindo os serviços"
docker compose up -d --build >/dev/null 2>&1 || falhar "os contêineres não subiram"

echo "2/4  Esperando a API responder"
bash scripts/wait-for.sh "http://localhost:${API_PORT}/health" "a API" 120 >/dev/null \
  || falhar "a API não respondeu" "A aplicação subiu mas não atendeu em /health."

echo "3/4  Aplicando as migrações"
docker compose exec -T api npm run migration:run --silent > /tmp/migracoes.txt 2>&1 \
  || falhar "as migrações falharam" "$(grep -viE '^query:' /tmp/migracoes.txt | tail -20)"

echo "4/4  Conferindo que as entidades batem com as migrações"
saida=$(docker compose exec -T api sh -c \
  './node_modules/.bin/typeorm-ts-node-esm migration:generate -d src/database/data-source.ts src/database/migrations/__DRIFT__ 2>&1' || true)

if echo "$saida" | grep -q 'No changes in database schema were found'; then
  : # entidades e migrações batem
elif echo "$saida" | grep -q 'has been generated successfully'; then
  docker compose exec -T api sh -c 'rm -f src/database/migrations/*__DRIFT__*.ts' >/dev/null 2>&1 || true
  falhar "existe entidade sem migração" \
"Alguma entidade foi criada ou alterada sem a migração correspondente.

Como o projeto roda com synchronize desligado, o TypeORM não cria tabela sozinho.
Sem a migração, a tabela não existe e a consulta estoura em execução.

Para gerar a migração que falta:

  make migration-generate NOME=CriaTabelaUsuarios

Depois confira o arquivo gerado e faça commit dele junto com a entidade."
else
  falhar "não consegui verificar as entidades" "$(echo "$saida" | grep -viE '^query:' | tail -20)"
fi

RESP=$(curl -s "http://localhost:${API_PORT}/health")
echo "$RESP" | grep -q '"status":"ok"' || falhar "resposta inesperada em /health" "$RESP"

echo
verde "SMOKE TEST PASSOU: serviços no ar, migrações aplicadas, entidades em dia, /health respondendo."
docker compose down -v >/dev/null 2>&1 || true
