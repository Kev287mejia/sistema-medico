'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const mockAlerts = [
  { id: 1, patient: 'Carmen Rojas Díaz', mrn: 'EXP-2026-002', severity: 'critical', message: 'Presión arterial 160/110 mmHg – Preeclampsia severa detectada. Evaluación urgente requerida.', time: 'Hace 2 horas', resolved: false },
  { id: 2, patient: 'Ana Martínez Vega', mrn: 'EXP-2026-004', severity: 'warning', message: 'Pérdida de peso: 2kg en último control (sem. 14). Requiere seguimiento nutricional.', time: 'Hace 1 día', resolved: false },
  { id: 3, patient: 'Julia López', mrn: 'EXP-2026-003', severity: 'info', message: 'FCF registrada en 158 bpm, ligeramente elevada. Monitorear en próximo control.', time: 'Hace 3 días', resolved: true },
]

const severityConfig: Record<string, { border: string; bg: string; icon: any; iconColor: string; label: string }> = {
  critical: { border: 'border-red-200',    bg: 'bg-red-50',    icon: AlertTriangle, iconColor: 'text-red-500',    label: 'Crítica' },
  warning:  { border: 'border-amber-200',  bg: 'bg-amber-50',  icon: AlertCircle,  iconColor: 'text-amber-500',  label: 'Advertencia' },
  info:     { border: 'border-blue-200',   bg: 'bg-blue-50',   icon: AlertCircle,  iconColor: 'text-blue-400',   label: 'Informativa' },
}

export default function AlertsPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alertas de Riesgo</h1>
        <p className="text-muted-foreground mt-1">Notificaciones automáticas del sistema sobre signos de alarma materna.</p>
      </div>

      <div className="space-y-4">
        {mockAlerts.map((alert, i) => {
          const cfg = severityConfig[alert.severity]
          const Icon = cfg.icon
          return (
            <motion.div key={alert.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`border rounded-2xl p-5 shadow-sm ${cfg.border} ${alert.resolved ? 'opacity-60' : ''}`}
              style={{ background: alert.resolved ? '#f8fafc' : undefined }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-foreground">{alert.patient}</span>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{alert.mrn}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cfg.border} ${cfg.bg} ${cfg.iconColor}`}>
                      {cfg.label}
                    </span>
                    {alert.resolved && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                        <CheckCircle className="w-3 h-3" /> Resuelta
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground mt-2 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
