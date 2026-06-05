'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Baby,
  Calendar,
  Activity,
  AlertTriangle,
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  Plus,
  Stethoscope,
  HeartPulse,
  Scale
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Mock Data
const mockPatientData = {
  id: '1',
  name: 'María Elena Flores',
  mrn: 'EXP-2026-001',
  age: 24,
  community: 'Santa Marta',
  phone: '+505 8888-0000',
  emergencyContact: 'José Flores (Esposo)',
  bloodType: 'O+',
  risk: 'low',
  status: 'active',
  gestationalWeeks: 28,
  edd: '2026-09-15',
}

const mockControls = [
  { id: 1, date: '2026-04-10', weeks: 12, weight: 62, bp: '110/70', fhr: 140, fundalHeight: 12, doctor: 'Dr. López' },
  { id: 2, date: '2026-05-08', weeks: 16, weight: 64, bp: '115/75', fhr: 145, fundalHeight: 16, doctor: 'Dr. López' },
  { id: 3, date: '2026-06-02', weeks: 20, weight: 66, bp: '120/80', fhr: 142, fundalHeight: 20, doctor: 'Dr. López' },
]

export default function PatientDetailsPage() {
  const params = useParams()
  const [controls, setControls] = useState(mockControls)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Form states for new control
  const [weight, setWeight] = useState('')
  const [bp, setBp] = useState('')
  const [fhr, setFhr] = useState('')
  const [fh, setFh] = useState('')

  const handleSaveControl = (e: React.FormEvent) => {
    e.preventDefault()
    const newControl = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      weeks: mockPatientData.gestationalWeeks,
      weight: Number(weight),
      bp,
      fhr: Number(fhr),
      fundalHeight: Number(fh),
      doctor: 'Dr. Médico (Actual)',
    }
    setControls([...controls, newControl])
    setIsSheetOpen(false)
    setWeight(''); setBp(''); setFhr(''); setFh('')
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <Link href="/patients" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{mockPatientData.name}</h1>
            {mockPatientData.risk === 'low' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Activity className="w-3.5 h-3.5" /> Bajo Riesgo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{mockPatientData.mrn}</span>
            <span>• {mockPatientData.age} años</span>
            <span>• Embarazo Activo ({mockPatientData.gestationalWeeks} semanas)</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Profile Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
                  {mockPatientData.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tipo de Sangre</div>
                  <div className="text-2xl font-bold text-red-500">{mockPatientData.bloodType}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Comunidad</p><p className="font-medium text-foreground">{mockPatientData.community}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Phone className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Teléfono</p><p className="font-medium text-foreground">{mockPatientData.phone}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Emergencia</p><p className="font-medium text-foreground">{mockPatientData.emergencyContact}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><Calendar className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Fecha Probable de Parto</p><p className="font-medium text-foreground">{mockPatientData.edd}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Clinical Data */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="controles" className="w-full">
            <TabsList className="bg-card border border-border p-1 rounded-xl">
              <TabsTrigger value="resumen" className="rounded-lg">Resumen Médico</TabsTrigger>
              <TabsTrigger value="controles" className="rounded-lg">Controles Prenatales</TabsTrigger>
              <TabsTrigger value="historial" className="rounded-lg">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controles" className="space-y-6 mt-6">
              {/* Header Action */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Registro de Controles</h2>
                
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
                    >
                      <Plus className="w-4 h-4" /> Nuevo Control
                    </button>
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Nuevo Control Prenatal</SheetTitle>
                      <SheetDescription>
                        Registra los signos vitales y datos del control de la semana {mockPatientData.gestationalWeeks}.
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSaveControl} className="space-y-6 mt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Semanas de Gest.</Label>
                          <Input value={mockPatientData.gestationalWeeks} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                          <Label>Peso (kg)</Label>
                          <Input required type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ej. 65" />
                        </div>
                        <div className="space-y-2">
                          <Label>Presión Arterial</Label>
                          <Input required placeholder="120/80" value={bp} onChange={e => setBp(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Frec. Cardíaca Fetal</Label>
                          <Input required type="number" value={fhr} onChange={e => setFhr(e.target.value)} placeholder="140" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Altura Uterina (cm)</Label>
                          <Input required type="number" value={fh} onChange={e => setFh(e.target.value)} placeholder="20" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <button type="submit" className="w-full py-3 rounded-xl font-semibold text-white bg-primary shadow-sm">
                          Guardar Control
                        </button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Chart */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
                    <Scale className="w-4 h-4" /> Evolución de Peso
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={controls}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="weeks" tickFormatter={(val) => `${val}w`} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
                    <HeartPulse className="w-4 h-4" /> Frecuencia Fetal (FCF)
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={controls}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="weeks" tickFormatter={(val) => `${val}w`} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[110, 170]} fontSize={12} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="fhr" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Controls List */}
              <div className="space-y-3">
                {controls.slice().reverse().map((ctrl, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={ctrl.id} 
                    className="bg-card border border-border p-4 rounded-xl flex items-center justify-between hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-[10px] uppercase font-bold leading-none">Sem</span>
                        <span className="text-lg font-bold leading-none mt-0.5">{ctrl.weeks}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {ctrl.date}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                          <span><Stethoscope className="w-3 h-3 inline mr-1" />{ctrl.doctor}</span>
                          <span>PA: {ctrl.bp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:grid grid-cols-3 gap-8 text-center text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Peso</div>
                        <div className="font-medium text-foreground">{ctrl.weight} kg</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Altura Ut.</div>
                        <div className="font-medium text-foreground">{ctrl.fundalHeight} cm</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">FCF</div>
                        <div className="font-medium text-foreground">{ctrl.fhr} bpm</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resumen">
              <div className="bg-card border border-border p-8 rounded-2xl text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Resumen médico en construcción...</p>
              </div>
            </TabsContent>

            <TabsContent value="historial">
              <div className="bg-card border border-border p-8 rounded-2xl text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Historial de atenciones anteriores en construcción...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
