#!/bin/bash

# Clear and optimize configuration caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations with force flag for production
php artisan migrate --force

# Clear Spatie Permission Cache before seeding
php artisan permission:cache-reset || php artisan cache:clear

# Run your specific seeders with the production --force flag
php artisan db:seed --class=PermissionSeeder --force
php artisan db:seed --class=UserSeeder --force

# Clear Spatie Permission Cache after seeding to make it take effect live
php artisan permission:cache-reset || php artisan cache:clear

# Start the application server
php artisan serve --host 0.0.0.0 --port $PORT