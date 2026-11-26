import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, X, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCategories, slugify, type CategoryDraft } from '@/hooks/useCategories'
import { CATEGORY_META } from '@/components/store/CategoryStrip'

interface DraftRow extends CategoryDraft {
  key: string
}

export function CategoryConfig() {
  const { categories, loading, saving, saveAll, uploadCategoryImage } = useCategories()
  const [draft, setDraft] = useState<DraftRow[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    if (!loading) {
      setDraft(
        categories.map((c) => ({ key: c.id, id: c.id, name: c.name, slug: c.slug, image_url: c.image_url })),
      )
    }
  }, [loading, categories])

  function patchRow(key: string, patch: Partial<DraftRow>) {
    setDraft((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)))
  }

  function removeCategory(row: DraftRow) {
    if (row.id && !window.confirm(`Remover "${row.name}"? Os produtos deixam de estar nessa categoria.`)) return
    setDraft((prev) => prev.filter((c) => c.key !== row.key))
  }

  function move(index: number, delta: -1 | 1) {
    setDraft((prev) => {
      const target = index + delta
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function addCategory() {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    const slug = slugify(trimmed)
    if (!slug) {
      toast.error('Nome inválido')
      return
    }
    if (draft.some((c) => c.slug === slug || c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Já existe uma categoria com esse nome')
      return
    }
    setDraft((prev) => [...prev, { key: `new-${slug}`, name: trimmed, slug, image_url: null }])
    setNewLabel('')
  }

  async function handleUpload(key: string, file: File) {
    setUploading(key)
    try {
      const url = await uploadCategoryImage(file)
      patchRow(key, { image_url: url })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  async function handleSave() {
    if (draft.some((c) => !c.name.trim())) {
      toast.error('Preencha o nome de todas as categorias')
      return
    }
    try {
      await saveAll(draft)
      toast.success('Categorias salvas!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    }
  }

  if (loading) return <p className="font-body text-sm text-texto/60 p-6">Carregando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-title text-2xl text-texto mb-1">Categorias</h1>
        <p className="font-body text-sm text-texto/60">
          Edite nomes, fotos e a ordem. As categorias aparecem no menu, nos círculos e no filtro da home.
          Para colocar um produto em uma categoria, use o cadastro em Produtos.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {draft.map((cat, index) => {
          const meta = CATEGORY_META[cat.slug]
          const isUploading = uploading === cat.key

          return (
            <div key={cat.key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blush/40">
              <div className="flex flex-col shrink-0">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  className="text-texto/30 hover:text-rosa disabled:opacity-20"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === draft.length - 1}
                  aria-label="Mover para baixo"
                  className="text-texto/30 hover:text-rosa disabled:opacity-20"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-blush/30 flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                ) : meta ? (
                  <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <meta.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                ) : (
                  <span className="font-subtitle text-xs text-texto/40 uppercase">{cat.name[0]}</span>
                )}
              </div>

              <input
                value={cat.name}
                onChange={(e) => patchRow(cat.key, { name: e.target.value })}
                className="flex-1 min-w-0 rounded-lg border border-blush/60 px-3 py-2 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa"
                placeholder="Nome da categoria"
              />

              <div className="flex items-center gap-1 shrink-0">
                {cat.image_url && (
                  <button
                    type="button"
                    onClick={() => patchRow(cat.key, { image_url: null })}
                    title="Remover foto"
                    className="p-1.5 rounded-lg text-texto/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <label
                  htmlFor={`upload-${cat.key}`}
                  className={`flex items-center gap-1 cursor-pointer rounded-lg border border-blush/60 px-2.5 py-1.5 font-subtitle text-[11px] uppercase tracking-wider text-texto/60 hover:border-rosa hover:text-rosa transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload size={12} />
                  {isUploading ? '...' : 'Foto'}
                </label>
                <input
                  id={`upload-${cat.key}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(cat.key, file)
                    e.target.value = ''
                  }}
                />

                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  title="Remover categoria"
                  className="p-1.5 rounded-lg text-texto/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          placeholder="Nome da nova categoria..."
          className="flex-1 rounded-lg border border-blush/60 px-3 py-2 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa"
        />
        <Button type="button" variant="outline" onClick={addCategory} disabled={!newLabel.trim()}>
          <Plus size={16} />
          Adicionar
        </Button>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploading !== null}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}
