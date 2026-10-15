from django.apps import AppConfig


class PedidosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pedidos"

    def ready(self):
        from importlib import import_module

        import_module("pedidos.authentication")
