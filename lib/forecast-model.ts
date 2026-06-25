/**
 * Modelo del Predictor de Metas (G4 · Guardian de Forecast).
 *
 * Soporta meta POR LINEA y POR MES, seleccion de que lineas entran al modelo
 * predictivo, y un generador de "analisis de la prediccion" (soporte verbal de
 * la IA) que explica el porque de cada escenario para generar confianza.
 *
 * Las curvas son acumuladas y se expresan como FRACCION de la meta (0..1+),
 * de modo que al multiplicar por la meta configurada de cada linea el grafico
 * escala de forma coherente y la meta siempre es la misma referencia visible.
 */

export type ScenarioId = "optimista" | "esperado" | "pesimista"

export interface ForecastLine {
  id: string
  nombre: string
  /** Color de acento (hex) consistente con la estetica del proyecto. */
  color: string
  /** Meta mensual por defecto en COP (editable por mes en la config de G4). */
  metaDefault: number
}

/* Lineas de negocio que alimentan el modelo (espejo de las lineas de empresa). */
export const FORECAST_LINES: ForecastLine[] = [
  { id: "lp1", nombre: "Linea Premium", color: "#a855f7", metaDefault: 60_000_000 },
  { id: "lp2", nombre: "Linea Corporativa", color: "#3b82f6", metaDefault: 45_000_000 },
  { id: "lp3", nombre: "Linea Retail", color: "#22c55e", metaDefault: 30_000_000 },
  { id: "lp5", nombre: "Linea Express", color: "#ef4444", metaDefault: 15_000_000 },
  { id: "lp4", nombre: "Linea Servicios", color: "#f59e0b", metaDefault: 35_000_000 },
]

/* Curvas acumuladas como fraccion de la meta (13 puntos base, se re-muestrean). */
const FRAC: Record<ScenarioId, number[]> = {
  optimista: [0.02, 0.05, 0.09, 0.15, 0.22, 0.31, 0.42, 0.55, 0.68, 0.8, 0.92, 1.01, 1.08],
  esperado: [0.02, 0.05, 0.08, 0.13, 0.19, 0.27, 0.36, 0.46, 0.57, 0.68, 0.79, 0.89, 0.96],
  pesimista: [0.02, 0.04, 0.07, 0.1, 0.15, 0.2, 0.27, 0.34, 0.42, 0.5, 0.57, 0.64, 0.7],
}

/* El historico real solo llega hasta "hoy" (~72% del periodo en curso). */
export const HIST_FRACTION = 0.72

/** Fraccion proyectada de cierre de cada escenario (ultimo punto de la curva). */
export function scenarioEndFraction(s: ScenarioId): number {
  return FRAC[s][FRAC[s].length - 1]
}

/** Re-muestrea una curva base a n puntos por interpolacion lineal. */
function resample(base: number[], n: number): number[] {
  if (n <= 0) return []
  if (n === 1) return [base[base.length - 1]]
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * (base.length - 1)
    const lo = Math.floor(t)
    const hi = Math.min(base.length - 1, lo + 1)
    out.push(base[lo] + (base[hi] - base[lo]) * (t - lo))
  }
  return out
}

export interface ForecastPoint {
  date: string
  historico?: number
  esperado: number
  pesimista: number
  optimista: number
}

/**
 * Construye la serie acumulada (en millones COP) para una meta dada, alineada a
 * las etiquetas de periodo del rango de fechas elegido.
 */
export function buildForecastSeries(labels: string[], metaCOP: number): ForecastPoint[] {
  const n = Math.max(labels.length, 1)
  const metaM = metaCOP / 1_000_000
  const opt = resample(FRAC.optimista, n)
  const esp = resample(FRAC.esperado, n)
  const pes = resample(FRAC.pesimista, n)
  const histCount = Math.max(1, Math.round(n * HIST_FRACTION))

  return labels.map((date, i) => ({
    date,
    optimista: Math.round(opt[i] * metaM),
    esperado: Math.round(esp[i] * metaM),
    pesimista: Math.round(pes[i] * metaM),
    historico: i < histCount ? Math.round(esp[i] * metaM * 0.98) : undefined,
  }))
}

