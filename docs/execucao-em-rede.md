# Execução do sistema em uma máquina da rede

Este documento explica como usar uma máquina do laboratório como servidor e
permitir que outros computadores acessem o cliente web do ComandaFácil.

## 1. Requisitos

Na máquina que será usada como servidor, instale:

- Docker;
- Docker Compose (normalmente disponível como `docker compose`);
- Node.js;
- `pnpm`;
- OpenSSL.

Todos os computadores que acessarão o sistema devem estar conectados à mesma
rede cabeada ou Wi-Fi da máquina servidora.

## 2. Configurar o servidor

Clone ou copie o projeto para a máquina servidora e entre na raiz do
repositório:

```bash
cd /caminho/para/comandafacil-gateway
```

Crie o arquivo `.env` na raiz do projeto:

```dotenv
JWT_SECRET=defina-um-segredo-com-pelo-menos-32-bytes
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=defina-uma-senha-forte
DATABASE_NAME=comandafacil_db
```

Para gerar um segredo aleatório:

```bash
openssl rand -hex 32
```

O arquivo `.env` contém credenciais e não deve ser publicado no GitHub ou
enviado aos outros computadores.

## 3. Iniciar o backend com Docker

Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

Verifique o estado dos contêineres:

```bash
docker compose ps
```

Os serviços principais são:

| Serviço | Porta no servidor | Função |
| --- | ---: | --- |
| Gateway | `8080` | Entrada das requisições da aplicação |
| Restaurantes | `8081` | API interna de restaurantes |
| Pedidos | `8082` | API interna de pedidos |
| PostgreSQL | `5432` | Banco de dados |

O cliente web deve acessar o Gateway, e não os microsserviços diretamente.
Para acompanhar os logs:

```bash
docker compose logs -f gateway pedidos restaurantes
```

Teste o Gateway na própria máquina servidora:

```bash
curl http://localhost:8080/api
```

Se for necessário parar o backend:

```bash
docker compose down
```

## 4. Iniciar o cliente web

Em outro terminal, entre no diretório do cliente:

```bash
cd web
pnpm install
pnpm start --host 0.0.0.0
```

O parâmetro `--host 0.0.0.0` faz o Vite aceitar conexões vindas de outros
computadores. O cliente web ficará disponível na porta `5173`.

O proxy configurado em `web/vite.config.ts` encaminha as requisições
iniciadas em `/api` para o Gateway na porta `8080`.

## 5. Descobrir o endereço da máquina servidora

Na máquina servidora, execute:

```bash
hostname -I
```

Escolha o endereço IPv4 da rede local. Por exemplo:

```text
192.168.1.50
```

O endereço final do cliente será:

```text
http://192.168.1.50:5173
```

Substitua `192.168.1.50` pelo IP real da máquina servidora.

## 6. Acessar de outros computadores

Em cada computador cliente, abra no navegador:

```text
http://IP_DA_SERVIDORA:5173
```

Por exemplo:

```text
http://192.168.1.50:5173
```

Não use `localhost` nos computadores clientes. `localhost` sempre representa o
próprio computador que está executando o navegador, e não a máquina servidora.

Para testar a comunicação com o Gateway a partir de outro computador:

```bash
curl http://192.168.1.50:8080/api
```

## 7. Liberar o firewall

Se o navegador não conseguir abrir o cliente, libere a porta `5173` na máquina
servidora. Para testar o Gateway diretamente, libere também a porta `8080`:

```bash
sudo ufw allow 5173/tcp
sudo ufw allow 8080/tcp
sudo ufw reload
```

As portas `8081`, `8082` e `5432` não precisam ser liberadas para os usuários
do sistema, pois são usadas internamente pelo backend. Evite expor o
PostgreSQL para a rede sem necessidade.

Também confirme que a rede Wi-Fi não está usando isolamento de clientes
(opção que impede um computador de acessar outro).

## 8. Diagnóstico rápido

Verifique se as portas estão sendo usadas na máquina servidora:

```bash
ss -lntp | grep -E '5173|8080|8081|8082'
```

Se o cliente web não abrir:

1. confirme que o processo `pnpm start --host 0.0.0.0` continua executando;
2. confira o IP correto com `hostname -I`;
3. teste a conectividade com `ping IP_DA_SERVIDORA`;
4. verifique o firewall;
5. teste `curl http://IP_DA_SERVIDORA:8080/api`.

Se o cliente abrir, mas o login ou as requisições falharem:

```bash
docker compose ps
docker compose logs --tail=100 gateway pedidos restaurantes
```

Confirme também que o arquivo `.env` existe e que `JWT_SECRET` possui pelo
menos 32 bytes.

## 9. Roteiro para a apresentação

Na máquina servidora:

```bash
docker compose up -d --build
docker compose ps
cd web
pnpm install
pnpm start --host 0.0.0.0
```

Descubra o IP:

```bash
hostname -I
```

Nos demais computadores, abra:

```text
http://IP_DA_SERVIDORA:5173
```

Enquanto o sistema estiver em execução, mantenha os dois terminais abertos:
um para o cliente web e outro para acompanhar os logs do Docker.
