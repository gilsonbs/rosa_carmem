import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, X, Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useDynamicCategories, slugify, type DynamicCategory } from '@/hooks/useDynamicCategories'
import { CATEGORY_META } from '@/components/store/CategoryStrip'

export function CategoryConfig() {
  const { categories, loading, saving, saveCategories, uploadCategoryImage } = useDynamicCategories()
  const [draft, setDraft] = useState<DynamicCategory[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')

  useEffect(() => {
    if (!loading) setDraft(categories)
  }, [loading, categories])

  function updateLabel(value: string, label: string) {
    setDraft((prev) => prev.map((c) => (c.value === value ? { ...c, label } : c)))
  }

  function removeCategory(value: string) {
    setDraft((prev) => prev.filter((c) => c.value !== value))
  }

  function addCategory() {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    const value = slugify(trimmed)
    if (draft.some((c) => c.value === value)) {
      toast.error('Já existe uma categoria com esse nome')
      return
    }
    setDraft((prev) => [...prev, { value, label: trimmed }])
    setNewLabel('')
  }

  async function handleUpload(catValue: string, file: File) {
    setUploading(catValue)
    try {
      const url = await uploadCategoryImage(file)
      setDraft((prev) => prev.map((c) => (c.value === catValue ? { ...c, image: url } : c)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  function removeImage(catValue: string) {
    setDraft((prev) => prev.map((c) => (c.value === catValue ? { ...c, image: undefined } : c)))
  }

  async function handleSave() {
    const invalid = draft.some((c) => !c.label.trim())
    if (invalid) { toast.error('Preencha o nome de todas as categorias'); return }
    try {
      await saveCategories(draft)
      toast.success('Categorias salvas!')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  if (loading) return <p className="font-body text-sm text-texto/60 p-6">Carregando...</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-title text-2xl text-texto mb-1">Categorias</h1>
        <p className="font-body text-sm text-texto/60">
          Edite os nomes, adicione fotos ou crie novas categorias. As categorias aparecem no menu e nos círculos da home.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {draft.map((cat) => {
          const meta = CATEGORY_META[cat.value]
          const isUploading = uploading === cat.value

          return (
            <div key={cat.value} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blush/40">
              {/* Drag handle placeholder */}
              <GripVertical size={16} className="text-texto/20 shrink-0" />

              {/* Circle preview */}
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-blush/30 flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                ) : meta ? (
                  <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}>
                    <meta.icon size={18} className="text-white" strokeWidth={1.5} />
                  </div>
                ) : (
                  <span className="font-subtitle text-xs text-texto/40 uppercase">{cat.label[0]}</span>
                )}
              </div>

              {/* Name input */}
              <input
                value={cat.label}
                onChange={(e) => updateLabel(cat.value, e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-blush/60 px-3 py-2 font-body text-sm text-texto focus:outline-none focus:ring-2 focus:ring-rosa/40 focus:border-rosa"
                placeholder="Nome da categoria"
              />

              {/* Photo actions */}
              <div className="flex items-center gap-1 shrink-0">
                {cat.image && (
                  <button
                    type="button"
                    onClick={() => removeImage(cat.value)}
                    title="Remover foto"
                    className="p-1.5 rounded-lg text-texto/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
                <label
                  htmlFor={`upload-${cat.value}`}
                  className={`flex items-center gap-1 cursor-pointer rounded-lg border border-blush/60 px-2.5 py-1.5 font-subtitle text-[11px] uppercase tracking-wider text-texto/60 hover:border-rosa hover:text-rosa transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload size={12} />
                  {isUploading ? '...' : 'Foto'}
                </label>
                <input
                  id={`upload-${cat.value}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(cat.value, file)
                    e.target.value = ''
                  }}
                />

                {/* Remove category */}
                <button
                  type="button"
                  onClick={() => removeCategory(cat.value)}
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

      {/* Add new category */}
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
