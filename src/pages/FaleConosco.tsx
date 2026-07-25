import { useState, type FormEvent } from 'react'
import { MessageCircle, Mail, Clock } from 'lucide-react'

const WHATSAPP = '5522997394050'
const EMAIL = 'contato@rosacarmen.com.br'

export function FaleConosco() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = encodeURIComponent(
      `Olá! Meu nome é ${form.name}.\n\n${form.message}` +
        (form.phone ? `\n\nTelefone: ${form.phone}` : '') +
        `\nE-mail: ${form.email}`,
    )
    window.open(`https://wa.me/${WHATSAPP}?text=${text}`, '_blank')
    setSent(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 bg-[#FDF0F3] text-center">
        <div className="max-w-2xl mx-auto">
          <p className="font-subtitle text-xs uppercase tracking-[0.2em] text-dourado mb-2">
            Atendimento
          </p>
          <h1 className="font-title text-4xl md:text-5xl text-texto">Fale Conosco</h1>
          <p className="font-body text-texto/60 mt-4 text-lg">
            Estamos aqui para ajudar. Envie sua mensagem e responderemos em breve.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="py-16 px-6 bg-fundo">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_360px] gap-12">

          {/* Formulário */}
          <div>
            <h2 className="font-title text-2xl text-texto mb-6">Envie uma mensagem</h2>

            {sent ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
                <MessageCircle className="mx-auto text-[#25D366] mb-3" size={40} />
                <p className="font-subtitle text-green-700 font-medium text-base">WhatsApp aberto!</p>
                <p className="font-body text-green-600 text-sm mt-1">Continue a conversa pelo WhatsApp.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 text-xs font-subtitle uppercase tracking-wider text-texto/40 hover:text-rosa transition-colors"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-subtitle text-xs uppercase tracking-wider text-texto/60">
                      Nome *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Seu nome"
                      className="border border-blush/60 rounded-lg px-4 py-3 font-body text-sm text-texto placeholder:text-texto/30 focus:outline-none focus:ring-2 focus:ring-rosa/30 focus:border-rosa/40 transition-colors bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-subtitle text-xs uppercase tracking-wider text-texto/60">
                      Telefone
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="border border-blush/60 rounded-lg px-4 py-3 font-body text-sm text-texto placeholder:text-texto/30 focus:outline-none focus:ring-2 focus:ring-rosa/30 focus:border-rosa/40 transition-colors bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-subtitle text-xs uppercase tracking-wider text-texto/60">
                    E-mail *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    className="border border-blush/60 rounded-lg px-4 py-3 font-body text-sm text-texto placeholder:text-texto/30 focus:outline-none focus:ring-2 focus:ring-rosa/30 focus:border-rosa/40 transition-colors bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-subtitle text-xs uppercase tracking-wider text-texto/60">
                    Mensagem *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Como podemos ajudar?"
                    className="border border-blush/60 rounded-lg px-4 py-3 font-body text-sm text-texto placeholder:text-texto/30 focus:outline-none focus:ring-2 focus:ring-rosa/30 focus:border-rosa/40 transition-colors bg-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-subtitle font-medium uppercase tracking-wider text-sm px-8 py-3.5 rounded-lg transition-colors w-full sm:w-auto"
                >
                  <MessageCircle size={16} />
                  Enviar pelo WhatsApp
                </button>
              </form>
            )}
          </div>

          {/* Informações */}
          <div className="flex flex-col gap-4">
            <h2 className="font-title text-2xl text-texto mb-2">Informações</h2>

            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <div>
                <p className="font-subtitle text-xs uppercase tracking-wider text-texto/50 mb-0.5">
                  WhatsApp
                </p>
                <p className="font-body text-texto font-medium group-hover:text-rosa transition-colors">
                  (22) 99739-4050
                </p>
                <p className="font-body text-xs text-texto/50 mt-0.5">Clique para iniciar conversa</p>
              </div>
            </a>

            <a
              href={`mailto:${EMAIL}`}
              className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-full bg-rosa/10 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-rosa" />
              </div>
              <div>
                <p className="font-subtitle text-xs uppercase tracking-wider text-texto/50 mb-0.5">
                  E-mail
                </p>
                <p className="font-body text-texto font-medium group-hover:text-rosa transition-colors break-all">
                  {EMAIL}
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 p-5 bg-white rounded-xl shadow-sm">
              <div className="w-10 h-10 rounded-full bg-dourado/10 flex items-center justify-center shrink-0">
                <Clock size={20} className="text-dourado" />
              </div>
              <div>
                <p className="font-subtitle text-xs uppercase tracking-wider text-texto/50 mb-1">
                  Horário de atendimento
                </p>
                <p className="font-body text-texto font-medium">Seg – Sáb</p>
                <p className="font-body text-texto/70 text-sm">9h às 18h</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
