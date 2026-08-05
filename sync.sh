#!/bin/bash
# Fast Bian — sync Desktop folder ke CEP extension folder
SRC="$HOME/Desktop/Fast_Bian"
DST="$HOME/Library/Application Support/Adobe/CEP/extensions/Fast_Bian"

# Exclude file yang gak perlu
rsync -av --delete \
  --exclude '.DS_Store' \
  --exclude 'sync.sh' \
  "$SRC/" "$DST/"

echo ""
echo "✅ Synced! Restart AE (Window > Extensions > Fast Bian) untuk liat perubahan."
