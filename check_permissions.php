<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$roles = Spatie\Permission\Models\Role::with('permissions')->get();
foreach ($roles as $role) {
    echo "Role: " . $role->name . "\n";
    echo "Permissions:\n";
    foreach ($role->permissions as $p) {
        echo " - " . $p->name . "\n";
    }
    echo "\n";
}
