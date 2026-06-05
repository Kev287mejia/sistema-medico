'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Baby, Calendar, Search, Filter, AlertTriangle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Mock Data
const upcomingControls = [
  { id: '1', name: 'María Elena Flores', mrn: 'EXP-2026-001', weeks: 28, scheduledDate: 'Hoy', time: '09:00 AM', risk: 'low', community: 'Santa Marta' },
  { id: '2', name: 'Carmen Rojas Díaz', mrn: 'EXP-2026-002', weeks: 36, scheduledDate: 'Hoy', time: '11:30 AM', risk: 'high', community: 'Waspam Centro' },
  { id: '4', name: 'Ana Martínez Vega', mrn: 'EXP-2026-004', weeks: 14, scheduledDate: 'Mañana', time: '08:00 AM', risk: 'medium', community: 'Bihmona' },
  { id: '5', name: 'Luisa Picado', mrn: 'EXP-2026-005', weeks: 22, scheduledDate: 'Mañana', time: '10:00 AM', risk: 'low', community: 'Siksayari' },
]

export default function PrenatalControlsPage() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = upcomingControls.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.mrn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Control Prenatal</h1>
          <p className="text-muted-foreground mt-1">Agenda de chequeos y monitoreo de embarazos activos.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por paciente o expediente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filtrar Fecha
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Fecha / Hora</TableHead>
              <TableHead className="w-[300px] font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Sem. Gest.</TableHead>
              <TableHead className="font-semibold">Riesgo</TableHead>
              <TableHead className="font-semibold text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((control) => (
                <TableRow key={control.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {control.scheduledDate}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{control.time}</div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {control.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {control.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{control.mrn} · {control.community}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <Baby className="w-3.5 h-3.5" /> {control.weeks} Sem
                    </span>
                  </TableCell>
                  <TableCell>
                    {control.risk === 'high' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle className="w-3 h-3" /> Alto
                      </span>
                    )}
                    {control.risk === 'medium' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <AlertTriangle className="w-3 h-3" /> Medio
                      </span>
                    )}
                    {control.risk === 'low' && (
                      <span className="text-xs text-muted-foreground">Rutina (Bajo)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => router.push(`/patients/${control.id}`)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold"
                    >
                      Ir al Control <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-muted-foreground/30" />
                    <span>No hay controles programados.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
