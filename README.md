# ComandaFacil

## Autenticação e execução local

O gateway é o ponto de entrada da aplicação. Crie o segredo compartilhado pelos
serviços antes de iniciar o Compose:

```sh
cp .env.example .env
openssl rand -hex 32
```

Substitua `JWT_SECRET` no arquivo `.env` pelo valor gerado e defina também
`DATABASE_PASSWORD` para uma senha aleatória forte:

```sh
openssl rand -hex 32
docker compose up -d --build
cd web && pnpm start
```

Abra `http://localhost:5173`. O frontend encaminha as chamadas de API ao
gateway em `http://localhost:8080`. Usuários podem criar uma conta com nome,
e-mail e senha; as senhas são armazenadas com BCrypt. O cadastro e o login
retornam um token JWT válido por oito horas. As rotas privadas do frontend,
gateway e microsserviços exigem esse token. As APIs ficam publicadas nas portas
`8080`, `8081` e `8082` para desenvolvimento, mas rejeitam chamadas sem token.
A porta do banco exige a senha definida em `.env`; não a encaminhe pelo Codespaces.

No primeiro acesso ao painel, cadastre o restaurante para habilitar o salão e o
cardápio. Mesas, categorias, produtos e pedidos são carregados e salvos pelas
APIs autenticadas através do gateway; não são mantidos apenas no navegador.
O gateway encaminha as chamadas às portas publicadas dos microsserviços; o
serviço de pedidos usa Gunicorn para aceitar corretamente as requisições
encaminhadas pelo gateway.

O segredo JWT deve permanecer privado, ter pelo menos 32 bytes e ser o mesmo
para gateway e microsserviços. Não use o valor de exemplo em produção.