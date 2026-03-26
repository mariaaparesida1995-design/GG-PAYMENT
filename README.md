# GGBUX Premium Sales Bot

Bot de vendas premium para Discord com foco em loja, produtos, painéis, tickets, pagamentos, verificação, moderação e central administrativa.

## O que já vem pronto

- `/geral` como central administrativa com visão geral, alternância de manutenção/loja, configuração rápida, métricas e atalhos
- `/politica-privacidade`
- `/transacao-consultar`
- Cadastro e edição de produtos
- Estoque manual e entrega automática por estoque
- Painéis de loja com select menu
- Ticket automático ao comprar
- PIX manual configurável
- Mercado Pago automático com webhook, atualização de status e QR/copia e cola
- Verificação por painel
- Moderação básica
- Logs e estatísticas
- Backup e restauração em JSON
- Estrutura preparada para crescer sem virar monólito

## Tecnologias

- Node.js 22+
- discord.js 14
- Express 5
- JSON persistente
- QRCode em PNG gerado no servidor

## Estrutura

```txt
src/
  commands/
  config/
  data/
  events/
  lib/
  repositories/
  services/
  stores/
  ui/
  utils/
scripts/
```

## Variáveis de ambiente

Use apenas o básico no `.env`:

```env
DISCORD_TOKEN=seu_token
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor_de_teste
MP_ACCESS_TOKEN=seu_access_token_mp
PORT=3000
```

## Instalação

```bash
npm install
cp .env.example .env
npm run deploy:commands
npm start
```

## Fluxo recomendado

1. Suba o bot
2. Rode `/configurar`
3. Defina cargo staff, cargo verificado, categoria de tickets, canal de logs e alvo de alerta
4. Use `/pagamento-config`
5. Cadastre produtos
6. Crie um painel
7. Envie o painel com `/painel-enviar`
8. Acompanhe tudo em `/geral`

## Webhook Mercado Pago

`POST /webhooks/mercadopago`
