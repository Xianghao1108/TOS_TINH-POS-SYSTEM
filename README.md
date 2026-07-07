# Step 01
composer install

# Step 02
npm install

# Step 03 / Add new table or column
php artisan migrate

# Step 04 / Run Seeder
php artisan db:seed --class=PermissionSeeder
php artisan db:seed --class=UserSeeder

php artisan jwt:secret

# Running project
php artisan serve
npm run dev

# If we got error "No application encryption key has been specified."
php artisan key:generate


# Delele Data All Table
php artisan migrate:refresh

# Delete Data One Table
php artisan migrate:refresh --path=""

# clear cache, route, config
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan route:cache
php artisan config:cache

# Run the queue worker:
php artisan queue:work

### Step 4: Configure the Server Cron Job
To keep the Laravel scheduler engine awake and running in your production environment, add this single cron string to your server's crontab configuration using `crontab -e`:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

If you deploy on Windows Server, use Task Scheduler to run `php artisan schedule:run` every 1 minute instead.

Keep a queue worker running in production with Supervisor/systemd or the equivalent process manager on your server.

php artisan make:model YourModelName -mcr
