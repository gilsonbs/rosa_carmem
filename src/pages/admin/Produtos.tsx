import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAdminProducts, type ProductInput, type ProductWithStock } from '@/hooks/useAdminProducts'
import { ProductForm } from '@/components/admin/ProductForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { formatCurrency } from '@/utils/format'
import type { Product } from '@/types'

export function Produtos() {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductField,
    uploadProductImage,
  } = useAdminProducts()

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  function openCreateForm() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleFormSubmit(input: ProductInput) {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, input)
        toast.success('Produto salvo com sucesso!')
      } else {
        await createProduct(input)
        toast.success('Produto salvo com sucesso!')
      }
      setFormOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto')
    }
  }

  async function handleDelete(product: ProductWithStock) {
    if (!window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) return
    try {
      const result = await deleteProduct(product.id)
      toast.success(
        result === 'deactivated'
          ? 'Este produto possui pedidos. Ele foi desativado em vez de excluído.'
          : 'Produto excluído com sucesso!',
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir produto')
    }
  }

  async function handleToggle(product: ProductWithStock, field: 'featured' | 'active', value: boolean) {
    try {
      await toggleProductField(product.id, field, value)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar produto')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-title text-texto">Produtos</h1>
        <Button onClick={openCreateForm} className="flex items-center gap-2">
          <Plus size={18} />
          Novo Produto
        </Button>
      </div>

      {loading && <p className="text-texto/60">Carregando produtos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="text-texto/60 font-body">Nenhum produto cadastrado ainda.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-blush/60 text-left text-texto/60">
                <th className="px-4 py-3 font-subtitle font-medium">Foto</th>
                <th className="px-4 py-3 font-subtitle font-medium">Nome</th>
                <th className="px-4 py-3 font-subtitle font-medium">Preço</th>
                <th className="px-4 py-3 font-subtitle font-medium">Destaque</th>
                <th className="px-4 py-3 font-subtitle font-medium">Status</th>
                <th className="px-4 py-3 font-subtitle font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-blush/30 last:border-0">
                  <td className="px-4 py-3">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-blush/40" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-texto">{product.name}</td>
                  <td className="px-4 py-3 text-texto">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={product.featured}
                      onChange={(value) => handleToggle(product, 'featured', value)}
                      label="Destaque"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.active}
                        onChange={(value) => handleToggle(product, 'active', value)}
                        label="Ativo"
                      />
                      <Badge tone={product.active ? 'success' : 'neutral'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEditForm(product)}
                        className="text-texto/40 hover:text-rosa transition-colors"
                        aria-label="Editar produto"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="text-texto/40 hover:text-red-600 transition-colors"
                        aria-label="Excluir produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
