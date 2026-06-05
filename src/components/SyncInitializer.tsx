'use client'

import { useEffect } from 'react'
import { initOfflineSync } from '@/lib/offlineSync'

export function SyncInitializer() {
  useEffect(() => {
    initOfflineSync()
  }, [])
  return null
}
