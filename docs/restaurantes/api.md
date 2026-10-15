# API de Restaurantes

Base: `http://localhost:8080/api/restaurantes/`

As rotas exigem um token JWT:

```text
Authorization: Bearer TOKEN_JWT
```

Obtenha o token em `POST /api/auth/register` ou `POST /api/auth/login`.

Documentação:

- Swagger geral: `http://localhost:8080/api/docs/`
- Swagger de Restaurantes: `http://localhost:8080/api/restaurantes/docs/`
- Schema OpenAPI: `http://localhost:8080/api/restaurantes/schema/`

## Restaurantes

| Método | Endpoint |
| --- | --- |
| `GET` | `/api/restaurantes/` |
| `POST` | `/api/restaurantes/` |
| `GET` | `/api/restaurantes/{id}/` |
| `PATCH` | `/api/restaurantes/{id}/` |
| `DELETE` | `/api/restaurantes/{id}/` |

```json
{
  "nome": "Restaurante Central",
  "ativo": true
}
```

## Categorias

| Método | Endpoint |
| --- | --- |
| `GET` / `POST` | `/api/restaurantes/{restauranteId}/categorias/` |
| `GET` / `PATCH` / `DELETE` | `/api/restaurantes/{restauranteId}/categorias/{id}/` |

```json
{
  "nome": "Hambúrgueres",
  "ativa": true
}
```

## Produtos

| Método | Endpoint |
| --- | --- |
| `GET` / `POST` | `/api/restaurantes/{restauranteId}/produtos/` |
| `GET` / `PATCH` / `DELETE` | `/api/restaurantes/{restauranteId}/produtos/{id}/` |

```json
{
  "categoriaId": 1,
  "nome": "Hambúrguer",
  "descricao": "Pão, carne e queijo",
  "preco": 25.5,
  "disponivel": true
}
```

`nome` e `preco` são obrigatórios. `categoriaId` é opcional e `preco` deve ser
maior que zero.

## Mesas

| Método | Endpoint |
| --- | --- |
| `GET` / `POST` | `/api/restaurantes/{restauranteId}/mesas/` |
| `GET` / `PATCH` / `DELETE` | `/api/restaurantes/{restauranteId}/mesas/{id}/` |

```json
{
  "nome": "Mesa 1",
  "capacidade": 4,
  "disponivel": true
}
```

`nome` é obrigatório e `capacidade` deve ser maior que zero.

## Respostas

| Código | Significado |
| --- | --- |
| `200` | Consulta ou atualização concluída |
| `201` | Recurso criado |
| `204` | Recurso excluído |
| `400` | Dados inválidos |
| `401` | Token ausente ou inválido |
| `404` | Recurso não encontrado |
