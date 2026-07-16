import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Component, ProductComponent } from '@/types'

interface ProductComponentsEditorProps {
  productComponents: ProductComponent[]
  allComponents: Component[]
  onAdd: (componentId: string, requiredQuantity: number) => Promise<void>
  onUpdateQuantity: (productComponentId: string, requiredQuantity: number) => Promise<void>
  onRemove: (productComponentId: string) => Promise<void>
}

export function ProductComponentsEditor({
  productComponents,
  allComponents,
  onAdd,
  onUpdateQuantity,
  onRemove,
}: ProductComponentsEditorProps) {
  const [selectedComponentId, setSelectedComponentId] = useState('')
  const [requiredQty, setRequiredQty] = useState('1')
  const [adding, setAdding] = useState(false)

  const usedComponentIds = new Set(productComponents.map((pc) => pc.component_id))
  const availableToAdd = allComponents.filter((c) => !usedComponentIds.has(c.id))

  async function handleAdd() {
    if (!selectedComponentId || Number(requiredQty) < 1) return
    setAdding(true)
    try {
      await onAdd(selectedComponentId, Number(requiredQty))
      setSelectedComponentId('')
      setRequiredQty('1')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {productComponents.length === 0 && (
        <p className="text-texto/40 text-xs font-body">Nenhum componente configurado para este produto.</p>
      )}

      {productComponents.map((pc) => (
        <div key={pc.id} className="flex items-center gap-2 text-sm font-body">
          <span className="flex-1 text-texto/80 truncate">{pc.component.name}</span>
          <span className="text-texto/40 text-xs whitespace-nowrap">×</span>
          <input
            type="number"
            min="1"
            defaultValue={pc.required_quantity}
            onBlur={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1)
              if (v !== pc.required_quantity) {
                onUpdateQuantity(pc.id, v)
              }
            }}
            className="w-16 rounded-lg border border-blush/60 px-2 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <span className="text-texto/40 text-xs">por un.</span>
          <button
            type="button"
            onClick={() => onRemove(pc.id)}
            className="text-texto/30 hover:text-red-500 transition-colors"
            aria-label="Remover"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {availableToAdd.length > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="flex-1 rounded-lg border border-blush/60 px-2.5 py-1.5 text-xs font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
          >
            <option value="">Adicionar componente...</option>
            {availableToAdd.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={requiredQty}
            onChange={(e) => setRequiredQty(e.target.value)}
            className="w-14 rounded-lg border border-blush/60 px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedComponentId || adding}
            className="text-xs font-subtitle font-semibold text-rosa hover:text-rosa/70 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            + Adicionar
          </button>
        </div>
      )}
    </div>
  )
}
