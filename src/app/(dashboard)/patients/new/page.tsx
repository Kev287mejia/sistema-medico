'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronRight, ChevronLeft, Save, UserPlus, MapPin, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// ── Schema ──────────────────────────────────────────────────────────────
const patientSchema = z.object({
  firstName:            z.string().min(2, 'El nombre es obligatorio'),
  lastName:             z.string().min(2, 'El apellido es obligatorio'),
  cedula:               z.string().optional(),
  birthDate:            z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  community:            z.string().min(1, 'La comunidad es obligatoria'),
  phone:                z.string().optional(),
  emergencyContact:     z.string().min(2, 'El contacto de emergencia es obligatorio'),
  emergencyPhone:       z.string().min(8, 'Teléfono de emergencia inválido'),
  bloodType:            z.string().min(1, 'Grupo sanguíneo obligatorio'),
  previousPregnancies:  z.number().min(0),
  riskLevel:            z.string().min(1, 'Nivel de riesgo inicial obligatorio'),
  weight:               z.number().min(20, 'Peso requerido (> 20 kg)'),
  bloodPressureSystolic:  z.number().min(50, 'Requerida'),
  bloodPressureDiastolic: z.number().min(30, 'Requerida'),
  gestationalWeeks:       z.number().min(0, 'Semanas requeridas'),
})

type PatientFormValues = z.infer<typeof patientSchema>

const steps = [
  { id: 1, name: 'Datos Personales',     icon: UserPlus },
  { id: 2, name: 'Contacto y Ubicación', icon: MapPin },
  { id: 3, name: 'Perfil Médico',        icon: AlertTriangle },
]

