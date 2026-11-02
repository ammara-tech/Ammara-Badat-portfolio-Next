#!/usr/bin/env bash
# Tests my database rules on a fresh, empty Postgres database.
# GitHub runs this on every push (.github/workflows/database-tests.yml).
# It needs a Postgres server; set PGHOST, PGUSER and PGPASSWORD to point at it.
#
#   1. makes an empty database called rules_test (deleting an old one first)
#   2. loads a small stand-in for Supabase (tests/database/supabase-stand-in.sql)
#   3. runs every file in Supabase/, in the same order as the README's setup steps
#   4. runs the checks in tests/database/rules.sql, which fail the run if any rule is wrong
set -euo pipefail
cd "$(dirname "$0")/../.."

DB=rules_test
psql -q -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists $DB" -c "create database $DB"
# Only errors are shown while loading (not the "already exists, skipping" notes)
run() { PGOPTIONS="-c client_min_messages=error" psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$1" > /dev/null; }

run tests/database/supabase-stand-in.sql
for file in schema.sql 003-screenshots-video-case-study.sql 004-messages-contact-form.sql \
  005-project-images-storage.sql 006-realtime-inbox.sql 007-drafts-activity-log.sql \
  008-two-step-sign-in.sql 009-activity-log-messages-images.sql 010-backup-codes.sql; do
  echo "Loading Supabase/$file"
  run "Supabase/$file"
done

# Running the setup files a second time must work too ("safe to run twice")
for file in 005-project-images-storage.sql 006-realtime-inbox.sql 007-drafts-activity-log.sql \
  008-two-step-sign-in.sql 009-activity-log-messages-images.sql 010-backup-codes.sql; do
  run "Supabase/$file"
done
echo "Every setup file ran twice without errors"

psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/database/rules.sql
