import { RefreshCw, Clock, CheckCircle, XCircle, MessageCircle, Package } from 'lucide-react'

const WHATSAPP = '5522997394050'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="shrink-0 w-10 h-10 rounded-full bg-rosa/10 flex items-center justify-center mt-0.5">
        <Icon size={20} className="text-rosa" />
      </div>
      <div>
        <h2 className="font-title text-xl text-texto mb-3">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function TrocasDevolucoes() {
  const whatsappLink = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá! Gostaria de solicitar uma troca ou devolução.')}`

  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 bg-[#FDF0F3] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
            Política
          </p>
          <h1 className="font-title text-4xl md:text-5xl text-texto">Trocas e Devoluções</h1>
          <p className="font-body text-texto/60 mt-4 text-lg">
            Sua satisfação é nossa prioridade. Conheça nossa política e como podemos ajudar.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">

          <Section icon={Clock} title="Prazo para solicitação">
            <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2">
              <p>
                De acordo com o <strong className="text-texto">Código de Defesa do Consumidor (Art. 49)</strong>, você
                tem até <strong className="text-texto">7 dias corridos</strong> a partir do recebimento do pedido para
                solicitar a devolução de compras realizadas online, sem necessidade de justificativa.
              </p>
              <p>
                Para trocas por defeito ou produto diferente do solicitado, o prazo é de{' '}
                <strong className="text-texto">30 dias</strong> após o recebimento.
              </p>
            </div>
          </Section>

          <div className="border-t border-blush/30" />

          <Section icon={CheckCircle} title="Quando aceitamos a troca ou devolução">
            <ul className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2.5">
              {[
                'Produto com defeito de fabricação',
                'Item diferente do que foi pedido',
                'Produto danificado na entrega',
                'Desistência da compra dentro de 7 dias do recebimento (direito do consumidor)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-blush/30" />

          <Section icon={XCircle} title="Quando não é possível trocar ou devolver">
            <ul className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2.5">
              {[
                'Produtos perecíveis (flores naturais, alimentos frescos) — pela natureza do produto',
                'Itens personalizados com nome, mensagem ou arte exclusiva solicitada pelo cliente',
                'Produtos que já foram utilizados ou com sinais evidentes de uso',
                'Solicitação fora do prazo estabelecido',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <div className="border-t border-blush/30" />

          <Section icon={Package} title="Condições do produto para devolução">
            <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2">
              <p>Para que a devolução seja aceita, o produto deve ser devolvido:</p>
              <ul className="flex flex-col gap-2 mt-1">
                {[
                  'Na embalagem original, sem danos',
                  'Com todos os acessórios e itens que acompanhavam o pedido',
                  'Sem sinais de uso ou avaria causada pelo cliente',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rosa mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <div className="border-t border-blush/30" />

          <Section icon={RefreshCw} title="Como funciona o reembolso">
            <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-2">
              <p>
                Após recebermos e avaliarmos o produto devolvido, o reembolso é processado em até{' '}
                <strong className="text-texto">10 dias úteis</strong> pela mesma forma de pagamento utilizada na compra.
              </p>
              <p>
                Para pagamentos via cartão de crédito, o estorno pode levar até 2 faturas para aparecer, dependendo da
                operadora.
              </p>
            </div>
          </Section>

          <div className="border-t border-blush/30" />

          <Section icon={MessageCircle} title="Como solicitar">
            <div className="font-body text-texto/70 text-sm leading-relaxed flex flex-col gap-4">
              <ol className="flex flex-col gap-2.5">
                {[
                  'Entre em contato pelo WhatsApp informando o número do pedido',
                  'Descreva o motivo da troca ou devolução',
                  'Aguarde nossa confirmação e as instruções de envio',
                  'Envie o produto de volta conforme orientado',
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-rosa/15 text-rosa text-xs font-semibold font-subtitle flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-subtitle font-medium uppercase tracking-wider text-sm px-7 py-3 rounded-lg transition-colors w-fit"
              >
                <MessageCircle size={16} />
                Iniciar solicitação pelo WhatsApp
              </a>
            </div>
          </Section>

        </div>
      </section>
    </>
  )
}
