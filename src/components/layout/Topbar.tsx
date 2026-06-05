'use client'

import { Bell, Search, Sun, Moon, Wifi, WifiOff, User, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

interface TopbarProps {
  pageTitle?: string
  pageSubtitle?: string
}

export function Topbar({ pageTitle = 'Dashboard', pageSubtitle }: TopbarProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [isOnline] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [hasNotifications] = useState(3)
  const router = useRouter()

  const handleLogout = () => {
    router.push('/login')
  }

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center px-6 gap-4"
      style={{ borderBottom: '1px solid #e2e8f0' }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-foreground leading-none">{pageTitle}</h1>
        {pageSubtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{pageSubtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background text-sm text-muted-foreground w-72 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
        </motion.button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors ml-1 cursor-pointer outline-none" aria-label="Menú de usuario">
            <Avatar className="w-7 h-7">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0d9488)' }}>
                DM
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-foreground leading-none">Dr. Médico</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Médico</div>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Dr. Médico</p>
                <p className="text-xs text-muted-foreground">medico@casamaterna.ni</p>
              </div>
            </DropdownMenuLabel>
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
