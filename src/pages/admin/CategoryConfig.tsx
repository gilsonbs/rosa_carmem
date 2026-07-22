import { useState } from 'react'
import toast from 'react-hot-toast'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCategoryImages } from '@/hooks/useCategoryImages'
import { CATEGORIES } from '@/utils/categories'

export function CategoryConfig() {
  const { images, loading, saving, saveImages, uploadCategoryImage } = useCategoryImages()
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState<string | null>(null)

  const current = { ...images, ...draft }

  async function handleUpload(categoryValue: string, file: File) {
    setUploading(categoryValue)
    try {
      const url = await uploadCategoryImage(file)
      setDraft((prev) => ({ ...prev, [categoryValue]: url }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar imagem')
    } finally {
      setUploading(null)
    }
  }

  function handleRemove(categoryValue: string) {
    setDraft((prev) => ({ ...prev, [categoryValue]: '' }))
  }

  async function handleSave() {
    try {
      await saveImages(current)
      setDraft({})
      toast.success('Imagens salvas!')
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  if (loading) {
    return <p className="font-body text-sm text-texto/60 p-6">Carregando...</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-title text-2xl text-texto mb-1">Imagens das Categorias</h1>
        <p className="font-body text-sm text-texto/60">
          Adicione uma foto para cada categoria. Se não houver foto, o ícone colorido será exibido.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat) => {
          const imageUrl = current[cat.value]
          const isUploading = uploading === cat.value

          return (
            <div
              key={cat.value}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-blush/40"
            >
              {/* Preview */}
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-blush/30 flex items-center justify-center">
                {imageUrl ? (
                  <img src={imageUrl} alt={cat.label} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-subtitle text-xs text-texto/40 uppercase">{cat.label[0]}</span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p className="font-subtitle text-sm uppercase tracking-wider text-texto mb-1">
                  {cat.label}
                </p>
                {imageUrl ? (
                  <p className="font-body text-xs text-texto/40 truncate">{imageUrl}</p>
                ) : (
                  <p className="font-body text-xs text-texto/40">Sem imagem — usando ícone</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => handleRemove(cat.value)}
                    title="Remover imagem"
                    className="p-1.5 rounded-lg text-texto/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
                <label
                  htmlFor={`upload-${cat.value}`}
                  className={`flex items-center gap-1.5 cursor-pointer rounded-lg border border-blush/60 px-3 py-1.5 font-subtitle text-xs uppercase tracking-wider text-texto/70 hover:border-rosa hover:text-rosa transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload size={13} />
                  {isUploading ? 'Enviando...' : 'Foto'}
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
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploading !== null}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </div>
  )
}
