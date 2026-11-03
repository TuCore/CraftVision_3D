using CraftVision.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CraftVision.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261103110000_RandomizeWebVoucherCodes")]
public sealed class RandomizeWebVoucherCodes : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Only managed web vouchers change. Order snapshots and usage references remain intact.
        migrationBuilder.Sql("""
            DO $randomize_codes$
            DECLARE
                voucher_id uuid;
                entropy bytea;
                new_code text;
            BEGIN
                FOR voucher_id IN SELECT id FROM vouchers
                    WHERE customer_limit IS NOT NULL AND code ~ '^MA[0-9]{1,3}%$' FOR UPDATE
                LOOP
                    LOOP
                        entropy := gen_random_bytes(8);
                        SELECT string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
                            (get_byte(entropy, n) & 31) + 1, 1), '' ORDER BY n)
                        INTO new_code FROM generate_series(0, 7) AS n;
                        EXIT WHEN NOT EXISTS (SELECT 1 FROM vouchers WHERE code = new_code);
                    END LOOP;
                    UPDATE vouchers SET code = new_code, revision = revision + 1 WHERE id = voucher_id;
                END LOOP;
            END $randomize_codes$;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Previously distributed codes cannot be reconstructed safely.
    }
}