// ── Reusable field components ────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm
  outline-none transition-all focus:ring-2 focus:ring-primary/25 focus:border-primary
  hover:border-primary/40 placeholder:text-muted-foreground`

const selectClass = `w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm
  outline-none transition-all focus:ring-2 focus:ring-primary/25 focus:border-primary
  hover:border-primary/40 cursor-pointer`

// ── Page ─────────────────────────────────────────────────────────────────
export default function NewPatientPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: { previousPregnancies: 0 },
    mode: 'onChange',
  })

  const stepFields: Record<number, (keyof PatientFormValues)[]> = {
    1: ['firstName', 'lastName', 'cedula', 'birthDate', 'community'],
    2: ['phone', 'emergencyContact', 'emergencyPhone'],
    3: ['bloodType', 'previousPregnancies', 'riskLevel', 'weight', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'gestationalWeeks'],
  }

  const nextStep = async () => {
    const valid = await trigger(stepFields[currentStep])
    if (valid) setCurrentStep(s => Math.min(s + 1, steps.length))
  }

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1))

  const supabase = createClient()

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true)
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Generate MRN (Medical Record Number)
    const mrn = `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    // Insert Patient
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        mrn,
        date_of_birth: data.birthDate,
        id_card: data.cedula || null,
        phone_number: data.phone || null,
        community: data.community,
        blood_type: data.bloodType === 'Desconocido' ? 'unknown' : data.bloodType as any,
        emergency_contact_name: data.emergencyContact,
        emergency_contact_phone: data.emergencyPhone,
        created_by: user?.id
      })
      .select()
      .single()

    if (patientError || !patientData) {
      toast.error('Error al registrar paciente')
      setIsSubmitting(false)
      return
    }

    // Insert Pregnancy
    const { data: pregnancyData, error: pregnancyError } = await supabase
      .from('pregnancies')
      .insert({
        patient_id: patientData.id,
        gravida: data.previousPregnancies + 1,
        para: 0,
        risk_level: data.riskLevel as any,
        created_by: user?.id
      })
      .select()
      .single()

    if (pregnancyError || !pregnancyData) {
      toast.error('Error al registrar datos obstétricos')
      setIsSubmitting(false)
      return
    }

    // Insert Initial Prenatal Control
    const { error: controlError } = await supabase
      .from('prenatal_controls')
      .insert({
        pregnancy_id: pregnancyData.id,
        patient_id: patientData.id,
        control_date: new Date().toISOString().split('T')[0],
        gestational_weeks: data.gestationalWeeks,
        weight_kg: data.weight,
        blood_pressure_systolic: data.bloodPressureSystolic,
        blood_pressure_diastolic: data.bloodPressureDiastolic,
        doctor_id: user?.id
      })

    if (controlError) {
      toast.error('Error al registrar el control prenatal inicial')
      setIsSubmitting(false)
      return
    }

    toast.success('Paciente registrada exitosamente')
    router.push('/patients')
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Registro de Paciente</h1>
        <p className="text-muted-foreground mt-1">Ingresa los datos para abrir un nuevo expediente clínico.</p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-muted rounded-full" />
        <div className="absolute top-5 left-0 h-0.5 transition-all duration-500 rounded-full"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #1e3a8a, #0d9488)',
          }} />

        <div className="relative flex justify-between">
          {steps.map(step => {
            const Icon = step.icon
            const done = currentStep > step.id
            const active = currentStep === step.id
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm"
                  style={{
                    background: (done || active) ? 'linear-gradient(135deg, #1e3a8a, #0d9488)' : undefined,
                    border: (done || active) ? 'none' : '1px solid #e2e8f0',
                  }}>
                  <Icon className={`w-5 h-5 ${(done || active) ? 'text-white' : 'text-muted-foreground'}`} />
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* ── Step 1 ── */}
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-bold text-foreground">Datos Personales</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Nombres" error={errors.firstName?.message}>
                      <input {...register('firstName')} placeholder="Ej. María Elena" className={inputClass} />
                    </Field>
                    <Field label="Apellidos" error={errors.lastName?.message}>
                      <input {...register('lastName')} placeholder="Ej. Flores" className={inputClass} />
                    </Field>
                    <Field label="Cédula de Identidad (Opcional)" error={errors.cedula?.message}>
                      <input {...register('cedula')} placeholder="000-000000-0000A" className={inputClass} />
                    </Field>
                    <Field label="Fecha de Nacimiento" error={errors.birthDate?.message}>
                      <input {...register('birthDate')} type="date" className={inputClass} />
                    </Field>
                    <Field label="Comunidad de Origen" error={errors.community?.message} >
                      <select {...register('community')} className={selectClass}>
                        <option value="">Selecciona una comunidad</option>
                        <option>Waspam Centro</option>
                        <option>Bihmona</option>
                        <option>Santa Marta</option>
                        <option>Ulwas</option>
                        <option>Siksayari</option>
                        <option>Otras comunidades</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {/* ── Step 2 ── */}
              {currentStep === 2 && (
                <>
                  <h2 className="text-xl font-bold text-foreground">Contacto y Ubicación</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Teléfono de la Paciente (Opcional)" error={errors.phone?.message}>
                      <input {...register('phone')} placeholder="+505 0000-0000" className={`${inputClass} sm:col-span-2`} />
                    </Field>
                    <Field label="Nombre Contacto de Emergencia" error={errors.emergencyContact?.message}>
                      <input {...register('emergencyContact')} placeholder="Familiar o Pareja" className={inputClass} />
                    </Field>
                    <Field label="Teléfono de Emergencia" error={errors.emergencyPhone?.message}>
                      <input {...register('emergencyPhone')} placeholder="+505 0000-0000" className={inputClass} />
                    </Field>
                  </div>
                </>
              )}

              {/* ── Step 3 ── */}
              {currentStep === 3 && (
                <>
                  <h2 className="text-xl font-bold text-foreground">Perfil Médico y Riesgo</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Grupo Sanguíneo" error={errors.bloodType?.message}>
                      <select {...register('bloodType')} className={selectClass}>
                        <option value="">Seleccione grupo</option>
                        {['A+','A-','B+','B-','O+','O-','AB+','AB-','Desconocido'].map(g => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Embarazos Previos (Gesta)" error={errors.previousPregnancies?.message}>
                      <input {...register('previousPregnancies', { valueAsNumber: true })} type="number" min={0} className={inputClass} />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Nivel de Riesgo Inicial Detectado" error={errors.riskLevel?.message}>
                        <select {...register('riskLevel')} className={selectClass}>
                          <option value="">Evaluar riesgo...</option>
                          <option value="low">Riesgo Bajo (Control de rutina)</option>
                          <option value="medium">Riesgo Medio (Atención especializada)</option>
                          <option value="high">Riesgo Alto (Referencia inmediata / Peligro)</option>
                        </select>
                      </Field>
                    </div>

                    <div className="sm:col-span-2 pt-4 border-t border-border mt-2">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Signos Vitales y Gestación (Control Inicial)</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <Field label="Peso (kg)" error={errors.weight?.message}>
                          <input {...register('weight', { valueAsNumber: true })} type="number" step="0.1" className={inputClass} placeholder="Ej. 65" />
                        </Field>
                        <Field label="P. Sistólica" error={errors.bloodPressureSystolic?.message}>
                          <input {...register('bloodPressureSystolic', { valueAsNumber: true })} type="number" className={inputClass} placeholder="Ej. 120" />
                        </Field>
                        <Field label="P. Diastólica" error={errors.bloodPressureDiastolic?.message}>
                          <input {...register('bloodPressureDiastolic', { valueAsNumber: true })} type="number" className={inputClass} placeholder="Ej. 80" />
                        </Field>
                        <Field label="Semanas Gest." error={errors.gestationalWeeks?.message}>
                          <input {...register('gestationalWeeks', { valueAsNumber: true })} type="number" className={inputClass} placeholder="Ej. 12" />
                        </Field>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <button type="button" onClick={prevStep}
              disabled={currentStep === 1 || isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>

            {currentStep < steps.length ? (
              <button type="button" onClick={nextStep}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 shadow-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
              >
                Siguiente paso <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
              >
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                  : <><Save className="w-4 h-4" />Registrar Paciente</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
