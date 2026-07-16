import { useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { StockItem } from '@/types'

interface StockItemsEditorProps {
  items: StockItem[]
  onQuantityChange: (stockItemId: string, quantity: number) => void
  onDelete: (stockItemId: string) => void
  onCreate: (itemName: string, quantity: number) => void
}

export function StockItemsEditor({ items, onQuantityChange, onDelete, onCreate }: StockItemsEditorProps) {
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('0')

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newItemName.trim()) return
    onCreate(newItemName.trim(), Math.max(0, Number(newItemQuantity) || 0))
    setNewItemName('')
    setNewItemQuantity('0')
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length === 0 && (
        <p className="text-texto/40 text-xs font-body">Nenhum item de estoque cadastrado.</p>
      )}
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 text-sm font-body">
          <span className="flex-1 text-texto/80">{item.item_name}</span>
          <input
            type="number"
            min="0"
            defaultValue={item.quantity}
            onBlur={(e) => onQuantityChange(item.id, Math.max(0, Number(e.target.value) || 0))}
            className="w-20 rounded-lg border border-blush/60 px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-rosa/40"
          />
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="text-texto/40 hover:text-red-600 transition-colors"
            aria-label={`Remover ${item.item_name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <form onSubmit={handleAdd} className="flex items-center gap-2 mt-1">
        <input
          type="text"
          placeholder="Novo item (ex: Rosas vermelhas)"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="flex-1 rounded-lg border border-blush/60 px-2.5 py-1.5 text-sm font-body focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        <input
          type="number"
          min="0"
          value={newItemQuantity}
          onChange={(e) => setNewItemQuantity(e.target.value)}
          className="w-20 rounded-lg border border-blush/60 px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-rosa/40"
        />
        <button
          type="submit"
          className="text-rosa hover:text-rosa/70 transition-colors"
          aria-label="Adicionar item"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  )
}
