<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'categories' => 'name',
        'sub_categories' => 'name',
        'sizes' => 'size_title',
        'makers' => 'maker_title',
        'brands' => 'brand_title',
        'units' => 'unit_title',
    ];

    private function hasUserIdForeignKey(string $tableName): bool
    {
        return ! empty(DB::select(
            'select CONSTRAINT_NAME from information_schema.KEY_COLUMN_USAGE
             where TABLE_SCHEMA = ?
             and TABLE_NAME = ?
             and COLUMN_NAME = ?
             and REFERENCED_TABLE_NAME is not null
             limit 1',
            [DB::getDatabaseName(), $tableName, 'user_id']
        ));
    }

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        foreach ($this->tables as $tableName => $afterColumn) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (! Schema::hasColumn($tableName, 'username')) {
                Schema::table($tableName, function (Blueprint $table) use ($afterColumn) {
                    $table->string('username')->default('admin')->after($afterColumn);
                });
            }

            if (Schema::hasColumn($tableName, 'user_id')) {
                DB::table($tableName)
                    ->leftJoin('users', "{$tableName}.user_id", '=', 'users.id')
                    ->whereNotNull("{$tableName}.user_id")
                    ->update([
                        "{$tableName}.username" => DB::raw("COALESCE(users.name, 'admin')"),
                    ]);

                $hasUserIdForeignKey = $this->hasUserIdForeignKey($tableName);

                Schema::table($tableName, function (Blueprint $table) use ($hasUserIdForeignKey) {
                    if ($hasUserIdForeignKey) {
                        $table->dropForeign(["user_id"]);
                    }

                    $table->dropColumn('user_id');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        foreach ($this->tables as $tableName => $afterColumn) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (! Schema::hasColumn($tableName, 'user_id')) {
                Schema::table($tableName, function (Blueprint $table) use ($afterColumn) {
                    $table->foreignId('user_id')->nullable()->after($afterColumn)->constrained('users')->nullOnDelete();
                });
            }

            if (Schema::hasColumn($tableName, 'username')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropColumn('username');
                });
            }
        }
    }
};
