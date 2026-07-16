<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MakerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\UserController;
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

    // Categories & Attributes Module
    Route::middleware('check:page.categories')->group(function () {
        // Main Categories
        Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create')->middleware('check:category.create');
        Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store')->middleware('check:category.create');
        Route::get('/categories/{id}', [CategoryController::class, 'edit'])->name('categories.edit')->middleware('check:category.edit');
        Route::patch('/categories/{id}', [CategoryController::class, 'update'])->name('categories.update')->middleware('check:category.edit');
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy')->middleware('check:category.delete');

        // Sub Categories
        Route::get('/sub-categories', [SubCategoryController::class, 'index'])->name('sub-categories.index');
        Route::get('/sub-categories/{sub_category}', [SubCategoryController::class, 'show'])->name('sub-categories.show');
        Route::get('/sub-categories/create', [SubCategoryController::class, 'create'])->name('sub-categories.create')->middleware('check:category.create');
        Route::post('/sub-categories', [SubCategoryController::class, 'store'])->name('sub-categories.store')->middleware('check:category.create');
        Route::get('/sub-categories/{sub_category}/edit', [SubCategoryController::class, 'edit'])->name('sub-categories.edit')->middleware('check:category.edit');
        Route::patch('/sub-categories/{sub_category}', [SubCategoryController::class, 'update'])->name('sub-categories.update')->middleware('check:category.edit');
        Route::delete('/sub-categories/{sub_category}', [SubCategoryController::class, 'destroy'])->name('sub-categories.destroy')->middleware('check:category.delete');

        // Units
        Route::get('/units', [UnitController::class, 'index'])->name('units.index');
        Route::get('/units/{unit}', [UnitController::class, 'show'])->name('units.show');
        Route::post('units/check-exists', [UnitController::class, 'checkExistUnit'])->name('units.check')->middleware('check:category.create');
        Route::get('/units/create', [UnitController::class, 'create'])->name('units.create')->middleware('check:category.create');
        Route::post('/units', [UnitController::class, 'store'])->name('units.store')->middleware('check:category.create');
        Route::get('/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit')->middleware('check:category.edit');
        Route::patch('/units/{unit}', [UnitController::class, 'update'])->name('units.update')->middleware('check:category.edit');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy')->middleware('check:category.delete');

        // Sizes
        Route::get('/sizes', [SizeController::class, 'index'])->name('sizes.index');
        Route::get('/sizes/{size}', [SizeController::class, 'show'])->name('sizes.show');
        Route::post('sizes/check-exists', [SizeController::class, 'checkExistSize'])->name('sizes.check')->middleware('check:category.create');
        Route::get('/sizes/create', [SizeController::class, 'create'])->name('sizes.create')->middleware('check:category.create');
        Route::post('/sizes', [SizeController::class, 'store'])->name('sizes.store')->middleware('check:category.create');
        Route::get('/sizes/{size}/edit', [SizeController::class, 'edit'])->name('sizes.edit')->middleware('check:category.edit');
        Route::patch('/sizes/{size}', [SizeController::class, 'update'])->name('sizes.update')->middleware('check:category.edit');
        Route::delete('/sizes/{size}', [SizeController::class, 'destroy'])->name('sizes.destroy')->middleware('check:category.delete');

        // Makers
        Route::get('/makers', [MakerController::class, 'index'])->name('makers.index');
        Route::get('/makers/{maker}', [MakerController::class, 'show'])->name('makers.show');
        Route::post('makers/check-exists', [MakerController::class, 'checkExistMaker'])->name('makers.check')->middleware('check:category.create');
        Route::get('/makers/create', [MakerController::class, 'create'])->name('makers.create')->middleware('check:category.create');
        Route::post('/makers', [MakerController::class, 'store'])->name('makers.store')->middleware('check:category.create');
        Route::get('/makers/{maker}/edit', [MakerController::class, 'edit'])->name('makers.edit')->middleware('check:category.edit');
        Route::patch('/makers/{maker}', [MakerController::class, 'update'])->name('makers.update')->middleware('check:category.edit');
        Route::delete('/makers/{maker}', [MakerController::class, 'destroy'])->name('makers.destroy')->middleware('check:category.delete');

        // Brands
        Route::get('/brands', [BrandController::class, 'index'])->name('brands.index');
        Route::get('/brands/{brand}', [BrandController::class, 'show'])->name('brands.show');
        Route::post('brands/check-exists', [BrandController::class, 'checkExistBrand'])->name('brands.check')->middleware('check:category.create');
        Route::get('/brands/create', [BrandController::class, 'create'])->name('brands.create')->middleware('check:category.create');
        Route::post('/brands', [BrandController::class, 'store'])->name('brands.store')->middleware('check:category.create');
        Route::get('/brands/{brand}/edit', [BrandController::class, 'edit'])->name('brands.edit')->middleware('check:category.edit');
        Route::patch('/brands/{brand}', [BrandController::class, 'update'])->name('brands.update')->middleware('check:category.edit');
        Route::delete('/brands/{brand}', [BrandController::class, 'destroy'])->name('brands.destroy')->middleware('check:category.delete');
    });

    // Roles Module
    Route::middleware('check:page.roles')->group(function () {
        Route::get('/roles', [RolesController::class, 'index'])->name('roles.index');
        Route::get('/roles/create', [RolesController::class, 'create'])->name('roles.create')->middleware('check:role.create');
        Route::post('/roles', [RolesController::class, 'store'])->name('roles.store')->middleware('check:role.create');
        Route::get('/roles/{id}', [RolesController::class, 'edit'])->name('roles.edit')->middleware('check:role.edit');
        Route::patch('/roles/{id}', [RolesController::class, 'update'])->name('roles.update')->middleware('check:role.edit');
        Route::delete('/roles/{id}', [RolesController::class, 'destroy'])->name('roles.destroy')->middleware('check:role.delete');
    });

    // Users Module
    Route::middleware('check:page.users')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/create', [UserController::class, 'create'])->name('users.create')->middleware('check:user.create');
        Route::post('/users', [UserController::class, 'store'])->name('users.store')->middleware('check:user.create');
        Route::get('/users/{id}', [UserController::class, 'edit'])->name('users.edit')->middleware('check:user.edit');
        Route::patch('/users/{id}', [UserController::class, 'update'])->name('users.update')->middleware('check:user.edit');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('check:user.delete');
    });

    // Products Module
    Route::middleware('check:page.products')->group(function () {
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
        Route::post('products/check-exists', [ProductController::class, 'checkExistProduct'])->name('products.check')->middleware('check:product.create');
        Route::delete('products/images/{id}', [ProductController::class, 'destroyImage'])->name('products.images.destroy')->middleware('check:product.edit');
        Route::get('/products/create', [ProductController::class, 'create'])->name('products.create')->middleware('check:product.create');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware('check:product.create');
        Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('check:product.edit');
        Route::patch('/products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware('check:product.edit');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('check:product.delete');
    });

    // Customers Module
    Route::middleware('check:page.customers')->group(function () {
        Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show');
        Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create')->middleware('check:customer.create');
        Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store')->middleware('check:customer.create');
        Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit')->middleware('check:customer.edit');
        Route::patch('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update')->middleware('check:customer.edit');
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy')->middleware('check:customer.delete');
    });

    // Orders & POS Module
    Route::middleware('check:page.orders')->group(function () {
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
        Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy')->middleware('check:order.cancel');
        Route::resource('payments', PaymentController::class)->only(['store'])->middleware('check:order.create');
    });

    // Invoices Module
    Route::middleware('check:page.invoices')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/{invoice}/details', [InvoiceController::class, 'details'])->name('invoices.details');
        Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf'])->name('invoices.pdf')->middleware('check:invoice.download');
        Route::resource('invoices', InvoiceController::class)->except(['index', 'show']);
    });

    // Settings Module
    Route::middleware('check:page.settings')->group(function () {
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update')->middleware('check:setting.update');
    });
});

require __DIR__.'/auth.php';
