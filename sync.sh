#!/bin/bash
# Fast Bian — sync repo (di mana pun) ke CEP extension folder
SRC="$(cd "$(dirname "$0")" && pwd)"
DST="$HOME/Library/Application Support/Adobe/CEP/extensions/Fast_Bian"

# Exclude file yang gak perlu
rsync -av --delete \
  --exclude '.DS_Store' \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude 'sync.sh' \
  "$SRC/" "$DST/"

echo ""
echo "✅ Synced! Restart AE (Window > Extensions > Fast Bian) untuk liat perubahan."
