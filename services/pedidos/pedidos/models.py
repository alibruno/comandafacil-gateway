from django.db import models


class Pedido(models.Model):
    class Status(models.TextChoices):
        COZINHA = "cozinha", "Na cozinha"
        PREPARO = "preparo", "Em preparo"
        PRONTO = "pronto", "Pronto para servir"
        FINALIZADO = "finalizado", "Finalizado"

    id = models.BigAutoField(primary_key=True)
    mesa_id = models.BigIntegerField()
    garcom_id = models.BigIntegerField(null=True, blank=True)
    garcom_nome = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.COZINHA)
    notas = models.TextField(blank=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    aberto_em = models.DateTimeField(auto_now_add=True)
    finalizado_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "pedido"
        ordering = ["-aberto_em"]


class ItemPedido(models.Model):
    id = models.BigAutoField(primary_key=True)
    pedido = models.ForeignKey(Pedido, related_name="itens", on_delete=models.CASCADE)
    produto_id = models.BigIntegerField()
    nome_produto = models.CharField(max_length=255)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade = models.PositiveIntegerField()
    observacao = models.TextField(blank=True)

    class Meta:
        db_table = "item_pedido"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(preco_unitario__gt=0),
                name="item_pedido_preco_positivo",
            ),
            models.CheckConstraint(
                condition=models.Q(quantidade__gte=1),
                name="item_pedido_quantidade_positiva",
            ),
        ]
