'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Shield, Database, Bell, Globe, Save, Loader2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'

const sections = [
  {
    icon: User,
    title: 'Perfil del Usuario',
    description: 'Nombre, especialidad, correo y contraseña del médico o personal activo.',
    color: '#1e3a8a',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Configurar alertas de riesgo automáticas, recordatorios de citas y umbrales clínicos.',
    color: '#0d9488',
  },
  {
    icon: Shield,
    title: 'Seguridad y Accesos',
    description: 'Gestión de roles y permisos para cada tipo de personal (Médico, Enfermera, Recepción).',
    color: '#7c3aed',
  }
]

export default function SettingsPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isStaffOpen, setIsStaffOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [staffList, setStaffList] = useState<any[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: '',
    license_number: '',
    email: '',
    password: ''
  })

  const [staffForm, setStaffForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'nurse',
    license_number: ''
  })

  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setFormData({
            full_name: data.full_name || '',
            license_number: data.license_number || '',
            email: data.email || user.email || '',
            password: ''
          })
        }
      }
    }
    loadProfile()
  }, [supabase])

  const fetchStaff = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (data) setStaffList(data)
  }

  const fetchUpcomingAppointments = async () => {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (first_name, last_name, phone_number)
      `)
      .gte('appointment_date', today)
      .lte('appointment_date', nextWeek)
      .in('status', ['pending', 'rescheduled'])
      .order('appointment_date', { ascending: true })

    if (data) setUpcomingAppointments(data)
  }

  useEffect(() => {
    const handleOpenNotifs = () => {
      setIsNotificationsOpen(true)
      fetchUpcomingAppointments()
    }

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('open') === 'notifications') {
        handleOpenNotifs()
        window.history.replaceState({}, '', '/settings')
      }
      
      window.addEventListener('open-notifications', handleOpenNotifs)
      return () => window.removeEventListener('open-notifications', handleOpenNotifs)
    }
  }, [supabase])

  const handleSectionClick = (title: string) => {
    if (title === 'Perfil del Usuario') {
      setIsProfileOpen(true)
    } else if (title === 'Notificaciones') {
      setIsNotificationsOpen(true)
      fetchUpcomingAppointments()
    } else if (title === 'Seguridad y Accesos') {
      setIsStaffOpen(true)
      setIsAddingStaff(false)
      fetchStaff()
    } else {
      toast.info('Sección en desarrollo')
    }
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al crear personal')
      
      toast.success('Personal registrado exitosamente')
      setStaffForm({ full_name: '', email: '', password: '', role: 'nurse', license_number: '' })
      setIsAddingStaff(false)
      fetchStaff()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // 1. Update Profile Table
      const { error: profileError } = await supabase.from('profiles')
        .update({
          full_name: formData.full_name,
          license_number: formData.license_number,
          email: formData.email
        })
        .eq('id', userId)
      
      if (profileError) throw profileError

      // 2. Update Auth User if email or password changed
      const updateAuth: any = {}
      if (formData.email) updateAuth.email = formData.email
      if (formData.password) updateAuth.password = formData.password
      
      if (Object.keys(updateAuth).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(updateAuth)
        if (authError) throw authError
      }

      toast.success('Perfil actualizado correctamente')
      setIsProfileOpen(false)
      setFormData(prev => ({ ...prev, password: '' })) // Clear password
    } catch (err: any) {
      toast.error('Error al actualizar: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-0.5">Administra la cuenta, seguridad y preferencias del sistema.</p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, i) => {
          const Icon = section.icon
          return (
            <div key={i}
              onClick={() => handleSectionClick(section.title)}
              className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${section.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: section.color }} />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{section.title}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{section.description}</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                <span className="text-sm">›</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border text-center text-xs text-muted-foreground">
        SIACEM v1.0.0-beta · Casa Materna Cecilia Lizario · Waspam Río Coco, Nicaragua · 2026
      </div>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Perfil del Usuario</SheetTitle>
            <SheetDescription>Actualiza tu información personal y credenciales de acceso al sistema.</SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nombre Completo</label>
              <Input 
                required
                value={formData.full_name}
                onChange={e => setFormData({...formData, full_name: e.target.value})}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Especialidad / Licencia (MINSA)</label>
              <Input 
                value={formData.license_number}
                onChange={e => setFormData({...formData, license_number: e.target.value})}
                placeholder="Ej. Médico General - 12345"
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
              <Input 
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-sm font-medium text-foreground">Cambiar Contraseña (Opcional)</label>
              <Input 
                type="password"
                placeholder="Ingresa una nueva contraseña"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="rounded-xl border-border bg-background focus-visible:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">Déjalo en blanco si no deseas cambiarla.</p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 mt-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={isStaffOpen} onOpenChange={setIsStaffOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Gestión de Personal</SheetTitle>
            <SheetDescription>Administra a los médicos, enfermeras y administradores con acceso al sistema.</SheetDescription>
          </SheetHeader>
          
          {!isAddingStaff ? (
            <div className="space-y-6">
              <button 
                onClick={() => setIsAddingStaff(true)}
                className="w-full py-3 rounded-xl border-2 border-dashed border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-colors"
              >
                + Registrar Nuevo Personal
              </button>
              
              <div className="space-y-3">
                {staffList.map((staff, idx) => (
                  <div key={idx} className="bg-card border border-border p-4 rounded-xl flex justify-between items-center shadow-sm">
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {staff.full_name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold">
                          {staff.role}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">{staff.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddStaff} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nombre Completo</label>
                <Input required value={staffForm.full_name} onChange={e => setStaffForm({...staffForm, full_name: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Rol en el Sistema</label>
                <select 
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={staffForm.role}
                  onChange={e => setStaffForm({...staffForm, role: e.target.value})}
                >
                  <option value="nurse">Enfermera</option>
                  <option value="doctor">Médico</option>
                  <option value="reception">Recepción</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Licencia MINSA (Opcional)</label>
                <Input value={staffForm.license_number} onChange={e => setStaffForm({...staffForm, license_number: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Correo Electrónico (Acceso)</label>
                <Input type="email" required value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contraseña Temporal</label>
                <Input type="password" required value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} className="rounded-xl" />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingStaff(false)} className="flex-1 py-3 rounded-xl border border-border font-semibold hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Centro de Notificaciones</SheetTitle>
            <SheetDescription>Recordatorios automáticos por WhatsApp para citas de los próximos 7 días.</SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                No hay citas programadas para los próximos 7 días.
              </div>
            ) : (
              upcomingAppointments.map((apt, idx) => {
                const phone = apt.patients?.phone_number
                const hasPhone = phone && phone.length >= 8
                
                // Format message
                const dateParts = apt.appointment_date.split('-')
                const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
                const timeStr = apt.appointment_time.substring(0, 5)
                
                const typeMap: Record<string, string> = {
                  prenatal_control: 'Control Prenatal',
                  ultrasound: 'Ultrasonido',
                  general: 'Consulta General',
                  emergency: 'Emergencia'
                }
                const typeName = typeMap[apt.type] || 'Cita Médica'
                
                const message = `Hola ${apt.patients?.first_name}, la Casa Materna Cecilia Lizario le recuerda que tiene programada una cita de *${typeName}* para el día *${formattedDate}* a las *${timeStr}*. ¡Le esperamos!`
                
                const handleSendWhatsApp = () => {
                  if (!hasPhone) return toast.error('La paciente no tiene número telefónico registrado.')
                  
                  let cleanPhone = phone.replace(/\D/g, '')
                  if (cleanPhone.length === 8) cleanPhone = `505${cleanPhone}`
                  
                  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
                  window.open(url, '_blank')
                }

                return (
                  <div key={idx} className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3">
                    <div>
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        {apt.patients?.first_name} {apt.patients?.last_name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase font-bold">
                          {formattedDate}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {typeName} a las {timeStr}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSendWhatsApp}
                      disabled={!hasPhone}
                      className="w-full py-2.5 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: hasPhone ? '#25D366' : '#e2e8f0', color: hasPhone ? '#fff' : '#64748b' }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {hasPhone ? 'Enviar por WhatsApp' : 'Sin Teléfono Registrado'}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
