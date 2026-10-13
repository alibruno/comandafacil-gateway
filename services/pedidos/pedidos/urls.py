from django.urls import path

from .views import PedidoDetailView, PedidoListCreateView


urlpatterns = [
    path("pedidos/", PedidoListCreateView.as_view(), name="pedido-list"),
    path("pedidos/<uuid:pk>/", PedidoDetailView.as_view(), name="pedido-detail"),
]
