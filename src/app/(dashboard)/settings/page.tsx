'use client'

import { Settings, User, Shield, Database, Bell, Globe } from 'lucide-react'

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
  },
  {
    icon: Database,
    title: 'Base de Datos / Supabase',
    description: 'Configuración de credenciales y sincronización con Supabase.',
    color: '#10b981',
  },
  {
    icon: Globe,
    title: 'Idioma e i18n',
    description: 'Cambiar entre Español y Miskitu para el sistema (en desarrollo).',
    color: '#f59e0b',
  },
]

export default function SettingsPage() {
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
    </div>
  )
}
