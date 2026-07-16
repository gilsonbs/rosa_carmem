import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Check, X, Trash2 } from 'lucide-react'
import { useAdminProducts, type ProductInput } from '@/hooks/useAdminProducts'
import { ProductForm } from '@/components/admin/ProductForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'

export function Stock() {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    uploadProductImage,
  } = useAdminProducts()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockQty, setEditingStockQty] = useState('')

  async function handleFormSubmit(input: ProductInput) {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, input)
        toast.success('Produto atualizado')
      } else {
        await createProduct(input)
        toast.success('Produto criado')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto')
    }
  }

  async function handleSaveStock(id: string) {
    try {
      await updateStock(id, Number(editingStockQty) || 0)
      setEditingStockId(null)
      toast.success('Estoque atualizado')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar estoque')
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!window.confirm(`Excluir "${product.name}"?`)) return
    try {
      const result = await deleteProduct(product.id)
      toast.success(
        result === 'deactivated'
          ? 'Produto com pedidos: foi desativado em vez de excluído.'
          : 'Produto excluído',
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir produto')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-title text-texto">Estoque</h1>
          <p className="text-sm font-body text-texto/50 mt-0.5">
            Edite a quantidade disponível de cada produto. Quando chegar a zero, o produto sai da vitrine automaticamente.
          </p>
        </div>
        <Button
          onClick={() => { setEditingProduct(null); setFormOpen(true) }}
          className="flex items-center gap-2 shrink-0"
        >
          <Plus size={18} /> Novo produto
        </Button>
      </div>

      {loading && <p className="text-texto/60">Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-texto/60 font-body">Nenhum produto cadastrado ainda.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <Card className="divide-y divide-blush/30">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-4 px-5 py-4">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <p className="font-subtitle font-semibold text-texto truncate">{product.name}</p>
                <p className="text-sm text-rosa font-semibold">{formatCurrency(product.price)}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge tone={product.active ? 'success' : 'neutral'}>
                  {product.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingStockId === product.id ? (
                  <>
                    <input
                      type="number"
                      min="0"
                      value={editingStockQty}
                      onChange={(e) => setEditingStockQty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveStock(product.id)
                        if (e.key === 'Escape') setEditingStockId(null)
                      }}
                      autoFocus
                      className="w-20 rounded-lg border border-rosa/60 px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-rosa/40"
                    />
                    <span className="text-texto/40 text-xs">un.</span>
                    <button
                      onClick={() => handleSaveStock(product.id)}
                      className="text-green-600 hover:text-green-700"
                      aria-label="Salvar"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setEditingStockId(null)}
                      className="text-texto/40 hover:text-texto"
                      aria-label="Cancelar"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`font-semibold text-sm ${product.stock === 0 ? 'text-red-500' : 'text-texto'}`}>
                      {product.stock}
                    </span>
                    <span className="text-texto/40 text-xs">un.</span>
                    <button
                      onClick={() => {
                        setEditingStockId(product.id)
                        setEditingStockQty(String(product.stock))
                      }}
                      className="text-texto/30 hover:text-rosa transition-colors"
                      aria-label="Editar estoque"
                    >
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => { setEditingProduct(product); setFormOpen(true) }}
                className="text-xs font-subtitle text-texto/40 hover:text-rosa transition-colors shrink-0"
              >
                Editar
              </button>
              <button
                onClick={() => handleDeleteProduct(product)}
                className="text-texto/30 hover:text-red-500 transition-colors shrink-0"
                aria-label="Excluir produto"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProduct ? 'Editar produto' : 'Novo produto'}
      >
        <ProductForm
          initialProduct={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
          uploadImage={uploadProductImage}
        />
      </Modal>
    </div>
  )
}
