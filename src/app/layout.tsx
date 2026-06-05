import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SIACEM – Casa Materna Cecilia Lizario',
  description:
    'Sistema Inteligente Automatizado para el Control de Expedientes Médicos de la Casa Materna Cecilia Lizario, Waspam Río Coco, Nicaragua.',
  keywords: ['SIACEM', 'expedientes médicos', 'casa materna', 'prenatal', 'Nicaragua'],
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  )
}
