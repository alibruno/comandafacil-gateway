from django.urls import include, path
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


urlpatterns = [
    path("", RedirectView.as_view(url="/api/pedidos/docs/", permanent=False), name="home"),
    path("api/pedidos/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/pedidos/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/", include("pedidos.urls")),
]
