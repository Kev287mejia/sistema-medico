import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  reloadOnOnline: true,
  disable: true, // Forzar desactivación temporal para limpiar el caché de Vercel
})

const nextConfig: NextConfig = {
  turbopack: {}, // Silence Next.js 16 turbopack warning
}

export default withSerwist(nextConfig)
