-- ==============================================================================
-- SIACEM - SEED DATA PARA PRUEBAS (Insertar en Supabase SQL Editor)
-- ==============================================================================

-- 1. Insertar Pacientes de Prueba
INSERT INTO public.patients (id, mrn, first_name, last_name, date_of_birth, id_card, community, status)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'EXP-2026-001', 'María Elena', 'Flores', '1995-05-14', '001-140595-0000A', 'Waspam', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'EXP-2026-002', 'Carmen', 'Rojas Díaz', '1988-11-02', '001-021188-0000B', 'Santa Marta', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'EXP-2026-003', 'Julia', 'López', '2001-08-20', '001-200801-0000C', 'Bilkwi', 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar Embarazos de Prueba
INSERT INTO public.pregnancies (id, patient_id, lmp, edd, gravida, para, risk_level, risk_factors)
VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2025-10-01', '2026-07-08', 2, 1, 'low', ARRAY['Ninguno']),
  ('bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '2025-11-15', '2026-08-22', 4, 3, 'high', ARRAY['Preeclampsia', 'Edad Materna Avanzada'])
ON CONFLICT (id) DO NOTHING;

-- 3. Insertar Controles Prenatales de Prueba
INSERT INTO public.prenatal_controls (id, pregnancy_id, patient_id, control_date, gestational_weeks, weight_kg, blood_pressure_systolic, blood_pressure_diastolic, fetal_heart_rate)
VALUES
  ('cccc1111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2026-06-01', 32, 65.5, 110, 70, 145),
  ('cccc2222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '2026-05-01', 28, 64.0, 115, 75, 140)
ON CONFLICT (id) DO NOTHING;
