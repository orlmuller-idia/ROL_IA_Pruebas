"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  SPEECH_PILLARS,
  pillarScore as calcPillarScore,
  weightedScore as calcWeightedScore,
} from "@/lib/speech-pillars"

/**
 * Configuracion de Speech Analytics por sucursal (Enterprise).
 * Cada sucursal define el peso de cada pilar (suma <= 100%) y si cada
 * subnivel debe cumplirse. El reporte de Speech Analytics lee de aqui
 * para ponderar los resultados en las 3 visualizaciones.
 */

export interface SucursalSpeechConfig {
  /** pillarId -> peso (0-100) */
  weights: Record<string, number>
  /** subItemId -> debe cumplirse */
  required: Record<string, boolean>
  /** subItemId -> texto/guion de referencia que se comparara para validar cumplimiento */
  criteria: Record<string, string>
}

function defaultConfig(): SucursalSpeechConfig {
  const weights: Record<string, number> = {}
  const required: Record<string, boolean> = {}
  const criteria: Record<string, string> = {}
  for (const p of SPEECH_PILLARS) {
    weights[p.id] = p.defaultWeight
    for (const s of p.subItems) {
      required[s.id] = true
      criteria[s.id] = ""
    }
  }
  return { weights, required, criteria }
}

interface SpeechConfigContextValue {
  getConfig: (sucursalId: string) => SucursalSpeechConfig
  setWeight: (sucursalId: string, pillarId: string, value: number) => void
  toggleRequired: (sucursalId: string, subItemId: string) => void
  setCriteria: (sucursalId: string, subItemId: string, text: string) => void
  resetToDefault: (sucursalId: string) => void
  weightsSum: (sucursalId: string) => number
  /** score 0-100 de un pilar segun la config de la sucursal */
  pillarScore: (sucursalId: string, pillarId: string) => number
  /** score global ponderado 0-100 de la sucursal */
  weightedScore: (sucursalId: string) => number
}

const SpeechConfigContext = createContext<SpeechConfigContextValue | undefined>(undefined)

export function SpeechConfigProvider({ children }: { children: ReactNode }) {
  const [configs, setConfigs] = useState<Record<string, SucursalSpeechConfig>>({})

  const getConfig = useCallback(
    (sucursalId: string): SucursalSpeechConfig => configs[sucursalId] ?? defaultConfig(),
    [configs],
  )

  const ensure = useCallback(
    (prev: Record<string, SucursalSpeechConfig>, id: string) =>
      prev[id] ? prev : { ...prev, [id]: defaultConfig() },
    [],
  )

  const setWeight = useCallback(
    (sucursalId: string, pillarId: string, value: number) => {
      setConfigs((prev) => {
        const base = ensure(prev, sucursalId)
        const current = base[sucursalId]
        return {
          ...base,
          [sucursalId]: {
            ...current,
            weights: { ...current.weights, [pillarId]: Math.max(0, Math.min(100, value)) },
          },
        }
      })
    },
    [ensure],
  )

  const toggleRequired = useCallback(
    (sucursalId: string, subItemId: string) => {
      setConfigs((prev) => {
        const base = ensure(prev, sucursalId)
        const current = base[sucursalId]
        return {
          ...base,
          [sucursalId]: {
            ...current,
            required: { ...current.required, [subItemId]: !current.required[subItemId] },
          },
        }
      })
    },
    [ensure],
  )

  const setCriteria = useCallback(
    (sucursalId: string, subItemId: string, text: string) => {
      setConfigs((prev) => {
        const base = ensure(prev, sucursalId)
        const current = base[sucursalId]
        return {
          ...base,
          [sucursalId]: {
            ...current,
            criteria: { ...current.criteria, [subItemId]: text },
          },
        }
      })
    },
    [ensure],
  )

  const resetToDefault = useCallback((sucursalId: string) => {
    setConfigs((prev) => ({ ...prev, [sucursalId]: defaultConfig() }))
  }, [])

  const weightsSum = useCallback(
    (sucursalId: string) => {
      const cfg = configs[sucursalId] ?? defaultConfig()
      return Object.values(cfg.weights).reduce((s, w) => s + w, 0)
    },
    [configs],
  )

  const pillarScore = useCallback(
    (sucursalId: string, pillarId: string) => {
      const cfg = configs[sucursalId] ?? defaultConfig()
      const pillar = SPEECH_PILLARS.find((p) => p.id === pillarId)
      if (!pillar) return 0
      return calcPillarScore(sucursalId, pillar, cfg.required)
    },
    [configs],
  )

  const weightedScore = useCallback(
    (sucursalId: string) => {
      const cfg = configs[sucursalId] ?? defaultConfig()
      return calcWeightedScore(sucursalId, cfg.weights, cfg.required)
    },
    [configs],
  )

  const value: SpeechConfigContextValue = {
    getConfig,
    setWeight,
    toggleRequired,
    setCriteria,
    resetToDefault,
    weightsSum,
    pillarScore,
    weightedScore,
  }

  return <SpeechConfigContext.Provider value={value}>{children}</SpeechConfigContext.Provider>
}

export function useSpeechConfig() {
  const ctx = useContext(SpeechConfigContext)
  if (!ctx) throw new Error("useSpeechConfig must be used within a SpeechConfigProvider")
  return ctx
}
