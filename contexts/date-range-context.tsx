"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import {
  type DateRange,
  type RangePresetId,
  type Period,
  type Granularity,
  presetRange,
  buildPeriods,
  granularityFor,
  describeSelection,
} from "@/lib/date-range"

interface DateRangeContextValue {
  presetId: RangePresetId
  range: DateRange
  periods: Period[]
  granularity: Granularity
  /** Etiqueta amable del periodo activo (ej. "Q2 2026") */
  selectionLabel: string
  /** Aplica un preset (trimestre / ano) */
  applyPreset: (id: Exclude<RangePresetId, "custom">) => void
  /** Aplica un rango personalizado desde el calendario */
  applyCustom: (range: DateRange) => void
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null)

export function DateRangeProvider({ children }: { children: ReactNode }) {
  // Estado compartido: arranca en el trimestre actual.
  const [presetId, setPresetId] = useState<RangePresetId>("this-quarter")
  const [range, setRange] = useState<DateRange>(() => presetRange("this-quarter"))

  const value = useMemo<DateRangeContextValue>(() => {
    const periods = buildPeriods(range)
    return {
      presetId,
      range,
      periods,
      granularity: granularityFor(range),
      selectionLabel: describeSelection(presetId, range),
      applyPreset: (id) => {
        setPresetId(id)
        setRange(presetRange(id))
      },
      applyCustom: (r) => {
        setPresetId("custom")
        setRange(r)
      },
    }
  }, [presetId, range])

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>
}

export function useDateRange(): DateRangeContextValue {
  const ctx = useContext(DateRangeContext)
  if (!ctx) throw new Error("useDateRange debe usarse dentro de DateRangeProvider")
  return ctx
}
