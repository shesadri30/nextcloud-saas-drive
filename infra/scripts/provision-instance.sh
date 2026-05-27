#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# provision-instance.sh
# Provisions a new Nextcloud instance for a user after subscription payment.
#
# Usage:
#   ./provision-instance.sh \
#     --user-id "clxxx123" \
#     --subdomain "john-doe" \
#     --storage-gb 200 \
#     --s3-bucket "user-clxxx123-bucket" \
#     --s3-host "account.r2.cloudflarestorage.com" \
#     --s3-key "ACCESS_KEY" \
#     --s3-secret "SECRET_KEY" \
#     --port 8101
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Parse args ────────────────────────────────────────────────────────────────
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --user-id) USER_ID="$2"; shift ;;
    --subdomain) SUBDOMAIN="$2"; shift ;;
    --storage-gb) STORAGE_GB="$2"; shift ;;
    --s3-bucket) S3_BUCKET="$2"; shift ;;
    --s3-host) S3_HOST="$2"; shift ;;
    --s3-key) S3_KEY="$2"; shift ;;
    --s3-secret) S3_SECRET="$2"; shift ;;
    --port) HOST_PORT="$2"; shift ;;
    *) echo "Unknown param: $1"; exit 1 ;;
  esac
  shift
done

# ── Validate ──────────────────────────────────────────────────────────────────
: "${USER_ID:?--user-id required}"
: "${SUBDOMAIN:?--subdomain required}"
: "${STORAGE_GB:?--storage-gb required}"
: "${S3_BUCKET:?--s3-bucket required}"
: "${S3_HOST:?--s3-host required}"
: "${S3_KEY:?--s3-key required}"
: "${S3_SECRET:?--s3-secret required}"
: "${HOST_PORT:?--port required}"

# Load base env
source /opt/saas/.env

NC_ADMIN_USER="nc_${USER_ID:0:8}"
NC_ADMIN_PASSWORD=$(openssl rand -base64 16)
CONTAINER_NAME="nextcloud_${USER_ID}"
DATA_DIR="/opt/saas/nextcloud-data/${USER_ID}"

echo "🚀 Provisioning Nextcloud instance for user: ${USER_ID}"
echo "   Subdomain : ${SUBDOMAIN}.${NEXTCLOUD_BASE_DOMAIN}"
echo "   Port      : ${HOST_PORT}"
echo "   Storage   : ${STORAGE_GB} GB"
echo "   S3 Bucket : ${S3_BUCKET}"

# ── Create data directory ────────────────────────────────────────────────────
mkdir -p "${DATA_DIR}"

# ── Start Nextcloud container ────────────────────────────────────────────────
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  --network saas_network \
  -p "${HOST_PORT}:80" \
  -v "${DATA_DIR}:/var/www/html" \
  -e NEXTCLOUD_ADMIN_USER="${NC_ADMIN_USER}" \
  -e NEXTCLOUD_ADMIN_PASSWORD="${NC_ADMIN_PASSWORD}" \
  -e NEXTCLOUD_TRUSTED_DOMAINS="${SUBDOMAIN}.${NEXTCLOUD_BASE_DOMAIN}" \
  -e OBJECTSTORE_S3_HOST="${S3_HOST}" \
  -e OBJECTSTORE_S3_BUCKET="${S3_BUCKET}" \
  -e OBJECTSTORE_S3_KEY="${S3_KEY}" \
  -e OBJECTSTORE_S3_SECRET="${S3_SECRET}" \
  -e OBJECTSTORE_S3_PORT="443" \
  -e OBJECTSTORE_S3_SSL="true" \
  -e OBJECTSTORE_S3_REGION="${S3_REGION:-auto}" \
  -e OBJECTSTORE_S3_USEPATH_STYLE="true" \
  -e POSTGRES_HOST="${POSTGRES_HOST}" \
  -e POSTGRES_DB="nextcloud_${USER_ID}" \
  -e POSTGRES_USER="${POSTGRES_USER}" \
  -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
  "${NEXTCLOUD_DOCKER_IMAGE:-nextcloud:28}"

echo "⏳ Waiting for Nextcloud to initialize (60s)..."
sleep 60

# ── Set storage quota ────────────────────────────────────────────────────────
echo "💾 Setting storage quota: ${STORAGE_GB} GB"
docker exec "${CONTAINER_NAME}" php occ user:setting \
  "${NC_ADMIN_USER}" files quota "${STORAGE_GB}GB"

# ── Update database record ───────────────────────────────────────────────────
echo "📝 Updating instance record in database..."
psql "${DATABASE_URL}" -c "
  UPDATE \"NextcloudInstance\"
  SET
    status = 'ACTIVE',
    \"dockerContainerId\" = '${CONTAINER_NAME}',
    \"provisionedAt\" = NOW()
  WHERE \"userId\" = '${USER_ID}';
"

echo ""
echo "✅ Nextcloud instance provisioned successfully!"
echo "   URL      : https://${SUBDOMAIN}.${NEXTCLOUD_BASE_DOMAIN}"
echo "   Admin    : ${NC_ADMIN_USER}"
echo "   Password : ${NC_ADMIN_PASSWORD}"
echo ""
echo "⚠️  Save the admin password above — it will not be shown again!"
