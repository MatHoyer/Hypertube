#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

case "${1:-config}" in
  config)
    exec "${SCRIPT_DIR}/prowlarr-init-config.sh"
    ;;
  indexers)
    exec "${SCRIPT_DIR}/prowlarr-init-indexers.sh"
    ;;
  all)
    "${SCRIPT_DIR}/prowlarr-init-config.sh"
    echo ""
    echo "Start Prowlarr, then run:"
    echo "  ${SCRIPT_DIR}/prowlarr-init.sh indexers"
    ;;
  *)
    echo "Usage: $0 {config|indexers|all}"
    exit 1
    ;;
esac
