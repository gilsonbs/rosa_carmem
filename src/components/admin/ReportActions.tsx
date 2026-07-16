import { Printer, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReportActionsProps {
  onExportCsv: () => void
}

export function ReportActions({ onExportCsv }: ReportActionsProps) {
  return (
    <div className="flex gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-2">
        <Printer size={16} /> Imprimir relatório
      </Button>
      <Button size="sm" onClick={onExportCsv} className="flex items-center gap-2">
        <Download size={16} /> Exportar CSV
      </Button>
    </div>
  )
}
