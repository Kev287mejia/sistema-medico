export type UserRole = 'admin' | 'doctor' | 'nurse' | 'reception' | 'supervisor' | 'statistics'

export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  specialty?: string
  active: boolean
  created_at: string
  updated_at: string
}

export type RiskLevel = 'low' | 'medium' | 'high'
export type PregnancyStatus = 'active' | 'delivered' | 'aborted'
export type AppointmentStatus = 'pending' | 'attended' | 'cancelled' | 'rescheduled'
export type ReferralStatus = 'pending' | 'transferred' | 'returned'

export interface Community {
  id: string
  name: string
  municipality: string
  distance_km?: number
  estimated_travel_time_hours?: number
}

export interface Patient {
  id: string
  medical_record_number: string
  first_name: string
  last_name: string
  birth_date: string
  national_id?: string
  community_id?: string
  community?: Community
  address?: string
  phone_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_type?: string
  allergies?: string
  photo_url?: string
  created_at: string
  updated_at: string
}

export interface Pregnancy {
  id: string
  patient_id: string
  patient?: Patient
  last_menstrual_period?: string
  estimated_due_date?: string
  gravida: number
  para: number
  abortions: number
  status: PregnancyStatus
  risk_level: RiskLevel
  risk_factors?: string[]
  created_at: string
  updated_at: string
}

export interface PrenatalControl {
  id: string
  pregnancy_id: string
  doctor_id?: string
  control_date: string
  gestational_age_weeks: number
  weight_kg?: number
  blood_pressure_systolic?: number
  blood_pressure_diastolic?: number
  fetal_heart_rate?: number
  uterine_height_cm?: number
  presentation?: string
  symptoms?: string[]
  alarm_signs?: string[]
  notes?: string
  next_appointment_date?: string
}

export interface Appointment {
  id: string
  patient_id: string
  patient?: Patient
  doctor_id?: string
  doctor?: UserProfile
  scheduled_at: string
  reason?: string
  status: AppointmentStatus
}

export interface NavItem {
  label: string
  href: string
  icon: string
  badge?: number
  roles?: UserRole[]
}
