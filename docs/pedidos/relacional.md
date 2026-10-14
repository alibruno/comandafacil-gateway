# Diagrama relacional — Microsserviço de Pedidos

O esquema mantém o preço e o nome do produto no item como snapshot. Dessa
forma, alterações futuras no catálogo não modificam o histórico financeiro de
um pedido. Todos os identificadores são `bigint`; `mesa_id`, `garcom_id` e
`produto_id` são referências externas e não recebem foreign keys para outro
banco.

```mermaid
erDiagram
    PEDIDO {
        bigint id PK
        bigint mesa_id
        bigint garcom_id
        varchar status
        text notas
        numeric total
        timestamptz aberto_em
        timestamptz finalizado_em
    }

    ITEM_PEDIDO {
        bigint id PK
        bigint pedido_id FK
        bigint produto_id
        varchar nome_produto
        numeric preco_unitario
        integer quantidade
        text observacao
    }

    PEDIDO ||--|{ ITEM_PEDIDO : possui
