import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  endOfHour,
  eachHourOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  differenceInCalendarDays,
  subMilliseconds,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type PeriodKey = 'today' | 'week' | 'month' | 'year' | 'custom'

export interface PeriodRange {
  key: PeriodKey
  start: Date
  end: Date
}

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'week', label: 'Esta semana' },
  { key: 'month', label: 'Este mês' },
  { key: 'year', label: 'Este ano' },
  { key: 'custom', label: 'Personalizado' },
]

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getPeriodRange(key: PeriodKey, customStart?: string, customEnd?: string): PeriodRange {
  const now = new Date()

  switch (key) {
    case 'today':
      return { key, start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { key, start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { key, start: startOfMonth(now), end: endOfMonth(now) }
    case 'year':
      return { key, start: startOfYear(now), end: endOfYear(now) }
    case 'custom': {
      const start = customStart ? startOfDay(parseIsoDate(customStart)) : startOfDay(now)
      const end = customEnd ? endOfDay(parseIsoDate(customEnd)) : endOfDay(now)
      return { key, start: start <= end ? start : end, end: start <= end ? end : start }
    }
  }
}

/** Período imediatamente anterior, com a mesma duração, para comparação. */
export function getPreviousPeriodRange(range: PeriodRange): PeriodRange {
  const durationMs = range.end.getTime() - range.start.getTime()
  const prevEnd = subMilliseconds(range.start, 1)
  const prevStart = new Date(prevEnd.getTime() - durationMs)
  return { key: range.key, start: prevStart, end: prevEnd }
}

export type GroupGranularity = 'hour' | 'day' | 'month'

export function getGroupGranularity(range: PeriodRange): GroupGranularity {
  if (range.key === 'today') return 'hour'
  if (range.key === 'year') return 'month'
  if (range.key === 'week' || range.key === 'month') return 'day'
  const days = differenceInCalendarDays(range.end, range.start) + 1
  return days > 31 ? 'month' : 'day'
}

export interface Bucket {
  key: string
  label: string
  date: Date
}

export function generateBuckets(range: PeriodRange, granularity: GroupGranularity): Bucket[] {
  if (granularity === 'hour') {
    return eachHourOfInterval({ start: range.start, end: range.end }).map((date) => ({
      key: format(date, 'yyyy-MM-dd HH'),
      label: `${format(date, 'HH')}h`,
      date,
    }))
  }
  if (granularity === 'month') {
    return eachMonthOfInterval({ start: range.start, end: range.end }).map((date) => ({
      key: format(date, 'yyyy-MM'),
      label: capitalize(format(date, 'MMM', { locale: ptBR })),
      date,
    }))
  }
  return eachDayOfInterval({ start: range.start, end: range.end }).map((date) => ({
    key: format(date, 'yyyy-MM-dd'),
    label: range.key === 'week' ? capitalize(format(date, 'EEE', { locale: ptBR })) : format(date, 'd'),
    date,
  }))
}

export function bucketKeyForDate(date: Date, granularity: GroupGranularity): string {
  if (granularity === 'hour') return format(date, 'yyyy-MM-dd HH')
  if (granularity === 'month') return format(date, 'yyyy-MM')
  return format(date, 'yyyy-MM-dd')
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, '')
}

export function isWithinRange(date: Date, range: PeriodRange): boolean {
  return date >= range.start && date <= range.end
}

export function formatPeriodRangeLabel(range: PeriodRange): string {
  return `${format(range.start, 'dd/MM/yyyy')} – ${format(range.end, 'dd/MM/yyyy')}`
}

/** Variação percentual do valor atual em relação ao anterior. `null` = sem base de comparação. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export interface SummaryRange {
  label: string
  start: Date
  end: Date
}

/**
 * Linhas da tabela de resumo financeiro: granularidade específica por tipo
 * de período (hora p/ hoje, semana p/ mês, mês p/ ano), com fallback para a
 * mesma granularidade dos gráficos nos demais casos.
 */
export function generateSummaryRanges(range: PeriodRange): SummaryRange[] {
  if (range.key === 'today') {
    return eachHourOfInterval({ start: range.start, end: range.end }).map((date) => ({
      label: `${format(date, 'HH')}h`,
      start: date,
      end: endOfHour(date),
    }))
  }

  if (range.key === 'year') {
    return eachMonthOfInterval({ start: range.start, end: range.end }).map((date) => ({
      label: capitalize(format(date, 'MMMM', { locale: ptBR })),
      start: startOfMonth(date) < range.start ? range.start : startOfMonth(date),
      end: endOfMonth(date) > range.end ? range.end : endOfMonth(date),
    }))
  }

  if (range.key === 'month') {
    return eachWeekOfInterval({ start: range.start, end: range.end }, { weekStartsOn: 1 }).map(
      (weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
        return {
          label: `Semana ${index + 1}`,
          start: weekStart < range.start ? range.start : weekStart,
          end: weekEnd > range.end ? range.end : weekEnd,
        }
      },
    )
  }

  const granularity = getGroupGranularity(range)
  return generateBuckets(range, granularity).map((bucket) => ({
    label: bucket.label,
    start: bucket.date,
    end: granularity === 'month' ? endOfMonth(bucket.date) : endOfDay(bucket.date),
  }))
}
