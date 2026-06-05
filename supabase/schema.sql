-- ==============================================================================
-- SIACEM - Sistema Inteligente Automatizado para el Control de Expedientes Médicos
-- ESQUEMA DE BASE DE DATOS (PostgreSQL / Supabase)
-- ==============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ENUMERADORES (Tipos de datos estrictos)
-- ==========================================
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'reception', 'supervisor', 'statistics');
CREATE TYPE patient_status AS ENUM ('active', 'delivered', 'archived', 'transferred');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE appointment_type AS ENUM ('prenatal_control', 'ultrasound', 'general', 'emergency');
CREATE TYPE appointment_status AS ENUM ('pending', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE referral_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown');
CREATE TYPE audit_action_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ==========================================
-- 2. TABLAS PRINCIPALES
-- ==========================================

-- Tabla: perfiles de usuario (Extiende auth.users de Supabase)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'nurse'::user_role NOT NULL,
    license_number TEXT, -- Número de licencia médica (MINSA)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: pacientes (Expedientes)
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn TEXT UNIQUE NOT NULL, -- Medical Record Number (Número de expediente Ej. EXP-2026-001)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    id_card TEXT UNIQUE, -- Cédula de identidad
    phone_number TEXT,
    community TEXT NOT NULL, -- Comunidad de procedencia (Ej. Waspam, Santa Marta)
    address TEXT,
    blood_type blood_type DEFAULT 'unknown'::blood_type,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    status patient_status DEFAULT 'active'::patient_status NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete
);

-- Tabla: embarazos (Historial obstétrico y embarazo actual)
CREATE TABLE public.pregnancies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    lmp DATE, -- Last Menstrual Period (FUR - Fecha de Última Regla)
    edd DATE, -- Estimated Date of Delivery (FPP - Fecha Probable de Parto)
    gravida INTEGER DEFAULT 1, -- Número total de embarazos
    para INTEGER DEFAULT 0, -- Número de partos
    abortions INTEGER DEFAULT 0, -- Número de abortos
    cesareans INTEGER DEFAULT 0, -- Número de cesáreas
    risk_level risk_level DEFAULT 'low'::risk_level NOT NULL,
    risk_factors TEXT[], -- Array de factores de riesgo (Ej. ["Hipertensión", "Diabetes Gestacional"])
    is_active BOOLEAN DEFAULT true,
    delivery_date DATE, -- Fecha real del parto (se llena al finalizar el embarazo)
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: controles prenatales (Signos vitales y seguimiento)
CREATE TABLE public.prenatal_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pregnancy_id UUID NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    control_date DATE NOT NULL DEFAULT CURRENT_DATE,
    gestational_weeks INTEGER NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    blood_pressure_systolic INTEGER NOT NULL,
    blood_pressure_diastolic INTEGER NOT NULL,
    fetal_heart_rate INTEGER, -- FCF (Latidos por minuto)
    fundal_height_cm INTEGER, -- Altura uterina
    fetal_presentation TEXT, -- Cefálica, Pélvica, Transversa
    symptoms TEXT, -- Notas médicas
    doctor_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: citas médicas (Calendario)
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.profiles(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type appointment_type NOT NULL,
    status appointment_status DEFAULT 'pending'::appointment_status NOT NULL,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: referencias médicas (Traslados a hospitales)
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    pregnancy_id UUID REFERENCES public.pregnancies(id),
    destination_facility TEXT NOT NULL, -- Ej. Hospital Regional Nuevo Amanecer
    reason TEXT NOT NULL,
    clinical_summary TEXT,
    referred_by UUID REFERENCES public.profiles(id),
    status referral_status DEFAULT 'in_progress'::referral_status NOT NULL,
    referral_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: registro de auditoría (Audit Logs)
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action audit_action_type NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES public.profiles(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ==========================================

-- Función genérica para actualizar `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pregnancies_updated_at BEFORE UPDATE ON public.pregnancies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prenatal_controls_updated_at BEFORE UPDATE ON public.prenatal_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función de Auditoría
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Obtener el usuario actual desde el JWT de Supabase si existe
    v_user_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, 'INSERT'::audit_action_type, row_to_json(NEW)::JSONB, v_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, NEW.id, 'UPDATE'::audit_action_type, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, v_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME::TEXT, OLD.id, 'DELETE'::audit_action_type, row_to_json(OLD)::JSONB, v_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar triggers de auditoría a las tablas principales
CREATE TRIGGER audit_patients_changes AFTER INSERT OR UPDATE OR DELETE ON public.patients FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_pregnancies_changes AFTER INSERT OR UPDATE OR DELETE ON public.pregnancies FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_prenatal_controls_changes AFTER INSERT OR UPDATE OR DELETE ON public.prenatal_controls FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ==========================================
-- 4. ÍNDICES DE RENDIMIENTO
-- ==========================================
CREATE INDEX idx_patients_mrn ON public.patients(mrn);
CREATE INDEX idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX idx_patients_community ON public.patients(community);
CREATE INDEX idx_pregnancies_patient_id ON public.pregnancies(patient_id);
CREATE INDEX idx_prenatal_controls_pregnancy_id ON public.prenatal_controls(pregnancy_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenatal_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
-- Los usuarios pueden leer todos los perfiles de la institución, pero solo pueden editar el suyo (a menos que sean admins).
CREATE POLICY "Profiles are viewable by all authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para Patients
-- Lectura: Todos los autenticados
-- Inserción/Actualización: Médicos, Enfermeras, Recepción, Admins
CREATE POLICY "Patients viewable by authenticated" ON public.patients FOR SELECT USING (auth.role() = 'authenticated' AND deleted_at IS NULL);
CREATE POLICY "Patients insertable by staff" ON public.patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Patients updatable by staff" ON public.patients FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para Prenatal Controls
CREATE POLICY "Controls viewable by authenticated" ON public.prenatal_controls FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Controls insertable by staff" ON public.prenatal_controls FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Controls updatable by staff" ON public.prenatal_controls FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para Appointments
CREATE POLICY "Appointments viewable by authenticated" ON public.appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Appointments insertable by staff" ON public.appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Appointments updatable by staff" ON public.appointments FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para Pregnancies & Referrals
CREATE POLICY "Pregnancies viewable by authenticated" ON public.pregnancies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Pregnancies insertable by staff" ON public.pregnancies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Pregnancies updatable by staff" ON public.pregnancies FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Referrals viewable by authenticated" ON public.referrals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Referrals insertable by staff" ON public.referrals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Referrals updatable by staff" ON public.referrals FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audit logs viewable by admins only" ON public.audit_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
-- Las inserciones se hacen mediante SECURITY DEFINER en el trigger, por lo que no se necesita política de INSERT directa.
