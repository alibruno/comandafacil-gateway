# API — Microsserviço de Pedidos

O serviço expõe JSON em `http://localhost:8082/api/` e Swagger UI em
`http://localhost:8082/api/docs/` (especificação OpenAPI em
`http://localhost:8082/api/schema/`). Na raiz do repositório, inicie-o em
segundo plano com:

```sh
docker compose up -d --build pedidos
docker compose ps
docker compose logs -f pedidos
```

O primeiro comando também inicia o PostgreSQL e aplica as migrações. Quando os
logs mostrarem `Starting development server`, abra
`http://localhost:8082/api/docs/`. No GitHub Codespaces, encaminhe a porta
`8082` pela aba **Ports** do VS Code e use **Open in Browser**; o endereço
encaminhado termina em `-8082.app.github.dev/api/docs/`. Se não abrir, confira
`docker compose ps` e os logs com `docker compose logs --tail=100 pedidos`.

Para desenvolvimento local, instale `services/pedidos/requirements.txt` e
execute `python manage.py migrate` e `python manage.py runserver` dentro de
`services/pedidos`. Sem configuração de banco, o serviço usa SQLite.

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
`produtoId` e os IDs de pedido/item são numéricos longos (`long`/`bigint`)
positivos. Um pedido deve ter ao menos um item.
`garcomId`, `notas` e a observação do item são opcionais. O preço do item é
persistido como snapshot e o `total` é calculado pelo serviço, nunca aceito do
cliente. `id` é um identificador numérico longo (`long`), e `total`, `abertoEm` e
`finalizadoEm` são gerados pelo serviço. Ao mudar o status para `finalizado`,
`finalizadoEm` é preenchido; ao reabrir para outro status, ele é limpo.

Erros de validação retornam `400`, recursos inexistentes retornam `404` e uma
criação bem-sucedida retorna `201`.
