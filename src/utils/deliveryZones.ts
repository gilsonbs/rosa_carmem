import type { DeliveryZone } from '@/types'

export function normalizePlace(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Remove sufixos que o ViaCEP coloca no bairro, ex.: "Aquarius (Tamoios)" → "Aquarius". */
function stripDistrict(bairro: string): string {
  return bairro.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

/**
 * Regiões que o ViaCEP não devolve com o nome usado nas zonas.
 * Chave = município da zona (normalizado). Retorna true se o endereço pertence a ele.
 *  - Unamar: o ViaCEP devolve cidade "Cabo Frio" e bairro "… (Tamoios)" (2º distrito).
 */
const SPECIAL_RULES: Record<string, (city: string, bairro: string) => boolean> = {
  unamar: (city, bairro) =>
    city === 'cabo frio' && (bairro.includes('(tamoios)') || bairro.includes('unamar') || bairro.includes('tamoios')),
}

export type ZoneMatchStatus = 'no_address' | 'matched' | 'out_of_area'

export interface ZoneMatch {
  status: ZoneMatchStatus
  /** Zonas que o cliente pode escolher para esse endereço. */
  zones: DeliveryZone[]
  /** Zona escolhida automaticamente (única opção ou bairro igual ao nome da zona). */
  autoZoneId: string | null
}

/**
 * Descobre quais zonas valem para a cidade/bairro do endereço (vindos do ViaCEP).
 * Correspondência por bairro/regra especial tem prioridade sobre a por cidade —
 * assim "Casimiro de Abreu / Barra de São João" cai em Barra de São João, não em Casimiro.
 */
export function matchDeliveryZones(zones: DeliveryZone[], cityRaw: string, bairroRaw: string): ZoneMatch {
  const city = normalizePlace(cityRaw)
  const bairro = normalizePlace(bairroRaw)

  if (!city) return { status: 'no_address', zones, autoZoneId: null }

  const municipalities = [...new Set(zones.map((z) => z.municipality))]
  const specific: string[] = []
  const byCity: string[] = []

  for (const m of municipalities) {
    const key = normalizePlace(m)
    const special = SPECIAL_RULES[key]
    if ((special && special(city, bairro)) || (bairro && bairro.includes(key))) {
      specific.push(m)
    } else if (city === key || city.startsWith(`${key} `)) {
      // "casimiro de abreu".startsWith("casimiro ")
      byCity.push(m)
    }
  }

  const chosen = specific.length > 0 ? specific : byCity
  if (chosen.length === 0) return { status: 'out_of_area', zones: [], autoZoneId: null }

  const allowed = zones.filter((z) => chosen.includes(z.municipality))

  let autoZoneId: string | null = null
  if (allowed.length === 1) {
    autoZoneId = allowed[0].id
  } else if (bairro) {
    const plainBairro = normalizePlace(stripDistrict(bairroRaw))
    const exact = allowed.filter((z) => normalizePlace(z.zone_name) === plainBairro)
    if (exact.length === 1) autoZoneId = exact[0].id
  }

  return { status: 'matched', zones: allowed, autoZoneId }
}
