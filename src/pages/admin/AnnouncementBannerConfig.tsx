import { useState, useEffect } from 'react'
import { Megaphone, Save } from 'lucide-react'
import { useAnnouncementBanner, type BannerSettings } from '@/hooks/useAnnouncementBanner'
import toast from 'react-hot-toast'

export function AnnouncementBannerConfig() {
  const { settings, loading, saving, saveSettings } = useAnnouncementBanner()
  const [form, setForm] = useState<BannerSettings>(settings)

  useEffect(() => {
    setForm(settings)
  }, [settings])

  function setMessage(i: number, value: string) {
    const next: [string, string, string] = [...form.messages] as [string, string, string]
    next[i] = value
    setForm({ ...form, messages: next })
  }

  async function handleSave() {
    await saveSettings(form)
    toast.success('Banner salvo!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-texto/40 font-body text-sm">
        Carregando...
      </div>
    )
  }

  const preview = form.messages.filter((m) => m.trim() !== '')

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Megaphone size={22} className="text-rosa" />
        <h1 className="font-title text-2xl text-texto">Banner de Anúncio</h1>
      </div>

      <div className="bg-white rounded-2xl border border-blush/40 p-6 flex flex-col gap-6">

        {/* Toggle ativo */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-subtitle text-sm font-medium text-texto">Exibir banner no site</p>
            <p className="font-body text-xs text-texto/50 mt-0.5">
              O banner aparece acima do menu em todas as páginas
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, enabled: !form.enabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              form.enabled ? 'bg-rosa' : 'bg-texto/20'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.enabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>

        <div className="border-t border-blush/30" />

        {/* Mensagens */}
        <div className="flex flex-col gap-4">
          <p className="font-subtitle text-sm font-medium text-texto">Mensagens (máx. 3)</p>
          {([0, 1, 2] as const).map((i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-rosa/10 text-rosa text-xs font-semibold font-subtitle flex items-center justify-center">
                {i + 1}
              </span>
              <input
                type="text"
                value={form.messages[i]}
                onChange={(e) => setMessage(i, e.target.value)}
                placeholder={`Mensagem ${i + 1}`}
                className="flex-1 border border-blush/60 rounded-lg px-3 py-2 font-body text-sm text-texto placeholder:text-texto/30 focus:outline-none focus:border-rosa"
              />
            </div>
          ))}
          <p className="font-body text-xs text-texto/40">
            Deixe em branco para ignorar. Mensagens vazias são puladas automaticamente.
          </p>
        </div>

        <div className="border-t border-blush/30" />

        {/* Intervalo */}
        <div className="flex flex-col gap-2">
          <p className="font-subtitle text-sm font-medium text-texto">
            Intervalo entre mensagens:{' '}
            <span className="text-rosa">{(form.interval / 1000).toFixed(0)}s</span>
          </p>
          <input
            type="range"
            min={2000}
            max={10000}
            step={500}
            value={form.interval}
            onChange={(e) => setForm({ ...form, interval: Number(e.target.value) })}
            className="accent-rosa"
          />
          <div className="flex justify-between font-body text-xs text-texto/40">
            <span>2s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <>
            <div className="border-t border-blush/30" />
            <div className="flex flex-col gap-2">
              <p className="font-subtitle text-xs uppercase tracking-wider text-texto/50">
                Preview
              </p>
              <div className="w-full bg-rosa text-white py-2 px-4 rounded-lg text-center">
                <p className="font-subtitle text-xs uppercase tracking-widest">
                  {preview[0]}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Salvar */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="self-end flex items-center gap-2 bg-rosa hover:bg-rosa/90 text-white font-subtitle text-sm uppercase tracking-wider px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}
