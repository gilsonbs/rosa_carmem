import { useState, type ChangeEvent, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import type { ProductInput } from '@/hooks/useAdminProducts'
import type { Product } from '@/types'
import { useCategories } from '@/hooks/useCategories'

interface ProductFormProps {
  initialProduct?: Product | null
  onSubmit: (input: ProductInput) => Promise<void>
  onCancel: () => void
  uploadImage: (file: File) => Promise<string>
}

const inputClasses =
  'w-full rounded-lg border border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa'
const labelClasses = 'block font-subtitle text-sm text-texto/80 mb-1.5'

export function ProductForm({ initialProduct, onSubmit, onCancel, uploadImage }: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? '')
  const [description, setDescription] = useState(initialProduct?.description ?? '')
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '')
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url ?? '')
  const { categories, loading: categoriesLoading } = useCategories()
  const [categoryIds, setCategoryIds] = useState<string[]>(initialProduct?.category_ids ?? [])
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false)
  const [active, setActive] = useState(initialProduct?.active ?? true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setImageUrl(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function toggleCategory(id: string, checked: boolean) {
    setCategoryIds((prev) => (checked ? [...prev, id] : prev.filter((c) => c !== id)))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const numericPrice = Number(price)
    if (!name.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        price: numericPrice,
        image_url: imageUrl.trim() || null,
        featured,
        active,
        // Ignora IDs de categorias que foram excluídas nesse meio-tempo.
        category_ids: categoryIds.filter((id) => categories.some((c) => c.id === id)),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClasses} htmlFor="name">
          Nome
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="description">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClasses}
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="price">
          Preço (R$)
        </label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClasses}
          required
        />
      </div>
      <div>
        <label className={labelClasses} htmlFor="image_file">
          Foto do produto
        </label>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <img src={imageUrl} alt="Prévia" className="w-14 h-14 rounded-lg object-cover shrink-0" />
          )}
          <label
            htmlFor="image_file"
            className="flex-1 cursor-pointer rounded-lg border border-dashed border-blush/60 px-3.5 py-2.5 font-body text-sm text-texto/60 text-center hover:border-rosa hover:text-rosa transition-colors"
          >
            {uploading ? 'Enviando...' : 'Clique para escolher uma foto'}
          </label>
          <input
            id="image_file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={`${inputClasses} mt-2`}
          placeholder="ou cole a URL da imagem"
        />
      </div>
      <fieldset>
        <legend className={labelClasses}>Categorias</legend>
        {categoriesLoading ? (
          <p className="text-xs text-texto/50 font-body">Carregando categorias...</p>
        ) : categories.length === 0 ? (
          <p className="text-xs text-texto/50 font-body">
            Nenhuma categoria cadastrada. Crie em Admin → Categorias.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const checked = categoryIds.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-subtitle transition-colors ${
                    checked
                      ? 'border-rosa bg-rosa/10 text-rosa'
                      : 'border-blush/60 text-texto/70 hover:border-rosa/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleCategory(cat.id, e.target.checked)}
                    className="accent-rosa"
                  />
                  {cat.name}
                </label>
              )
            })}
          </div>
        )}
      </fieldset>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm font-body text-texto/80">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm font-body text-texto/80">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Ativo
        </label>
      </div>
      <div className="flex gap-3 mt-2">
        <Button type="submit" disabled={submitting || uploading} className="flex-1">
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting || uploading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
