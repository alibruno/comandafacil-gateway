# API de Restaurantes

Base da API:

```text
http://localhost:8080/api/restaurantes
```

As rotas de negócio exigem um token JWT emitido pelo gateway. A documentação
continua disponível sem autenticação, mas é necessário clicar em `Authorize` no
Swagger e informar o token JWT para executar as operacoes da API.

## Documentação

```text
Swagger: http://localhost:8080/api/docs
Swagger de restaurantes: http://localhost:8080/api/restaurantes/docs/
Schema: http://localhost:8080/api/restaurantes/schema/
```

Para obter um token, registre um usuário e faça login pela API de autenticação:

```text
POST /api/auth/register
POST /api/auth/login
```

## Restaurantes

| Método | Endpoint |
| --- | --- |
| `GET` | `/api/restaurantes/` |
| `POST` | `/api/restaurantes/` |
| `GET` | `/api/restaurantes/{id}/` |
| `PATCH` | `/api/restaurantes/{id}/` |
| `DELETE` | `/api/restaurantes/{id}/` |

Criar ou atualizar:

```json
{
  "nome": "Restaurante Central",
  "ativo": true
}
```

## Categorias

| Método | Endpoint |
| --- | --- |
| `GET` | `/api/restaurantes/{restauranteId}/categorias/` |
| `POST` | `/api/restaurantes/{restauranteId}/categorias/` |
| `GET` | `/api/restaurantes/{restauranteId}/categorias/{id}/` |
| `PATCH` | `/api/restaurantes/{restauranteId}/categorias/{id}/` |
| `DELETE` | `/api/restaurantes/{restauranteId}/categorias/{id}/` |

Corpo:

```json
{
  "nome": "Hambúrgueres",
  "ativa": true
}
```

## Produtos

| Método | Endpoint |
| --- | --- |
| `GET` | `/api/restaurantes/{restauranteId}/produtos/` |
| `POST` | `/api/restaurantes/{restauranteId}/produtos/` |
| `GET` | `/api/restaurantes/{restauranteId}/produtos/{id}/` |
| `PATCH` | `/api/restaurantes/{restauranteId}/produtos/{id}/` |
| `DELETE` | `/api/restaurantes/{restauranteId}/produtos/{id}/` |

Corpo:

```json
{
  "categoriaId": 1,
  "nome": "Hambúrguer",
  "descricao": "Pão, carne e queijo",
  "preco": 25.5,
  "disponivel": true
}
```

`categoriaId` é opcional. `nome` e `preco` são obrigatórios; o preço deve ser
maior que zero.

## Mesas

| Método | Endpoint |
| --- | --- |
| `GET` | `/api/restaurantes/{restauranteId}/mesas/` |
| `POST` | `/api/restaurantes/{restauranteId}/mesas/` |
| `GET` | `/api/restaurantes/{restauranteId}/mesas/{id}/` |
| `PATCH` | `/api/restaurantes/{restauranteId}/mesas/{id}/` |
| `DELETE` | `/api/restaurantes/{restauranteId}/mesas/{id}/` |

Corpo:

```json
{
  "nome": "Mesa 1",
  "capacidade": 4,
  "disponivel": true
}
```

`nome` é obrigatório e `capacidade` deve ser maior que zero.

## Códigos de resposta

| Código | Significado |
| --- | --- |
| `200` | Operação de consulta ou atualização concluída |
| `201` | Recurso criado |
| `204` | Recurso excluído sem conteúdo de resposta |
| `400` | Dados inválidos ou falha de validação |
| `401` | Token ausente, inválido ou expirado |
| `404` | Restaurante, categoria, produto ou mesa não encontrado |

Erros de validação retornam um objeto com `status` e os campos inválidos:

```json
{
  "timestamp": "2026-10-14T20:00:00Z",
  "status": 400,
  "errors": {
    "nome": "nome é obrigatório"
  }
}
```
