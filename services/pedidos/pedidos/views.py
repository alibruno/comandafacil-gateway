from rest_framework import generics, serializers

from .models import Pedido
from .serializers import PedidoSerializer


class PedidoListCreateView(generics.ListCreateAPIView):
    serializer_class = PedidoSerializer

    def get_queryset(self):
        queryset = Pedido.objects.prefetch_related("itens")
        status = self.request.query_params.get("status")
        if status:
            if status not in Pedido.Status.values:
                raise serializers.ValidationError({"status": "Status inválido."})
            queryset = queryset.filter(status=status)
        return queryset


class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.prefetch_related("itens")
    serializer_class = PedidoSerializer
