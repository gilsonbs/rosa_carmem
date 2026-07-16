# Webhook do Mercado Pago — status e histórico (Dia 4 → resolvido em 2026-07-15)

## Status atual: RESOLVIDO

Causa raiz confirmada em 2026-07-15: o app estava inscrito no evento
**"Pagamentos (legacy)"** (escopo recomendado para CheckoutTransparente, não
para Checkout Pro que este projeto usa). O secret desse evento nunca bateu
com a assinatura das notificações reais porque o Mercado Pago, para Checkout
Pro, envia as notificações através do pipeline de **Order**
(`type=order`, evento **"Order (Mercado Pago)"** no painel) — não do
pipeline de `type=payment`.

Reconfigurado em Developers → Webhooks → Modo de produção: desmarcado
"Pagamentos (legacy)", marcado **"Order (Mercado Pago)"**, novo secret salvo
em `MERCADOPAGO_WEBHOOK_SECRET`. Validado manualmente (HMAC recalculado à
mão contra uma notificação real de "Simular notificação") que a assinatura
bate perfeitamente com esse novo secret.

`server/routes/webhook.ts` foi reescrito para processar `type=order`
(via `orderClient.get()`, novo em `server/lib/mercadopago.ts`) como caminho
principal — extrai o pagamento de `order.transactions.payments[]`
(priorizando o que estiver `approved`) e casa com nosso pedido via
`order.external_reference`. O suporte a `type=payment` (via `paymentClient`)
foi mantido como caminho legado, por segurança, caso o Mercado Pago volte a
mandar esse formato.

**Confirmado com "Simular notificação":** a assinatura passa e o servidor
tenta processar de verdade (só falha em buscar o order de teste "123456" na
API real, o que é esperado — não é um order real). **Ainda falta**: um teste
de ponta a ponta com um pagamento real, que o usuário decidiu adiar para
quando o backend for implantado no servidor de produção (não faz sentido
testar isso contra o túnel ngrok local).

### Pendente na hora do deploy

- Trocar `API_URL` no `.env` de produção para a URL real do backend
  implantado (hoje aponta para o túnel ngrok local usado durante o debug:
  `https://monosepalous-colene-unsuccessful.ngrok-free.dev`).
- Atualizar a "URL de produção" em Developers → Webhooks no painel do
  Mercado Pago para essa mesma URL real (ela está com a URL do ngrok agora).
- Depois disso, fazer uma compra real de baixo valor para confirmar o fluxo
  ponta a ponta (pedido confirmado automaticamente + estoque baixado sem
  precisar rodar `npm run test:webhook` manualmente).

## Workaround (não deve mais ser necessário, mas fica documentado)

Enquanto o webhook não estava confiável, cada pedido pago precisava ser
confirmado manualmente com o script de teste do webhook. Isso executa
exatamente a mesma lógica que roda automaticamente agora (busca o pagamento
real na API do Mercado Pago, confirma o pedido, baixa o estoque, desativa o
produto se zerar) — só pula a etapa de "receber a notificação sozinho".

1. Depois que o cliente pagar, pegue o `payment_id` (aparece na URL de
   redirecionamento `/checkout/success?payment_id=...`, ou no painel de
   pagamentos do Mercado Pago).
2. Com o backend rodando (`npm run dev` ou `npm run dev:server`), rode:
   ```
   npm run test:webhook <payment_id>
   ```
3. Confira no terminal do backend as linhas `WEBHOOK`, `ORDER UPDATED` (ou
   `ORDER CREATED`) e `STOCK DECREMENTED` confirmando que processou.

## O que já foi investigado

- Confirmado que os pagamentos são aprovados de verdade na API do Mercado
  Pago (`GET /v1/payments/search?external_reference=...`, `status: approved`).
- Confirmado (via ngrok) que a Mercado Pago **envia mesmo** a notificação
  para nossa URL — ou seja, `API_URL` e o cadastro no painel estão certos.
- Identificado e corrigido um bug real no código: para o mesmo pagamento, a
  Mercado Pago manda **3 notificações em paralelo**, com formatos diferentes:
  - `?data.id=X&type=payment` (User-Agent `MercadoPago WebHook v1.0
    payments_via_orders`) — o formato moderno, que processamos.
  - `?id=X&topic=payment` (User-Agent `MercadoPago Feed v2.0 payment`) —
    formato legado, sem `data.id`.
  - `?id=X&topic=merchant_order` (User-Agent `MercadoPago Feed v2.0
    merchant_order`) — idem, para o "merchant order" associado.

  Os dois formatos legados não têm como ser validados com o esquema de
  assinatura documentado (não carregam `data.id`) — o código agora aceita e
  ignora esses dois (200 OK) sem exigir assinatura, já que não agimos sobre
  eles, e só valida a assinatura da notificação que de fato processamos
  (`server/routes/webhook.ts`).
- Mesmo assim, a notificação no formato correto continua voltando
  `SignatureMismatch`. Recalculei o HMAC manualmente (fora do código do
  projeto, com Node puro) usando os dados exatos capturados pelo inspector
  local do ngrok (`http://127.0.0.1:4040/api/requests/http`) contra:
  - o secret original copiado do painel;
  - o secret depois de "regenerar" a assinatura no painel;
  - variações de codificação (string direta, bytes de hex, base64).

  **Nenhuma bateu.**
- Descartado erro de transcrição: o campo "Assinatura secreta" no painel não
  é mascarado (confirmado clicando no ícone de olho — o valor não muda).
- Testado o botão oficial "Simular notificação" do próprio painel do
  Mercado Pago — o teste retornou erro, e o payload de exemplo mostrado era
  de um evento `type: "order"` (API nova/unificada de Orders), não
  `type: "payment"`. Ou seja, a simulação nem testa o cenário real do nosso
  Checkout Pro.
- **Suspeita mais forte:** no painel, o único evento de pagamento disponível
  para marcar se chama **"Pagamentos (legacy)"**, listado sob "Eventos
  recomendados para integrações com **CheckoutTransparente**". Este projeto
  usa **Checkout Pro** (redirect para `init_point`), não Checkout
  Transparente. É possível que o secret exibido no painel pertença a um
  esquema de assinatura diferente do que realmente assina os eventos de
  pagamento do Checkout Pro.

## O que perguntar ao suporte do Mercado Pago

> "Configurei um webhook em Developers → Webhooks → Modo de produção, com o
> evento 'Pagamentos (legacy)'. A assinatura (`x-signature`) das
> notificações reais de pagamento (`type=payment`, User-Agent `MercadoPago
> WebHook v1.0 payments_via_orders`) que recebo nesse endpoint nunca bate
> com o HMAC-SHA256 calculado usando a 'Assinatura secreta' mostrada nessa
> mesma tela — nem com o valor original, nem depois de regenerar. Meu
> aplicativo usa Checkout Pro (Preference API). A assinatura secreta exibida
> nessa tela é realmente a usada para assinar esses eventos, ou existe uma
> chave diferente para integrações Checkout Pro?"

Application ID envolvido: `5991964206161895`.

## Alternativa: testar numa conta própria antes de mexer na do cliente

Se antes de acionar o suporte quisermos isolar se isso é um problema
específico da conta/app do cliente ou um comportamento geral da plataforma,
dá para reproduzir o cadastro do zero (novo app, ou até nova conta MP) e
repetir os mesmos testes deste documento. Se funcionar limpo numa conta
nova, o problema é specific do app/conta do cliente (e o suporte deles
provavelmente vai conseguir resetar algo do lado deles). Se falhar do mesmo
jeito, é mais forte a hipótese de bug geral da plataforma para Checkout Pro.
