# ComandaFácil

## Executar com Docker

Com Docker e Docker Compose instalados, na raiz do projeto execute:

```bash
docker compose up --build
```

A interface roda pelo servidor de desenvolvimento do Angular (Vite) em
`http://localhost:4200`, e a API fica em `http://localhost:8080`. Para parar
os serviços, use `Ctrl+C` e depois `docker compose down`. O banco H2 é mantido
em memória; os dados são apagados quando o backend é reiniciado.

## Backend

O backend usa Java 25, Spring Boot, Spring Data JPA, Spring Security, JWT e H2.
Na raiz do repositório, inicie a API com:

```bash
./backend/mvnw -f backend/pom.xml spring-boot:run
```

A API fica disponível em `http://localhost:8080`. O H2 roda em memória durante
a execução e pode ser acessado em `http://localhost:8080/h2-console` usando:

- JDBC URL: `jdbc:h2:mem:comandafacil`
- Usuário: `sa`
- Senha: em branco

As rotas de mesas e pedidos exigem o token JWT no cabeçalho
`Authorization: Bearer <token>`. Cadastre-se ou faça login para obter um token:

| Método | Rota | Ação |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Cadastrar usuário |
| `POST` | `/api/auth/login` | Fazer login |
| `GET` | `/api/mesas` | Listar mesas |
| `GET` | `/api/mesas/{id}` | Consultar mesa |
| `POST` | `/api/mesas` | Criar mesa |
| `PUT` | `/api/mesas/{id}` | Atualizar mesa |
| `DELETE` | `/api/mesas/{id}` | Remover mesa |
| `GET` | `/api/pedidos` | Listar pedidos |
| `GET` | `/api/pedidos/{id}` | Consultar pedido (`PED-0001`) |
| `POST` | `/api/pedidos` | Criar pedido |
| `PUT` | `/api/pedidos/{id}` | Atualizar pedido |
| `DELETE` | `/api/pedidos/{id}` | Remover pedido |

Cadastro/login recebem `{ "name": "Nome", "email": "email@exemplo.com", "password": "senha123" }`
(no login, somente `email` e `password`) e retornam `token`, `email` e `name`.
O cadastro exige senha com pelo menos oito caracteres.

Exemplo de mesa:

```json
{
  "nome": "Mesa 01",
  "capacidade": 4,
  "dataCadastro": "2026-09-12",
  "disponivel": true
}
```

Exemplo de pedido:

```json
{
  "table": "Mesa 01",
  "waiter": "Jean-Pierre",
  "items": [
    {
      "id": "item-1",
      "name": "Prato do dia",
      "detail": "R$ 25,00 un.",
      "unitPrice": 25,
      "quantity": 2,
      "note": ""
    }
  ],
  "notes": "",
  "status": "cozinha"
}
```

Antes de criar um pedido, cadastre uma mesa em `/api/mesas` e use o mesmo nome
em `table`. O total do pedido é calculado pela API a partir dos itens. Os
estados aceitos são `cozinha`, `preparo`, `pronto` e `finalizado`. Para
desenvolvimento, a chave JWT pode ser substituída pela variável de ambiente
`JWT_SECRET`.

## Frontend

Inicie o backend em um terminal e, em outro, execute:

```bash
pnpm --dir web start
```

O Angular fica disponível em `http://localhost:4200`. Crie uma conta pela tela
inicial para receber o token e acessar mesas e pedidos. Os dados H2 são
reiniciados quando o backend é encerrado. Mais detalhes do Angular em
[web/README.md](./web/README.md).
