export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11)

  if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1')
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d*)/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3')
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3')
}

export function maskCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8)

  if (digits.length <= 5) return digits
  return digits.replace(/^(\d{5})(\d*)/, '$1-$2')
}
