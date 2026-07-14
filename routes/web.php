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
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');


Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

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
    // Read-only resource access for authenticated cashiers / staff
    Route::resource('customers', CustomerController::class)->only(['index', 'show']);
    Route::resource('products', ProductController::class)->only(['index', 'show']);
    Route::resource('sub-categories', SubCategoryController::class)->only(['index', 'show']);
    Route::resource('units', UnitController::class)->only(['index', 'show']);
    Route::resource('sizes', SizeController::class)->only(['index', 'show']);
    Route::resource('makers', MakerController::class)->only(['index', 'show']);
    Route::resource('brands', BrandController::class)->only(['index', 'show']);
    Route::resource('invoices', InvoiceController::class)->only(['index', 'show']);

    Route::get('/pos', function () {
        // Mock data for POS
        $products = [
            ['id' => 1, 'name' => 'Premium Spring Water', 'category' => 'Beverages', 'price' => 1.25, 'stock' => 84],
            ['id' => 2, 'name' => 'Salted Pretzels', 'category' => 'Snacks', 'price' => 2.50, 'stock' => 4],
            ['id' => 3, 'name' => 'Espresso Roast Coffee', 'category' => 'Beverages', 'price' => 4.99, 'stock' => 12],
            ['id' => 4, 'name' => 'Organic Apple Juice', 'category' => 'Beverages', 'price' => 3.50, 'stock' => 45],
            ['id' => 5, 'name' => 'Chocolate Bar', 'category' => 'Snacks', 'price' => 1.99, 'stock' => 2],
        ];
        return Inertia::render('POS/Index', ['products' => $products]);
    })->name('pos.index');

    Route::get('/orders', [PaymentController::class, 'index'])->name('orders.index');
    Route::resource('payments', PaymentController::class)->only(['store']);

    // Admin-only data-altering and system settings routes
    Route::middleware('admin')->group(function () {
        // Settings routes
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

        // Products write routes
        Route::post('products/check-exists', [ProductController::class, 'checkExistProduct'])->name('products.check');
        Route::delete('products/images/{id}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');
        Route::resource('products', ProductController::class)->except(['index', 'show']);

        // Customers write routes
        Route::resource('customers', CustomerController::class)->except(['index', 'show']);

        // Sub-categories write routes
        Route::resource('sub-categories', SubCategoryController::class)->except(['index', 'show']);

        // Units write routes
        Route::post('units/check-exists', [UnitController::class, 'checkExistUnit'])->name('units.check');
        Route::resource('units', UnitController::class)->except(['index', 'show']);

        // Sizes write routes
        Route::post('sizes/check-exists', [SizeController::class, 'checkExistSize'])->name('sizes.check');
        Route::resource('sizes', SizeController::class)->except(['index', 'show']);

        // Makers write routes
        Route::post('makers/check-exists', [MakerController::class, 'checkExistMaker'])->name('makers.check');
        Route::resource('makers', MakerController::class)->except(['index', 'show']);

        // Brands write routes
        Route::post('brands/check-exists', [BrandController::class, 'checkExistBrand'])->name('brands.check');
        Route::resource('brands', BrandController::class)->except(['index', 'show']);

        // Orders write routes (deletion)
        Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy');

        // Invoices write routes
        Route::resource('invoices', InvoiceController::class)->except(['index', 'show']);
    });
});




require __DIR__.'/auth.php';
