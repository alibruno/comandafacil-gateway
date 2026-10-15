from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pedidos", "0003_convert_all_ids_to_bigint"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedido",
            name="garcom_nome",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
    ]
