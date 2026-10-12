# Diagrama relacional — Microsserviço de Pedidos

O esquema mantém o preço e o nome do produto no item como snapshot. Dessa
forma, alterações futuras no catálogo não modificam o histórico financeiro de
um pedido. `mesa_id`, `garcom_id` e `produto_id` são identificadores de
recursos externos e não recebem foreign keys para outro banco.

```mermaid
erDiagram
    PEDIDO {
        uuid id PK
        uuid mesa_id
        uuid garcom_id
        varchar status
        text notas
        numeric total
        timestamptz aberto_em
        timestamptz finalizado_em
    }

    ITEM_PEDIDO {
        uuid id PK
        uuid pedido_id FK
        uuid produto_id
        varchar nome_produto
        numeric preco_unitario
        integer quantidade
        text observacao
    }

    PEDIDO ||--|{ ITEM_PEDIDO : possui
