'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Filter, MoreHorizontal, User, Baby, Activity, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data
const mockPatients = [
  { id: '1', name: 'María Elena Flores', mrn: 'EXP-2026-001', age: 24, community: 'Santa Marta', status: 'active', risk: 'low', lastVisit: '2026-06-02' },
  { id: '2', name: 'Carmen Rojas Díaz', mrn: 'EXP-2026-002', age: 19, community: 'Waspam Centro', status: 'active', risk: 'high', lastVisit: '2026-06-01' },
  { id: '3', name: 'Julia López', mrn: 'EXP-2026-003', age: 31, community: 'Ulwas', status: 'delivered', risk: 'low', lastVisit: '2026-05-28' },
  { id: '4', name: 'Ana Martínez Vega', mrn: 'EXP-2026-004', age: 27, community: 'Bihmona', status: 'active', risk: 'medium', lastVisit: '2026-05-25' },
]

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = mockPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground mt-1">Gestión de expedientes y registros maternos.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/patients/new')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </motion.button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o número de expediente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          Filtrar
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Comunidad</TableHead>
              <TableHead className="font-semibold">Riesgo</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold text-right">Última Visita</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((patient) => (
                <TableRow key={patient.id} className="group cursor-pointer hover:bg-muted/30">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {patient.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {patient.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{patient.mrn} · {patient.age} años</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{patient.community}</span>
                  </TableCell>
                  <TableCell>
                    {patient.risk === 'high' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        <AlertTriangle className="w-3 h-3" /> Alto
                      </span>
                    )}
                    {patient.risk === 'medium' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        <AlertTriangle className="w-3 h-3" /> Medio
                      </span>
                    )}
                    {patient.risk === 'low' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <Activity className="w-3 h-3" /> Bajo
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        <Baby className="w-3 h-3" /> Prenatal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <User className="w-3 h-3" /> Postparto
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {patient.lastVisit}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors outline-none">
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem className="cursor-pointer">Ver Expediente</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Nuevo Control</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">Dar de alta</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-muted-foreground/30" />
                    <span>No se encontraron pacientes.</span>
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
