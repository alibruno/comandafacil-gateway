from django.db import migrations


def convert_pedido_id_to_bigint(apps, schema_editor):
    connection = schema_editor.connection
    if connection.vendor != "postgresql":
        return

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND table_name = 'pedido'
              AND column_name = 'id'
            """
        )
        column = cursor.fetchone()
        if column is None or column[0] != "uuid":
            return

        cursor.execute(
            """
            ALTER TABLE pedido
            ADD COLUMN id_new BIGSERIAL
            """
        )
        cursor.execute(
            """
            ALTER TABLE item_pedido
            ADD COLUMN pedido_id_new BIGINT
            """
        )
        cursor.execute(
            """
            UPDATE item_pedido AS item
            SET pedido_id_new = pedido.id_new
            FROM pedido
            WHERE item.pedido_id = pedido.id
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
                  AND confrelid = 'pedido'::regclass
                  AND contype = 'f';
                IF constraint_name IS NOT NULL THEN
                    EXECUTE format(
                        'ALTER TABLE item_pedido DROP CONSTRAINT %I',
                        constraint_name
                    );
                END IF;
            END $$;
            """
        )
        cursor.execute(
            """
            ALTER TABLE item_pedido
            ALTER COLUMN pedido_id_new SET NOT NULL
            """
        )
        cursor.execute(
            """
            ALTER TABLE item_pedido DROP COLUMN pedido_id
            """
        )
        cursor.execute(
            """
            ALTER TABLE item_pedido
            RENAME COLUMN pedido_id_new TO pedido_id
            """
        )
        cursor.execute(
            """
            DO $$
            DECLARE constraint_name text;
            BEGIN
                SELECT conname INTO constraint_name
                FROM pg_constraint
                WHERE conrelid = 'pedido'::regclass
                  AND contype = 'p';
                IF constraint_name IS NOT NULL THEN
                    EXECUTE format(
                        'ALTER TABLE pedido DROP CONSTRAINT %I',
                        constraint_name
                    );
                END IF;
            END $$;
            """
        )
        cursor.execute(
            """
            ALTER TABLE pedido DROP COLUMN id
            """
        )
        cursor.execute(
            """
            ALTER TABLE pedido
            RENAME COLUMN id_new TO id
            """
        )
        cursor.execute(
            """
            ALTER TABLE pedido
            ADD CONSTRAINT pedido_pkey PRIMARY KEY (id)
            """
        )
        cursor.execute(
            """
            ALTER TABLE item_pedido
            ADD CONSTRAINT item_pedido_pedido_id_fk
            FOREIGN KEY (pedido_id) REFERENCES pedido (id)
            DEFERRABLE INITIALLY DEFERRED
            """
        )


class Migration(migrations.Migration):

    dependencies = [
        ("pedidos", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            convert_pedido_id_to_bigint,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
