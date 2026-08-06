#!/usr/bin/env bash
# Ad-hoc imza + karantina bayrağı temizliği (macOS Gatekeeper "hasar görmüş" uyarısı için)
set -euo pipefail

APP=$(find release -name "MQTT Explorer Alt.app" -type d 2>/dev/null | head -1)
if [ -z "$APP" ]; then
  echo "MQTT Explorer Alt.app bulunamadı" >&2
  exit 1
fi

echo "Signing: $APP"
xattr -cr "$APP"

while IFS= read -r -d '' helper; do
  codesign --force --sign - "$helper" 2>/dev/null || true
done < <(find "$APP/Contents/Frameworks" -name "*.app" -print0 2>/dev/null)

codesign --force --deep --sign - "$APP"
codesign --verify --deep --strict "$APP"
echo "OK: $APP"
