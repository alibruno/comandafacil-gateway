# API — Microsserviço de Pedidos

O gateway encaminha a API em `http://localhost:8080/api/` e o Swagger UI em
`http://localhost:8080/api/docs/` (especificação OpenAPI em
`http://localhost:8080/api/schema/`). O endpoint `/api/pedidos/` exige o token
JWT recebido no cadastro ou login como `Authorization: Bearer <token>`. As
portas dos microsserviços não são expostas diretamente. Na raiz do repositório,
configure `JWT_SECRET` em `.env` e inicie a aplicação com:

```sh
docker compose up -d --build
docker compose ps
docker compose logs -f gateway pedidos
```

O Compose também inicia PostgreSQL e aplica as migrações. Para usar o frontend,
inicie-o em `web` com `pnpm start`; no Codespaces, encaminhe as portas `5173`
(frontend) e `8080` (gateway).

O Swagger e o schema também são protegidos. Para testar endpoints no Swagger,
use **Authorize** e informe `Bearer <token>` obtido em `POST /api/auth/login`
ou `POST /api/auth/register`.

## Endpoints

| Método | Caminho | Ação |
| --- | --- | --- |
| `GET` | `/api/pedidos/` | Lista pedidos; aceita `?status=cozinha`, `preparo`, `pronto` ou `finalizado` |
| `POST` | `/api/pedidos/` | Cria um pedido |
| `GET` | `/api/pedidos/{id}/` | Busca um pedido e seus itens |
| `PUT` / `PATCH` | `/api/pedidos/{id}/` | Atualiza o pedido; se `itens` for informado, substitui a lista inteira |
| `DELETE` | `/api/pedidos/{id}/` | Exclui o pedido e seus itens |

Exemplo de criação:

```json
{
  "mesaId": 12,
  "garcomId": 34,
  "notas": "Sem cebola",
  "itens": [
    {
      "produtoId": 56,
      "nomeProduto": "Hambúrguer",
      "precoUnitario": "25.50",
      "quantidade": 2,
      "observacao": "Bem passado"
    }
  ]
}
```

`mesaId` e `itens` são obrigatórios; os identificadores `mesaId`, `garcomId`,
`produtoId`, `id` e `pedidoId` são longs positivos.
`garcomId`, `notas` e a observação do item são opcionais. O preço do item é
persistido como snapshot e o `total` é calculado pelo serviço, nunca aceito do
cliente. `id`, `total`, `abertoEm` e `finalizadoEm` são gerados pelo serviço.
Ao mudar o status para `finalizado`, `finalizadoEm` é preenchido; ao reabrir
para outro status, ele é limpo.

Erros de validação retornam `400`, recursos inexistentes retornam `404` e uma
criação bem-sucedida retorna `201`.
