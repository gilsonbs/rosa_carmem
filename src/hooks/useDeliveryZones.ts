import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DeliveryZone } from '@/types'

/** Zonas de entrega. `onlyActive` = vitrine/checkout; admin usa todas. */
export function useDeliveryZones(onlyActive = true) {
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchZones = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('delivery_zones')
      .select('*')
      .order('display_order', { ascending: true })
      .order('zone_name', { ascending: true })
    if (onlyActive) query = query.eq('active', true)

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setZones(((data ?? []) as DeliveryZone[]).map((z) => ({ ...z, fee: Number(z.fee) })))
      setError(null)
    }
    setLoading(false)
  }, [onlyActive])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  async function updateZone(id: string, patch: Partial<Omit<DeliveryZone, 'id' | 'created_at'>>) {
    const { data, error } = await supabase.from('delivery_zones').update(patch).eq('id', id).select('id')
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) throw new Error('Sem permissão para alterar zonas')
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)))
  }

  async function createZone(input: Pick<DeliveryZone, 'municipality' | 'zone_name' | 'fee'>) {
    const nextOrder = zones.reduce((max, z) => Math.max(max, z.display_order ?? 0), 0) + 1
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert({ ...input, display_order: nextOrder })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    setZones((prev) => [...prev, { ...(data as DeliveryZone), fee: Number(data.fee) }])
  }

  return { zones, loading, error, refetch: fetchZones, updateZone, createZone }
}

/** Agrupa zonas por município preservando a ordem de exibição. */
export function groupZonesByMunicipality(zones: DeliveryZone[]): Array<[string, DeliveryZone[]]> {
  const groups = new Map<string, DeliveryZone[]>()
  for (const z of zones) {
    if (!groups.has(z.municipality)) groups.set(z.municipality, [])
    groups.get(z.municipality)!.push(z)
  }
  return [...groups.entries()]
}
