import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ShoppingBag, ChevronDown } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartDrawer } from '@/components/store/CartDrawer'
import { useDynamicCategories } from '@/hooks/useDynamicCategories'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const { categories } = useDynamicCategories()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function goToCategory(value: string) {
    navigate(`/?categoria=${value}`)
    setMenuOpen(false)
    setCategoriesOpen(false)
  }

  function goToAll() {
    navigate('/')
    setMenuOpen(false)
    setCategoriesOpen(false)
  }

  return (
    <>
      <header
        id="top"
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : ''
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 relative flex items-center justify-center md:grid md:grid-cols-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
            className="md:hidden absolute left-6 text-texto"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Nav desktop */}
          <nav className="hidden md:flex md:col-start-1 md:justify-self-start gap-6 font-subtitle text-xs uppercase tracking-wider text-texto/80 items-center">
            <a href="/#top" className="hover:text-rosa transition-colors">
              Início
            </a>

            {/* Dropdown Presentes */}
            <div className="relative group">
              <button
                type="button"
                onClick={goToAll}
                className="flex items-center gap-1 hover:text-rosa transition-colors"
              >
                Presentes <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-blush/40 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
                <button
                  onClick={goToAll}
                  className="w-full text-left px-4 py-2.5 text-xs font-subtitle uppercase tracking-wider text-texto/70 hover:text-rosa hover:bg-blush/20 transition-colors"
                >
                  Todos os presentes
                </button>
                <div className="border-t border-blush/30 my-1" />
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => goToCategory(cat.value)}
                    className="w-full text-left px-4 py-2.5 text-xs font-subtitle uppercase tracking-wider text-texto/70 hover:text-rosa hover:bg-blush/20 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <a href="/#sobre" className="hover:text-rosa transition-colors">
              Sobre
            </a>
          </nav>

          <Link to="/" className="md:col-start-2 md:justify-self-center">
            <img src="/logo.png" alt="Rosa Carmen" className="h-14 w-auto" />
          </Link>

          <div className="md:col-start-3 md:justify-self-end flex items-center gap-4">
            <a
              href="/#sobre"
              className="hidden md:inline-block font-subtitle text-xs uppercase tracking-wider text-texto/80 hover:text-rosa transition-colors"
            >
              Contato
            </a>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Carrinho${totalItems > 0 ? ` (${totalItems} itens)` : ''}`}
              className="absolute right-6 md:relative md:right-auto relative flex items-center text-texto/80 hover:text-rosa transition-colors"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rosa px-1 text-[10px] font-semibold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <nav className="md:hidden flex flex-col items-center gap-1 pb-4 font-subtitle text-sm text-texto/80">
            <a href="/#top" onClick={() => setMenuOpen(false)} className="py-2 hover:text-rosa transition-colors uppercase tracking-wider text-xs">
              Início
            </a>
            <button
              onClick={() => setCategoriesOpen((v) => !v)}
              className="flex items-center gap-1 py-2 hover:text-rosa transition-colors uppercase tracking-wider text-xs"
            >
              Presentes <ChevronDown size={12} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            {categoriesOpen && (
              <div className="flex flex-col items-center gap-1 w-full">
                <button onClick={goToAll} className="py-1.5 text-xs text-texto/60 hover:text-rosa uppercase tracking-wider">
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => goToCategory(cat.value)}
                    className="py-1.5 text-xs text-texto/60 hover:text-rosa uppercase tracking-wider"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
            <a href="/#sobre" onClick={() => setMenuOpen(false)} className="py-2 hover:text-rosa transition-colors uppercase tracking-wider text-xs">
              Sobre
            </a>
            <a href="/#sobre" onClick={() => setMenuOpen(false)} className="py-2 hover:text-rosa transition-colors uppercase tracking-wider text-xs">
              Contato
            </a>
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
