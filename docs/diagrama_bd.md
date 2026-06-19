# Diagrama de Base de Datos - SIACEM
*Diagrama Entidad-Relación (ERD) del Sistema Inteligente Automatizado para el Control de Expedientes Médicos*

A continuación se presenta el diagrama visual que representa las tablas de la base de datos, sus campos principales y cómo se relacionan entre sí.

```mermaid
erDiagram
    %% Relaciones entre Usuarios/Personal (profiles) y las demás entidades
    profiles ||--o{ patients : "crea"
    profiles ||--o{ pregnancies : "registra"
    profiles ||--o{ prenatal_controls : "atiende (doctor_id)"
    profiles ||--o{ appointments : "atiende / programa"
    profiles ||--o{ referrals : "autoriza_traslado"
    profiles ||--o{ admissions : "procesa_ingreso"
    profiles ||--o{ audit_logs : "realiza_cambio"

    %% Relaciones de los Pacientes con su historial clínico
    patients ||--o{ pregnancies : "tiene"
    patients ||--o{ prenatal_controls : "recibe"
    patients ||--o{ appointments : "programa"
    patients ||--o{ referrals : "es_trasladado"
    patients ||--o{ admissions : "es_ingresado"

    %% Relaciones de los Embarazos con otras áreas clínicas
    pregnancies ||--o{ prenatal_controls : "requiere"
    pregnancies |o--o{ referrals : "motiva (opcional)"
    pregnancies |o--o{ admissions : "motiva (opcional)"

    %% Estructura de Tablas (Entidades)
    profiles {
        uuid id PK "Referencia a auth.users"
        text email "Único"
        text full_name
        user_role role
        text license_number "MINSA"
        boolean is_active
    }

    patients {
        uuid id PK
        text mrn "No. Expediente (Único)"
        text first_name
        text last_name
        date date_of_birth
        text id_card "Cédula"
        patient_status status
        uuid created_by FK
    }

    pregnancies {
        uuid id PK
        uuid patient_id FK
        date lmp "Última Regla"
        date edd "Probable Parto"
        integer gravida "Total Embarazos"
        risk_level risk_level
        boolean is_active
    }

    prenatal_controls {
        uuid id PK
        uuid pregnancy_id FK
        uuid patient_id FK
        date control_date
        integer gestational_weeks
        decimal weight_kg
        uuid doctor_id FK
    }

    appointments {
        uuid id PK
        uuid patient_id FK
        uuid doctor_id FK
        date appointment_date
        time appointment_time
        appointment_type type
        appointment_status status
    }

    referrals {
        uuid id PK
        uuid patient_id FK
        uuid pregnancy_id FK "Opcional"
        text destination_facility "Destino"
        text reason "Motivo"
        uuid referred_by FK
        referral_status status
    }

    admissions {
        uuid id PK
        uuid patient_id FK
        uuid pregnancy_id FK "Opcional"
        text bed_number
        timestamptz admission_date
        text reason
        admission_status status
        uuid created_by FK
    }

    audit_logs {
        uuid id PK
        text table_name
        uuid record_id
        audit_action_type action
        uuid changed_by FK
    }
```

> [!NOTE]
> **Convenciones del Diagrama:**
> - **PK**: Llave Primaria (Identificador único de la tabla).
> - **FK**: Llave Foránea (Referencia a un registro en otra tabla).
> - La notación `||--o{` significa que "1 registro de la primera tabla puede estar relacionado con 0 o muchos registros de la segunda tabla" (Relación 1 a muchos).
> - La notación `|o--o{` significa que "es opcional en la primera tabla y puede tener muchos en la segunda".
