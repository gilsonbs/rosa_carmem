import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Product } from '@/types'
import { formatCurrency } from '@/utils/format'

interface HeroCarouselProps {
  products: Product[]
  autoAdvance: boolean
  intervalSeconds: number
  showPrice: boolean
  onSelectProduct: (product: Product) => void
}

const STRIPE_BG = {
  backgroundImage:
    'repeating-linear-gradient(135deg, #F2C4CE 0px, #F2C4CE 24px, #E8AFC0 24px, #E8AFC0 48px)',
}

export function HeroCarousel({
  products,
  autoAdvance,
  intervalSeconds,
  showPrice,
  onSelectProduct,
}: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const total = products.length

  const goTo = useCallback(
    (index: number) => {
      if (animating || total === 0) return
      setAnimating(true)
      setCurrent((index + total) % total)
      setTimeout(() => setAnimating(false), 400)
    },
    [animating, total],
  )

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    if (!autoAdvance || total <= 1) return
    const timer = setInterval(next, intervalSeconds * 1000)
    return () => clearInterval(timer)
  }, [autoAdvance, intervalSeconds, next, total])

  // Sem produtos configurados: hero estático padrão
  if (total === 0) {
    return (
      <section
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6"
        style={STRIPE_BG}
      >
        <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-texto/60">
          Rosa Carmen · Boutique de Presentes
        </p>
        <h1 className="font-title text-4xl md:text-5xl text-texto mt-4">
          Presentes que tocam o coração.
        </h1>
        <p className="font-subtitle font-light text-lg text-texto/70 mt-3 max-w-xl">
          Curadoria de presentes elegantes para os momentos que merecem ser lembrados.
        </p>
        <a
          href="#presentes"
          className="mt-8 inline-block bg-white text-texto font-subtitle font-medium uppercase tracking-wide text-sm px-8 py-3.5 rounded hover:bg-texto hover:text-white transition-colors"
        >
          Explorar a Coleção
        </a>
      </section>
    )
  }

  const product = products[current]

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Fundo: imagem do produto ou listras */}
      <div className="absolute inset-0 transition-opacity duration-400">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-400 ${animating ? 'opacity-0' : 'opacity-100'}`}
            />
            <div className="absolute inset-0 bg-black/40" />
          </>
        ) : (
          <div className="w-full h-full" style={STRIPE_BG} />
        )}
      </div>

      {/* Conteúdo central */}
      <div
        className={`relative z-10 text-center px-6 max-w-xl transition-all duration-400 ${
          animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <p className={`font-subtitle text-xs uppercase tracking-[0.2em] mb-3 ${product.image_url ? 'text-white/80' : 'text-texto/60'}`}>
          Rosa Carmen · Boutique de Presentes
        </p>
        <h2 className={`font-title text-3xl md:text-5xl leading-tight ${product.image_url ? 'text-white' : 'text-texto'}`}>
          {product.name}
        </h2>
        {product.description && (
          <p className={`font-subtitle font-light text-lg mt-3 max-w-md mx-auto line-clamp-2 ${product.image_url ? 'text-white/80' : 'text-texto/70'}`}>
            {product.description}
          </p>
        )}
        {showPrice && (
          <p className={`font-title text-2xl mt-4 ${product.image_url ? 'text-white' : 'text-rosa'}`}>
            {formatCurrency(product.price)}
          </p>
        )}
        <button
          onClick={() => onSelectProduct(product)}
          className="mt-6 inline-block bg-white text-texto font-subtitle font-medium uppercase tracking-wide text-sm px-8 py-3.5 rounded hover:bg-texto hover:text-white transition-colors"
        >
          Ver este presente
        </button>
      </div>

      {/* Seta esquerda */}
      {total > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors text-white"
          aria-label="Slide anterior"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Seta direita */}
      {total > 1 && (
        <button
          onClick={next}
          className="absolute right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors text-white"
          aria-label="Próximo slide"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2.5 bg-white'
                  : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
