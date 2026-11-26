import type { ElementType } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Flower2, ShoppingBasket, Briefcase, Sparkles, Coffee, Zap, Candy, Gift, SprayCan } from 'lucide-react'
import type { Category } from '@/types'

export const CATEGORY_META: Record<string, { icon: ElementType; gradient: string }> = {
  flores: { icon: Flower2, gradient: 'from-rose-300 to-pink-400' },
  cestas: { icon: ShoppingBasket, gradient: 'from-amber-300 to-orange-400' },
  corporativo: { icon: Briefcase, gradient: 'from-slate-400 to-slate-500' },
  personalizados: { icon: Sparkles, gradient: 'from-purple-300 to-pink-400' },
  coffee_break: { icon: Coffee, gradient: 'from-amber-500 to-yellow-600' },
  pronta_entrega: { icon: Zap, gradient: 'from-emerald-300 to-teal-400' },
  chocolates: { icon: Candy, gradient: 'from-amber-600 to-orange-800' },
  kits: { icon: Gift, gradient: 'from-pink-300 to-rose-400' },
  perfumes: { icon: SprayCan, gradient: 'from-fuchsia-300 to-purple-400' },
}

const DEFAULT_GRADIENT = 'from-rosa to-blush'

interface CategoryStripProps {
  categories: Category[]
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeCategory = searchParams.get('categoria')

  function goToCategory(slug: string) {
    navigate(activeCategory === slug ? '/' : `/?categoria=${slug}`, { preventScrollReset: true })
    setTimeout(() => {
      document.getElementById('presentes')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  if (categories.length === 0) return null

  return (
    <section className="py-10 bg-white border-b border-blush/30">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-6 md:gap-10 overflow-x-auto scrollbar-hide justify-start md:justify-center pb-1">
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.slug]
            const Icon = meta?.icon ?? Sparkles
            const isActive = activeCategory === cat.slug
            return (
              <button
                key={cat.id}
                onClick={() => goToCategory(cat.slug)}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200 ${isActive ? 'ring-2 ring-rosa ring-offset-2' : ''}`}>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${meta?.gradient ?? DEFAULT_GRADIENT} flex items-center justify-center`}>
                      <Icon size={30} className="text-white drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <span className={`font-subtitle text-[10px] md:text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${isActive ? 'text-rosa font-semibold' : 'text-texto/60 group-hover:text-rosa'}`}>
                  {cat.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
