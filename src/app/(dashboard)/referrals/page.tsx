'use client'

import { motion } from 'framer-motion'
import { ArrowRightLeft, MapPin, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react'

const mockReferrals = [
  { id: 1, patient: 'Carmen Rojas Díaz', mrn: 'EXP-2026-002', destination: 'Hospital Regional de Bilwi', reason: 'Preeclampsia severa - Riesgo alto', date: '2026-06-01', status: 'active' },
  { id: 2, patient: 'Julia López', mrn: 'EXP-2026-003', destination: 'Centro de Salud Siuna', reason: 'Seguimiento postparto complicado', date: '2026-05-28', status: 'completed' },
]

export default function ReferralsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referencias Médicas</h1>
          <p className="text-muted-foreground mt-1">Traslados y derivaciones a otros centros de salud.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}>
          <Plus className="w-4 h-4" /> Nueva Referencia
        </button>
      </div>

      <div className="space-y-4">
        {mockReferrals.map((ref, i) => (
          <motion.div key={ref.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: ref.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                  <ArrowRightLeft className={`w-5 h-5 ${ref.status === 'active' ? 'text-red-500' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-lg">{ref.patient}</div>
                  <div className="text-xs text-muted-foreground mb-2">{ref.mrn}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-foreground">{ref.destination}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{ref.reason}</p>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0">
                {ref.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5" /> En curso
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" /> Completada
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {ref.date}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
