import { useState } from 'react'
import toast from 'react-hot-toast'
import { Check, Pencil, Plus, X } from 'lucide-react'
import { useDeliveryZones } from '@/hooks/useDeliveryZones'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { formatCurrency } from '@/utils/format'
import type { DeliveryZone } from '@/types'

const inputClasses =
  'rounded-lg border border-blush/60 px-3 py-2 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'

function parseFee(value: string): number | null {
  if (!value.trim()) return null
  const n = Number(value.replace(',', '.'))
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}

export function ZonasEntrega() {
  const { zones, loading, error, updateZone, createZone } = useDeliveryZones(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFee, setEditFee] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [newZone, setNewZone] = useState({ municipality: '', zone_name: '', fee: '' })
  const [creating, setCreating] = useState(false)

  function startEdit(zone: DeliveryZone) {
    setEditingId(zone.id)
    setEditFee(zone.fee.toFixed(2).replace('.', ','))
  }

  async function saveFee(zone: DeliveryZone) {
    const fee = parseFee(editFee)
    if (fee === null) {
      toast.error('Informe uma taxa válida')
      return
    }
    setSavingId(zone.id)
    try {
      await updateZone(zone.id, { fee })
      toast.success('Taxa atualizada')
      setEditingId(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar taxa')
    } finally {
      setSavingId(null)
    }
  }

  async function toggleActive(zone: DeliveryZone, active: boolean) {
    setSavingId(zone.id)
    try {
      await updateZone(zone.id, { active })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar zona')
    } finally {
      setSavingId(null)
    }
  }

  async function handleCreate() {
    const fee = parseFee(newZone.fee)
    if (!newZone.municipality.trim() || !newZone.zone_name.trim() || fee === null) {
      toast.error('Preencha município, zona e uma taxa válida')
      return
    }
    setCreating(true)
    try {
      await createZone({
        municipality: newZone.municipality.trim(),
        zone_name: newZone.zone_name.trim(),
        fee,
      })
      setNewZone({ municipality: newZone.municipality, zone_name: '', fee: '' })
      toast.success('Zona adicionada')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar zona')
    } finally {
      setCreating(false)
    }
  }

  const municipalities = [...new Set(zones.map((z) => z.municipality))]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-title text-texto">Zonas de Entrega</h1>
        <p className="font-body text-sm text-texto/60 mt-1">
          Taxas cobradas no checkout por região. Zonas inativas não aparecem para o cliente.
        </p>
      </div>

      {loading && <p className="text-texto/60">Carregando zonas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-blush/60 text-left text-texto/60">
                <th className="px-4 py-3 font-subtitle font-medium">Município</th>
                <th className="px-4 py-3 font-subtitle font-medium">Zona</th>
                <th className="px-4 py-3 font-subtitle font-medium">Taxa</th>
                <th className="px-4 py-3 font-subtitle font-medium">Ativo</th>
                <th className="px-4 py-3 font-subtitle font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const isEditing = editingId === zone.id
                const busy = savingId === zone.id
                return (
                  <tr key={zone.id} className="border-b border-blush/30 last:border-0">
                    <td className={`px-4 py-3 ${zone.active ? 'text-texto' : 'text-texto/40'}`}>
                      {zone.municipality}
                    </td>
                    <td className={`px-4 py-3 ${zone.active ? 'text-texto' : 'text-texto/40'}`}>
                      {zone.zone_name}
                    </td>
                    <td className="px-4 py-3 text-texto">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <span className="text-texto/50">R$</span>
                          <input
                            autoFocus
                            inputMode="decimal"
                            value={editFee}
                            onChange={(e) => setEditFee(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveFee(zone)
                              if (e.key === 'Escape') setEditingId(null)
                            }}
                            className={`${inputClasses} w-24 py-1`}
                          />
                        </div>
                      ) : (
                        formatCurrency(zone.fee)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Switch
                        checked={zone.active}
                        disabled={busy}
                        onChange={(value) => toggleActive(zone, value)}
                        label="Ativo"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveFee(zone)}
                            disabled={busy}
                            className="text-green-600 hover:text-green-700 disabled:opacity-50"
                            aria-label="Salvar taxa"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-texto/40 hover:text-red-600"
                            aria-label="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(zone)}
                          className="text-texto/40 hover:text-rosa transition-colors"
                          aria-label="Editar taxa"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}

              <tr className="bg-fundo/60">
                <td className="px-4 py-3">
                  <input
                    list="municipalities"
                    placeholder="Município"
                    value={newZone.municipality}
                    onChange={(e) => setNewZone({ ...newZone, municipality: e.target.value })}
                    className={`${inputClasses} w-full`}
                  />
                  <datalist id="municipalities">
                    {municipalities.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </td>
                <td className="px-4 py-3">
                  <input
                    placeholder="Zona (ex.: Centro → Praia)"
                    value={newZone.zone_name}
                    onChange={(e) => setNewZone({ ...newZone, zone_name: e.target.value })}
                    className={`${inputClasses} w-full`}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={newZone.fee}
                    onChange={(e) => setNewZone({ ...newZone, fee: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    className={`${inputClasses} w-24`}
                  />
                </td>
                <td className="px-4 py-3" colSpan={2}>
                  <Button onClick={handleCreate} disabled={creating} className="flex items-center gap-1.5">
                    <Plus size={16} />
                    {creating ? 'Adicionando...' : 'Adicionar'}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
