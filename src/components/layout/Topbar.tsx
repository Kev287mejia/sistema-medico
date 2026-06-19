'use client'

import { Bell, Search, Sun, Moon, Wifi, WifiOff, User, LogOut, ChevronDown, Menu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAllNavItems } from './Sidebar'
import Link from 'next/link'

interface TopbarProps {
  pageTitle?: string
  pageSubtitle?: string
  profile?: any
}

export function Topbar({ pageTitle = 'Dashboard', pageSubtitle, profile }: TopbarProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const navItems = getAllNavItems(profile?.role)
  const [isOnline] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasNotifications, setHasNotifications] = useState(0)
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      const { data } = await supabase
        .from('patients')
        .select('id, first_name, last_name, mrn')
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,mrn.ilike.%${searchQuery}%`)
        .limit(5)
      
      if (data) {
        setSearchResults(data)
      }
      setIsSearching(false)
    }

    const timeoutId = setTimeout(() => {
      handleSearch()
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, supabase])

  useEffect(() => {
    const fetchPendingCount = async () => {
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', today)
        .lte('appointment_date', nextWeek)
        .in('status', ['pending', 'rescheduled'])
      
      if (count !== null) setHasNotifications(count)
    }
    fetchPendingCount()
  }, [supabase])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([])
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const toggleDark = async () => {
    if (!document.startViewTransition) {
      setDarkMode(!darkMode)
      document.documentElement.classList.toggle('dark')
      return
    }

    const transition = document.startViewTransition(() => {
      setDarkMode(!darkMode)
      document.documentElement.classList.toggle('dark')
    })

    await transition.ready

    document.documentElement.animate(
      { clipPath: ["inset(0 0 100% 0)", "inset(0)"] },
      { pseudoElement: "::view-transition-new(root)", duration: 600 }
    )
  }

  return (
    <header className="h-16 glass-panel shadow-soft sticky top-0 z-30 flex items-center px-4 md:px-6 gap-3 md:gap-4 mx-4 md:mx-6 mt-4 rounded-2xl mb-4">
      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger className="md:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
          <Menu className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r-0">
          <div className="flex items-center h-16 px-6 border-b border-border gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}>
              <svg className="w-4 h-4 text-white" fill="white" viewBox="0 0 24 24" stroke="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </div>
            <div>
              <div className="font-bold text-sm text-foreground tracking-tight leading-none">SIACEM</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Casa Materna</div>
            </div>
          </div>
          <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-4rem)]">
            {navItems.map((group) => (
              <div key={group.group}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : ''}`} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold font-heading text-foreground leading-none">{pageTitle}</h1>
        {pageSubtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{pageSubtitle}</p>
        )}
      </div>

      {/* Search */}
      <div ref={searchRef} className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-muted-foreground w-72 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 relative">
        <Search className="w-4 h-4 shrink-0" />
        <input
          id="global-search"
          type="text"
          placeholder="Buscar pacientes, expedientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border border-border text-muted-foreground">
          ⌘K
        </kbd>

        <AnimatePresence>
          {searchQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 left-0 w-full glass-panel shadow-floating border-0 rounded-2xl overflow-hidden py-2"
            >
              {isSearching ? (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">Buscando...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      router.push(`/patients/${p.id}`)
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors flex flex-col"
                  >
                    <span className="font-semibold text-foreground text-sm">{p.first_name} {p.last_name}</span>
                    <span className="text-xs text-muted-foreground">{p.mrn}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground text-center">No se encontraron resultados</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Online status */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          isOnline ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
        }`}>
          {isOnline ? (
            <><Wifi className="w-3.5 h-3.5" /><span>En línea</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5" /><span>Sin conexión</span></>
          )}
        </div>

        {/* Dark mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Cambiar modo"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </motion.button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            <AnimatePresence>
              {hasNotifications > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#ef4444' }}
                >
                  {hasNotifications}
                </motion.span>
              )}
            </AnimatePresence>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-sm font-semibold">Notificaciones</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="p-3 text-sm text-muted-foreground space-y-3">
              {hasNotifications > 0 ? (
                <p>Tienes <strong className="text-foreground">{hasNotifications} citas</strong> en los próximos 7 días que puedes confirmar.</p>
              ) : (
                <p>No tienes recordatorios pendientes de envío en este momento.</p>
              )}
              <button 
                onClick={() => {
                  router.push('/settings?open=notifications')
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-notifications'))
                  }
                }}
                className="w-full text-xs bg-primary/10 text-primary font-semibold py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
              >
                Abrir Centro de WhatsApp
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors ml-1 cursor-pointer outline-none" aria-label="Menú de usuario">
            <Avatar className="w-7 h-7">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}>
                {profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-foreground leading-none truncate max-w-[120px]">
                {profile?.full_name || 'Usuario'}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'doctor' ? 'Médico' : profile?.role === 'nurse' ? 'Enfermera' : 'Personal'}
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email || 'No email'}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
