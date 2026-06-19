# Diccionario de Datos - Proyecto SIACEM
*Sistema Inteligente Automatizado para el Control de Expedientes Médicos*

## 1. Tipos de Datos Enumerados (ENUMs)

| Nombre del ENUM | Valores Permitidos | Descripción |
|---|---|---|
| `user_role` | `admin`, `doctor`, `nurse`, `reception`, `supervisor`, `statistics` | Roles de los usuarios en el sistema. |
| `patient_status` | `active`, `delivered`, `archived`, `transferred` | Estado actual de la paciente (activa, parto realizado, archivado, transferida). |
| `risk_level` | `low`, `medium`, `high` | Nivel de riesgo del embarazo. |
| `appointment_type` | `prenatal_control`, `ultrasound`, `general`, `emergency` | Tipo de cita médica. |
| `appointment_status` | `pending`, `completed`, `cancelled`, `rescheduled` | Estado de la cita médica. |
| `referral_status` | `pending`, `in_progress`, `completed`, `cancelled` | Estado de la referencia médica (traslado). |
| `admission_status` | `admitted`, `discharged` | Estado de la admisión en cama (ingresado, dado de alta). |
| `blood_type` | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `unknown` | Tipo de sangre. |
| `audit_action_type` | `INSERT`, `UPDATE`, `DELETE` | Acción realizada registrada en auditoría. |

## 2. Tablas Principales

### 2.1 Tabla: `profiles` (Perfiles de Usuario)
Extiende los usuarios de autenticación de Supabase (`auth.users`).

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, FK | Identificador único. Referencia a `auth.users(id)` con DELETE CASCADE. |
| `email` | TEXT | UNIQUE, NOT NULL | Correo electrónico del usuario. |
| `full_name` | TEXT | NOT NULL | Nombre completo. |
| `role` | user_role | NOT NULL, DEFAULT 'nurse' | Rol del usuario en el sistema. |
| `license_number` | TEXT | - | Número de licencia médica (MINSA). |
| `is_active` | BOOLEAN | DEFAULT true | Indica si el usuario está activo. |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de última actualización. |

### 2.2 Tabla: `patients` (Pacientes / Expedientes)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único del paciente. |
| `mrn` | TEXT | UNIQUE, NOT NULL | Número de Expediente Médico (Ej. EXP-2026-001). |
| `first_name` | TEXT | NOT NULL | Nombres de la paciente. |
| `last_name` | TEXT | NOT NULL | Apellidos de la paciente. |
| `date_of_birth` | DATE | NOT NULL | Fecha de nacimiento. |
| `id_card` | TEXT | UNIQUE | Cédula de identidad. |
| `phone_number` | TEXT | - | Número de teléfono. |
| `community` | TEXT | NOT NULL | Comunidad de procedencia (Ej. Waspam, Santa Marta). |
| `address` | TEXT | - | Dirección domiciliaria. |
| `blood_type` | blood_type | DEFAULT 'unknown' | Tipo de sangre de la paciente. |
| `emergency_contact_name` | TEXT | - | Nombre del contacto de emergencia. |
| `emergency_contact_phone` | TEXT | - | Teléfono del contacto de emergencia. |
| `emergency_contact_relation` | TEXT | - | Relación con el contacto de emergencia. |
| `status` | patient_status | NOT NULL, DEFAULT 'active' | Estado del expediente. |
| `created_by` | UUID | FK | Referencia al usuario que creó el registro (`profiles(id)`). |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de última actualización. |
| `deleted_at` | TIMESTAMPTZ | - | Fecha de borrado lógico (Soft delete). |

### 2.3 Tabla: `pregnancies` (Embarazos e Historial Obstétrico)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único del embarazo. |
| `patient_id` | UUID | FK, NOT NULL | Referencia a `patients(id)` con DELETE CASCADE. |
| `lmp` | DATE | - | Fecha de Última Regla (FUR). |
| `edd` | DATE | - | Fecha Probable de Parto (FPP). |
| `gravida` | INTEGER | DEFAULT 1 | Número total de embarazos. |
| `para` | INTEGER | DEFAULT 0 | Número de partos. |
| `abortions` | INTEGER | DEFAULT 0 | Número de abortos. |
| `cesareans` | INTEGER | DEFAULT 0 | Número de cesáreas. |
| `risk_level` | risk_level | NOT NULL, DEFAULT 'low' | Nivel de riesgo obstétrico. |
| `risk_factors` | TEXT[] | - | Array de factores de riesgo (Ej. ["Hipertensión", "Diabetes Gestacional"]). |
| `is_active` | BOOLEAN | DEFAULT true | Indica si el embarazo está en curso. |
| `delivery_date` | DATE | - | Fecha real del parto (se llena al finalizar). |
| `created_by` | UUID | FK | Referencia al usuario que registró el embarazo. |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de última actualización. |

