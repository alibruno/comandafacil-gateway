## Roteiro breve para apresentação (aproximadamente 5 minutos)

1. **Aplicação e componentes:** apresente o ComandaFácil, usado para gerenciar
   mesas e pedidos. Em `web/src/app/pages/restaurant/restaurant-management.ts`,
   mostre o componente da tela e seus componentes filhos, como `MesaTable` e
   `MesaDialog`.

2. **Comunicação e signals:** em
   `web/src/app/pages/restaurant/restaurant-management.html`, mostre
   `[mesas]="mesas()"`: o pai lê o signal e passa a lista à tabela. Em
   `components/mesa-table/mesa-table.ts`, mostre `input.required<Mesa[]>()`.
   Para o caminho de volta, em `components/mesa-dialog/mesa-dialog.ts`, mostre
   `save.emit(this.mesaForm().value())`; no template do pai,
   `(save)="saveMesa($event)"` recebe os dados. **Input leva dados ao filho;
   output envia eventos ao pai.**

3. **Cadastro com Signal Forms:** em `components/mesa-dialog/mesa-dialog.ts`,
   mostre que `mesaDraft` é um signal, `form()` cria o formulário e `schema()`
   define validações, como nome obrigatório e capacidade mínima. O formulário
   de login usa Reactive Forms, não Signal Forms.

4. **Service e API:** em `web/src/app/core/restaurant-data.service.ts`,
   mostre `loadMesas()` e `createMesa()`: `HttpClient` faz requisições GET e
   POST, e as respostas atualizam o signal `mesas`. O componente acessa esse
   service por injeção de dependência.

5. **Rotas e segurança:** em `web/src/app/app.routes.ts`, mostre a rota inicial
   pública e as rotas `restaurante` e `pedidos` protegidas por `authGuard`.
   Em `web/src/app/pages/home/components/home-auth/home-auth.ts` e
   `web/src/app/core/auth.service.ts`, mostre o login e a chamada à API.
   Em `auth.guard.ts`, explique o redirecionamento de quem não tem sessão; em
   `auth.interceptor.ts`, mostre o envio do JWT no cabeçalho das chamadas à API.
   No backend, mostre `backend/backend/src/main/java/br/com/comandafacil/backend/config/SecurityConfig.java`
   e `backend/backend/src/main/java/br/com/comandafacil/backend/auth/JwtAuthenticationFilter.java`:
   a API exige autenticação nas rotas protegidas e verifica o token.

**Antes da apresentação:** a cópia atual está com arquivos ausentes, incluindo
os templates da tabela e do formulário de mesas e arquivos de configuração do
projeto web. Restaure-os antes de executar a aplicação e demonstrar as telas.
