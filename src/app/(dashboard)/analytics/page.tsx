'use client'

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const monthlyData = [
  { mes: 'Ene', controles: 18, nuevas: 4 },
  { mes: 'Feb', controles: 22, nuevas: 6 },
  { mes: 'Mar', controles: 19, nuevas: 3 },
  { mes: 'Abr', controles: 28, nuevas: 8 },
  { mes: 'May', controles: 24, nuevas: 5 },
  { mes: 'Jun', controles: 31, nuevas: 7 },
]

const riskData = [
  { name: 'Bajo Riesgo', value: 58, color: '#10b981' },
  { name: 'Riesgo Medio', value: 28, color: '#f59e0b' },
  { name: 'Riesgo Alto',  value: 14, color: '#ef4444' },
]

const kpis = [
  { label: 'Pacientes Activas', value: '42', change: '+4 este mes', positive: true },
  { label: 'Controles Realizados', value: '124', change: '+12 vs mes anterior', positive: true },
  { label: 'Alertas de Riesgo', value: '7', change: '-2 vs mes anterior', positive: true },
  { label: 'Referencias Emitidas', value: '3', change: '+1 vs mes anterior', positive: false },
]

export default function AnalyticsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analítica</h1>
        <p className="text-muted-foreground mt-1">Estadísticas y métricas de atención materna.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
            <div className="text-4xl font-bold mt-2 mb-1" style={{ color: '#1e3a8a' }}>{kpi.value}</div>
            <div className={`text-xs font-medium ${kpi.positive ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Actividad Mensual</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="controles" name="Controles" fill="#1e3a8a" radius={[6,6,0,0]} />
                <Bar dataKey="nuevas" name="Nuevas Pacientes" fill="#0d9488" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Distribución de Riesgo</h2>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" stroke="none">
                  {riskData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {riskData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
