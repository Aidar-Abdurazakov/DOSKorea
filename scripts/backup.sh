#!/usr/bin/env bash
set -euo pipefail
# Run from the project root. Stop the app briefly for a consistent H2 file copy.
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
[ -f ./data/doskorea.mv.db ] && cp ./data/doskorea.mv.db "$BACKUP_DIR/doskorea-$STAMP.mv.db"
[ -d ./uploads ] && tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" uploads
find "$BACKUP_DIR" -type f -mtime +14 -delete
echo "Backup written to $BACKUP_DIR (retain copies off-server too)."
