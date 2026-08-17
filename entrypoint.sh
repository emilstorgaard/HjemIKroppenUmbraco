#!/bin/bash
set -e

# Fix ownership of bind-mounted directories so the app can write to them.
# Only run chown -R if the directory is not already owned by APP_UID to avoid
# slow recursive operations on large directories (e.g., media with many files).
fix_ownership() {
    local dir="$1"
    mkdir -p "$dir"
    if [ "$(stat -c '%u' "$dir")" != "$APP_UID" ]; then
        chown -R "$APP_UID:$APP_UID" "$dir"
    fi
}

fix_ownership /app/wwwroot/media
fix_ownership /app/wwwroot/scripts
fix_ownership /app/wwwroot/css
fix_ownership /app/Views
fix_ownership /app/umbraco

# Wait for the database to accept TCP connections before starting Umbraco.
# Prevents Umbraco crashing on boot if the DB container isn't ready yet
# (e.g. after a host reboot where containers start in parallel).
DB_HOST="${DB_HOST:-mssql}"
DB_PORT="${DB_PORT:-1433}"
DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-60}"

echo "Awaiting database $DB_HOST:$DB_PORT..."
start_time=$(date +%s)
until bash -c "echo > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; do
    now=$(date +%s)
    elapsed=$((now - start_time))
    if [ "$elapsed" -ge "$DB_WAIT_TIMEOUT" ]; then
        echo "Timeout after ${DB_WAIT_TIMEOUT}s - starting anyway and letting Umbraco/.NET's own retry logic take over."
        break
    fi
    sleep 2
done
echo "Database is responding (or timeout reached) - starting Umbraco"

# Drop privileges and run the application as the app user
exec gosu "$APP_UID" dotnet HjemIKroppenUmbraco.dll
