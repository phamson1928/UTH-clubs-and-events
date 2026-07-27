#!/bin/bash
# =============================================================================
# refresh-vps.sh — Refresh dates on VPS after deployment
# Chạy: bash ops/refresh-vps.sh
# =============================================================================
set -e

cd ~/UTH-clubs-and-events || { echo "❌ Không tìm thấy ~/UTH-clubs-and-events"; exit 1; }

echo "📦 Extracting DB credentials from .env..."
DB_USER=$(grep ^DB_USER uth-club-backend/.env | cut -d= -f2-)
DB_PASSWORD=$(grep ^DB_PASSWORD uth-club-backend/.env | cut -d= -f2-)
DB_HOST=$(grep ^DB_HOST uth-club-backend/.env | cut -d= -f2-)
DB_NAME=$(grep ^DB_NAME uth-club-backend/.env | cut -d= -f2-)

echo "🔌 Connecting to $DB_HOST ..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f database/refresh-dates.sql

echo "✅ Dates refreshed successfully!"