export const CATEGORIES = [
  { value: 'flores', label: 'Flores' },
  { value: 'cestas', label: 'Cestas' },
  { value: 'corporativo', label: 'Corporativo' },
  { value: 'personalizados', label: 'Personalizados' },
  { value: 'coffee_break', label: 'Coffee Break' },
  { value: 'pronta_entrega', label: 'Pronta Entrega' },
] as const

export type CategoryValue = (typeof CATEGORIES)[number]['value']

export function getCategoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value
}
