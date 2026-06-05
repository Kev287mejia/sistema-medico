'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ChevronRight, ChevronLeft, Save, UserPlus, MapPin, AlertTriangle, Loader2 } from 'lucide-react'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

// Schema definition
const patientSchema = z.object({
  // Step 1: Personal
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  cedula: z.string().optional(),
  birthDate: z.string().min(1, 'La fecha de nacimiento es obligatoria'),
  community: z.string().min(1, 'La comunidad es obligatoria'),
  
  // Step 2: Contact
  phone: z.string().optional(),
  emergencyContact: z.string().min(2, 'El contacto de emergencia es obligatorio'),
  emergencyPhone: z.string().min(8, 'Teléfono de emergencia inválido'),
  
  // Step 3: Medical
  bloodType: z.string().min(1, 'Grupo sanguíneo obligatorio'),
  previousPregnancies: z.coerce.number().min(0),
  riskLevel: z.string().min(1, 'Nivel de riesgo inicial obligatorio'),
})

type PatientFormValues = z.infer<typeof patientSchema>

const steps = [
  { id: 1, name: 'Datos Personales', icon: UserPlus },
  { id: 2, name: 'Contacto y Ubicación', icon: MapPin },
  { id: 3, name: 'Perfil Médico', icon: AlertTriangle },
]

export default function NewPatientPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      cedula: '',
      birthDate: '',
      community: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      bloodType: '',
      previousPregnancies: 0,
      riskLevel: '',
    },
    mode: 'onChange',
  })

  // Validate step before proceeding
  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    if (currentStep === 1) fieldsToValidate = ['firstName', 'lastName', 'cedula', 'birthDate', 'community']
    if (currentStep === 2) fieldsToValidate = ['phone', 'emergencyContact', 'emergencyPhone']
    
    const isValid = await form.trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: PatientFormValues) => {
    setIsSubmitting(true)
    // Mock save
    await new Promise(r => setTimeout(r, 1500))
    toast.success('Paciente registrado exitosamente')
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
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 transition-all duration-500 rounded-full" 
          style={{ 
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            background: 'linear-gradient(90deg, #1e3a8a, #0d9488)'
          }} 
        />
        
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                    isCompleted || isCurrent 
                      ? 'text-white' 
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                  style={{
                    background: (isCompleted || isCurrent) ? 'linear-gradient(135deg, #1e3a8a, #0d9488)' : undefined
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Step 1: Datos Personales */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Datos Personales</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombres</FormLabel>
                          <FormControl><Input placeholder="Ej. María Elena" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl><Input placeholder="Ej. Flores" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cedula" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédula de Identidad (Opcional)</FormLabel>
                          <FormControl><Input placeholder="000-000000-0000A" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="birthDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <FormControl><Input type="date" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="community" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Comunidad de Origen</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Selecciona una comunidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Waspam Centro">Waspam Centro</SelectItem>
                              <SelectItem value="Bihmona">Bihmona</SelectItem>
                              <SelectItem value="Santa Marta">Santa Marta</SelectItem>
                              <SelectItem value="Ulwas">Ulwas</SelectItem>
                              <SelectItem value="Otras">Otras comunidades</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Step 2: Contacto */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Contacto y Ubicación</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Teléfono de la Paciente (Opcional)</FormLabel>
                          <FormControl><Input placeholder="+505 0000-0000" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Contacto de Emergencia</FormLabel>
                          <FormControl><Input placeholder="Familiar o Pareja" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="emergencyPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de Emergencia</FormLabel>
                          <FormControl><Input placeholder="+505 0000-0000" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Step 3: Perfil Médico */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground mb-4">Perfil Médico y Riesgo</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="bloodType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo Sanguíneo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Seleccione grupo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="Desconocido">Desconocido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="previousPregnancies" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Embarazos Previos (Gesta)</FormLabel>
                          <FormControl><Input type="number" min={0} {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="riskLevel" render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Nivel de Riesgo Inicial Detectado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Evaluar riesgo..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Riesgo Bajo (Control de rutina)</SelectItem>
                              <SelectItem value="medium">Riesgo Medio (Atención especializada)</SelectItem>
                              <SelectItem value="high">Riesgo Alto (Referencia inmediata / Peligro)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Volver
                </div>
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
                >
                  Siguiente paso
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Registrar Paciente</>
                  )}
                </button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
