# ComandaFácil Web

Frontend operacional em React 19, TypeScript, Material UI e Tailwind CSS v4.

## Desenvolvimento

```bash
pnpm install
pnpm start
```

O Vite inicia em `http://localhost:5173`.

## Verificação

```bash
pnpm test
pnpm build
```

## Organização

- `src/app`: roteamento e estrutura compartilhada da aplicação.
- `src/features`: dashboard, pedidos, mesas e cardápio.
- `src/shared`: formatação e componentes reutilizáveis.
- `src/state`: estado de trabalho persistido no navegador.

Mesas, categorias, produtos e pedidos usam dados demonstrativos persistidos em `localStorage`. O serviço de restaurantes possui contratos REST, mas ainda não há configuração de restaurante/gateway para conectar este frontend; pedidos ainda não têm serviço backend.