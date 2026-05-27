#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-s3-bucket.sh
# Creates a scoped S3 bucket for a new user using the aws CLI.
# Compatible with Cloudflare R2, Backblaze B2, and any S3-compatible storage.
#
# Usage:
#   ./setup-s3-bucket.sh --user-id "clxxx123"
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --user-id) USER_ID="$2"; shift ;;
    *) echo "Unknown param: $1"; exit 1 ;;
  esac
  shift
done

: "${USER_ID:?--user-id required}"

source /opt/saas/.env

BUCKET_NAME="user-${USER_ID}-$(date +%s)"

echo "☁️  Creating S3 bucket: ${BUCKET_NAME}"

# Configure AWS CLI for S3-compatible endpoint
export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${S3_REGION:-auto}"

# Create bucket
aws s3api create-bucket \
  --bucket "${BUCKET_NAME}" \
  --endpoint-url "${S3_ENDPOINT}"

# Set bucket lifecycle policy (auto-delete incomplete multipart uploads after 7 days)
aws s3api put-bucket-lifecycle-configuration \
  --bucket "${BUCKET_NAME}" \
  --endpoint-url "${S3_ENDPOINT}" \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "abort-incomplete-multipart",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 }
    }]
  }'

echo "✅ Bucket created: ${BUCKET_NAME}"
echo "BUCKET_NAME=${BUCKET_NAME}"
