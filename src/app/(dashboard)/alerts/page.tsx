'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const severityConfig: Record<string, { border: string; bg: string; icon: any; iconColor: string; label: string }> = {
  critical: { border: 'border-red-200',    bg: 'bg-red-50',    icon: AlertTriangle, iconColor: 'text-red-500',    label: 'Crítica' },
  warning:  { border: 'border-amber-200',  bg: 'bg-amber-50',  icon: AlertCircle,  iconColor: 'text-amber-500',  label: 'Advertencia' },
  info:     { border: 'border-blue-200',   bg: 'bg-blue-50',   icon: AlertCircle,  iconColor: 'text-blue-400',   label: 'Informativa' },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadAlerts() {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          patients (first_name, last_name, mrn)
        `)
        .order('created_at', { ascending: false })
      
      if (data) {
        setAlerts(data)
      }
      setIsLoading(false)
    }
    loadAlerts()
  }, [supabase])

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alertas de Riesgo</h1>
        <p className="text-muted-foreground mt-1">Notificaciones automáticas del sistema sobre signos de alarma materna.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-2xl text-muted-foreground">
          No hay alertas registradas.
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, i) => {
            const cfg = severityConfig[alert.severity] || severityConfig.info
            const Icon = cfg.icon
            return (
              <motion.div key={alert.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`border rounded-2xl p-5 shadow-sm ${cfg.border} ${alert.is_resolved ? 'opacity-60' : ''}`}
                style={{ background: alert.is_resolved ? '#f8fafc' : undefined }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-foreground">{alert.patients?.first_name} {alert.patients?.last_name}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{alert.patients?.mrn}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${cfg.border} ${cfg.bg} ${cfg.iconColor}`}>
                        {cfg.label}
                      </span>
                      {alert.is_resolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          <CheckCircle className="w-3 h-3" /> Resuelta
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground mt-2 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                      <Clock className="w-3 h-3" /> Hace {formatDistanceToNow(new Date(alert.created_at), { locale: es })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
