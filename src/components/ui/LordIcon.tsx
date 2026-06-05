'use client'

import React, { useEffect, useState } from 'react'

interface LordIconProps {
  src: string
  trigger?: 'hover' | 'click' | 'loop' | 'loop-on-hover' | 'morph' | 'in'
  colors?: string
  size?: number
  className?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': any
    }
  }
}

export function LordIcon({ src, trigger = 'hover', colors = 'primary:#1e3a8a,secondary:#0d9488', size = 24, className }: LordIconProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Import the lordicon script dynamically if not loaded
    if (typeof window !== 'undefined' && !document.querySelector('script#lordicon-script')) {
      const script = document.createElement('script')
      script.id = 'lordicon-script'
      script.src = 'https://cdn.lordicon.com/lordicon.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  if (!isMounted) {
    return <div style={{ width: size, height: size }} className={className} />
  }

  return (
    <lord-icon
      src={src}
      trigger={trigger}
      colors={colors}
      style={{ width: size, height: size }}
      className={className}
    ></lord-icon>
  )
}
