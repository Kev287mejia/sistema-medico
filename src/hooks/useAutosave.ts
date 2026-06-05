import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useAutosave<T>(key: string, defaultValues: T) {
  const [hasDraft, setHasDraft] = useState(false)

  // Function to save draft
  const saveDraft = (data: T) => {
    try {
      localStorage.setItem(`draft_${key}`, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save draft:', e)
    }
  }

  // Function to clear draft
  const clearDraft = () => {
    localStorage.removeItem(`draft_${key}`)
    setHasDraft(false)
  }

  // Function to load draft
  const loadDraft = (): T | null => {
    try {
      const saved = localStorage.getItem(`draft_${key}`)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load draft:', e)
    }
    return null
  }

  // Check on mount if draft exists
  useEffect(() => {
    const saved = localStorage.getItem(`draft_${key}`)
    if (saved) {
      setHasDraft(true)
    }
  }, [key])

  return {
    saveDraft,
    clearDraft,
    loadDraft,
    hasDraft
  }
}
