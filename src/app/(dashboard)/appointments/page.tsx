'use client'

import { useState } from 'react'
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

const initialAppointments = [
  { id: 1, patient: 'María Elena Flores', mrn: 'EXP-2026-001', doctor: 'Dr. López', date: '2026-06-05', time: '09:00', type: 'Control Prenatal', status: 'confirmed' },
  { id: 2, patient: 'Carmen Rojas Díaz',  mrn: 'EXP-2026-002', doctor: 'Dr. López', date: '2026-06-05', time: '11:30', type: 'Ultrasonido',       status: 'confirmed' },
  { id: 3, patient: 'Ana Martínez Vega',  mrn: 'EXP-2026-004', doctor: 'Dra. García', date: '2026-06-06', time: '08:00', type: 'Control Prenatal', status: 'pending' },
  { id: 4, patient: 'Luisa Picado',       mrn: 'EXP-2026-005', doctor: 'Dra. García', date: '2026-06-06', time: '10:00', type: 'Consulta General', status: 'cancelled' },
]

const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
  confirmed: { label: 'Confirmada', icon: CheckCircle, classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  pending:   { label: 'Pendiente',  icon: AlertCircle, classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  cancelled: { label: 'Cancelada',  icon: XCircle,     classes: 'bg-red-50 text-red-700 border-red-100' },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [patient, setPatient] = useState('')
  const [doctor, setDoctor] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient || !doctor || !date || !time || !type) return

    setIsSaving(true)
    await new Promise(r => setTimeout(r, 800))

    const newAppt = {
      id: Date.now(),
      patient,
      mrn: `EXP-2026-00${appointments.length + 1}`,
      doctor,
      date,
      time,
      type,
      status: 'pending',
    }

    setAppointments(prev => [newAppt, ...prev])
    toast.success(`Cita agendada para ${patient}`)
    setIsOpen(false)
    setIsSaving(false)
    setPatient(''); setDoctor(''); setDate(''); setTime(''); setType('')
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Citas Médicas</h1>
          <p className="text-muted-foreground mt-1">Agenda y gestión de citas programadas.</p>
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
            >
              <Plus className="w-4 h-4" /> Nueva Cita
            </button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Agendar Nueva Cita</SheetTitle>
              <SheetDescription>
                Completa los datos para registrar la cita en el sistema.
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSave} className="space-y-5 mt-6">
              {/* Paciente */}
              <div className="space-y-2">
                <Label htmlFor="patient">Nombre de la Paciente</Label>
                <Input
                  id="patient"
                  required
                  placeholder="Ej. María Elena Flores"
                  value={patient}
                  onChange={e => setPatient(e.target.value)}
                />
              </div>

              {/* Doctor */}
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico Responsable</Label>
                <Select value={doctor} onValueChange={setDoctor} required>
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Seleccionar médico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. López">Dr. López</SelectItem>
                    <SelectItem value="Dra. García">Dra. García</SelectItem>
                    <SelectItem value="Dr. Ruiz">Dr. Ruiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de cita */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cita</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tipo de consulta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Control Prenatal">Control Prenatal</SelectItem>
                    <SelectItem value="Ultrasonido">Ultrasonido</SelectItem>
                    <SelectItem value="Consulta General">Consulta General</SelectItem>
                    <SelectItem value="Urgencia Obstétrica">Urgencia Obstétrica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
                >
                  {isSaving
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                    : <><Calendar className="w-4 h-4" />Confirmar Cita</>
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
          {filtered.length > 0 ? (
            filtered.map((appt, i) => {
              const cfg = statusConfig[appt.status]
              const Icon = cfg.icon
              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {appt.patient.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{appt.patient}</div>
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
