<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\MakerController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\SettingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index')->middleware(['check:category-list']);
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware(['check:category-create']);
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::prefix('roles')->group(function () {
        Route::get('/', [RolesController::class, 'index'])->name('roles.index')->middleware(['check:role-list']);
        Route::get('/create', [RolesController::class, 'create'])->name('roles.create')->middleware(['check:role-create']);
        Route::get('/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware(['check:role-edit']);
        Route::post("/", [RolesController::class, 'store'])->name('roles.store');
        Route::patch("/{id}", [RolesController::class, 'update'])->name('roles.update');
        Route::delete("/{id}", [RolesController::class, 'destroy'])->name('roles.destroy')->middleware(['check:role-delete']);
    });
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('users.index')->middleware(['check:user-list']);
        Route::get('/create', [UserController::class, 'create'])->name('users.create')->middleware(['check:user-create']);
        Route::get('/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware(['check:user-edit']);
        Route::post("/", [UserController::class, 'store'])->name('users.store');
        Route::patch("/{id}", [UserController::class, 'update'])->name('users.update');
        Route::delete("/{id}", [UserController::class, 'destroy'])->name('users.destroy')->middleware(['check:user-delete']);
    });
    Route::resource('customers', CustomerController::class);

    Route::get('/pos', function () {
        // Mock data for POS
        $products = [
            ['id' => 1, 'name' => 'Premium Spring Water', 'category' => 'Beverages', 'price' => 1.25, 'stock' => 84],
            ['id' => 2, 'name' => 'Salted Pretzels', 'category' => 'Snacks', 'price' => 2.50, 'stock' => 4],
            ['id' => 3, 'name' => 'Espresso Roast Coffee', 'category' => 'Beverages', 'price' => 4.99, 'stock' => 12],
            ['id' => 4, 'name' => 'Organic Apple Juice', 'category' => 'Beverages', 'price' => 3.50, 'stock' => 45],
            ['id' => 5, 'name' => 'Chocolate Bar', 'category' => 'Snacks', 'price' => 1.99, 'stock' => 2],
        ];
        return Inertia\Inertia::render('POS/Index', ['products' => $products]);
    })->name('pos.index');

   
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    // Custom validation endpoints (Must be declared BEFORE the resource routes)
    Route::post('products/check-exists', [ProductController::class, 'checkExistProduct'])->name('products.check');
    Route::delete('products/images/{id}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');

// Standard Resource CRUD Routes
Route::resource('products', ProductController::class);

    Route::resource('sub-categories', SubCategoryController::class);

    // Custom route for checkExistUnit (Must go BEFORE the resource route)
    Route::post('units/check-exists', [UnitController::class, 'checkExistUnit'])->name('units.check');

    // This single line handles index (list), store (add), update (edit), and destroy (delete)
    Route::resource('units', UnitController::class);

    // Custom route for checkExistSize (MUST go before the resource route)
    Route::post('sizes/check-exists', [SizeController::class, 'checkExistSize'])->name('sizes.check');

    // Standard CRUD resource routes
    Route::resource('sizes', SizeController::class);

    // Custom route for live validation (Must go before the resource route)
    Route::post('makers/check-exists', [MakerController::class, 'checkExistMaker'])->name('makers.check');

    // Standard CRUD routes
    Route::resource('makers', MakerController::class);

    // Custom route for live validation (Must go before the resource route)
    Route::post('brands/check-exists', [BrandController::class, 'checkExistBrand'])->name('brands.check');

    // Standard CRUD routes
    Route::resource('brands', BrandController::class);

    Route::post('products/check-exists', [ProductController::class, 'checkExistProduct'])->name('products.check');
    Route::resource('products', ProductController::class);

    Route::get('/orders', [PaymentController::class, 'index'])->name('orders.index');
    Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');
    Route::resource('payments', PaymentController::class)->only(['store']);
    Route::resource('invoices', InvoiceController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
