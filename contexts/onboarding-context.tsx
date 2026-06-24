"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { ProfileLevel } from "@/contexts/profile-context"

interface OnboardingContextType {
  /* on/off del onboarding por nivel de perfil */
  enabledByLevel: Record<ProfileLevel, boolean>
  setEnabledForLevel: (level: ProfileLevel, enabled: boolean) => void
  toggleLevel: (level: ProfileLevel) => void
  /* Paseo guiado por el sistema (modo explicativo) */
  tourActive: boolean
  tourStep: number
  startTour: () => void
  exitTour: () => void
  goToStep: (i: number) => void
  /* total de pasos del tour del perfil activo; lo fija el overlay */
  setTourTotal: (n: number) => void
  tourTotal: number
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [enabledByLevel, setEnabledByLevel] = useState<Record<ProfileLevel, boolean>>({
    macro: true,
    meso: true,
    micro: true,
  })
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourTotal, setTourTotal] = useState(0)

  const setEnabledForLevel = useCallback((level: ProfileLevel, enabled: boolean) => {
    setEnabledByLevel((prev) => ({ ...prev, [level]: enabled }))
  }, [])

  const toggleLevel = useCallback((level: ProfileLevel) => {
    setEnabledByLevel((prev) => ({ ...prev, [level]: !prev[level] }))
  }, [])

  const startTour = useCallback(() => {
    setTourStep(0)
    setTourActive(true)
  }, [])

  const exitTour = useCallback(() => {
    setTourActive(false)
    setTourStep(0)
  }, [])

  const goToStep = useCallback((i: number) => {
    setTourStep(i)
  }, [])

  return (
    <OnboardingContext.Provider
      value={{
        enabledByLevel,
        setEnabledForLevel,
        toggleLevel,
        tourActive,
        tourStep,
        startTour,
        exitTour,
        goToStep,
        setTourTotal,
        tourTotal,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error("useOnboarding must be used within an OnboardingProvider")
  return ctx
}
