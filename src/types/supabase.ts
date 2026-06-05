export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'doctor' | 'nurse' | 'reception' | 'supervisor' | 'statistics'
          license_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
      patients: {
        Row: {
          id: string
          mrn: string
          first_name: string
          last_name: string
          date_of_birth: string
          id_card: string | null
          phone_number: string | null
          community: string
          address: string | null
          blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          status: 'active' | 'delivered' | 'archived' | 'transferred'
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
      }
      pregnancies: {
        Row: {
          id: string
          patient_id: string
          lmp: string | null
          edd: string | null
          gravida: number
          para: number
          abortions: number
          cesareans: number
          risk_level: 'low' | 'medium' | 'high'
          risk_factors: string[] | null
          is_active: boolean
          delivery_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      prenatal_controls: {
        Row: {
          id: string
          pregnancy_id: string
          patient_id: string
          control_date: string
          gestational_weeks: number
          weight_kg: number
          blood_pressure_systolic: number
          blood_pressure_diastolic: number
          fetal_heart_rate: number | null
          fundal_height_cm: number | null
          fetal_presentation: string | null
          symptoms: string | null
          doctor_id: string | null
          created_at: string
          updated_at: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string | null
          appointment_date: string
          appointment_time: string
          type: 'prenatal_control' | 'ultrasound' | 'general' | 'emergency'
          status: 'pending' | 'completed' | 'cancelled' | 'rescheduled'
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
      }
      referrals: {
        Row: {
          id: string
          patient_id: string
          pregnancy_id: string | null
          destination_facility: string
          reason: string
          clinical_summary: string | null
          referred_by: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          referral_date: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
