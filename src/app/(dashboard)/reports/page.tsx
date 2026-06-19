'use client'

import { useState } from 'react'
import { FileText, Download, Calendar, Users, Baby, BarChart3, Loader2, Bed, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const reportTypes = [
  { icon: Users, title: 'Reporte de Pacientes', description: 'Listado completo de pacientes registradas en el período seleccionado.', color: '#1e3a8a' },
  { icon: Baby, title: 'Controles Prenatales', description: 'Resumen estadístico de todos los controles prenatales realizados.', color: '#0d9488' },
  { icon: BarChart3, title: 'Indicadores Perinatales', description: 'Tasas de mortalidad, morbilidad materna e indicadores MINSA.', color: '#10b981' },
  { icon: FileText, title: 'Expedientes Completos', description: 'Exportar la matriz consolidada de expedientes con su historial activo en CSV.', color: '#7c3aed' },
  { icon: Bed, title: 'Camas Ocupadas', description: 'Reporte de pacientes actualmente ingresadas en el centro médico.', color: '#ea580c' },
  { icon: AlertTriangle, title: 'Embarazos de Riesgo', description: 'Listado de embarazos activos clasificados con nivel de riesgo medio o alto.', color: '#dc2626' },
]

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const supabase = createClient()

  const generatePatientsReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase.from('patients').select('*').is('deleted_at', null).order('created_at', { ascending: false })
      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Nombres', 'Apellidos', 'Fecha Nacimiento', 'Sangre', 'Comunidad', 'Telefono', 'Contacto Emergencia', 'Fecha Registro']
      const rows = data.map(p => [
        p.mrn, p.first_name, p.last_name, p.date_of_birth, p.blood_type, p.community, p.phone_number || 'N/A', p.emergency_contact_name || 'N/A', new Date(p.created_at).toLocaleDateString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      // UTF-8 BOM para que Excel lea los tildes correctamente
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Reporte_Pacientes_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reporte CSV descargado exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generatePrenatalControlsReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('prenatal_controls')
        .select(`
          *,
          patients (mrn, first_name, last_name)
        `)
        .order('control_date', { ascending: false })
      
      if (startDate) query = query.gte('control_date', startDate)
      if (endDate) query = query.lte('control_date', endDate)
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Paciente', 'Fecha Control', 'Semanas Gest.', 'Peso (kg)', 'Presion (mmHg)', 'Latidos Fetales (lpm)', 'Altura Uterina (cm)', 'Presentacion Fetal', 'Sintomas']
      const rows = data.map((c: any) => [
        c.patients?.mrn,
        `${c.patients?.first_name} ${c.patients?.last_name}`,
        c.control_date,
        c.gestational_weeks,
        c.weight_kg,
        `${c.blood_pressure_systolic}/${c.blood_pressure_diastolic}`,
        c.fetal_heart_rate || 'N/A',
        c.fundal_height_cm || 'N/A',
        c.fetal_presentation || 'N/A',
        c.symptoms || 'N/A'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Reporte_Controles_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reporte de Controles descargado exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateIndicatorsReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('pregnancies')
        .select(`
          *,
          patients (mrn, first_name, last_name, community, date_of_birth)
        `)
        .order('created_at', { ascending: false })
      
      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Paciente', 'Comunidad', 'Edad Materna', 'F.U.R', 'F.P.P', 'Nivel Riesgo', 'Factores Riesgo', 'Gestas', 'Partos', 'Abortos', 'Cesareas', 'Fecha Parto (Real)']
      const rows = data.map((p: any) => {
        let age = 'N/A'
        if (p.patients?.date_of_birth) {
           const diff = new Date().getTime() - new Date(p.patients.date_of_birth).getTime()
           age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)).toString()
        }

        return [
          p.patients?.mrn,
          `${p.patients?.first_name} ${p.patients?.last_name}`,
          p.patients?.community,
          age,
          p.lmp || 'N/A',
          p.edd || 'N/A',
          p.risk_level === 'high' ? 'ALTO' : p.risk_level === 'medium' ? 'MEDIO' : 'BAJO',
          p.risk_factors ? p.risk_factors.join('; ') : 'Ninguno',
          p.gravida,
          p.para,
          p.abortions,
          p.cesareans,
          p.delivery_date || 'Pendiente'
        ]
      })
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Indicadores_Perinatales_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reporte de Indicadores descargado exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMasterReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('patients')
        .select(`
          *,
          pregnancies (
            risk_level, gravida, para
          ),
          prenatal_controls (id)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (startDate) query = query.gte('created_at', `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`)
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Paciente', 'Comunidad', 'Estado', 'Gestas', 'Partos', 'Riesgo Obstetrico', 'Total Controles Realizados', 'Fecha Registro']
      
      const rows = data.map((p: any) => {
        const activePregnancy = p.pregnancies && p.pregnancies.length > 0 ? p.pregnancies[0] : null
        
        return [
          p.mrn,
          `${p.first_name} ${p.last_name}`,
          p.community,
          p.status === 'active' ? 'ACTIVA' : p.status === 'delivered' ? 'PUERPERIO' : 'OTRO',
          activePregnancy ? activePregnancy.gravida : 0,
          activePregnancy ? activePregnancy.para : 0,
          activePregnancy ? (activePregnancy.risk_level === 'high' ? 'ALTO' : activePregnancy.risk_level === 'medium' ? 'MEDIO' : 'BAJO') : 'N/A',
          p.prenatal_controls ? p.prenatal_controls.length : 0,
          new Date(p.created_at).toLocaleDateString()
        ]
      })
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Master_Expedientes_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Expedientes exportados exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte maestro')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateBedsReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('admissions')
        .select(`
          *,
          patients (mrn, first_name, last_name)
        `)
        .eq('status', 'admitted')
        .order('admission_date', { ascending: false })
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Paciente', 'Cama', 'Motivo', 'Fecha de Admision']
      const rows = data.map((a: any) => [
        a.patients?.mrn,
        `${a.patients?.first_name} ${a.patients?.last_name}`,
        a.bed_number || 'N/A',
        a.reason || 'N/A',
        new Date(a.admission_date).toLocaleString()
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Camas_Ocupadas_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reporte de Camas Ocupadas descargado exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateRiskPregnanciesReport = async () => {
    setIsGenerating(true)
    try {
      let query = supabase
        .from('pregnancies')
        .select(`
          *,
          patients (mrn, first_name, last_name, phone_number, community)
        `)
        .eq('is_active', true)
        .in('risk_level', ['medium', 'high'])
        .order('created_at', { ascending: false })
      
      const { data, error } = await query
      if (error) throw error
      
      const headers = ['Expediente', 'Paciente', 'Comunidad', 'Telefono', 'Nivel de Riesgo', 'Factores de Riesgo', 'FPP']
      const rows = data.map((p: any) => [
        p.patients?.mrn,
        `${p.patients?.first_name} ${p.patients?.last_name}`,
        p.patients?.community || 'N/A',
        p.patients?.phone_number || 'N/A',
        p.risk_level === 'high' ? 'ALTO' : 'MEDIO',
        p.risk_factors ? p.risk_factors.join('; ') : 'N/A',
        p.edd || 'N/A'
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(','))
      ].join('\n')
      
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF])
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' })
      
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `Embarazos_Riesgo_SIACEM_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Reporte de Embarazos de Riesgo descargado exitosamente')
    } catch (err) {
      toast.error('Error al generar el reporte')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReportClick = (title: string) => {
    if (title === 'Reporte de Pacientes') {
      generatePatientsReport()
    } else if (title === 'Controles Prenatales') {
      generatePrenatalControlsReport()
    } else if (title === 'Indicadores Perinatales') {
      generateIndicatorsReport()
    } else if (title === 'Expedientes Completos') {
      generateMasterReport()
    } else if (title === 'Camas Ocupadas') {
      generateBedsReport()
    } else if (title === 'Embarazos de Riesgo') {
      generateRiskPregnanciesReport()
    } else {
      toast.info('Este reporte estará disponible próximamente.')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">Generación de informes estadísticos y exportación de datos clínicos.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {reportTypes.map((report, i) => {
          const Icon = report.icon
          return (
            <motion.div key={report.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 hover:shadow-md transition-all group cursor-pointer"
              onClick={() => handleReportClick(report.title)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${report.color}18` }}>
                  <Icon className="w-6 h-6" style={{ color: report.color }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">{report.title}</div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{report.description}</p>
                    <button className="mt-4 inline-flex items-center gap-2 text-xs font-semibold group-hover:gap-3 transition-all"
                      style={{ color: report.color }}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Procesando...</>
                      ) : (
                        <><Download className="w-3.5 h-3.5" /> Generar Reporte</>
                      )}
                    </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Date Selector */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Filtro de Período
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-sm">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full py-2.5 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}