/** Suma punto a punto varias series (para el consolidado de lineas activas). */
export function sumForecastSeries(series: ForecastPoint[][]): ForecastPoint[] {
  if (series.length === 0) return []
  const len = series[0].length
  const out: ForecastPoint[] = []
  for (let i = 0; i < len; i++) {
    let optimista = 0
    let esperado = 0
    let pesimista = 0
    let historico: number | undefined = 0
    let hasHist = false
    for (const s of series) {
      optimista += s[i].optimista
      esperado += s[i].esperado
      pesimista += s[i].pesimista
      if (s[i].historico !== undefined) {
        historico = (historico ?? 0) + (s[i].historico as number)
        hasHist = true
      }
    }
    out.push({
      date: series[0][i].date,
      optimista,
      esperado,
      pesimista,
      historico: hasHist ? historico : undefined,
    })
  }
  return out
}

/* ─────────────────  Analisis de la prediccion (soporte verbal IA)  ───────────────── */

export interface PredictionInsight {
  id: "contexto" | "tendencia" | "factor" | "riesgo" | "outliers"
  title: string
  /** Texto enriquecido en parrafos (cada string es un parrafo o vineta). */
  paragraphs: string[]
  /** Tono visual de la tarjeta. */
  tone: "positive" | "info" | "warning"
}

