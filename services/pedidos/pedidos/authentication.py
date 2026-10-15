import jwt
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class GatewayUser:
    is_authenticated = True
    is_anonymous = False

    def __init__(self, email, name):
        self.email = email
        self.name = name
        self.username = email

    def __str__(self):
        return self.email


class GatewayJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        parts = get_authorization_header(request).split()
        if not parts:
            return None
        if parts[0].lower() != b"bearer" or len(parts) != 2:
            raise AuthenticationFailed("Use o esquema Bearer com um token válido.")

        from django.conf import settings

        if not settings.JWT_SECRET:
            raise AuthenticationFailed("Autenticação JWT não está configurada.")
        try:
            claims = jwt.decode(
                parts[1],
                settings.JWT_SECRET,
                algorithms=["HS256"],
                issuer="comandafacil-gateway",
                audience="comandafacil-api",
            )
        except jwt.InvalidTokenError as error:
            raise AuthenticationFailed("Token inválido ou expirado.") from error

        email = claims.get("sub")
        name = claims.get("name")
        if not isinstance(email, str) or not isinstance(name, str):
            raise AuthenticationFailed("Token não contém os dados necessários do usuário.")
        return GatewayUser(email=email, name=name), claims

    def authenticate_header(self, request):
        return "Bearer"


class GatewayBearerScheme(OpenApiAuthenticationExtension):
    target_class = "pedidos.authentication.GatewayJWTAuthentication"
    name = "BearerAuth"

    def get_security_definition(self, auto_schema):
        return {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"}
