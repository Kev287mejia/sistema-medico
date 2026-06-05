import * as z from 'zod'

export const prenatalControlSchema = z.object({
  gestational_weeks: z.number()
    .min(1, 'Las semanas deben ser mayor a 0')
    .max(42, 'Las semanas no pueden ser mayores a 42'),
  
  weight_kg: z.number()
    .min(30, 'El peso debe ser al menos 30 kg')
    .max(200, 'El peso parece ser incorrecto (máx 200 kg)'),
  
  blood_pressure_systolic: z.number()
    .min(70, 'Presión sistólica muy baja (min 70)')
    .max(250, 'Presión sistólica extremadamente alta (máx 250)'),
    
  blood_pressure_diastolic: z.number()
    .min(40, 'Presión diastólica muy baja (min 40)')
    .max(150, 'Presión diastólica extremadamente alta (máx 150)'),
    
  fetal_heart_rate: z.number()
    .min(0, 'La FCF no puede ser negativa')
    .max(200, 'FCF extremadamente alta (máx 200)')
    .optional()
    .nullable(),
    
  fundal_height_cm: z.number()
    .min(0, 'La altura uterina no puede ser negativa')
    .max(50, 'Altura uterina anormal (máx 50 cm)')
    .optional()
    .nullable(),
    
  fetal_presentation: z.string().optional(),
  symptoms: z.string().optional()
})

export type PrenatalControlFormData = z.infer<typeof prenatalControlSchema>
