"use client"

import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>
}

export function AuthWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function SessionTimeoutWarning() {
  return null
}

export function BiometricSetupPrompt() {
  return null
}