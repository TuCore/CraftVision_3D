using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Infrastructure.Internal;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using Npgsql.EntityFrameworkCore.PostgreSQL.Migrations;

namespace CraftVision.Infrastructure.Data;

// Preserve historical migration files while tolerating the duplicate operations in
// AddMobileCommerceApis. AddCartAndWishlist already owns the cart schema and its data.
#pragma warning disable EF1001
public sealed class CompatibleMigrationsSqlGenerator(
    MigrationsSqlGeneratorDependencies dependencies,
    INpgsqlSingletonOptions options) : NpgsqlMigrationsSqlGenerator(dependencies, options)
{
    private bool _legacyCartDeclaration;
    private readonly bool _requiresNonTransactionalEnum = options.PostgresVersion.Major < 12;

    public override IReadOnlyList<MigrationCommand> Generate(IReadOnlyList<MigrationOperation> operations,
        IModel? model = null, MigrationsSqlGenerationOptions options = MigrationsSqlGenerationOptions.Default)
    {
        _legacyCartDeclaration = operations.OfType<CreateTableOperation>().Any(t => t.Name == "cart_items" &&
            t.Schema is null && t.Columns.Any(c => c.Name == "user_id") && !t.Columns.Any(c => c.Name == "cart_id"));
        try { return base.Generate(operations, model, options); }
        finally { _legacyCartDeclaration = false; }
    }

    protected override void GenerateAddEnumLabel(PostgresEnum enumType, string addedLabel,
        string? beforeLabel, string? afterLabel, IModel? model, MigrationCommandListBuilder builder)
    {
        if (enumType.Name != "payment_method_enum" || addedLabel != "BankTransfer")
        {
            base.GenerateAddEnumLabel(enumType, addedLabel, beforeLabel, afterLabel, model, builder);
            return;
        }
        if (beforeLabel is not null && afterLabel is not null)
            throw new ArgumentException("Only one enum label position may be specified.");
        var strings = Dependencies.TypeMappingSource.GetMapping(typeof(string));
        builder.Append("ALTER TYPE ")
            .Append(Dependencies.SqlGenerationHelper.DelimitIdentifier(enumType.Name, enumType.Schema ?? model?.GetDefaultSchema()))
            .Append(" ADD VALUE IF NOT EXISTS ").Append(strings.GenerateSqlLiteral(addedLabel));
        if (beforeLabel is not null) builder.Append(" BEFORE ").Append(strings.GenerateSqlLiteral(beforeLabel));
        if (afterLabel is not null) builder.Append(" AFTER ").Append(strings.GenerateSqlLiteral(afterLabel));
        builder.AppendLine(";");
        if (_requiresNonTransactionalEnum) EndStatement(builder, suppressTransaction: true);
    }

    protected override void Generate(CreateTableOperation operation, IModel? model,
        MigrationCommandListBuilder builder, bool terminate = true)
    {
        if (operation.Name == "cart_items" && operation.Schema is null &&
            operation.Columns.Any(c => c.Name == "user_id") && !operation.Columns.Any(c => c.Name == "cart_id"))
        {
            // Fail on an unexpected schema rather than silently marking it as migrated.
            builder.AppendLine("""
                DO $cart_compat$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_attribute
                        WHERE attrelid = to_regclass('cart_items') AND attname = 'cart_id'
                          AND atttypid = 'uuid'::regtype AND attnotnull AND NOT attisdropped
                    ) THEN
                        RAISE EXCEPTION 'Expected cart_items.cart_id from AddCartAndWishlist; inspect the database migration history.';
                    END IF;
                END $cart_compat$;
                """);
            EndStatement(builder);
            return;
        }
        base.Generate(operation, model, builder, terminate);
    }

    protected override void Generate(CreateIndexOperation operation, IModel? model,
        MigrationCommandListBuilder builder, bool terminate = true)
    {
        // These exact indexes belong to the duplicate legacy table declaration.
        // The product index and unique (cart_id, product_id) index already exist.
        if (_legacyCartDeclaration && operation.Table == "cart_items" && operation.Schema is null &&
            ((operation.Name == "ix_cart_items_product_id" && operation.Columns.SequenceEqual(["product_id"])) ||
             (operation.Name == "ix_cart_items_user_id_product_id" && operation.IsUnique &&
              operation.Columns.SequenceEqual(["user_id", "product_id"]))))
            return;
        base.Generate(operation, model, builder, terminate);
    }
}
#pragma warning restore EF1001
