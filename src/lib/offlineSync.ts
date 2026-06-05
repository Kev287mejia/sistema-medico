import { createClient } from '@/lib/supabase/client'

const SYNC_QUEUE_KEY = 'siacem_offline_sync_queue'

type SyncAction = {
  id: string
  table: string
  payload: any
  timestamp: number
}

export function addToSyncQueue(table: string, payload: any) {
  const queue: SyncAction[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]')
  queue.push({
    id: crypto.randomUUID(),
    table,
    payload,
    timestamp: Date.now()
  })
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

export async function processSyncQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return

  const queue: SyncAction[] = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]')
  if (queue.length === 0) return

  const supabase = createClient()
  const failedItems: SyncAction[] = []

  for (const item of queue) {
    try {
      const { error } = await supabase.from(item.table).insert(item.payload)
      if (error) {
        console.error('Sync error:', error)
        failedItems.push(item)
      }
    } catch (e) {
      console.error('Network error during sync:', e)
      failedItems.push(item)
    }
  }

  if (failedItems.length > 0) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(failedItems))
  } else {
    localStorage.removeItem(SYNC_QUEUE_KEY)
  }
}

export function initOfflineSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log('Back online. Processing sync queue...')
      processSyncQueue()
    })
    
    // Attempt sync on initial load if online
    if (navigator.onLine) {
      processSyncQueue()
    }
  }
}
