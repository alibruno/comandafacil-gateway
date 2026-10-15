# Diagrama de domínio — Microsserviço de Restaurantes

Este contexto é responsável pelo cadastro e pela disponibilidade dos recursos
do restaurante. Ele é o proprietário das mesas e dos produtos. O pedido
consome esses dados por identificadores e contratos, sem acessar diretamente
as entidades internas deste serviço.

```mermaid
classDiagram
    direction LR

    class Restaurante {
        +string id
        +string nome
        +boolean ativo
    }

    class Mesa {
        +string id
        +string nome
        +number capacidade
        +string dataCadastro
        +boolean disponivel
        +ocupar()
        +liberar()
    }

    class Produto {
        +string id
        +string nome
        +string descricao
        +number preco
        +boolean disponivel
    }

    class Categoria {
        +string id
        +string nome
        +boolean ativa
    }

    Restaurante "1" *-- "1..*" Mesa : administra
    Restaurante "1" *-- "0..*" Produto : oferece
    Categoria "1" --> "0..*" Produto : classifica
```
