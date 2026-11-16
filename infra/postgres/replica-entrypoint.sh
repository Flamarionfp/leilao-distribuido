#!/bin/bash
set -e

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "Clonando o primário com pg_basebackup…"
  until pg_basebackup -h pg-primary -U replicator -D "$PGDATA" -Fp -Xs -P -R; do
    echo "Primário ainda não disponível, tentando de novo em 2s…"
    rm -rf "${PGDATA:?}"/*
    sleep 2
  done
  chmod 0700 "$PGDATA"
fi

exec postgres -c hot_standby=on -c listen_addresses='*'
