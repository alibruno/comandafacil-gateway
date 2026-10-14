from django.db import migrations, models


def _postgres_column_type(cursor, table, column):
    cursor.execute(
        """
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = %s
          AND column_name = %s
        """,
        [table, column],
    )
    result = cursor.fetchone()
    return result[0] if result else None


def convert_legacy_ids(apps, schema_editor):
    connection = schema_editor.connection
    if connection.vendor == "sqlite":
        with connection.cursor() as cursor:
            cursor.execute("PRAGMA table_info(pedido)")
            pedido_columns = {row[1]: row[2].upper() for row in cursor.fetchall()}
            cursor.execute("PRAGMA table_info(item_pedido)")
            item_columns = {row[1]: row[2].upper() for row in cursor.fetchall()}
        expected_integer_types = {"INTEGER", "BIGINT", "BIGINT UNSIGNED"}
        if any(
            column_type not in expected_integer_types
            for column_type in (
                pedido_columns.get("id"),
                pedido_columns.get("mesa_id"),
                pedido_columns.get("garcom_id"),
                item_columns.get("id"),
                item_columns.get("produto_id"),
            )
        ):
            raise RuntimeError(
                "A conversao de IDs UUID legados requer PostgreSQL. "
                "Migre o banco SQLite para PostgreSQL antes desta migration."
            )
        return
    if connection.vendor != "postgresql":
        raise RuntimeError(
            f"Conversao de IDs nao suportada para {connection.vendor}."
        )

    with connection.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS pedido_legacy_id_map (
                resource_type varchar(32) NOT NULL,
                legacy_id uuid NOT NULL,
                new_id bigint NOT NULL,
                PRIMARY KEY (resource_type, legacy_id),
                UNIQUE (resource_type, new_id)
            )
            """
        )
        cursor.execute(
            """
            CREATE SEQUENCE IF NOT EXISTS pedido_legacy_id_map_new_id_seq
            """
        )

        for resource_type, table, column in (
            ("mesa", "pedido", "mesa_id"),
            ("garcom", "pedido", "garcom_id"),
            ("produto", "item_pedido", "produto_id"),
        ):
            if _postgres_column_type(cursor, table, column) != "uuid":
                continue
            cursor.execute(
                f"""
                INSERT INTO pedido_legacy_id_map (resource_type, legacy_id, new_id)
                SELECT %s, legacy_ids.id, nextval('pedido_legacy_id_map_new_id_seq')
                FROM (
                    SELECT DISTINCT {column} AS id
                    FROM {table}
                    WHERE {column} IS NOT NULL
                ) AS legacy_ids
                ON CONFLICT (resource_type, legacy_id) DO NOTHING
                """,
                [resource_type],
            )
            new_column = f"{column}_new"
            cursor.execute(
                f"ALTER TABLE {table} ADD COLUMN {new_column} bigint"
            )
            cursor.execute(
                f"""
                UPDATE {table} AS resource
                SET {new_column} = mapping.new_id
                FROM pedido_legacy_id_map AS mapping
                WHERE mapping.resource_type = %s
                  AND resource.{column} = mapping.legacy_id
                """,
                [resource_type],
            )
            cursor.execute(
                f"ALTER TABLE {table} DROP COLUMN {column}"
            )
            cursor.execute(
                f"ALTER TABLE {table} RENAME COLUMN {new_column} TO {column}"
            )
            if not (table == "pedido" and column == "garcom_id"):
                cursor.execute(
                    f"ALTER TABLE {table} ALTER COLUMN {column} SET NOT NULL"
                )

        if _postgres_column_type(cursor, "item_pedido", "id") == "uuid":
            cursor.execute(
                """
                ALTER TABLE item_pedido
                ADD COLUMN id_new BIGSERIAL
                """
            )
            cursor.execute(
                """
                INSERT INTO pedido_legacy_id_map
                    (resource_type, legacy_id, new_id)
                SELECT 'item', id, id_new
                FROM item_pedido
                ON CONFLICT (resource_type, legacy_id) DO NOTHING
                """
            )
            cursor.execute(
                """
                DO $$
                DECLARE constraint_name text;
                BEGIN
                    SELECT conname INTO constraint_name
                    FROM pg_constraint
                    WHERE conrelid = 'item_pedido'::regclass
                      AND contype = 'p';
                    IF constraint_name IS NOT NULL THEN
                        EXECUTE format(
                            'ALTER TABLE item_pedido DROP CONSTRAINT %I',
                            constraint_name
                        );
                    END IF;
                END $$;
                """
            )
            cursor.execute("ALTER TABLE item_pedido DROP COLUMN id")
            cursor.execute(
                "ALTER TABLE item_pedido RENAME COLUMN id_new TO id"
            )
            cursor.execute(
                """
                ALTER TABLE item_pedido
                ADD CONSTRAINT item_pedido_pkey PRIMARY KEY (id)
                """
            )


class Migration(migrations.Migration):

    dependencies = [
        ("pedidos", "0002_convert_pedido_id_to_bigint"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    convert_legacy_ids,
                ),
            ],
            state_operations=[
                migrations.AlterField(
                    model_name="pedido",
                    name="mesa_id",
                    field=models.BigIntegerField(),
                ),
                migrations.AlterField(
                    model_name="pedido",
                    name="garcom_id",
                    field=models.BigIntegerField(blank=True, null=True),
                ),
                migrations.AlterField(
                    model_name="itempedido",
                    name="id",
                    field=models.BigAutoField(
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                migrations.AlterField(
                    model_name="itempedido",
                    name="produto_id",
                    field=models.BigIntegerField(),
                ),
            ],
        ),
    ]
