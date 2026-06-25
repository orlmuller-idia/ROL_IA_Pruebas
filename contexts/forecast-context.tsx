"use client"

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react"
import { FORECAST_LINES, type ForecastLine } from "@/lib/forecast-model"
import { MONTHS_ES_LONG } from "@/lib/date-range"

/**
 * Estado compartido del Predictor / G4 (Guardian de Forecast).
 * Vive a nivel de /centro para que la configuracion de G4 y el reporte
 * predictivo lean lo mismo: que lineas entran al modelo y la meta por
 * linea y por mes.
 */

export interface MonthOption {
  key: string // "0".."11"
  index: number
  label: string // "enero" ...
  short: string // "ene"
}

interface ForecastContextValue {
  lines: ForecastLine[]
  months: MonthOption[]
  year: number
  /** Mes en foco para el reporte (por defecto, el mes actual). */
  activeMonth: number
  setActiveMonth: (m: number) => void
  /** Lineas incluidas en el modelo predictivo. */
  activeLineIds: string[]
  toggleLine: (id: string) => void
  isLineActive: (id: string) => boolean
  /** Meta por linea y por mes (COP). */
  getGoal: (lineId: string, month: number) => number
  setGoal: (lineId: string, month: number, value: number) => void
  /** Meta total del mes sumando solo las lineas activas. */
  goalForMonth: (month: number) => number
}

const ForecastContext = createContext<ForecastContextValue | undefined>(undefined)

const SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

export function ForecastProvider({ children }: { children: ReactNode }) {
  const year = new Date().getFullYear()
  const now = new Date().getMonth()

  const months = useMemo<MonthOption[]>(
    () =>
      MONTHS_ES_LONG.map((label, index) => ({
        key: String(index),
        index,
        label,
        short: SHORT[index],
      })),
    [],
  )

  const [activeMonth, setActiveMonth] = useState(now)
  const [activeLineIds, setActiveLineIds] = useState<string[]>(FORECAST_LINES.map((l) => l.id))

  // Meta por linea/mes. Se inicializa con la meta default de cada linea en los 12 meses.
  const [goals, setGoals] = useState<Record<string, Record<number, number>>>(() => {
    const init: Record<string, Record<number, number>> = {}
    for (const l of FORECAST_LINES) {
      init[l.id] = {}
      for (let m = 0; m < 12; m++) init[l.id][m] = l.metaDefault
    }
    return init
  })

  const toggleLine = useCallback((id: string) => {
    setActiveLineIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const isLineActive = useCallback((id: string) => activeLineIds.includes(id), [activeLineIds])

  const getGoal = useCallback(
    (lineId: string, month: number) => goals[lineId]?.[month] ?? 0,
    [goals],
  )

  const setGoal = useCallback((lineId: string, month: number, value: number) => {
    setGoals((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], [month]: Math.max(0, value) },
    }))
  }, [])

  const goalForMonth = useCallback(
    (month: number) =>
      activeLineIds.reduce((acc, id) => acc + (goals[id]?.[month] ?? 0), 0),
    [activeLineIds, goals],
  )

  const value: ForecastContextValue = {
    lines: FORECAST_LINES,
    months,
    year,
    activeMonth,
    setActiveMonth,
    activeLineIds,
    toggleLine,
    isLineActive,
    getGoal,
    setGoal,
    goalForMonth,
  }

  return <ForecastContext.Provider value={value}>{children}</ForecastContext.Provider>
}

export function useForecast() {
  const ctx = useContext(ForecastContext)
  if (!ctx) throw new Error("useForecast must be used within a ForecastProvider")
  return ctx
}
