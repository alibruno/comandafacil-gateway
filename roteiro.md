## Roteiro breve para apresentação

Uma apresentação de aproximadamente 5 minutos pode seguir esta ordem:

1. **Apresentar a aplicação:** “Este é o ComandaFácil, feito em Angular 22 para
   gerenciar mesas e pedidos de um restaurante. Usei OptimusUI e Tailwind para
   montar a interface. Vou mostrar como as telas se organizam e conversam com a API.”
2. **Mostrar as telas e os componentes:** faça login e navegue entre Restaurante
   e Pedidos. Explique que cada tela é um componente e que componentes menores,
   como a tabela e o resumo de mesas, cuidam de partes específicas. Mostre a
   mesa e seus quatro dados: nome, capacidade, data de cadastro e disponibilidade.
3. **Demonstrar a comunicação entre componentes:** em Restaurante, abra
   `restaurant-management.html`. Explique que o componente de Restaurante é o
   **pai** e a tabela é um componente **filho**. O pai envia a lista de mesas
   para o filho com `[mesas]="mesas()"`; no filho, `input.required<Mesa[]>()`
   declara que essa lista será recebida. Como `input()` é um signal, o filho lê
   o valor chamando `mesas()`.

   Depois, mostre o caminho de volta: ao clicar em Editar, o filho executa
   `edit.emit(mesa)`. No template do pai, `(edit)="openEditModal($event)`
   recebe o evento; `$event` é a mesa que o filho enviou. O pai então abre o
   formulário para aquela mesa. Resuma assim: **input é a informação que entra
   no filho; output é o aviso que sai do filho para o pai**. Aqui, `input()`
   é um recurso Angular, não o campo de texto `input` do HTML.
4. **Mostrar o formulário Signal Forms:** abra o formulário de cadastro/edição
   de mesa. Explique que `form()` liga os dados do formulário a signals, `schema()`
   define validações e `[formField]` conecta cada campo da tela ao formulário.
5. **Explicar o service e a API:** em `restaurant-data.service.ts`, mostre como
   `HttpClient` lista, cria, atualiza e remove dados. O service guarda os dados
   em signals para que as telas possam compartilhá-los.
6. **Mostrar rotas e autenticação:** em `app.routes.ts`, aponte os caminhos das
   telas e o `authGuard` nas rotas protegidas. Explique que o interceptor envia
   o token JWT nas chamadas à API; o backend também verifica esse token. O login
   e o cadastro são feitos em `home-auth.ts`.
7. **Encerrar com as operações:** mostre que é possível listar, ver detalhes,
   cadastrar, editar e remover mesas ou pedidos. Se o tempo for curto, cadastre
   ou edite uma mesa e mostre a lista atualizada. “Assim, tela, componentes,
   service e API trabalham juntos.”

### Códigos para consultar durante a apresentação

- Rotas e carregamento das telas: `web/src/app/app.routes.ts`.
- Comunicação pai/filho e Signals Forms: `web/src/app/pages/restaurant/restaurant-management.html`,
  `web/src/app/pages/restaurant/components/mesa-table/mesa-table.ts` e
  `web/src/app/pages/restaurant/components/mesa-dialog/mesa-dialog.ts`.
- Estado compartilhado e operações HTTP: `web/src/app/core/restaurant-data.service.ts`.
- Login, proteção da navegação e envio do token: `web/src/app/core/auth.service.ts`,
  `web/src/app/pages/home/components/home-auth/home-auth.ts`,
  `web/src/app/core/auth.guard.ts` e `web/src/app/core/auth.interceptor.ts`.

**Observação:** o formulário de mesa usa Signal Forms. O formulário de pedidos
e os formulários de login/cadastro usam Reactive Forms; portanto, para mostrar
o requisito de Signal Forms, use o cadastro ou a edição de mesa.