import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartDrawer } from '@/components/store/CartDrawer'

const navLinks = [
  { label: 'Início', href: '#top' },
  { label: 'Presentes', href: '#presentes' },
  { label: 'Sobre', href: '#sobre' },
]

const mobileNavLinks = [...navLinks, { label: 'Contato', href: '#sobre' }]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

          <nav className="hidden md:flex md:col-start-1 md:justify-self-start gap-6 font-subtitle text-xs uppercase tracking-wider text-texto/80">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-rosa transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <Link to="/" className="md:col-start-2 md:justify-self-center">
            <img src="/logo.png" alt="Rosa Carmen" className="h-10 w-auto" />
          </Link>

          <div className="md:col-start-3 md:justify-self-end flex items-center gap-4">
            <a
              href="#sobre"
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

        {menuOpen && (
          <nav className="md:hidden flex flex-col items-center gap-4 pb-4 font-subtitle text-sm text-texto/80">
            {mobileNavLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="hover:text-rosa transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
