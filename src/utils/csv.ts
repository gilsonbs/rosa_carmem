import Papa from 'papaparse'

export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  const csv = Papa.unparse(rows)
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Concatena múltiplas seções (cada uma com título + linhas) em um único CSV. */
export function downloadMultiSectionCsv(
  filename: string,
  sections: { title: string; rows: Record<string, unknown>[] }[],
): void {
  const parts = sections.map(({ title, rows }) => `${title}\n${Papa.unparse(rows)}`)
  const csv = parts.join('\n\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
