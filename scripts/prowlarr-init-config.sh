#!/bin/sh
set -eu

CONFIG_DIR="${PROWLARR_CONFIG_DIR:-/config}"
CONFIG_FILE="${CONFIG_DIR}/config.xml"
API_KEY_FILE="${CONFIG_DIR}/api_key"
PORT="${PROWLARR_PORT:-9696}"
API_KEY="${PROWLARR_API_KEY:-}"

mkdir -p "${CONFIG_DIR}"

read_api_key_from_config() {
  if [ ! -f "${CONFIG_FILE}" ]; then
    return 0
  fi
  sed -n 's|.*<ApiKey>\(.*\)</ApiKey>.*|\1|p' "${CONFIG_FILE}" | head -n1
}

if [ -z "${API_KEY}" ]; then
  API_KEY="$(read_api_key_from_config)"
fi

if [ -z "${API_KEY}" ]; then
  if command -v openssl >/dev/null 2>&1; then
    API_KEY="$(openssl rand -hex 16)"
  else
    API_KEY="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n' | cut -c1-32)"
  fi
  echo "PROWLARR_API_KEY was empty — generated: ${API_KEY}"
  echo "Saved to ${API_KEY_FILE} (also readable via PROWLARR_API_KEY_FILE in prod)."
fi

write_config() {
  cat > "${CONFIG_FILE}" <<EOF
<Config>
  <BindAddress>*</BindAddress>
  <Port>${PORT}</Port>
  <SslPort>6969</SslPort>
  <EnableSsl>False</EnableSsl>
  <LaunchBrowser>False</LaunchBrowser>
  <ApiKey>${API_KEY}</ApiKey>
  <AuthenticationMethod>None</AuthenticationMethod>
  <AuthenticationRequired>DisabledForLocalAddresses</AuthenticationRequired>
  <Branch>master</Branch>
  <LogLevel>info</LogLevel>
  <UrlBase></UrlBase>
  <InstanceName>Prowlarr</InstanceName>
  <UpdateMechanism>Docker</UpdateMechanism>
</Config>
EOF
}

upsert_xml_value() {
  key="$1"
  value="$2"
  if grep -q "<${key}>" "${CONFIG_FILE}"; then
    sed -i "s|<${key}>.*</${key}>|<${key}>${value}</${key}>|" "${CONFIG_FILE}"
  else
    sed -i "s|</Config>|  <${key}>${value}</${key}>\n</Config>|" "${CONFIG_FILE}"
  fi
}

if [ ! -f "${CONFIG_FILE}" ]; then
  echo "Creating ${CONFIG_FILE}"
  write_config
else
  echo "Updating ${CONFIG_FILE}"
  upsert_xml_value "ApiKey" "${API_KEY}"
  upsert_xml_value "Port" "${PORT}"
  upsert_xml_value "AuthenticationMethod" "None"
  upsert_xml_value "AuthenticationRequired" "DisabledForLocalAddresses"
  upsert_xml_value "LaunchBrowser" "False"
fi

printf '%s' "${API_KEY}" > "${API_KEY_FILE}"
chmod 600 "${API_KEY_FILE}"

echo "Prowlarr config ready (no UI login required on local addresses)."
echo "API key: ${API_KEY}"
