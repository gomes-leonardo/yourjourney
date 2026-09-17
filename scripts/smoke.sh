#!/usr/bin/env bash
# Sobe o projeto de verdade, aplica as migrações e confere que a aplicação responde.
#
# Por que isto existe: lint, teste unitário e build não sobem a aplicação contra
# um banco. Então um Pull Request pode deixar tudo verde e mesmo assim quebrar
# em execução, por módulo não registrado, rota que estoura, ou entidade sem a
# migração correspondente.
#
# Este script é rodado pelo CI. Ele foi escrito para nunca dar falso positivo:
# qualquer etapa que não possa ser comprovada derruba o script.

set -euo pipefail
cd "$(dirname "$0")/.."

vermelho() { printf '\033[31m%s\033[0m\n' "$1"; }
verde()    { printf '\033[32m%s\033[0m\n' "$1"; }

limpar() { docker compose down -v --remove-orphans >/dev/null 2>&1 || true; }

falhar() {
  echo
  vermelho "SMOKE TEST FALHOU: $1"
  echo
  [ $# -gt 1 ] && { echo "$2"; echo; }
  echo "--- últimas linhas do log da API ---"
  docker compose logs --tail 60 api 2>&1 || true
  echo "--- estado dos contêineres ---"
  docker compose ps 2>&1 || true
  limpar
  exit 1
}

[ -f .env ] || cp .env.example .env
API_PORT=$(grep -E '^API_PORT=' .env | cut -d= -f2 | tr -d '[:space:]')
API_PORT=${API_PORT:-8080}

# Começa sempre do zero. Volume sobrando de uma execução anterior esconde
# migração faltando, porque a tabela já existe de antes.
echo "1/5  Limpando o que possa ter sobrado"
limpar

echo "2/5  Subindo os serviços e esperando ficarem saudáveis"
# --wait faz o compose esperar as verificações de saúde, em vez de devolver o
# terminal assim que os contêineres iniciam. Sem isso, os passos seguintes
# correm contra um banco que ainda está subindo.
docker compose up -d --build --wait --wait-timeout 240 \
  || falhar "os serviços não ficaram saudáveis em 240s"

# Cinto e suspensório: mesmo com --wait, confirma que a API atende de fato.
bash scripts/wait-for.sh "http://localhost:${API_PORT}/health" "a API" 120 >/dev/null \
  || falhar "a API subiu mas não atendeu em /health"

echo "3/5  Aplicando as migrações"
docker compose exec -T api npm run migration:run --silent > /tmp/yj-migracoes.txt 2>&1 \
  || falhar "as migrações falharam" "$(grep -viE '^query:' /tmp/yj-migracoes.txt | tail -25)"

# Prova que elas realmente rodaram, em vez de terem falhado em silêncio.
APLICADAS=$(docker compose exec -T postgres psql -U "$(grep -E '^POSTGRES_USER=' .env | cut -d= -f2)" \
  -d "$(grep -E '^POSTGRES_DB=' .env | cut -d= -f2)" -tAc 'SELECT count(*) FROM migrations;' 2>/dev/null | tr -d '[:space:]')
case "$APLICADAS" in
  ''|*[!0-9]*) falhar "não consegui ler a tabela de migrações" "Resposta do banco: '${APLICADAS}'" ;;
esac
[ "$APLICADAS" -ge 1 ] || falhar "nenhuma migração foi aplicada" "A tabela migrations existe e está vazia."
echo "     $APLICADAS migração(ões) aplicada(s)"

echo "4/5  Conferindo que as entidades batem com as migrações"
SAIDA=$(docker compose exec -T api sh -c \
  './node_modules/.bin/typeorm-ts-node-esm migration:generate -d src/database/data-source.ts src/database/migrations/__DRIFT__ 2>&1' || true)

if echo "$SAIDA" | grep -q 'No changes in database schema were found'; then
  : # entidades e migrações batem
elif echo "$SAIDA" | grep -q 'has been generated successfully'; then
  docker compose exec -T api sh -c 'rm -f src/database/migrations/*__DRIFT__*.ts' >/dev/null 2>&1 || true
  falhar "existe entidade sem migração" \
"Alguma entidade foi criada ou alterada sem a migração correspondente.

O projeto roda com synchronize desligado, então o TypeORM não cria tabela sozinho.
Sem a migração, a tabela não existe e a consulta estoura em execução.

Para gerar a migração que falta:

  make migration-generate NOME=CreateSomethingTable

Confira o arquivo gerado e faça commit dele junto com a entidade."
else
  falhar "não consegui verificar as entidades" "$(echo "$SAIDA" | grep -viE '^query:' | tail -25)"
fi

echo "5/5  Conferindo a resposta de /health"
RESP=$(curl -s --max-time 10 "http://localhost:${API_PORT}/health") \
  || falhar "não consegui chamar /health"
echo "$RESP" | grep -q '"status":"ok"' \
  || falhar "resposta inesperada em /health" "Recebido: $RESP"

echo
verde "SMOKE TEST PASSOU: serviços saudáveis, $APLICADAS migração(ões) aplicada(s), entidades em dia, /health respondendo."
limpar
