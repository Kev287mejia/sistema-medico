'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Baby,
  CalendarCheck,
  AlertTriangle,
  ArrowRightLeft,
  UserPlus,
  BedDouble,
  Activity,
  Bell,
  TrendingUp,
  TrendingDown,
  Heart,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { createClient } from '@/lib/supabase/client'

// ── Demo Data (Charts) ──────────────────────────────────────────────────────────────
const monthlyAttentions = [
  { mes: 'Ene', atenciones: 145 },
  { mes: 'Feb', atenciones: 162 },
  { mes: 'Mar', atenciones: 178 },
  { mes: 'Abr', atenciones: 155 },
  { mes: 'May', atenciones: 190 },
  { mes: 'Jun', atenciones: 203 },
]

const riskDistribution = [
  { name: 'Riesgo Bajo', value: 38, color: '#10b981' },
  { name: 'Riesgo Medio', value: 14, color: '#f59e0b' },
  { name: 'Riesgo Alto', value: 11, color: '#ef4444' },
]

const recentAlerts = [
  { patient: 'María López', condition: 'Presión arterial elevada', risk: 'high', time: 'Hace 20 min', community: 'Waspam Centro' },
  { patient: 'Ana Martínez', condition: 'Consulta prenatal vencida (3 sem)', risk: 'medium', time: 'Hace 1 h', community: 'Kum' },
  { patient: 'Rosa García', condition: 'Anemia detectada (Hb 9.2)', risk: 'medium', time: 'Hace 2 h', community: 'Asang' },
  { patient: 'Juana Rivera', condition: 'Signos de preeclampsia', risk: 'high', time: 'Hace 3 h', community: 'Kisalaya' },
]



const communityData = [
  { community: 'Waspam', pacientes: 82 },
  { community: 'Kum', pacientes: 41 },
  { community: 'Asang', pacientes: 35 },
  { community: 'Kisalaya', pacientes: 28 },
  { community: 'Bilwas', pacientes: 22 },
  { community: 'Otras', pacientes: 39 },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const riskColors: Record<string, string> = {
  high: '#fef2f2',
  medium: '#fffbeb',
  low: '#f0fdf4',
}

const riskTextColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
}

const riskLabels: Record<string, string> = {
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  attended: { label: 'Atendida', color: '#10b981' },
  pending: { label: 'Pendiente', color: '#f59e0b' },
  cancelled: { label: 'Cancelada', color: '#ef4444' },
}