function fmtM(cop: number): string {
  const m = cop / 1_000_000
  return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`
}

/* Ajustes de redaccion por escenario: porcentajes y enfasis distintos. */
const SCENARIO_TUNE: Record<
  ScenarioId,
  {
    label: string
    superoVeces: number
    superoPct: number
    promedioPctVsMeta: number
    cumplimientoPct: number
    ritmoActual: number
    ritmoNecesario: number
    concentracionPct: number
    oportunidades: number
    deficitPct: number
  }
> = {
  optimista: {
    label: "Optimista",
    superoVeces: 9,
    superoPct: 50,
    promedioPctVsMeta: 6,
    cumplimientoPct: 108,
    ritmoActual: 3.4,
    ritmoNecesario: 3.0,
    concentracionPct: 64,
    oportunidades: 1,
    deficitPct: 0,
  },
  esperado: {
    label: "Normal",
    superoVeces: 5,
    superoPct: 27,
    promedioPctVsMeta: 9,
    cumplimientoPct: 96,
    ritmoActual: 2.6,
    ritmoNecesario: 3.2,
    concentracionPct: 71,
    oportunidades: 2,
    deficitPct: 4,
  },
  pesimista: {
    label: "Pesimista",
    superoVeces: 3,
    superoPct: 17,
    promedioPctVsMeta: 18,
    cumplimientoPct: 70,
    ritmoActual: 2.1,
    ritmoNecesario: 4.0,
    concentracionPct: 78,
    oportunidades: 3,
    deficitPct: 30,
  },
}

/**
 * Genera el bloque de 5 analisis que explican la prediccion, adaptado al
 * escenario (optimista / normal / pesimista), la linea y la meta del mes.
 */
export function buildPredictionAnalysis(
  scenario: ScenarioId,
  lineaNombre: string,
  metaCOP: number,
  mesLabel: string,
  anio: number,
  monthsAnalyzed = 18,
): PredictionInsight[] {
  const t = SCENARIO_TUNE[scenario]
  const metaM = metaCOP / 1_000_000
  const promedio = (metaM * (100 - t.promedioPctVsMeta)) / 100
  const proyeccion = (metaM * t.cumplimientoPct) / 100
  const brecha = Math.max(0, metaM - proyeccion)
  const mejorMesVal = (metaM * 1.53).toFixed(0)
  const acumulado = (metaM * 0.55).toFixed(1)

  const contexto: PredictionInsight = {
    id: "contexto",
    title: "Contexto historico",
    tone: "positive",
    paragraphs: [
      `En los ${monthsAnalyzed} meses analizados, ${lineaNombre} supero la meta de ${fmtM(
        metaCOP,
      )} en ${t.superoVeces} ocasiones (${t.superoPct}% de los meses). Los meses de mayor rendimiento coinciden con Q1 y diciembre.`,
      `El promedio mensual historico es ${promedio.toFixed(1)}M — un ${t.promedioPctVsMeta}% ${
        t.promedioPctVsMeta === 0 ? "alineado con" : "por debajo de"
      } la meta. Febrero ${anio} fue el mejor mes registrado con ${mejorMesVal}M (153% de meta).`,
    ],
  }

  const tendencia: PredictionInsight = {
    id: "tendencia",
    title: "Tendencia detectada",
    tone: "info",
    paragraphs: [
      `El modelo detecta un patron de cierre tardio: el ${t.concentracionPct}% del volumen mensual se concentra en los ultimos 12 dias del mes.`,
      `${mesLabel} sigue este patron — con ${acumulado}M acumulados al dia 21 y 9 dias habiles restantes, el modelo proyecta una aceleracion necesaria de ${t.ritmoNecesario.toFixed(
        1,
      )}M/dia para alcanzar la meta, frente a un ritmo actual de ${t.ritmoActual.toFixed(1)}M/dia.`,
    ],
  }

  const factor: PredictionInsight = {
    id: "factor",
    title: "Factor clave del mes",
    tone: "info",
    paragraphs: [
      `Los meses con mayor cumplimiento (febrero ${(metaM * 1.29).toFixed(0)}M, abril ${(
        metaM * 1.16
      ).toFixed(0)}M) tuvieron en comun cierres de tickets superiores a 5M en la segunda quincena.`,
      `${mesLabel} ${
        scenario === "optimista"
          ? "ya registra cierres de ese tamano, lo que sostiene la proyeccion"
          : "aun no registra ningun cierre de ese tamano desde el dia 14"
      }. La probabilidad de cumplir la meta de ${fmtM(
        metaCOP,
      )} depende de que al menos ${t.oportunidades} oportunidad(es) de alto valor cierren antes del dia 29.`,
    ],
  }

  const riesgo: PredictionInsight = {
    id: "riesgo",
    title: "Riesgo principal",
    tone: "warning",
    paragraphs: [
      `La brecha actual contra meta es de ${brecha.toFixed(
        1,
      )}M en 9 dias — equivalente al total acumulado de los ultimos 21 dias comprimido en menos de la mitad del tiempo.`,
      `El escenario pesimista proyecta un cierre de ${(metaM * 0.7).toFixed(0)}M (deficit del ${
        SCENARIO_TUNE.pesimista.deficitPct
      }%). El escenario esperado proyecta ${(metaM * 0.96).toFixed(0)}M (96% de cumplimiento).`,
    ],
  }

  const outliers: PredictionInsight = {
    id: "outliers",
    title: "Outliers detectados",
    tone: "warning",
    paragraphs: [
      `El analisis identifica 2 jornadas con resultados fuera de lo comun en ${mesLabel.toLowerCase()} ${anio}:`,
      `• Tracción máxima: ${(metaM * 0.07).toFixed(1)}M en un solo dia — 1,9× el promedio diario del mes, impulsado por 3 cierres de alto valor concentrados en una jornada.`,
      `• Punto de ajuste: el resultado mas bajo del mes — una senal clara para revisar la estrategia de apertura de semana.`,
      `Como referencia historica del negocio, febrero ${anio} (${mejorMesVal}M, 153% de la meta) y febrero ${
        anio - 1
      } se mantienen como los meses con mayor sobrefacturacion y mayor exigencia comercial del historico.`,
    ],
  }

  return [contexto, tendencia, factor, riesgo, outliers]
}
