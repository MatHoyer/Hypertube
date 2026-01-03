.PHONY: vpn stop-vpn logs-vpn infra stop-infra logs-infra helpers stop-helpers logs-helpers dev stop-dev logs-dev prod stop-prod logs-prod stop-all rebuild-dev rebuild-prod

# VPN (doit être lancé en premier)
vpn:
	docker compose -f docker-compose-vpn.yml -f docker-compose-vpn.override.yml up -d

stop-vpn:
	docker compose -f docker-compose-vpn.yml -f docker-compose-vpn.override.yml down

logs-vpn:
	docker compose -f docker-compose-vpn.yml -f docker-compose-vpn.override.yml logs -f

# Infra
infra: vpn
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

stop-infra:
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

logs-infra:
	docker compose -f docker-compose.yml -f docker-compose.override.yml logs -f

# Helpers
helpers:
	docker compose -f docker-compose-helpers.yml up -d

stop-helpers:
	docker compose -f docker-compose-helpers.yml down

logs-helpers:
	docker compose -f docker-compose-helpers.yml logs -f

# Dev
dev: infra
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

stop-dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml down

logs-dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml logs -f

# Prod
prod: infra
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml up -d

stop-prod:
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml down

logs-prod:
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml logs -f

# Stop everything
stop-all: stop-dev stop-prod stop-vpn stop-helpers stop-infra

# Rebuild
rebuild-dev: stop-dev
	docker compose -f docker-compose.yml -f docker-compose.override.yml build --no-cache
	$(MAKE) dev

rebuild-prod: stop-prod
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml build --no-cache
	$(MAKE) prod

