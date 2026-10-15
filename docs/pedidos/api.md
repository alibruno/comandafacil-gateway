# API de Pedidos

Base: `http://localhost:8080/api/pedidos/`

As rotas exigem um token JWT no cabeçalho:

```text
Authorization: Bearer TOKEN_JWT
```

Documentação:

- Swagger geral: `http://localhost:8080/api/docs/`
- Swagger de Pedidos: `http://localhost:8080/api/pedidos/docs/`
- Schema OpenAPI: `http://localhost:8080/api/pedidos/schema/`

## Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/pedidos/` | Lista pedidos; aceita `?status=cozinha`, `preparo`, `pronto` ou `finalizado` |
| `POST` | `/api/pedidos/` | Cria pedido |
| `GET` | `/api/pedidos/{id}/` | Consulta pedido |
| `PUT` / `PATCH` | `/api/pedidos/{id}/` | Atualiza pedido |
| `DELETE` | `/api/pedidos/{id}/` | Exclui pedido |

### Criar pedido

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

`mesaId` e `itens` são obrigatórios. O pedido deve ter pelo menos um item.
`garcomId`, `notas` e `observacao` são opcionais. O serviço calcula `total`,
`abertoEm` e `finalizadoEm`; o total enviado pelo cliente é ignorado.

Ao informar `itens` em uma atualização, a lista inteira é substituída.

## Respostas

| Código | Significado |
| --- | --- |
| `200` | Consulta ou atualização concluída |
| `201` | Pedido criado |
| `204` | Pedido excluído |
| `400` | Dados inválidos |
| `401` | Token ausente ou inválido |
| `404` | Pedido não encontrado |
