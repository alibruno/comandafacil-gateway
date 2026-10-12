# Diagrama de domínio — Microsserviço de Pedidos

Este contexto controla o ciclo de vida da comanda e seus itens. `mesaId`,
`produtoId` e `garcomId` são referências externas: a identidade e os dados
completos desses recursos pertencem a outros contextos.

```mermaid
classDiagram
    direction LR

    class Pedido {
        +string id
        +string mesaId
        +string garcomId
        +string notas
        +number total
        +OrderStatus status
        +string abertoEm
        +adicionarItem(item)
        +calcularTotal()
        +alterarStatus(status)
    }

    class ItemPedido {
        +string id
        +string produtoId
        +string nomeProduto
        +number precoUnitario
        +number quantidade
        +string observacao
        +calcularSubtotal()
    }

    class Garcom {
        +string id
        +string nome
    }

    class Mesa {
        <<external>>
        +string id
    }

    class Produto {
        <<external>>
        +string id
    }

    class OrderStatus {
        <<enumeration>>
        cozinha
        preparo
        pronto
        finalizado
    }

    Pedido "1" *-- "1..*" ItemPedido : contém
    Pedido "0..*" --> "1" Garcom : atendido por
    Pedido --> OrderStatus : possui
    ItemPedido ..> Produto : produtoId
    Pedido ..> Mesa : mesaId
