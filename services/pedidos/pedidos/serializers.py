from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import ItemPedido, Pedido

MAX_LONG = 9223372036854775807


class ItemPedidoSerializer(serializers.ModelSerializer):
    produtoId = serializers.IntegerField(
        source="produto_id", min_value=1, max_value=MAX_LONG
    )
    nomeProduto = serializers.CharField(source="nome_produto", max_length=255)
    precoUnitario = serializers.DecimalField(
        source="preco_unitario", max_digits=10, decimal_places=2, min_value=Decimal("0.01")
    )
    observacao = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ItemPedido
        fields = ("id", "produtoId", "nomeProduto", "precoUnitario", "quantidade", "observacao")
        read_only_fields = ("id",)

    def validate_quantidade(self, quantidade):
        if quantidade < 1:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return quantidade


class PedidoSerializer(serializers.ModelSerializer):
    MAX_TOTAL = Decimal("9999999999.99")

    mesaId = serializers.IntegerField(
        source="mesa_id", min_value=1, max_value=MAX_LONG
    )
    garcomId = serializers.IntegerField(
        source="garcom_id",
        min_value=1,
        max_value=MAX_LONG,
        required=False,
        allow_null=True,
    )
    itens = ItemPedidoSerializer(many=True)
    abertoEm = serializers.DateTimeField(source="aberto_em", read_only=True)
    finalizadoEm = serializers.DateTimeField(source="finalizado_em", read_only=True)

    class Meta:
        model = Pedido
        fields = (
            "id",
            "mesaId",
            "garcomId",
            "status",
            "notas",
            "total",
            "abertoEm",
            "finalizadoEm",
            "itens",
        )
        read_only_fields = ("id", "total", "abertoEm", "finalizadoEm")

    def validate_itens(self, itens):
        if not itens:
            raise serializers.ValidationError("O pedido deve conter pelo menos um item.")
        total = sum(
            (item["preco_unitario"] * item["quantidade"] for item in itens),
            start=Decimal("0.00"),
        )
        if total > self.MAX_TOTAL:
            raise serializers.ValidationError("O total excede o limite permitido.")
        return itens

    @staticmethod
    def _recalcular_total(pedido):
        pedido.total = sum(
            (item.preco_unitario * item.quantidade for item in pedido.itens.all()),
            start=Decimal("0.00"),
        )
        pedido.save(update_fields=("total",))

    @transaction.atomic
    def create(self, validated_data):
        itens = validated_data.pop("itens")
        if validated_data.get("status") == Pedido.Status.FINALIZADO:
            validated_data["finalizado_em"] = timezone.now()
        pedido = Pedido.objects.create(**validated_data)
        ItemPedido.objects.bulk_create(
            [ItemPedido(pedido=pedido, **item) for item in itens]
        )
        self._recalcular_total(pedido)
        return pedido

    @transaction.atomic
    def update(self, instance, validated_data):
        itens = validated_data.pop("itens", None)
        novo_status = validated_data.get("status", instance.status)
        if novo_status != instance.status:
            validated_data["finalizado_em"] = (
                timezone.now() if novo_status == Pedido.Status.FINALIZADO else None
            )
        pedido = super().update(instance, validated_data)
        if itens is not None:
            pedido.itens.all().delete()
            ItemPedido.objects.bulk_create(
                [ItemPedido(pedido=pedido, **item) for item in itens]
            )
            self._recalcular_total(pedido)
        return pedido
