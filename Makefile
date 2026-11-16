COMPOSE := docker compose
URL ?= http://localhost:8080
ROBOS ?= 30
LEILAO ?= 1

.DEFAULT_GOAL := help

.PHONY: help run up build down stop restart reset logs ps status install dev typecheck format \
	teste kill-app stop-app start-app kill-lider redis-failover pg-failover

help: ## Lista os comandos
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

run: build up ## Builda e sobe toda a aplicação
	@echo ""
	@echo "  Leilões: $(URL)"
	@echo "  Painel:  $(URL)/painel"

up: ## Sobe os containers (sem rebuild)
	$(COMPOSE) up -d

build: ## Builda as imagens
	$(COMPOSE) build

down: ## Para e remove os containers (mantém volumes)
	$(COMPOSE) down

stop: ## Para os containers sem remover
	$(COMPOSE) stop

restart: down run ## Recria os containers

reset: ## Remove containers, volumes, imagens e órfãos e sobe tudo do zero
	$(COMPOSE) down -v --rmi local --remove-orphans
	$(MAKE) run

logs: ## Segue os logs (ex.: make logs S=app-1)
	$(COMPOSE) logs -f --tail 100 $(S)

ps: ## Estado dos containers
	$(COMPOSE) ps -a

status: ## Estado do cluster (líder, nós, Redis, Postgres)
	@curl -s $(URL)/api/cluster | python3 -m json.tool

install: ## Instala dependências locais (server e web)
	cd server && npm install
	cd web && npm install

dev: ## Front em modo dev (Vite) usando o cluster do docker
	cd web && npm run dev

typecheck: ## Verifica tipos do server e do web
	cd server && npx tsc --noEmit
	cd web && npx tsc --noEmit

format: ## Formata o código com Prettier
	cd server && npm run format
	cd web && npm run format

teste: ## Lances concorrentes (ex.: make teste ROBOS=50 LEILAO=2)
	cd web && node scripts/lances-concorrentes.mjs $(URL) $(ROBOS) $(LEILAO)

kill-app: ## Crash de um nó (ex.: make kill-app N=2)
	$(COMPOSE) kill app-$(N)

stop-app: ## Desligamento gracioso de um nó (ex.: make stop-app N=2)
	$(COMPOSE) stop app-$(N)

start-app: ## Religa um nó (ex.: make start-app N=2)
	$(COMPOSE) start app-$(N)

kill-lider: ## Derruba o nó líder atual
	@L=$$(curl -s $(URL)/api/cluster | python3 -c 'import json,sys; print(json.load(sys.stdin)["leader"])'); \
	echo "Derrubando o líder: $$L"; $(COMPOSE) kill $$L

redis-failover: ## Derruba o Redis master atual (Sentinel promove a réplica)
	@M=$$(curl -s $(URL)/api/cluster | python3 -c 'import json,sys; print(json.load(sys.stdin)["redis"]["master"].split(":")[0])'); \
	echo "Derrubando o Redis master: $$M"; $(COMPOSE) stop $$M

pg-failover: ## Derruba o Postgres primário (o líder promove a réplica)
	$(COMPOSE) stop pg-primary
