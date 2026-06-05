'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Baby,
  CalendarDays,
  ArrowRightLeft,
  BedDouble,
  BarChart3,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
export const getAllNavItems = (role?: string) => {
  const items = [
    {
      group: 'Principal',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Pacientes', href: '/patients', icon: Users },
        { label: 'Control Prenatal', href: '/prenatal', icon: Baby },
        { label: 'Citas', href: '/appointments', icon: CalendarDays },
      ],
    },
    {
      group: 'Gestión',
      items: [
        { label: 'Camas', href: '/admissions', icon: BedDouble },
        { label: 'Referencias', href: '/referrals', icon: ArrowRightLeft },
        { label: 'Alertas de Riesgo', href: '/alerts', icon: AlertTriangle },
        { label: 'Reportes', href: '/reports', icon: FileText },
      ],
    },
  ]

  // Add Analytics and Settings only for Admins and Doctors
  if (role === 'admin' || role === 'doctor') {
    items[1].items.push({ label: 'Analítica', href: '/analytics', icon: BarChart3 })
    items.push({
      group: 'Sistema',
      items: [
        { label: 'Configuración', href: '/settings', icon: Settings },
      ],
    })
  } else {
    items.push({
      group: 'Sistema',
      items: [
        { label: 'Configuración', href: '/settings', icon: Settings },
      ],
    })
  }

  return items
}


interface SidebarProps {
  className?: string
  role?: string
}

export function Sidebar({ className, role }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  const navItems = getAllNavItems(role)

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative hidden md:flex flex-col h-screen border-r border-border bg-sidebar overflow-hidden shrink-0 shadow-soft',
        className
      )}
    >
      {/* Logo Area */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border shrink-0',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}
        >
          <Heart className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="font-bold text-sm text-foreground tracking-tight leading-none">SIACEM</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">Casa Materna C. Lizario</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1"
                >
                  {group.group}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: collapsed ? 0 : 3 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer group',
                        collapsed && 'justify-center',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isActive && 'text-white')} />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2 w-full px-2.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Colapsar</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
