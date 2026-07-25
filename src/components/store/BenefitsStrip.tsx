import { MessageCircle, Truck, CreditCard } from 'lucide-react'

const ITEMS = [
  {
    icon: MessageCircle,
    title: 'Clique aqui',
    description: 'Para falar com a nossa equipe de atendimento via WhatsApp',
    href: 'https://wa.me/5522997394050',
  },
  {
    icon: Truck,
    title: 'Entrega expressa',
    description: 'Consulte a disponibilidade de envio imediato para Macaé, Rio das Ostras, Cabo Frio e Barra de São João',
    href: null,
  },
  {
    icon: CreditCard,
    title: 'Parcelamento',
    description: 'Em até 12x sem juros',
    href: null,
  },
]

export function BenefitsStrip() {
  return (
    <div className="bg-[#F7EFE8] border-t border-b border-blush/40">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-blush/40">
        {ITEMS.map(({ icon: Icon, title, description, href }) => {
          const inner = (
            <div className="flex items-center justify-center gap-5 py-6 md:py-0 md:px-10">
              <Icon size={32} strokeWidth={1.2} className="shrink-0 text-texto/50" />
              <div>
                <p className="font-subtitle text-xs uppercase tracking-[0.18em] text-texto font-semibold">
                  {title}
                </p>
                <p className="font-body text-xs text-texto/60 mt-1 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          )

          return href ? (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-75 transition-opacity"
            >
              {inner}
            </a>
          ) : (
            <div key={title}>{inner}</div>
          )
        })}
      </div>
    </div>
  )
}
