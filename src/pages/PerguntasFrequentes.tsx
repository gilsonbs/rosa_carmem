import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FaqItem {
  q: string
  a: React.ReactNode
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

const FAQ: FaqCategory[] = [
  {
    title: 'Entrega',
    items: [
      {
        q: 'Qual é o prazo de entrega?',
        a: 'O prazo varia conforme a sua região e a disponibilidade do produto. Em geral, realizamos entregas em até 2 dias úteis para a região de Campos dos Goytacazes e municípios vizinhos. Para outras localidades, consulte pelo WhatsApp antes de finalizar o pedido.',
      },
      {
        q: 'Vocês entregam no mesmo dia?',
        a: 'Sim! Para pedidos realizados até as 12h, tentamos realizar a entrega no mesmo dia dentro da nossa área de cobertura. Disponibilidade sujeita ao estoque e à logística do dia — confirme pelo WhatsApp.',
      },
      {
        q: 'E se o destinatário não estiver em casa no momento da entrega?',
        a: 'Entraremos em contato para combinar um novo horário ou deixar o presente com um vizinho ou porteiro, conforme sua autorização. Flores naturais têm prazo de conservação — quanto antes entregues, melhor.',
      },
      {
        q: 'Vocês entregam em todo o Brasil?',
        a: 'No momento atendemos presencialmente a região de Campos dos Goytacazes e municípios próximos. Para outras cidades, entre em contato — avaliamos caso a caso.',
      },
    ],
  },
  {
    title: 'Pedidos',
    items: [
      {
        q: 'Posso incluir uma mensagem no presente?',
        a: 'Sim! Durante o pedido, você pode adicionar uma mensagem personalizada que será incluída em um cartão junto ao presente.',
      },
      {
        q: 'Posso cancelar ou alterar meu pedido após a confirmação?',
        a: 'Pedidos podem ser cancelados ou alterados em até 2 horas após a confirmação, desde que a produção ainda não tenha iniciado. Entre em contato imediatamente pelo WhatsApp caso precise fazer alguma mudança.',
      },
      {
        q: 'Como sei que meu pedido foi confirmado?',
        a: 'Após a confirmação do pagamento, você receberá uma notificação. Se tiver dúvidas sobre o status, entre em contato pelo WhatsApp com o número do pedido.',
      },
      {
        q: 'Vocês fazem arranjos e cestas personalizados?',
        a: 'Sim! Adoramos criar presentes únicos. Entre em contato pelo WhatsApp descrevendo sua ideia — orçamos sem compromisso.',
      },
    ],
  },
  {
    title: 'Pagamento',
    items: [
      {
        q: 'Quais formas de pagamento são aceitas?',
        a: 'Aceitamos cartão de crédito, cartão de débito e Pix. O pagamento é processado de forma segura pelo Mercado Pago.',
      },
      {
        q: 'Posso parcelar minha compra?',
        a: 'Sim, oferecemos parcelamento em até 12x no cartão de crédito. As condições de parcelamento são exibidas no momento do checkout.',
      },
      {
        q: 'O site é seguro para compras?',
        a: 'Sim. Todas as transações são processadas pelo Mercado Pago, plataforma líder em pagamentos online na América Latina. Seus dados financeiros nunca passam pelo nosso servidor.',
      },
    ],
  },
  {
    title: 'Produtos',
    items: [
      {
        q: 'As flores são naturais?',
        a: 'Sim, trabalhamos com flores naturais frescas, selecionadas com cuidado para garantir qualidade e durabilidade.',
      },
      {
        q: 'Por quanto tempo as flores duram?',
        a: 'Com os cuidados adequados (água fresca, longe do sol direto e de ambientes muito quentes), flores de corte duram entre 5 e 10 dias. Sempre enviamos dicas de conservação junto ao pedido.',
      },
      {
        q: 'Os produtos das fotos são exatamente iguais ao que vou receber?',
        a: 'As fotos representam fielmente nossos produtos. Como trabalhamos com flores naturais, pode haver pequenas variações de cor e volume conforme a safra da temporada — mas sempre mantemos o mesmo padrão de qualidade.',
      },
    ],
  },
  {
    title: 'Trocas e Devoluções',
    items: [
      {
        q: 'Posso devolver um presente?',
        a: (
          <>
            Sim, conforme nossa política de trocas e devoluções. Para produtos não perecíveis, você tem 7 dias a partir do recebimento. Para flores e alimentos frescos, a política é diferente — reportar problemas em até 24h com foto.{' '}
            <Link to="/trocas-e-devolucoes" className="text-rosa hover:underline">
              Leia a política completa aqui.
            </Link>
          </>
        ),
      },
      {
        q: 'O que faço se meu pedido chegou danificado?',
        a: 'Fotografe o produto imediatamente e entre em contato pelo WhatsApp com as fotos e o número do pedido. Avaliaremos e resolveremos o mais rápido possível.',
      },
    ],
  },
]

function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-blush/40 last:border-none">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="font-body font-medium text-texto text-sm md:text-base group-hover:text-rosa transition-colors">
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-rosa transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="pb-4 font-body text-sm text-texto/70 leading-relaxed pr-8">
          {item.a}
        </div>
      )}
    </div>
  )
}

export function PerguntasFrequentes() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 bg-[#FDF0F3] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
            Ajuda
          </p>
          <h1 className="font-title text-4xl md:text-5xl text-texto">Perguntas Frequentes</h1>
          <p className="font-body text-texto/60 mt-4 text-lg">
            Encontre respostas para as dúvidas mais comuns. Não achou o que procura?{' '}
            <Link to="/fale-conosco" className="text-rosa hover:underline">
              Fale com a gente.
            </Link>
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {FAQ.map((category) => (
            <div key={category.title}>
              <h2 className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-4">
                {category.title}
              </h2>
              <div className="bg-white rounded-2xl px-6 shadow-sm">
                {category.items.map((item) => (
                  <AccordionItem key={item.q} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
