"use client"

import { useState } from "react"
import { CalendarDays, Check, ChevronDown, Sparkles } from "lucide-react"
import type { DateRange as DayPickerRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDateRange } from "@/contexts/date-range-context"
import {
  presetOptions,
  formatRangeLabel,
  type RangePresetId,
} from "@/lib/date-range"

/**
 * Filtro de rango de fechas amigable para los informes temporales.
 * - Accesos rapidos por trimestre y ano.
 * - Rango personalizado con calendario (modo rango).
 * El estado es compartido (contexto), asi que al cambiarlo se mantiene al navegar.
 */
export function DateRangeFilter() {
  const { presetId, range, periods, granularity, selectionLabel, applyPreset, applyCustom } =
    useDateRange()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DayPickerRange | undefined>({ from: range.from, to: range.to })

  const options = presetOptions()
  const trimestres = options.filter((o) => o.group === "Trimestre")
  const anos = options.filter((o) => o.group === "Ano")

  const granLabel = granularity === "week" ? "semanal" : "mensual"

  function choosePreset(id: Exclude<RangePresetId, "custom">) {
    applyPreset(id)
    setOpen(false)
  }

  function applyDraft() {
    if (draft?.from && draft?.to) {
      applyCustom({ from: draft.from, to: draft.to })
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="border-border bg-card hover:border-aura/40 hover:bg-aura/5 group flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors"
          aria-label="Filtrar por rango de fechas"
        >
          <div className="bg-aura/10 text-aura flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide leading-none">
              Periodo
            </span>
            <span className="text-foreground truncate text-[13px] font-semibold leading-tight">
              {selectionLabel}
            </span>
          </div>
          <ChevronDown
            className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(92vw,640px)] p-0" sideOffset={8}>
        <div className="flex flex-col sm:flex-row">
          {/* Accesos rapidos */}
          <div className="border-border flex flex-col gap-3 border-b p-3 sm:w-[210px] sm:border-b-0 sm:border-r">
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground px-1 text-[10px] font-semibold uppercase tracking-wide">
                Trimestre
              </span>
              <div className="grid grid-cols-1 gap-1">
                {trimestres.map((o) => (
                  <PresetButton
                    key={o.id}
                    label={o.label}
                    active={presetId === o.id}
                    onClick={() => choosePreset(o.id)}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground px-1 text-[10px] font-semibold uppercase tracking-wide">
                Ano
              </span>
              <div className="grid grid-cols-1 gap-1">
                {anos.map((o) => (
                  <PresetButton
                    key={o.id}
                    label={o.label}
                    active={presetId === o.id}
                    onClick={() => choosePreset(o.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rango personalizado */}
          <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wide">
                Rango personalizado
              </span>
              {presetId === "custom" && (
                <span className="bg-aura/10 text-aura rounded-full px-2 py-0.5 text-[10px] font-medium">
                  Activo
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="range"
                numberOfMonths={1}
                defaultMonth={range.from}
                selected={draft}
                onSelect={setDraft}
                className="p-0"
              />
            </div>

            <div className="border-border mt-1 flex items-center justify-between gap-2 border-t pt-2">
              <span className="text-muted-foreground text-[11px]">
                {draft?.from && draft?.to
                  ? formatRangeLabel({ from: draft.from, to: draft.to })
                  : "Elige una fecha inicial y final"}
              </span>
              <button
                onClick={applyDraft}
                disabled={!draft?.from || !draft?.to}
                className="bg-aura inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Pie: resumen del impacto en los graficos */}
        <div className="border-border bg-muted/40 flex items-center gap-2 border-t px-3 py-2">
          <Sparkles className="text-aura h-3.5 w-3.5 shrink-0" />
          <span className="text-muted-foreground text-[11px] leading-snug">
            Los graficos muestran{" "}
            <span className="text-foreground font-medium">
              {periods.length} puntos
            </span>{" "}
            con escala {granLabel}, ajustada al periodo elegido.
          </span>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function PresetButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] transition-colors ${
        active
          ? "bg-aura/10 text-aura font-medium"
          : "text-foreground hover:bg-muted"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
    </button>
  )
}
