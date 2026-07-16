import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Component } from '@/types'

export function useComponents() {
  const [components, setComponents] = useState<Component[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComponents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setComponents(data as Component[])
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchComponents()
  }, [fetchComponents])

  async function createComponent(name: string, quantity: number): Promise<Component> {
    const { data, error } = await supabase
      .from('components')
      .insert({ name: name.trim(), quantity })
      .select('*')
      .single()

    if (error) throw new Error(error.message)
    const comp = data as Component
    setComponents((prev) => [...prev, comp].sort((a, b) => a.name.localeCompare(b.name)))
    return comp
  }

  async function updateComponentQuantity(id: string, quantity: number) {
    const { error } = await supabase.from('components').update({ quantity }).eq('id', id)
    if (error) throw new Error(error.message)
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, quantity } : c)))
  }

  async function deleteComponent(id: string) {
    const { error } = await supabase.from('components').delete().eq('id', id)
    if (error) throw new Error(error.message)
    setComponents((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    components,
    loading,
    error,
    createComponent,
    updateComponentQuantity,
    deleteComponent,
    refetch: fetchComponents,
  }
}
