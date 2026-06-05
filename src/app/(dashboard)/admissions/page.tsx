'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BedDouble, Plus, LogOut, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    patient_id: '',
    bed_number: '',
    reason: ''
  })

  useEffect(() => {
    loadAdmissions()
    loadPatients()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPatients() {
    const { data } = await supabase
      .from('patients')
      .select('id, first_name, last_name, mrn')
      .is('deleted_at', null)
      .order('first_name')
    if (data) setPatientsList(data)
  }

  async function handleAdmitSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.patient_id || !formData.reason) {
      toast.error('Por favor selecciona una paciente y escribe la razón')
      return
    }

    setSubmitting(true)
    const { error } = await supabase.from('admissions').insert({
      patient_id: formData.patient_id,
      bed_number: formData.bed_number,
      reason: formData.reason,
      status: 'admitted'
    })

    setSubmitting(false)

    if (error) {
      toast.error('Error al ingresar paciente')
      console.error(error)
    } else {
      toast.success('Paciente ingresada correctamente')
      setIsAdmitModalOpen(false)
      setFormData({ patient_id: '', bed_number: '', reason: '' })
      loadAdmissions()
    }
  }

  async function loadAdmissions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('admissions')
      .select(`
        id,
        bed_number,
        admission_date,
        reason,
        status,
        patients ( id, first_name, last_name, mrn, community )
      `)
      .eq('status', 'admitted')
      .order('admission_date', { ascending: false })

    if (error) {
      toast.error('Error al cargar camas ocupadas')
      console.error(error)
    } else {
      setAdmissions(data || [])
    }
    setLoading(false)
  }

  async function dischargePatient(id: string) {
    if (!confirm('¿Estás seguro de que deseas dar de alta a esta paciente y liberar la cama?')) return

    const { error } = await supabase
      .from('admissions')
      .update({
        status: 'discharged',
        discharge_date: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('Error al dar de alta')
    } else {
      toast.success('Paciente dada de alta, cama liberada')
      loadAdmissions()
    }
  }

  // Capacidad de camas estática según la Casa Materna
  const totalBeds = 20
  const occupiedBeds = admissions.length

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Ocupación de Camas</h1>
          <p className="text-muted-foreground mt-1">
            Casa Materna Cecilia Lizario
          </p>
        </div>
        <Button className="shrink-0" onClick={() => setIsAdmitModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ingresar Paciente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass-panel border-0 shadow-floating">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
              <BedDouble className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Camas Ocupadas</p>
              <h3 className="text-3xl font-bold text-cyan-700">{occupiedBeds} <span className="text-lg text-muted-foreground">/ {totalBeds}</span></h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-0 shadow-floating">
        <CardHeader>
          <CardTitle className="text-lg">Pacientes Ingresadas ({occupiedBeds})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando camas...</div>
          ) : admissions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-foreground">Todas las camas están libres</p>
              <p className="text-sm text-muted-foreground">No hay pacientes ingresadas actualmente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admissions.map((adm, i) => {
                const patient = adm.patients as any
                const name = patient ? `${patient.first_name} ${patient.last_name}` : 'Desconocida'
                const community = patient?.community || 'Sin comunidad'
                const exp = patient?.mrn || 'N/A'
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={adm.id}
                    className="border border-border bg-card rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                          <BedDouble className="w-3.5 h-3.5" />
                          Cama {adm.bed_number || 'S/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">{exp}</span>
                      </div>
                      <h4 className="font-bold text-foreground text-lg leading-tight mb-1">{name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{community}</p>
                      
                      <div className="bg-muted/50 rounded-lg p-2.5 mb-4">
                        <p className="text-xs font-medium text-foreground">Razón de Ingreso:</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{adm.reason}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => dischargePatient(adm.id)}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Dar de Alta
                    </Button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Admit Patient Modal */}
      <Dialog open={isAdmitModalOpen} onOpenChange={setIsAdmitModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ingresar Paciente a Cama</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdmitSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                required
              >
                <option value="">-- Seleccionar Paciente --</option>
                {patientsList.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Número de Cama (Opcional)</Label>
              <Input 
                placeholder="Ej. Cama 3, Cama A..." 
                value={formData.bed_number}
                onChange={(e) => setFormData({...formData, bed_number: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Razón de Ingreso</Label>
              <Input 
                placeholder="Ej. Trabajo de parto, Observación..." 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAdmitModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Confirmar Ingreso'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
