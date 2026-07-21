import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { GripVertical } from 'lucide-react'
import { useHeroSettings } from '@/hooks/useHeroSettings'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Switch } from '@/components/ui/Switch'
import { formatCurrency } from '@/utils/format'

export function HeroConfig() {
  const { settings, loading, saving, saveSettings } = useHeroSettings()
  const { products, loading: productsLoading } = useAdminProducts()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [intervalSeconds, setIntervalSeconds] = useState(5)
  const [showPrice, setShowPrice] = useState(false)

  useEffect(() => {
    if (!loading) {
      setSelectedIds(settings.product_ids)
      setAutoAdvance(settings.auto_advance)
      setIntervalSeconds(settings.interval_seconds)
      setShowPrice(settings.show_price)
    }
  }, [loading, settings])

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function moveUp(index: number) {
    if (index === 0) return
    setSelectedIds((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index: number) {
    setSelectedIds((prev) => {
      if (index === prev.length - 1) return prev
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  async function handleSave() {
    try {
      await saveSettings({
        product_ids: selectedIds,
        auto_advance: autoAdvance,
        interval_seconds: intervalSeconds,
        show_price: showPrice,
      })
      toast.success('Configurações do hero salvas!')
    } catch {
      toast.error('Erro ao salvar configurações')
    }
  }

  const isLoading = loading || productsLoading

  // Produtos selecionados em ordem
  const orderedSelected = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products

  // Produtos não selecionados
  const unselected = products.filter((p) => !selectedIds.includes(p.id))

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-title text-texto">Configuração do Hero</h1>
        <p className="text-sm font-body text-texto/50 mt-0.5">
          Selecione os produtos que aparecem no carrossel da página inicial e configure o comportamento.
        </p>
      </div>

      {isLoading && <p className="text-texto/60">Carregando...</p>}

      {!isLoading && (
        <>
          {/* Slides selecionados */}
          <Card className="p-5">
            <h2 className="font-subtitle font-semibold text-texto mb-4">
              Slides do carrossel ({selectedIds.length})
            </h2>

            {orderedSelected.length === 0 && (
              <p className="text-sm font-body text-texto/50">
                Nenhum produto selecionado. Selecione abaixo para adicionar slides.
                Sem produtos, o hero exibe o conteúdo padrão.
              </p>
            )}

            {orderedSelected.length > 0 && (
              <ul className="flex flex-col gap-2">
                {orderedSelected.map((product, index) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-blush/20 rounded-lg"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-texto/30 hover:text-texto disabled:opacity-20 leading-none"
                        aria-label="Mover para cima"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === orderedSelected.length - 1}
                        className="text-texto/30 hover:text-texto disabled:opacity-20 leading-none"
                        aria-label="Mover para baixo"
                      >
                        ▼
                      </button>
                    </div>
                    <GripVertical size={16} className="text-texto/20 shrink-0" />
                    <span className="w-6 h-6 rounded-full bg-rosa text-white text-xs font-semibold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-subtitle font-semibold text-texto text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-rosa">{formatCurrency(product.price)}</p>
                    </div>
                    <button
                      onClick={() => toggleProduct(product.id)}
                      className="text-xs text-texto/40 hover:text-red-500 transition-colors shrink-0"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Produtos disponíveis */}
          <Card className="p-5">
            <h2 className="font-subtitle font-semibold text-texto mb-4">
              Produtos disponíveis
            </h2>

            {unselected.length === 0 && (
              <p className="text-sm font-body text-texto/50">
                Todos os produtos já estão no carrossel.
              </p>
            )}

            <ul className="flex flex-col divide-y divide-blush/30">
              {unselected.map((product) => (
                <li key={product.id} className="flex items-center gap-3 py-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-subtitle font-semibold text-texto text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-rosa">{formatCurrency(product.price)}</p>
                  </div>
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="text-xs font-subtitle text-rosa hover:underline shrink-0"
                  >
                    + Adicionar
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Configurações */}
          <Card className="p-5 flex flex-col gap-5">
            <h2 className="font-subtitle font-semibold text-texto">Comportamento</h2>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-subtitle text-sm font-semibold text-texto">
                  Avanço automático
                </p>
                <p className="text-xs font-body text-texto/50">
                  Troca de slide automaticamente após o intervalo definido
                </p>
              </div>
              <Switch checked={autoAdvance} onChange={setAutoAdvance} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-subtitle text-sm font-semibold text-texto">
                  Exibir preço
                </p>
                <p className="text-xs font-body text-texto/50">
                  Mostra o preço do produto em cada slide
                </p>
              </div>
              <Switch checked={showPrice} onChange={setShowPrice} />
            </div>

            {autoAdvance && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-subtitle text-sm font-semibold text-texto">
                    Intervalo (segundos)
                  </p>
                  <p className="text-xs font-body text-texto/50">
                    Tempo em cada slide antes de avançar
                  </p>
                </div>
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(Math.max(2, Number(e.target.value)))}
                  className="w-20 rounded-lg border border-blush/60 px-3 py-2 text-center text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
                />
              </div>
            )}
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-fit">
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </>
      )}
    </div>
  )
}
