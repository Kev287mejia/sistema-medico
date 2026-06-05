'use client'

import { FileText, Download, Calendar, Users, Baby, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

const reportTypes = [
  { icon: Users, title: 'Reporte de Pacientes', description: 'Listado completo de pacientes registradas en el período seleccionado.', color: '#1e3a8a' },
  { icon: Baby, title: 'Controles Prenatales', description: 'Resumen estadístico de todos los controles prenatales realizados.', color: '#0d9488' },
  { icon: BarChart3, title: 'Indicadores Perinatales', description: 'Tasas de mortalidad, morbilidad materna e indicadores MINSA.', color: '#10b981' },
  { icon: FileText, title: 'Expedientes Completos', description: 'Exportar expedientes individuales o en lote en formato PDF.', color: '#7c3aed' },
]

export default function ReportsPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">Generación de informes estadísticos y exportación de datos clínicos.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {reportTypes.map((report, i) => {
          const Icon = report.icon
          return (
            <motion.div key={report.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${report.color}18` }}>
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{report.title}</div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{report.description}</p>
                  <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold group-hover:gap-3 transition-all"
                    style={{ color: report.color }}>
                    <Download className="w-3.5 h-3.5" /> Generar Reporte
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Date Selector Mockup */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Filtro de Período
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <input type="date" className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <input type="date" className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>
    </div>
  )
}