### 2.4 Tabla: `prenatal_controls` (Controles Prenatales)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único del control. |
| `pregnancy_id` | UUID | FK, NOT NULL | Referencia a `pregnancies(id)` con DELETE CASCADE. |
| `patient_id` | UUID | FK, NOT NULL | Referencia a `patients(id)` con DELETE CASCADE. |
| `control_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Fecha de la consulta de control. |
| `gestational_weeks` | INTEGER | NOT NULL | Semanas de gestación. |
| `weight_kg` | DECIMAL(5,2) | NOT NULL | Peso en kilogramos. |
| `blood_pressure_systolic` | INTEGER | NOT NULL | Presión arterial sistólica. |
| `blood_pressure_diastolic`| INTEGER | NOT NULL | Presión arterial diastólica. |
| `fetal_heart_rate` | INTEGER | - | Frecuencia Cardíaca Fetal (latidos por minuto). |
| `fundal_height_cm` | INTEGER | - | Altura uterina en centímetros. |
| `fetal_presentation` | TEXT | - | Presentación fetal (Cefálica, Pélvica, Transversa). |
| `symptoms` | TEXT | - | Notas médicas o síntomas reportados. |
| `doctor_id` | UUID | FK | Referencia al médico que atendió (`profiles(id)`). |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora de última actualización. |

### 2.5 Tabla: `appointments` (Citas Médicas)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único de la cita. |
| `patient_id` | UUID | FK, NOT NULL | Referencia al paciente. |
| `doctor_id` | UUID | FK | Referencia al médico asignado. |
| `appointment_date` | DATE | NOT NULL | Fecha programada. |
| `appointment_time` | TIME | NOT NULL | Hora programada. |
| `type` | appointment_type| NOT NULL | Tipo de cita. |
| `status` | appointment_status| NOT NULL, DEFAULT 'pending' | Estado de la cita. |
| `notes` | TEXT | - | Notas adicionales. |
| `created_by` | UUID | FK | Usuario que programó la cita. |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de última actualización. |

### 2.6 Tabla: `referrals` (Referencias Médicas / Traslados)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador único de la referencia. |
| `patient_id` | UUID | FK, NOT NULL | Referencia al paciente trasladado. |
| `pregnancy_id` | UUID | FK | Referencia al embarazo (opcional). |
| `destination_facility` | TEXT | NOT NULL | Centro médico de destino (Ej. Hospital Regional Nuevo Amanecer). |
| `reason` | TEXT | NOT NULL | Motivo del traslado. |
| `clinical_summary` | TEXT | - | Resumen clínico. |
| `referred_by` | UUID | FK | Usuario que autoriza/crea la referencia. |
| `status` | referral_status | NOT NULL, DEFAULT 'in_progress'| Estado de la referencia. |
| `referral_date` | DATE | NOT NULL, DEFAULT CURRENT_DATE | Fecha de la referencia. |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de última actualización. |

### 2.7 Tabla: `admissions` (Admisiones / Ocupación de Camas)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador de la admisión. |
| `patient_id` | UUID | FK, NOT NULL | Referencia al paciente ingresado. |
| `pregnancy_id` | UUID | FK | Referencia al embarazo. |
| `bed_number` | TEXT | - | Número de cama asignada. |
| `admission_date` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Fecha y hora de ingreso. |
| `discharge_date` | TIMESTAMPTZ | - | Fecha y hora de alta. |
| `reason` | TEXT | NOT NULL | Motivo de la admisión. |
| `status` | admission_status| NOT NULL, DEFAULT 'admitted' | Estado de la admisión. |
| `created_by` | UUID | FK | Usuario que procesó el ingreso. |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación. |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha de última actualización. |

### 2.8 Tabla: `audit_logs` (Registros de Auditoría)

| Campo | Tipo de Dato | Restricciones | Descripción |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Identificador del registro de auditoría. |
| `table_name` | TEXT | NOT NULL | Nombre de la tabla modificada. |
| `record_id` | UUID | NOT NULL | Identificador del registro modificado. |
| `action` | audit_action_type | NOT NULL | Tipo de acción (INSERT, UPDATE, DELETE). |
| `old_data` | JSONB | - | Estado de los datos antes de la modificación. |
| `new_data` | JSONB | - | Estado de los datos tras la modificación. |
| `changed_by` | UUID | FK | Referencia al usuario que realizó el cambio. |
| `changed_at` | TIMESTAMPTZ | DEFAULT NOW() | Fecha y hora del cambio. |

---
**Nota:** El campo `updated_at` se actualiza automáticamente en las tablas principales a través de disparadores (Triggers) de PostgreSQL. Además, el seguimiento de cambios (Auditoría) también está automatizado por Triggers en las tablas principales (`patients`, `pregnancies`, `prenatal_controls`).
