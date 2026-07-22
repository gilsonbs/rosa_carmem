import { useNavigate } from 'react-router-dom'
import { Flower2, ShoppingBasket, Briefcase, Sparkles, Coffee, Zap } from 'lucide-react'
import { CATEGORIES } from '@/utils/categories'

const CATEGORY_META: Record<string, { icon: React.ElementType; gradient: string }> = {
  flores: { icon: Flower2, gradient: 'from-rose-300 to-pink-400' },
  cestas: { icon: ShoppingBasket, gradient: 'from-amber-300 to-orange-400' },
  corporativo: { icon: Briefcase, gradient: 'from-slate-400 to-slate-500' },
  personalizados: { icon: Sparkles, gradient: 'from-purple-300 to-pink-400' },
  coffee_break: { icon: Coffee, gradient: 'from-amber-500 to-yellow-600' },
  pronta_entrega: { icon: Zap, gradient: 'from-emerald-300 to-teal-400' },
}

export function CategoryStrip() {
  const navigate = useNavigate()

  function goToCategory(value: string) {
    navigate(`/?categoria=${value}`)
    setTimeout(() => {
      document.getElementById('presentes')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <section className="py-10 bg-white border-b border-blush/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-6 md:gap-10 overflow-x-auto scrollbar-hide justify-start md:justify-center pb-1">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat.value]
            const Icon = meta?.icon ?? Sparkles
            return (
              <button
                key={cat.value}
                onClick={() => goToCategory(cat.value)}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${meta?.gradient ?? 'from-rosa to-blush'} flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}
                >
                  <Icon size={30} className="text-white drop-shadow-sm" strokeWidth={1.5} />
                </div>
                <span className="font-subtitle text-[10px] md:text-xs uppercase tracking-wider text-texto/60 group-hover:text-rosa transition-colors whitespace-nowrap">
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
