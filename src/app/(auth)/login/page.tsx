'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Heart, Shield, Loader2, Lock, Mail, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [supabase, router])

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      toast.error('Credenciales incorrectas o usuario no encontrado')
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* ── Panel Izquierdo (Branding) ── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #0f1f5c 0%, #1e3a8a 40%, #0d9488 100%)' }}
      >
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">SIACEM</span>
            <div className="text-blue-200 text-xs tracking-widest uppercase">Sistema Médico</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="relative z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-emerald-300 font-medium"
            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Sistema Activo · Waspam Río Coco 2026
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            Salud materna<br />
            <span style={{ background: 'linear-gradient(90deg, #5eead4, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              inteligente y digital
            </span>
          </h1>

          <p className="text-blue-200 text-lg leading-relaxed max-w-md">
            Expedientes médicos digitales, control prenatal automatizado y trazabilidad completa.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-blue-300 text-sm"
        >
          <Shield className="w-4 h-4" />
          <span>Datos protegidos · Cumplimiento MINSA Nicaragua</span>
        </motion.div>
      </div>

      {/* ── Panel Derecho (Formulario) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-foreground text-lg">SIACEM</span>
          </div>

          <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible" className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground">Bienvenido</h2>
            <p className="text-muted-foreground">Ingresa tus credenciales para acceder al sistema</p>
          </motion.div>

          <motion.div custom={1} variants={fadeInUp} initial="hidden" animate="visible">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Correo electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="medico@casamaterna.gob.ni"
                    {...register('email')}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white
                      focus:ring-2 focus:ring-primary/25 focus:border-primary
                      ${errors.email ? 'border-destructive' : 'border-border hover:border-primary/40'}`}
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition-all bg-white
                      focus:ring-2 focus:ring-primary/25 focus:border-primary
                      ${errors.password ? 'border-destructive' : 'border-border hover:border-primary/40'}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  boxShadow: '0 4px 20px rgba(30,58,138,0.35)',
                }}
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando credenciales...</>
                  : 'Iniciar Sesión'}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
