'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Search, User, Stethoscope, CheckCircle, XCircle, AlertCircle, X, Loader2 } from 'lucide-react'
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


const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
  confirmed: { label: 'Confirmada', icon: CheckCircle, classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  pending:   { label: 'Pendiente',  icon: AlertCircle, classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  cancelled: { label: 'Cancelada',  icon: XCircle,     classes: 'bg-red-50 text-red-700 border-red-100' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Form state
  const [patientId, setPatientId] = useState('')
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('appointments').select(`
        *,
        patients (first_name, last_name, mrn)
      `).order('appointment_date', { ascending: true })
      
      if (data) {
        const mapped = data.map((a: any) => ({
          id: a.id,
          patient: `${a.patients?.first_name} ${a.patients?.last_name}`,
          mrn: a.patients?.mrn,
          doctor: 'Dr/Dra. General',
          date: a.appointment_date,
          time: a.appointment_time,
          type: a.type === 'prenatal_control' ? 'Control Prenatal' : a.type === 'ultrasound' ? 'Ultrasonido' : a.type === 'emergency' ? 'Urgencia Obstétrica' : 'Consulta General',
          status: a.status
        }))
        setAppointments(mapped)
      }

      const { data: pData } = await supabase.from('patients').select('id, first_name, last_name, mrn').is('deleted_at', null)
      if (pData) setPatientsList(pData)
      setIsLoading(false)
    }
    loadData()
  }, [supabase])

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !date || !time || !type) return

    setIsSaving(true)

    let typeEnum = 'general'
    if (type === 'Control Prenatal') typeEnum = 'prenatal_control'
    if (type === 'Ultrasonido') typeEnum = 'ultrasound'
    if (type === 'Urgencia Obstétrica') typeEnum = 'emergency'

    const { data: userData } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('appointments').insert({
      patient_id: patientId,
      appointment_date: date,
      appointment_time: time,
      type: typeEnum as any,
      status: 'pending',
      created_by: userData.user?.id
    }).select(`*, patients(first_name, last_name, mrn)`).single()

    if (!error && data) {
      const newAppt = {
        id: data.id,
        patient: `${(data.patients as any)?.first_name} ${(data.patients as any)?.last_name}`,
        mrn: (data.patients as any)?.mrn,
        doctor: 'Dr/Dra. General',
        date: data.appointment_date,
        time: data.appointment_time,
        type: type,
        status: data.status,
      }
      setAppointments(prev => [newAppt, ...prev])
      toast.success(`Cita agendada exitosamente`)
      setIsOpen(false)
      setPatientId(''); setDoctor(''); setDate(''); setTime(''); setType('')
    } else {
      toast.error('Error al agendar cita')
    }
    setIsSaving(false)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold font-heading text-foreground">Citas Médicas</h1>
          <p className="text-muted-foreground mt-1">Agenda y gestión de citas programadas.</p>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
          >
            <Plus className="w-4 h-4" /> Nueva Cita
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto border-l-0 shadow-floating glass-panel rounded-l-[2rem]">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-3xl font-bold font-heading text-foreground">Nueva Cita</SheetTitle>
              <SheetDescription className="text-sm">
                Agenda un nuevo espacio en el calendario médico.
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

              {/* Doctor */}
              <div className="space-y-2.5">
                <Label htmlFor="doctor" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Especialista</Label>
                <Select value={doctor} onValueChange={(v) => setDoctor(v || '')} required>
                  <SelectTrigger id="doctor" className="py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus:ring-primary/20 text-base">
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl glass-panel shadow-floating border-0">
                    <SelectItem value="Dr. López">Dr. López (Obstetricia)</SelectItem>
                    <SelectItem value="Dra. García">Dra. García (General)</SelectItem>
                    <SelectItem value="Dr. Ruiz">Dr. Ruiz (Ecografía)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de cita */}
              <div className="space-y-2.5">
                <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Motivo</Label>
                <Select value={type} onValueChange={(v) => setType(v || '')} required>
                  <SelectTrigger id="type" className="py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus:ring-primary/20 text-base">
                    <SelectValue placeholder="Razón de la consulta" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl glass-panel shadow-floating border-0">
                    <SelectItem value="Control Prenatal">Control Prenatal</SelectItem>
                    <SelectItem value="Ultrasonido">Ultrasonido</SelectItem>
                    <SelectItem value="Consulta General">Consulta General</SelectItem>
                    <SelectItem value="Urgencia Obstétrica">Urgencia Obstétrica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus-visible:ring-primary/20 text-base"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="py-6 rounded-2xl bg-white/50 border-white/40 shadow-sm focus-visible:ring-primary/20 text-base"
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
                    : <><Calendar className="w-5 h-5" /> Agendar en Calendario</>
                  }
                </button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Appointment cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {isLoading ? (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <span className="text-sm">Cargando citas...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((appt, i) => {
              const cfg = statusConfig[appt.status] || statusConfig.pending
              const Icon = cfg.icon
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel shadow-soft border-0 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {appt.patient.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold font-heading text-lg text-foreground">{appt.patient}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{appt.doctor}</span>
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{appt.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Fecha</div>
                      <div className="font-medium text-sm text-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {appt.date}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Hora</div>
                      <div className="font-medium text-sm text-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> {appt.time}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.classes}`}>
                      <Icon className="w-3.5 h-3.5" />{cfg.label}
                    </span>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Search className="w-8 h-8 opacity-30" />
              <span className="text-sm">No se encontraron citas.</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
