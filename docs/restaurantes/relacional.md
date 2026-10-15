# Diagrama relacional — Microsserviço de Restaurantes

O banco do microsserviço de Restaurantes contém somente dados sob sua
responsabilidade. `PEDIDO` não aparece neste esquema; o microsserviço de
Pedidos mantém apenas o `mesa_id` e consulta a disponibilidade por API quando
necessário.

```mermaid
erDiagram
    RESTAURANTE {
        uuid id PK
        varchar nome
        boolean ativo
    }

    MESA {
        uuid id PK
        uuid restaurante_id FK
        varchar nome
        smallint capacidade
        date data_cadastro
        boolean disponivel
    }

    CATEGORIA {
        uuid id PK
        uuid restaurante_id FK
        varchar nome
        boolean ativa
    }

    PRODUTO {
        uuid id PK
        uuid restaurante_id FK
        uuid categoria_id FK
        varchar nome
        text descricao
        numeric preco
        boolean disponivel
    }

    RESTAURANTE ||--|{ MESA : possui
    RESTAURANTE ||--o{ CATEGORIA : organiza
    RESTAURANTE ||--o{ PRODUTO : oferece
    CATEGORIA o|--o{ PRODUTO : classifica
```
