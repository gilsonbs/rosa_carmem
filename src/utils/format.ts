import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy'): string {
  return format(typeof date === 'string' ? new Date(date) : date, pattern, {
    locale: ptBR,
  })
}

/**
 * Formata uma data no formato "YYYY-MM-DD" (ex.: vinda de um <input
 * type="date"> ou de uma coluna `date` do Postgres) sem o deslocamento de
 * fuso horário que `new Date("YYYY-MM-DD")` introduz (ela é interpretada
 * como UTC meia-noite).
 */
export function formatIsoDate(iso: string, pattern = 'dd/MM/yyyy'): string {
  const [year, month, day] = iso.split('-').map(Number)
  return formatDate(new Date(year, month - 1, day), pattern)
}

/** Data de hoje no formato "YYYY-MM-DD", em horário local (não UTC). */
export function getTodayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

/** Desloca uma data ISO "YYYY-MM-DD" em N dias (aceita negativo). */
export function shiftIsoDate(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}
