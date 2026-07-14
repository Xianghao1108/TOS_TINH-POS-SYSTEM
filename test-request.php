<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$request = Request::create('/sub-categories/1', 'PATCH', [
    'name' => 'Updated Name',
    'category_id' => 1,
]);
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);
echo 'Status: '.$response->getStatusCode()."\n";
echo 'Content: '.$response->getContent()."\n";
