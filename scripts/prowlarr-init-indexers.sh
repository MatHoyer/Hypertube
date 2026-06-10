#!/bin/sh
set -eu

PROWLARR_URL="${PROWLARR_URL:-http://localhost:9696}"
API_KEY="${PROWLARR_API_KEY:-}"
API_KEY_FILE="${PROWLARR_API_KEY_FILE:-${PROWLARR_CONFIG_DIR:-/config}/api_key}"
INDEXERS="${PROWLARR_INDEXERS:-yts,thepiratebay,torrentgalaxyclone,limetorrents,torrentdownloads,bitmagnet,btdirectory,torrentcore,kickasstorrents-ws,torrentproject2}"
MAX_WAIT="${PROWLARR_INIT_MAX_WAIT:-120}"

BASE_URL="${PROWLARR_URL%/}"

if [ -z "${API_KEY}" ] && [ -f "${API_KEY_FILE}" ]; then
  API_KEY="$(cat "${API_KEY_FILE}")"
fi

if [ -z "${API_KEY}" ]; then
  echo "PROWLARR_API_KEY is required (set in .env or run prowlarr-init-config.sh first)."
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required."
  exit 1
fi

api() {
  curl -sf -H "X-Api-Key: ${API_KEY}" -H "Content-Type: application/json" "$@"
}

resolve_definition_name() {
  def_name="$(echo "$1" | tr '[:upper:]' '[:lower:]')"
  case "${def_name}" in
    torrentgalaxy | tgx) echo "torrentgalaxyclone" ;;
    tpb | piratebay | thepiratebay) echo "thepiratebay" ;;
    lime | limetorrents) echo "limetorrents" ;;
    kickass | kat) echo "kickasstorrents-ws" ;;
    torrentproject | tp) echo "torrentproject2" ;;
    extratorrent | et) echo "extratorrent-st" ;;
    magnet | bitmagnet) echo "bitmagnet" ;;
    *) echo "${def_name}" ;;
  esac
}

indexer_exists() {
  def_name="$1"
  api "${BASE_URL}/api/v1/indexer" | jq -e --arg def "${def_name}" \
    '[.[] | select((.definitionName // "") | ascii_downcase == ($def | ascii_downcase))] | length > 0' \
    >/dev/null
}

extract_error_message() {
  body="$1"
  echo "${body}" | jq -r '
    if type == "array" then
      [.[] | select(.errorMessage? != null) | .errorMessage] | join("; ")
    elif .errors? then
      (.errors | to_entries[] | .value[]?) // empty
    else
      empty
    end
  ' 2>/dev/null || true
}

post_indexer() {
  payload="$1"
  curl -sS -H "X-Api-Key: ${API_KEY}" -H "Content-Type: application/json" \
    -X POST -d "${payload}" "${BASE_URL}/api/v1/indexer?forceSave=true" \
    -w "\n%{http_code}"
}

try_add_with_base_url() {
  payload="$1"
  base_url="$2"

  if [ -n "${base_url}" ]; then
    payload="$(echo "${payload}" | jq -c --arg url "${base_url}" '
      (if (.fields[]? | select(.name == "baseUrl")) then
        (.fields[] | select(.name == "baseUrl") | .value) = $url
      else . end)
    ')"
  fi

  response="$(post_indexer "${payload}")"
  http_code="$(echo "${response}" | tail -n1)"
  body="$(echo "${response}" | sed '$d')"

  if [ "${http_code}" = "201" ] || [ "${http_code}" = "200" ]; then
    echo "${body}"
    return 0
  fi

  error_msg="$(extract_error_message "${body}")"
  if [ -n "${error_msg}" ]; then
    echo "${error_msg}" >&2
  else
    echo "HTTP ${http_code}" >&2
  fi
  return 1
}

add_indexer() {
  requested_name="$1"
  def_name="$(resolve_definition_name "${requested_name}")"

  if [ "${requested_name}" != "${def_name}" ]; then
    echo "Resolving indexer alias '${requested_name}' -> '${def_name}'."
  fi

  if indexer_exists "${def_name}"; then
    echo "Indexer '${def_name}' already configured — skipping."
    return 0
  fi

  schema_entry="$(api "${BASE_URL}/api/v1/indexer/schema" | jq -c --arg def "${def_name}" '
    [.[] | select((.definitionName // "") | ascii_downcase == ($def | ascii_downcase))] | first
  ')"

  if [ -z "${schema_entry}" ] || [ "${schema_entry}" = "null" ]; then
    echo "Indexer '${requested_name}' not found in Prowlarr schema (resolved: '${def_name}') — skipping."
    return 1
  fi

  payload="$(echo "${schema_entry}" | jq -c '
    .enable = true
    | .appProfileId = 1
    | .priority = 25
    | del(.id, .message, .presets)
  ')"

  display_name="$(echo "${payload}" | jq -r '.name // .definitionName // "unknown"')"

  if try_add_with_base_url "${payload}" ""; then
    echo "Added indexer: ${display_name} (${def_name})"
    return 0
  fi

  has_base_url_field="$(echo "${payload}" | jq 'any(.fields[]?; .name == "baseUrl")')"
  if [ "${has_base_url_field}" = "true" ]; then
    echo "Retrying '${def_name}' with alternate base URLs..."
    while IFS= read -r base_url; do
      [ -z "${base_url}" ] && continue
      echo "  Trying ${base_url}"
      if try_add_with_base_url "${payload}" "${base_url}" >/dev/null; then
        echo "Added indexer: ${display_name} (${def_name}) via ${base_url}"
        return 0
      fi
    done <<URLS
$(echo "${schema_entry}" | jq -r '[.indexerUrls[]?] | unique | .[]')
URLS
  fi

  case "${def_name}" in
    1337x)
      echo "Failed to add '${def_name}': Cloudflare protection — configure FlareSolverr in Prowlarr (Settings > Indexers)."
      ;;
    torrentgalaxyclone)
      echo "Failed to add '${def_name}': site unreachable or redirect loop from the VPN exit IP."
      ;;
    *)
      echo "Failed to add indexer '${def_name}'."
      ;;
  esac
  return 1
}

wait_for_prowlarr() {
  elapsed=0
  echo "Waiting for Prowlarr at ${BASE_URL}..."
  while [ "${elapsed}" -lt "${MAX_WAIT}" ]; do
    if api "${BASE_URL}/api/v1/system/status" >/dev/null 2>&1; then
      echo "Prowlarr is ready."
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  echo "Prowlarr did not become ready within ${MAX_WAIT}s."
  exit 1
}

wait_for_prowlarr

echo "Configuring indexers: ${INDEXERS}"
failed=0

OLDIFS="${IFS}"
IFS=,
for def_name in ${INDEXERS}; do
  def_name="$(echo "${def_name}" | tr -d '[:space:]')"
  [ -z "${def_name}" ] && continue
  if ! add_indexer "${def_name}"; then
    failed=$((failed + 1))
  fi
done
IFS="${OLDIFS}"

if [ "${failed}" -gt 0 ]; then
  echo "${failed} indexer(s) could not be added — continuing with the rest."
fi

echo "Indexer setup complete."
