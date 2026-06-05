'use client'

import { useState, useEffect } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { prenatalControlSchema, PrenatalControlFormData } from '@/lib/validations/clinical'
import { useAutosave } from '@/hooks/useAutosave'
import { addToSyncQueue } from '@/lib/offlineSync'

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

export default function PatientDetailsPage() {
  const params = useParams()
  const patientId = params.id as string

  const [patientData, setPatientData] = useState<any>(null)
  const [pregnancy, setPregnancy] = useState<any>(null)
  const [controls, setControls] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PrenatalControlFormData>({
    resolver: zodResolver(prenatalControlSchema)
  })

  const { saveDraft, clearDraft, loadDraft, hasDraft } = useAutosave<PrenatalControlFormData>(`prenatal_${patientId}`, {} as PrenatalControlFormData)

  useEffect(() => {
    const subscription = watch((value) => {
      // Only save if some fields have values to avoid empty drafts
      if (Object.keys(value).length > 0) {
        saveDraft(value as PrenatalControlFormData)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, saveDraft])

  const handleRestoreDraft = () => {
    const draft = loadDraft()
    if (draft) {
      reset(draft)
      toast.success('Borrador restaurado exitosamente')
    }
  }

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      if (!patientId) return
      
      const { data: pData } = await supabase.from('patients').select('*').eq('id', patientId).single()
      if (pData) {
        setPatientData(pData)
        
        const { data: prData } = await supabase.from('pregnancies')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
          
        if (prData) {
          setPregnancy(prData)
          const { data: ctrlData } = await supabase.from('prenatal_controls')
            .select('*')
            .eq('pregnancy_id', prData.id)
            .order('control_date', { ascending: true })
          if (ctrlData) setControls(ctrlData)
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [patientId, supabase])

  const handleSaveControl = async (formData: PrenatalControlFormData) => {
    setIsSubmitting(true)

    const payload = {
      pregnancy_id: pregnancy?.id,
      patient_id: patientId,
      control_date: new Date().toISOString().split('T')[0],
      gestational_weeks: formData.gestational_weeks,
      weight_kg: formData.weight_kg,
      blood_pressure_systolic: formData.blood_pressure_systolic,
      blood_pressure_diastolic: formData.blood_pressure_diastolic,
      fetal_heart_rate: formData.fetal_heart_rate || null,
      fundal_height_cm: formData.fundal_height_cm || null,
      doctor_id: (await supabase.auth.getUser()).data?.user?.id
    }

    if (!navigator.onLine) {
      addToSyncQueue('prenatal_controls', payload)
      toast.success('Guardado localmente. Se sincronizará cuando vuelvas a tener conexión.')
      setIsSheetOpen(false)
      reset()
      clearDraft()
      setIsSubmitting(false)
      return
    }

    const { data, error } = await supabase.from('prenatal_controls').insert(payload).select().single()

    if (!error && data) {
      setControls([...controls, data])
      setIsSheetOpen(false)
      toast.success('Control registrado exitosamente')
      reset()
      clearDraft()
    } else {
      toast.error('Error al guardar control')
    }
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!patientData) {
    return <div className="p-8 text-center text-muted-foreground">Paciente no encontrado</div>
  }

  const age = Math.floor((new Date().getTime() - new Date(patientData.date_of_birth).getTime()) / 3.15576e+10)


  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Nav */}
      <div className="flex items-center gap-4">
        <Link href="/patients" className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-foreground">{patientData.first_name} {patientData.last_name}</h1>
            {pregnancy?.risk_level && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                ${pregnancy.risk_level === 'high' ? 'bg-red-50 text-red-700 border-red-100' : 
                  pregnancy.risk_level === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                  'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
              >
                <Activity className="w-3.5 h-3.5" /> 
                {pregnancy.risk_level === 'high' ? 'Alto Riesgo' : pregnancy.risk_level === 'medium' ? 'Riesgo Medio' : 'Bajo Riesgo'}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{patientData.mrn}</span>
            <span>• {age} años</span>
            {pregnancy && <span>• Embarazo Activo</span>}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Profile Card */}
        <div className="space-y-6">
          <div className="glass-panel shadow-floating border-0 rounded-3xl p-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -z-0" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center text-2xl font-bold text-primary border border-primary/20">
                  {patientData.first_name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tipo de Sangre</div>
                  <div className="text-2xl font-bold text-red-500">{patientData.blood_type === 'unknown' ? '?' : patientData.blood_type}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><MapPin className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Comunidad</p><p className="font-medium text-foreground">{patientData.community}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Phone className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Teléfono</p><p className="font-medium text-foreground">{patientData.phone_number || 'N/A'}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500"><AlertTriangle className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Emergencia</p><p className="font-medium text-foreground">{patientData.emergency_contact_name}</p></div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><Calendar className="w-4 h-4" /></div>
                  <div><p className="text-muted-foreground text-xs">Fecha Probable de Parto</p><p className="font-medium text-foreground">{pregnancy?.edd || 'No calculada'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tabs & Clinical Data */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="controles" className="w-full">
            <TabsList className="glass-panel shadow-soft border-0 p-1 rounded-2xl">
              <TabsTrigger value="resumen" className="rounded-xl">Resumen Médico</TabsTrigger>
              <TabsTrigger value="controles" className="rounded-xl">Controles Prenatales</TabsTrigger>
              <TabsTrigger value="historial" className="rounded-xl">Historial</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controles" className="space-y-6 mt-6">
              {/* Header Action */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-heading text-foreground">Registro de Controles</h2>
                
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}>
                      <Plus className="w-4 h-4" /> Nuevo Control
                  </SheetTrigger>
                  <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Nuevo Control Prenatal</SheetTitle>
                      <SheetDescription>
                        Registra los signos vitales y datos del nuevo control prenatal.
                      </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit(handleSaveControl)} className="space-y-6 mt-6">
                      {hasDraft && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg flex items-center justify-between">
                          <span>Tienes un borrador sin guardar.</span>
                          <button type="button" onClick={handleRestoreDraft} className="underline font-semibold hover:text-amber-900">Restaurar</button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Semanas de Gest.</Label>
                          <Input type="number" {...register('gestational_weeks', { valueAsNumber: true })} placeholder="Ej. 24" />
                          {errors.gestational_weeks && <p className="text-red-500 text-[10px]">{errors.gestational_weeks.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Peso (kg)</Label>
                          <Input type="number" step="0.1" {...register('weight_kg', { valueAsNumber: true })} placeholder="Ej. 65" />
                          {errors.weight_kg && <p className="text-red-500 text-[10px]">{errors.weight_kg.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Presión Sistólica</Label>
                          <Input type="number" {...register('blood_pressure_systolic', { valueAsNumber: true })} placeholder="120" />
                          {errors.blood_pressure_systolic && <p className="text-red-500 text-[10px]">{errors.blood_pressure_systolic.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Presión Diastólica</Label>
                          <Input type="number" {...register('blood_pressure_diastolic', { valueAsNumber: true })} placeholder="80" />
                          {errors.blood_pressure_diastolic && <p className="text-red-500 text-[10px]">{errors.blood_pressure_diastolic.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Frec. Cardíaca Fetal</Label>
                          <Input type="number" {...register('fetal_heart_rate', { valueAsNumber: true })} placeholder="140" />
                          {errors.fetal_heart_rate && <p className="text-red-500 text-[10px]">{errors.fetal_heart_rate.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Altura Uterina (cm)</Label>
                          <Input type="number" {...register('fundal_height_cm', { valueAsNumber: true })} placeholder="20" />
                          {errors.fundal_height_cm && <p className="text-red-500 text-[10px]">{errors.fundal_height_cm.message}</p>}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl font-semibold text-white bg-primary shadow-sm disabled:opacity-70 flex justify-center items-center gap-2">
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Guardar Control
                        </button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Chart */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="glass-panel shadow-soft border-0 p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
                    <Scale className="w-4 h-4" /> Evolución de Peso
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={controls}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="gestational_weeks" tickFormatter={(val) => `${val}w`} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="weight_kg" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="glass-panel shadow-soft border-0 p-6 rounded-3xl">
                  <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
                    <HeartPulse className="w-4 h-4" /> Frecuencia Fetal (FCF)
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={controls}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="gestational_weeks" tickFormatter={(val) => `${val}w`} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis domain={[110, 170]} fontSize={12} tickLine={false} axisLine={false} width={30} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="fetal_heart_rate" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }} />
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
                    className="glass-panel shadow-soft border-0 p-5 rounded-2xl flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex flex-col items-center justify-center text-primary">
                        <span className="text-[10px] uppercase font-bold leading-none">Sem</span>
                        <span className="text-lg font-bold leading-none mt-0.5">{ctrl.gestational_weeks}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {ctrl.control_date}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                          <span><Stethoscope className="w-3 h-3 inline mr-1" />Médico de Turno</span>
                          <span>PA: {ctrl.blood_pressure_systolic}/{ctrl.blood_pressure_diastolic}</span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:grid grid-cols-3 gap-8 text-center text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs">Peso</div>
                        <div className="font-medium text-foreground">{ctrl.weight_kg} kg</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Altura Ut.</div>
                        <div className="font-medium text-foreground">{ctrl.fundal_height_cm} cm</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">FCF</div>
                        <div className="font-medium text-foreground">{ctrl.fetal_heart_rate || '--'} bpm</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="resumen">
              <div className="glass-panel shadow-soft border-0 p-12 rounded-3xl text-center text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Resumen médico en construcción...</p>
              </div>
            </TabsContent>

            <TabsContent value="historial">
              <div className="glass-panel shadow-soft border-0 p-12 rounded-3xl text-center text-muted-foreground">
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
