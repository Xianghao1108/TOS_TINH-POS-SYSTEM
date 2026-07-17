#!/bin/bash

# Create storage symlink
php artisan storage:link || true

# Clear and optimize configuration caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
php artisan migrate --force

# Clear Spatie Permission Cache
php artisan permission:cache-reset || php artisan cache:clear

# Seed
php artisan db:seed --class=PermissionSeeder --force
php artisan db:seed --class=UserSeeder --force

# Clear cache again
php artisan permission:cache-reset || php artisan cache:clear

# Start server
php artisan serve --host 0.0.0.0 --port $PORTd --class=UserSeeder --force

echo "==> Resetting Spatie permission cache after seeding..."
php artisan permission:cache-reset || true

echo "==> Caching config, routes, and views for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> Starting application server on port ${PORT}..."
php artisan serve --host 0.0.0.0 --port $PORT