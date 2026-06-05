'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, MapPin, Clock, CheckCircle, AlertTriangle, Plus, User, Hospital, FileText, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'


export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([])
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [patientId, setPatientId] = useState('')
  const [destination, setDestination] = useState('')
  const [reason, setReason] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('referrals').select(`
        *,
        patients (first_name, last_name, mrn)
      `).order('referral_date', { ascending: false })

      if (data) {
        const mapped = data.map((r: any) => ({
          id: r.id,
          patient: `${r.patients?.first_name} ${r.patients?.last_name}`,
          mrn: r.patients?.mrn,
          destination: r.destination_facility,
          reason: r.reason,
          date: r.referral_date,
          status: r.status === 'in_progress' ? 'active' : r.status
        }))
        setReferrals(mapped)
      }

      const { data: pData } = await supabase.from('patients').select('id, first_name, last_name, mrn').is('deleted_at', null)
      if (pData) setPatientsList(pData)
      setIsLoading(false)
    }
    loadData()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !destination || !reason) return

    setIsSaving(true)
    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('referrals').insert({
      patient_id: patientId,
      destination_facility: destination,
      reason,
      status: 'in_progress',
      referral_date: new Date().toISOString().split('T')[0],
      referred_by: userData.user?.id
    }).select(`*, patients(first_name, last_name, mrn)`).single()

    if (!error && data) {
      const newRef = {
        id: data.id,
        patient: `${(data.patients as any)?.first_name} ${(data.patients as any)?.last_name}`,
        mrn: (data.patients as any)?.mrn,
        destination: data.destination_facility,
        reason: data.reason,
        date: data.referral_date,
        status: 'active',
      }
      setReferrals(prev => [newRef, ...prev])
      toast.success(`Referencia creada exitosamente`)
      setIsOpen(false)
      setPatientId(''); setDestination(''); setReason('')
    } else {
      toast.error('Error al crear la referencia')
    }
    setIsSaving(false)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-foreground">Referencias Médicas</h1>
          <p className="text-muted-foreground mt-1">Traslados y derivaciones a otros centros de salud.</p>
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
          >
            <Plus className="w-4 h-4" /> Nueva Referencia
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l-0 shadow-floating glass-panel rounded-l-[2rem]">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-3xl font-bold font-heading text-foreground">Nueva Referencia</SheetTitle>
              <SheetDescription className="text-sm">
                Inicia un trámite de traslado para un paciente.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Paciente */}
              <div className="space-y-2.5">
                <Label htmlFor="patient" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paciente</Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <Select value={patientId} onValueChange={(v) => setPatientId(v || '')} required>
                    <SelectTrigger id="patient" className="pl-14 py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus:ring-primary/20 text-base">
                      <SelectValue placeholder="Selecciona la paciente" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl glass-panel shadow-floating border-0">
                      {patientsList.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.mrn})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Destino */}
              <div className="space-y-2.5">
                <Label htmlFor="destination" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Centro de Destino</Label>
                <Select value={destination} onValueChange={(v) => setDestination(v || '')} required>
                  <SelectTrigger id="destination" className="py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus:ring-primary/20 text-base">
                    <SelectValue placeholder="Selecciona un hospital" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl glass-panel shadow-floating border-0">
                    <SelectItem value="Hospital Regional de Bilwi">Hospital Regional de Bilwi</SelectItem>
                    <SelectItem value="Centro de Salud Siuna">Centro de Salud Siuna</SelectItem>
                    <SelectItem value="Hospital Alemán Nicaragüense">Hospital Alemán Nicaragüense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Motivo */}
              <div className="space-y-2.5">
                <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motivo Clínico</Label>
                <div className="relative">
                  <div className="absolute left-3.5 top-4 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    id="reason"
                    required
                    placeholder="Ej. Preeclampsia severa..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 rounded-2xl bg-white/50 border border-white/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-base min-h-[120px] resize-none"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-soft hover:-translate-y-0.5 active:translate-y-0"
                  style={{ background: 'linear-gradient(135deg, #064E3B, #115E59)' }}
                >
                  {isSaving
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                    : <><ArrowRightLeft className="w-5 h-5" /> Emitir Referencia</>
                  }
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            <span className="text-sm">Cargando referencias...</span>
          </div>
        ) : referrals.length > 0 ? (
          <AnimatePresence>
            {referrals.map((ref, i) => (
              <motion.div key={ref.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: i * 0.08 }}
                className="glass-panel shadow-soft border-0 rounded-3xl p-6 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: ref.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)' }}>
                      <ArrowRightLeft className={`w-6 h-6 ${ref.status === 'active' ? 'text-red-500' : 'text-emerald-500'}`} />
                    </div>
                    <div>
                      <div className="font-bold font-heading text-foreground text-xl">{ref.patient}</div>
                      <div className="text-xs text-muted-foreground mb-3">{ref.mrn}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Hospital className="w-4 h-4 text-primary" />
                        <span className="font-bold text-foreground">{ref.destination}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{ref.reason}</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 mt-4 sm:mt-0">
                    {ref.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-100 shadow-sm">
                        <AlertTriangle className="w-4 h-4" /> En curso
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                        <CheckCircle className="w-4 h-4" /> Completada
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" /> {ref.date}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ArrowRightLeft className="w-8 h-8 opacity-30" />
            <span className="text-sm">No se encontraron referencias.</span>
          </div>
        )}
      </div>
    </div>
  )
}
