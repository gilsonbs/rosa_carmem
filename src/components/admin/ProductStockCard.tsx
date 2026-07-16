import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProductComponentsEditor } from './ProductComponentsEditor'
import { formatCurrency } from '@/utils/format'
import type { ProductWithStock } from '@/hooks/useAdminProducts'
import type { Component } from '@/types'

interface ProductStockCardProps {
  product: ProductWithStock
  allComponents: Component[]
  onEdit: () => void
  onDelete: () => void
  onAddComponent: (componentId: string, requiredQty: number) => Promise<void>
  onUpdateComponent: (productComponentId: string, requiredQty: number) => Promise<void>
  onRemoveComponent: (productComponentId: string) => Promise<void>
}

export function ProductStockCard({
  product,
  allComponents,
  onEdit,
  onDelete,
  onAddComponent,
  onUpdateComponent,
  onRemoveComponent,
}: ProductStockCardProps) {
  const stock = product.available_units

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-14 h-14 rounded-lg object-cover"
            />
          )}
          <div>
            <p className="font-subtitle font-semibold text-texto">{product.name}</p>
            <p className="text-rosa text-sm font-semibold">{formatCurrency(product.price)}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              <Badge tone={product.active ? 'success' : 'neutral'}>
                {product.active ? 'Ativo' : 'Inativo'}
              </Badge>
              {product.featured && <Badge tone="dourado">Destaque</Badge>}
              <Badge tone={stock > 0 ? 'rosa' : 'danger'}>
                {stock > 0 ? `${stock} disponível${stock !== 1 ? 'is' : ''}` : 'Sem estoque'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="text-texto/40 hover:text-rosa transition-colors"
            aria-label="Editar produto"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-texto/40 hover:text-red-600 transition-colors"
            aria-label="Excluir produto"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="border-t border-blush/40 pt-3">
        <p className="text-xs font-subtitle text-texto/50 mb-2 uppercase tracking-wide">Receita</p>
        <ProductComponentsEditor
          productComponents={product.product_components}
          allComponents={allComponents}
          onAdd={onAddComponent}
          onUpdateQuantity={onUpdateComponent}
          onRemove={onRemoveComponent}
        />
      </div>
    </Card>
  )
}