export default function DashboardPage() {
  const [counts, setCounts] = useState({
    totalPatients: 0,
    activePregnancies: 0,
    highRisk: 0,
    referrals: 0,
    appointmentsToday: 0
  })
  const [appointmentsList, setAppointmentsList] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function loadKPIs() {
      const today = new Date().toISOString().split('T')[0]
      const [pRes, prRes, riskRes, refRes, apptRes] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('pregnancies').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('pregnancies').select('*', { count: 'exact', head: true }).eq('is_active', true).eq('risk_level', 'high'),
        supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('appointment_date', today)
      ])

      setCounts({
        totalPatients: pRes.count || 0,
        activePregnancies: prRes.count || 0,
        highRisk: riskRes.count || 0,
        referrals: refRes.count || 0,
        appointmentsToday: apptRes.count || 0
      })

      const { data: apptData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          type,
          status,
          patients (first_name, last_name),
          profiles!doctor_id (full_name)
        `)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true })

      if (apptData) {
        setAppointmentsList(apptData.map(a => ({
          patient: `${(a.patients as any)?.first_name || ''} ${(a.patients as any)?.last_name || ''}`.trim(),
          time: a.appointment_time.substring(0, 5),
          type: a.type === 'prenatal_control' ? 'Control Prenatal' : a.type === 'ultrasound' ? 'Ultrasonido' : 'General',
          doctor: (a.profiles as any)?.full_name || 'Sin asignar',
          status: a.status === 'completed' ? 'attended' : a.status === 'cancelled' ? 'cancelled' : 'pending'
        })))
      }
    }
    loadKPIs()
  }, [supabase])

  const kpiData = [
    { label: 'Total Pacientes', value: counts.totalPatients.toString(), icon: Users, trend: 'Real', trendUp: true, color: '#1e3a8a', bg: '#eff6ff', sub: 'Registradas en BD' },
    { label: 'Embarazos Activos', value: counts.activePregnancies.toString(), icon: Baby, trend: 'Real', trendUp: true, color: '#0d9488', bg: '#f0fdfa', sub: 'En seguimiento' },
    { label: 'Citas Hoy', value: counts.appointmentsToday.toString(), icon: CalendarCheck, trend: 'Real', trendUp: true, color: '#10b981', bg: '#f0fdf4', sub: 'Agendadas hoy' },
    { label: 'Embarazos de Riesgo', value: counts.highRisk.toString(), icon: AlertTriangle, trend: 'Real', trendUp: false, color: '#ef4444', bg: '#fef2f2', sub: 'Requieren prioridad' },
    { label: 'Referencias Activas', value: counts.referrals.toString(), icon: ArrowRightLeft, trend: 'Real', trendUp: true, color: '#f59e0b', bg: '#fffbeb', sub: 'Traslados en curso' },
    { label: 'Ocupación de Camas', value: '14/20', icon: BedDouble, trend: 'Demo', trendUp: true, color: '#0891b2', bg: '#ecfeff', sub: 'Capacidad de unidad' },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-screen-2xl mx-auto"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Casa Materna Cecilia Lizario · Waspam Río Coco · Datos Reales
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Conectado a Supabase
        </div>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-panel shadow-floating border-0 overflow-hidden cursor-pointer rounded-2xl h-full">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: kpi.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${kpi.trendUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                      {kpi.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {kpi.trend}
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold font-heading mb-1" style={{ color: kpi.color }}>
                      {kpi.value}
                    </div>
                    <div className="text-sm font-bold text-foreground">{kpi.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-panel shadow-floating border-0 rounded-3xl h-full">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Atenciones Mensuales</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Consultas prenatales y controles 2026</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +14% vs 2025
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyAttentions} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAtenciones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                    cursor={{ stroke: '#1e3a8a', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="atenciones"
                    name="Atenciones"
                    stroke="#1e3a8a"
                    strokeWidth={2.5}
                    fill="url(#colorAtenciones)"
                    dot={{ fill: '#1e3a8a', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel shadow-floating border-0 rounded-3xl h-full">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-lg font-bold font-heading">Distribución de Riesgo</CardTitle>
              <p className="text-xs text-muted-foreground">Embarazos activos por nivel</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-2">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Alerts */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-panel shadow-floating border-0 rounded-3xl">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">Alertas Médicas Activas</CardTitle>
                    <p className="text-xs text-muted-foreground">Requieren atención prioritaria</p>
                  </div>
                </div>
                <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  Ver todas <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentAlerts.map((alert, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 + 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: riskColors[alert.risk] }}
                  >
                    <Heart className="w-4 h-4" style={{ color: riskTextColors[alert.risk] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{alert.patient}</div>
                    <div className="text-xs text-muted-foreground truncate">{alert.condition}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{alert.community}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ background: riskColors[alert.risk], color: riskTextColors[alert.risk] }}
                    >
                      Riesgo {riskLabels[alert.risk]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Today Appointments */}
        <motion.div variants={itemVariants}>
          <Card className="glass-panel shadow-floating border-0 rounded-3xl h-full">
            <CardHeader className="pb-4 pt-6 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Citas de Hoy</CardTitle>
                  <p className="text-xs text-muted-foreground">Jueves 5 de junio, 2026</p>
                </div>
                <Badge variant="secondary" className="text-xs">{appointmentsList.length} citas</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {appointmentsList.length === 0 ? (
                <div className="text-sm text-center text-muted-foreground py-4">No hay citas agendadas para hoy.</div>
              ) : (
                appointmentsList.map((apt, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="text-center shrink-0">
                      <div className="text-xs font-bold text-foreground">{apt.time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{apt.patient}</div>
                      <div className="text-[10px] text-muted-foreground">{apt.type} • {apt.doctor}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: statusConfig[apt.status]?.color || '#94a3b8' }}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Community Chart ── */}
      <motion.div variants={itemVariants}>
        <Card className="glass-panel shadow-floating border-0 rounded-3xl mb-8">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Pacientes por Comunidad</CardTitle>
                <p className="text-xs text-muted-foreground">Distribución geográfica de atenciones</p>
              </div>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={communityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="community" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: 'rgba(30,58,138,0.04)' }}
                />
                <Bar dataKey="pacientes" name="Pacientes" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
