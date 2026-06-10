.PHONY: vpn stop-vpn logs-vpn refresh-vpn-sidecars infra stop-infra logs-infra helpers stop-helpers logs-helpers prod stop-prod logs-prod stop-all rebuild-prod reset

# Sidecars use network_mode: container:vpn — they must be recreated when the VPN
# container is replaced, or DNS/networking breaks inside Prowlarr/Transmission.
refresh-vpn-sidecars:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up -d --force-recreate transmission
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml up -d --force-recreate prowlarr subtitle-proxy

# VPN
vpn:
	docker compose -f docker-compose-vpn.yml -f docker-compose-vpn.override.yml up -d
	@VPN_ID=$$(docker inspect -f '{{.Id}}' vpn 2>/dev/null); \
	PROWLARR_NS=$$(docker inspect -f '{{.HostConfig.NetworkMode}}' hypertube-prowlarr-prod 2>/dev/null || true); \
	if [ -n "$$VPN_ID" ] && [ "container:$$VPN_ID" != "$$PROWLARR_NS" ]; then \
		echo "VPN container changed — recreating sidecars..."; \
		$(MAKE) refresh-vpn-sidecars; \
	fi

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

rebuild-infra: stop-infra
	docker compose -f docker-compose.yml -f docker-compose.override.yml build --no-cache
	$(MAKE) infra

rebuild-helpers: stop-helpers
	docker compose -f docker-compose-helpers.yml build --no-cache
	$(MAKE) helpers

rebuild-prod: stop-prod
	docker compose -f docker-compose-prod.yml -f docker-compose-prod.override.yml build --no-cache
	$(MAKE) prod

reset: stop-all
	docker system prune -af && docker volume prune -af

