export function Footer() {
  return (
    <footer id="sobre" className="bg-texto text-white">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div className="flex flex-col gap-3 items-center md:items-start text-center md:text-left">
          <img src="/logo-white.png" alt="Rosa Carmen" className="h-16 w-auto opacity-90" />
          <p className="font-body text-sm text-white/60 max-w-xs">
            Presentes selecionados com cuidado, para quem você ama.
          </p>
        </div>

        <div className="text-center md:text-left">
          <h3 className="font-subtitle text-xs uppercase tracking-wider text-white/50 mb-4">
            Atendimento
          </h3>
          <ul className="flex flex-col gap-2.5 font-body text-sm text-white/70">
            <li>
              <a href="/fale-conosco" className="hover:text-white transition-colors">
                Fale conosco
              </a>
            </li>
            <li>
              <a href="/trocas-e-devolucoes" className="hover:text-white transition-colors">
                Trocas e devoluções
              </a>
            </li>
            <li>
              <a href="/perguntas-frequentes" className="hover:text-white transition-colors">
                Perguntas frequentes
              </a>
            </li>
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h3 className="font-subtitle text-xs uppercase tracking-wider text-white/50 mb-4">
            Institucional
          </h3>
          <ul className="flex flex-col gap-2.5 font-body text-sm text-white/70">
            <li>
              <a href="/sobre" className="hover:text-white transition-colors">
                Sobre a Rosa Carmen
              </a>
            </li>
            <li>
              <a href="/politica-de-privacidade" className="hover:text-white transition-colors">
                Política de privacidade
              </a>
            </li>
          </ul>
        </div>

        <div className="text-center md:text-left">
          <h3 className="font-subtitle text-xs uppercase tracking-wider text-white/50 mb-4">
            Siga-nos
          </h3>
          <ul className="flex flex-col gap-2.5 font-body text-sm text-white/70">
            <li>
              <a
                href="https://www.instagram.com/rosacarmen.loja"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/5522997394050"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="max-w-6xl mx-auto px-6 py-5 text-center font-body text-xs text-white/40">
          © {new Date().getFullYear()} Rosa Carmen. Feito com carinho, para presentear com carinho.
        </p>
      </div>
    </footer>
  )
}
