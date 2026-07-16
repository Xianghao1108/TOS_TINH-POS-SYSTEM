#!/bin/bash

# Clear and optimize configuration caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations and seeders automatically
# The --force flag is mandatory for running migrations in production
php artisan migrate --force
php artisan db:seed --force

# Start the application server
php artisan serve --host 0.0.0.0 --port $PORT