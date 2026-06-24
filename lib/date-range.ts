/**
 * Modelo de rango de fechas para los informes temporales.
 * Presets por trimestre y ano + rango personalizado (calendario).
 * Genera "periodos" (semanales o mensuales) que los graficos usan como eje X,
 * de modo que la escala de cada grafico sea clara y dependa de las fechas elegidas.
 */

export type RangePresetId =
  | "this-quarter"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "this-year"
  | "last-year"
  | "custom"

export interface DateRange {
  from: Date
  to: Date
}

export type Granularity = "week" | "month"

export interface Period {
  key: string
  /** Etiqueta corta para el eje X del grafico (ej. "8 abr" o "abr") */
  label: string
  start: Date
  end: Date
}

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const MONTHS_ES_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

function quarterRange(year: number, q: 1 | 2 | 3 | 4): DateRange {
  const startMonth = (q - 1) * 3
  return {
    from: startOfDay(new Date(year, startMonth, 1)),
    to: endOfDay(new Date(year, startMonth + 3, 0)), // dia 0 del mes siguiente = ultimo dia del trimestre
  }
}

/** Trimestre actual (1-4) segun el mes */
export function currentQuarter(now = new Date()): 1 | 2 | 3 | 4 {
  return (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4
}

/** Devuelve el rango de fechas de un preset relativo a `now`. */
export function presetRange(id: Exclude<RangePresetId, "custom">, now = new Date()): DateRange {
  const year = now.getFullYear()
  switch (id) {
    case "this-quarter":
      return quarterRange(year, currentQuarter(now))
    case "q1":
      return quarterRange(year, 1)
    case "q2":
      return quarterRange(year, 2)
    case "q3":
      return quarterRange(year, 3)
    case "q4":
      return quarterRange(year, 4)
    case "this-year":
      return { from: startOfDay(new Date(year, 0, 1)), to: endOfDay(new Date(year, 11, 31)) }
    case "last-year":
      return { from: startOfDay(new Date(year - 1, 0, 1)), to: endOfDay(new Date(year - 1, 11, 31)) }
  }
}

export interface PresetOption {
  id: Exclude<RangePresetId, "custom">
  label: string
  group: "Trimestre" | "Ano"
}

export function presetOptions(now = new Date()): PresetOption[] {
  const y = now.getFullYear()
  return [
    { id: "this-quarter", label: `Trimestre actual (Q${currentQuarter(now)})`, group: "Trimestre" },
    { id: "q1", label: "Q1 · Ene-Mar", group: "Trimestre" },
    { id: "q2", label: "Q2 · Abr-Jun", group: "Trimestre" },
    { id: "q3", label: "Q3 · Jul-Sep", group: "Trimestre" },
    { id: "q4", label: "Q4 · Oct-Dic", group: "Trimestre" },
    { id: "this-year", label: `Este ano (${y})`, group: "Ano" },
    { id: "last-year", label: `Ano pasado (${y - 1})`, group: "Ano" },
  ]
}

function spanInDays(range: DateRange): number {
  return Math.max(1, Math.round((range.to.getTime() - range.from.getTime()) / 86_400_000))
}

/** Decide la granularidad: rangos cortos -> semanal; rangos largos -> mensual. */
export function granularityFor(range: DateRange): Granularity {
  return spanInDays(range) <= 110 ? "week" : "month"
}

/** Dias representados por cada periodo (para escalar montos/volumenes agregados). */
export function periodDays(g: Granularity): number {
  return g === "week" ? 7 : 30
}

/** Construye los periodos (buckets) del rango para usar como eje X del grafico. */
export function buildPeriods(range: DateRange): Period[] {
  const granularity = granularityFor(range)
  const periods: Period[] = []

  if (granularity === "month") {
    const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1)
    const last = new Date(range.to.getFullYear(), range.to.getMonth(), 1)
    while (cursor <= last) {
      const start = new Date(cursor)
      const end = endOfDay(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0))
      const sameYearSpan = range.from.getFullYear() === range.to.getFullYear()
      periods.push({
        key: `${start.getFullYear()}-${start.getMonth()}`,
        label: sameYearSpan
          ? MONTHS_ES[start.getMonth()]
          : `${MONTHS_ES[start.getMonth()]} ${String(start.getFullYear()).slice(2)}`,
        start,
        end,
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return periods
  }

  // Semanal: avanzamos de 7 en 7 dias desde el inicio del rango
  const cursor = startOfDay(range.from)
  let guard = 0
  while (cursor <= range.to && guard < 60) {
    const start = new Date(cursor)
    const end = endOfDay(new Date(cursor.getTime() + 6 * 86_400_000))
    periods.push({
      key: `${start.getFullYear()}-${start.getMonth()}-${start.getDate()}`,
      label: `${start.getDate()} ${MONTHS_ES[start.getMonth()]}`,
      start,
      end,
    })
    cursor.setDate(cursor.getDate() + 7)
    guard++
  }
  return periods
}

/**
 * Re-muestrea una serie base a `n` puntos por interpolacion lineal.
 * Permite que cualquier curva base de los datos mock se adapte al numero de
 * periodos del rango elegido, manteniendo su forma.
 */
export function resampleSeries(base: number[], n: number): number[] {
  if (n <= 0) return []
  if (base.length === 0) return new Array(n).fill(0)
  if (base.length === 1) return new Array(n).fill(base[0])
  if (n === 1) return [base[base.length - 1]]

  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (base.length - 1)
    const lo = Math.floor(t)
    const hi = Math.min(base.length - 1, lo + 1)
    const frac = t - lo
    out.push(base[lo] + (base[hi] - base[lo]) * frac)
  }
  return out
}

/** Factor de escala segun cuantos dias cubre el rango (para KPIs de informes no-serie). */
export function rangeScaleFactor(range: DateRange, baselineDays = 90): number {
  return spanInDays(range) / baselineDays
}

/** Etiqueta legible del rango, ej. "1 abr – 30 jun 2026". */
export function formatRangeLabel(range: DateRange): string {
  const sameYear = range.from.getFullYear() === range.to.getFullYear()
  const f = `${range.from.getDate()} ${MONTHS_ES[range.from.getMonth()]}${sameYear ? "" : " " + range.from.getFullYear()}`
  const t = `${range.to.getDate()} ${MONTHS_ES[range.to.getMonth()]} ${range.to.getFullYear()}`
  return `${f} – ${t}`
}

/** Etiqueta amable del periodo activo, ej. "Q2 2026" o "Este ano". */
export function describeSelection(presetId: RangePresetId, range: DateRange, now = new Date()): string {
  const y = range.from.getFullYear()
  switch (presetId) {
    case "this-quarter":
      return `Q${currentQuarter(now)} ${y}`
    case "q1":
      return `Q1 ${y}`
    case "q2":
      return `Q2 ${y}`
    case "q3":
      return `Q3 ${y}`
    case "q4":
      return `Q4 ${y}`
    case "this-year":
      return `Ano ${y}`
    case "last-year":
      return `Ano ${y}`
    case "custom":
      return formatRangeLabel(range)
  }
}

export { MONTHS_ES, MONTHS_ES_LONG }
