.PHONY: vpn stop-vpn logs-vpn infra stop-infra logs-infra helpers stop-helpers logs-helpers prod stop-prod logs-prod stop-all rebuild-prod reset

# VPN
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

# Prod
prod: infra
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml up -d

stop-prod:
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml down

logs-prod:
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml logs -f

# Stop everything
stop-all: stop-prod stop-vpn stop-helpers stop-infra

rebuild-vpn: stop-vpn
	docker compose -f docker-compose-vpn.yml -f docker-compose-vpn.override.yml build --no-cache
	$(MAKE) vpn

rebuild-prod: stop-prod
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml build --no-cache
	$(MAKE) prod

reset: stop-all
	docker system prune -af && docker volume prune -af

