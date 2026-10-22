#!/usr/bin/env bash
set -euo pipefail
umask 077
if [[ ${EUID} -ne 0 ]]; then echo 'Run with sudo.' >&2; exit 1; fi
archive=${1:?Usage: install.sh /absolute/path/release.tar.gz RELEASE_ID PUBLIC_ORIGIN}
release=${2:?Release ID required}
origin=${3:?Public HTTP/HTTPS origin required}
[[ $archive == /* && -f $archive && $release =~ ^[0-9A-Za-z_-]+$ && $origin =~ ^https?://[0-9A-Za-z.:-]+$ ]] || exit 2
script_dir=$(cd -- "$(dirname -- "$0")" && pwd)

if ! command -v java >/dev/null || ! command -v psql >/dev/null || ! command -v nginx >/dev/null; then
    export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a
    apt-get update -qq
    apt-get install -y openjdk-21-jre-headless postgresql nginx openssl
fi

# Small student VMs need headroom during initial catalog imports.
if [[ ! -f /swap-stem-compass ]]; then
    fallocate -l 2G /swap-stem-compass
    chmod 600 /swap-stem-compass
    mkswap /swap-stem-compass >/dev/null
fi
if ! swapon --show=NAME --noheadings | grep -qx /swap-stem-compass; then swapon /swap-stem-compass; fi
grep -q '^/swap-stem-compass ' /etc/fstab || printf '/swap-stem-compass none swap sw 0 0\n' >> /etc/fstab
printf 'vm.swappiness=20\n' > /etc/sysctl.d/90-stem-compass.conf
sysctl -p /etc/sysctl.d/90-stem-compass.conf >/dev/null
id stemapp >/dev/null 2>&1 || useradd --system --home-dir /opt/stem-compass --shell /usr/sbin/nologin stemapp
install -d -m 755 /opt/stem-compass /opt/stem-compass/releases
install -d -m 700 /etc/stem-compass
install -d -m 700 -o postgres -g postgres /var/backups/stem-compass

systemctl enable --now postgresql
pg_version=$(find /etc/postgresql -mindepth 1 -maxdepth 1 -type d | sort -V | tail -n 1)
cat > "$pg_version/main/conf.d/90-stem-compass.conf" <<'PG'
listen_addresses = 'localhost'
max_connections = 25
shared_buffers = '32MB'
work_mem = '2MB'
maintenance_work_mem = '32MB'
PG
chown root:postgres "$pg_version/main/conf.d/90-stem-compass.conf"
chmod 640 "$pg_version/main/conf.d/90-stem-compass.conf"
pg_ctlcluster "${pg_version##*/}" main restart
pg_isready -q

if [[ ! -f /etc/stem-compass/app.env ]]; then
    db_password=$(openssl rand -hex 24)
    admin_password=$(openssl rand -hex 16)
    runuser -u postgres -- psql -v ON_ERROR_STOP=1 <<SQL
CREATE ROLE stemapp LOGIN PASSWORD '$db_password';
CREATE DATABASE huongnghiep OWNER stemapp;
SQL
    cat > /etc/stem-compass/app.env <<ENV
APP_PORT=8080
SERVER_ADDRESS=127.0.0.1
SERVER_FORWARD_HEADERS_STRATEGY=framework
APP_ORIGIN=$origin
SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:5432/huongnghiep
SPRING_DATASOURCE_USERNAME=stemapp
SPRING_DATASOURCE_PASSWORD=$db_password
SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=4
SPRING_DATASOURCE_HIKARI_MINIMUM_IDLE=1
SERVER_TOMCAT_THREADS_MAX=16
SERVER_TOMCAT_THREADS_MIN_SPARE=2
SEED_ENABLED=true
LOCAL_ADMIN_ENABLED=true
LOCAL_ADMIN_USERNAME=admin
LOCAL_ADMIN_PASSWORD=$admin_password
COOKIE_SECURE=false
ENV
    printf 'URL: %s\nUsername: admin\nPassword: %s\n' "$origin" "$admin_password" > /etc/stem-compass/admin-access.txt
    chmod 600 /etc/stem-compass/app.env /etc/stem-compass/admin-access.txt
fi

target=/opt/stem-compass/releases/$release
[[ ! -e $target ]] || { echo 'Release already exists; use a new ID.' >&2; exit 3; }
install -d -m 755 "$target"
tar -xzf "$archive" --no-same-owner -C "$target"
test -f "$target/backend.jar" && test -f "$target/web/index.html"
chown -R root:root "$target"
find "$target" -type d -exec chmod 755 {} +
find "$target" -type f -exec chmod 644 {} +
# Atomic switch; earlier releases remain available for rollback.
ln -s "$target" /opt/stem-compass/current.next
mv -Tf /opt/stem-compass/current.next /opt/stem-compass/current
install -m 644 "$script_dir/stem-compass.service" /etc/systemd/system/stem-compass.service
install -m 644 "$script_dir/nginx.conf" /etc/nginx/sites-available/stem-compass
if [[ -L /etc/nginx/sites-enabled/default ]]; then unlink /etc/nginx/sites-enabled/default; fi
ln -sfn /etc/nginx/sites-available/stem-compass /etc/nginx/sites-enabled/stem-compass
nginx -t
if command -v ufw >/dev/null && ufw status | grep -q '^Status: active'; then ufw allow 'Nginx Full'; fi
systemctl daemon-reload
systemctl enable stem-compass nginx
systemctl restart stem-compass
systemctl reload nginx
echo "Installed release $release. Startup and seed import may take several minutes."
