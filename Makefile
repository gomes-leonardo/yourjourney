# Atalhos do projeto. Rode `make` (ou `make help`) para ver a lista.
#
# Regra de ouro: se um comando do dia a dia so funciona com uma sequencia de
# passos decorados, ele vira um alvo aqui. Ninguem deveria precisar decorar.

SHELL := /bin/bash
COMPOSE := docker compose

# Le o .env, para que alvos como `make health` saibam em qual porta bater.
ifneq (,$(wildcard .env))
include .env
export
endif

API_PORT ?= 8080
WEB_PORT ?= 3000

.DEFAULT_GOAL := help
.PHONY: help setup up down restart reset ps logs logs-api logs-web logs-db \
        health migrate migrate-revert migrate-status migration-generate smoke test lint verify sh-api sh-web psql

help: ## Mostra esta lista
	@echo "Your Journey -- comandos disponiveis:"
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' Makefile | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo
	@echo "Primeira vez aqui? Rode: make setup && make up"

setup: ## Prepara a maquina: cria o .env e instala dependencias locais
	@if [ -f .env ]; then echo ".env ja existe, mantido como esta."; else cp .env.example .env && echo "Criado .env a partir de .env.example."; fi
	@echo
	@echo "Instalando dependencias locais (fora do Docker)."
	@echo "O projeto roda em conteiner, mas o editor precisa destes arquivos"
	@echo "para autocompletar e parar de marcar tudo em vermelho."
	cd apps/api && npm install
	cd apps/web && npm install
	@echo
	@echo "Pronto. Agora rode: make up"

up: ## Sobe todos os servicos e espera eles responderem
	@bash scripts/preflight.sh
	$(COMPOSE) up -d --build
	@echo
	@bash scripts/wait-for.sh http://localhost:$(API_PORT)/health "a API" 120
	@bash scripts/wait-for.sh http://localhost:$(WEB_PORT) "o front-end" 120
	@echo
	@echo
	@echo "Aplicando migracoes do banco..."
	@set -o pipefail; $(COMPOSE) exec -T api npm run migration:run --silent 2>&1 | sed '/^query:/d'
	@echo
	@echo "Tudo no ar:"
	@echo "  Front-end  http://localhost:$(WEB_PORT)"
	@echo "  API        http://localhost:$(API_PORT)/health"
	@echo
	@echo "Para acompanhar os logs: make logs"

down: ## Para os servicos, preservando os dados
	$(COMPOSE) down

restart: ## Para e sobe de novo
	@$(MAKE) down
	@$(MAKE) up

reset: ## Para os servicos e APAGA os dados dos bancos
	@echo "Isto apaga o banco local e nao tem volta."
	@read -p "Digite 'apagar' para confirmar: " r; [ "$$r" = "apagar" ] || { echo "Cancelado."; exit 1; }
	$(COMPOSE) down -v
	@echo "Bancos apagados. Rode 'make up' para comecar do zero."

migrate: ## Aplica as migracoes pendentes no banco
	@set -o pipefail; $(COMPOSE) exec -T api npm run migration:run --silent 2>&1 | sed '/^query:/d'

migrate-revert: ## Desfaz a ultima migracao aplicada
	@$(COMPOSE) exec -T api npm run migration:revert

migration-generate: ## Gera a migracao a partir das entidades. Use: make migration-generate NOME=CriaTabelaX
	@test -n "$(NOME)" || { echo "Falta o nome. Use: make migration-generate NOME=CriaTabelaUsuarios"; exit 1; }
	@$(COMPOSE) exec -T api sh -c './node_modules/.bin/typeorm-ts-node-esm migration:generate -d src/database/data-source.ts src/database/migrations/$(NOME)' 2>&1 | sed '/^query:/d'

smoke: ## Sobe tudo de verdade e confere que a aplicacao responde
	@bash scripts/smoke.sh

migrate-status: ## Mostra quais migracoes ja foram aplicadas
	@$(COMPOSE) exec -T api npm run migration:show

ps: ## Mostra o estado de cada servico
	$(COMPOSE) ps

logs: ## Acompanha os logs de todos os servicos
	$(COMPOSE) logs -f

logs-api: ## Acompanha os logs so da API
	$(COMPOSE) logs -f api

logs-web: ## Acompanha os logs so do front-end
	$(COMPOSE) logs -f web

logs-db: ## Acompanha os logs so do banco
	$(COMPOSE) logs -f postgres

health: ## Pergunta a API se ela esta viva
	@curl --silent --fail http://localhost:$(API_PORT)/health && echo || echo "A API nao respondeu. Rode 'make logs-api' para ver o motivo."

test: ## Roda os testes da API
	cd apps/api && npm test

lint: ## Confere o estilo do codigo nos dois apps
	cd apps/api && npm run lint
	cd apps/web && npm run lint

verify: ## Roda lint e testes, o mesmo que o CI vai rodar
	@$(MAKE) lint
	@$(MAKE) test

sh-api: ## Abre um terminal dentro do conteiner da API
	$(COMPOSE) exec api sh

sh-web: ## Abre um terminal dentro do conteiner do front-end
	$(COMPOSE) exec web sh

psql: ## Abre o cliente do Postgres no banco do projeto
	$(COMPOSE) exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)
