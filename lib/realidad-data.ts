/**
 * Realidad vs Marketing — modelo de datos en DINERO REAL.
 *
 * La idea no es mostrar metricas de informe tipicas, sino contrastar, peso por peso,
 * lo que REPORTA marketing contra lo que el CRM realmente CONFIRMA, por sucursal.
 *
 * Cada registro guarda dos versiones de la misma historia:
 *   - lo que dice marketing (atribuido por la plataforma)
 *   - lo que el CRM confirma (cerrado de verdad)
 * y dos fugas de dinero que la realidad no respalda:
 *   - fuga semaforo rojo (leads que la campana trajo y murieron en rojo)
 *   - mala atencion (cerrado fuera de SLA o sin cumplir calidad)
 *
 * Todos los KPIs (CPL, CPO, CAC, ROAS, ROMI, conversion) se DERIVAN de estos numeros,
 * nunca se hardcodean, para que el contraste sea siempre consistente.
 */

export interface SucursalRealidad {
  sucursalId: string
  /* Inversion en pauta (COP) — denominador comun de todo */
  inversion: number
  /* Leads calificados que dice marketing vs los que el CRM valida como reales/contactables */
  mqlReportado: number
  mqlValido: number
  /* Oportunidades (SQL) que dice marketing vs las que el CRM confirma */
  sqlReportado: number
  sqlReal: number
  /* Ventas (conteo) atribuidas vs cerradas */
  ventasReportadas: number
  ventasReales: number
  /* Dinero (COP): ingreso atribuido por marketing vs cerrado en CRM */
  ingresoReportado: number
  ingresoReal: number
  /* Dinero perdido en leads que entraron a semaforo ROJO del auditor y murieron */
  fugaRojo: number
  /* Dinero cerrado pero fuera de SLA o sin cumplir calidad (venta fragil / en riesgo) */
  malaAtencion: number
}

/**
 * Seed calibrado para que el consolidado (los 5) reproduzca los numeros del CEO:
 *   MQL 275 · SQL 70 (25.45%) · $167.5M atribuidos · $113.2M reales · ROAS 4.9x vs 3.3x · +48% inflado
 * El reparto cuenta una historia: Bogota y Sao Paulo alineadas, CDMX y Miami inflan fuerte.
 */
export const REALIDAD_SEED: SucursalRealidad[] = [
  {
    sucursalId: "s1", // Sede Bogota — la sana
    inversion: 9_800_000,
    mqlReportado: 80,
    mqlValido: 64,
    sqlReportado: 22,
    sqlReal: 18,
    ventasReportadas: 9,
    ventasReales: 7,
    ingresoReportado: 58_000_000,
    ingresoReal: 41_200_000,
    fugaRojo: 12_400_000,
    malaAtencion: 7_900_000,
  },
  {
    sucursalId: "s2", // Sede Medellin — aceptable
    inversion: 7_200_000,
    mqlReportado: 55,
    mqlValido: 47,
    sqlReportado: 14,
    sqlReal: 13,
    ventasReportadas: 7,
    ventasReales: 6,
    ingresoReportado: 34_000_000,
    ingresoReal: 28_000_000,
    fugaRojo: 6_100_000,
    malaAtencion: 3_400_000,
  },
  {
    sucursalId: "s3", // Sede CDMX — infla fuerte
    inversion: 6_400_000,
    mqlReportado: 48,
    mqlValido: 33,
    sqlReportado: 12,
    sqlReal: 8,
    ventasReportadas: 6,
    ventasReales: 4,
    ingresoReportado: 30_000_000,
    ingresoReal: 18_300_000,
    fugaRojo: 8_200_000,
    malaAtencion: 5_100_000,
  },
  {
    sucursalId: "s4", // Miami Hub — la peor brecha
    inversion: 5_200_000,
    mqlReportado: 42,
    mqlValido: 30,
    sqlReportado: 10,
    sqlReal: 7,
    ventasReportadas: 5,
    ventasReales: 3,
    ingresoReportado: 24_000_000,
    ingresoReal: 14_800_000,
    fugaRojo: 6_900_000,
    malaAtencion: 4_200_000,
  },
  {
    sucursalId: "s5", // Sede Sao Paulo — alineada (CRM casi iguala marketing)
    inversion: 5_300_000,
    mqlReportado: 50,
    mqlValido: 39,
    sqlReportado: 12,
    sqlReal: 10,
    ventasReportadas: 6,
    ventasReales: 5,
    ingresoReportado: 21_500_000,
    ingresoReal: 14_900_000,
    fugaRojo: 4_600_000,
    malaAtencion: 2_400_000,
  },
]

/* ───────────────────────── Campanas por sucursal (drill-down meso) ───────────────────────── */

export type Plataforma = "Meta" | "Google" | "TikTok" | "Offline"

export interface CampanaRealidad extends Omit<SucursalRealidad, "sucursalId"> {
  id: string
  sucursalId: string
  nombre: string
  plataforma: Plataforma
}

/** Reparte el total de una sucursal en 2-3 campanas con pesos fijos para mantener consistencia. */
function splitCampanas(s: SucursalRealidad): CampanaRealidad[] {
  const plantillas: { nombre: string; plataforma: Plataforma; w: number }[] = [
    { nombre: "Advantage+ | Conversiones | Frio", plataforma: "Meta", w: 0.45 },
    { nombre: "Search | Alta intencion", plataforma: "Google", w: 0.33 },
    { nombre: "Spark Ads | Publico frio", plataforma: "TikTok", w: 0.22 },
  ]
  const r = (n: number, w: number) => Math.round(n * w)
  return plantillas.map((p, i) => ({
    id: `${s.sucursalId}-c${i + 1}`,
    sucursalId: s.sucursalId,
    nombre: p.nombre,
    plataforma: p.plataforma,
    inversion: r(s.inversion, p.w),
    mqlReportado: r(s.mqlReportado, p.w),
    mqlValido: r(s.mqlValido, p.w),
    sqlReportado: r(s.sqlReportado, p.w),
    sqlReal: r(s.sqlReal, p.w),
    ventasReportadas: r(s.ventasReportadas, p.w),
    ventasReales: r(s.ventasReales, p.w),
    ingresoReportado: r(s.ingresoReportado, p.w),
    ingresoReal: r(s.ingresoReal, p.w),
    fugaRojo: r(s.fugaRojo, p.w),
    malaAtencion: r(s.malaAtencion, p.w),
  }))
}

export function campanasDeSucursal(sucursalId: string): CampanaRealidad[] {
  const s = REALIDAD_SEED.find((x) => x.sucursalId === sucursalId)
  return s ? splitCampanas(s) : []
}

/* ───────────────────────── Agregacion ───────────────────────── */

export interface Agregado {
  inversion: number
  mqlReportado: number
  mqlValido: number
  sqlReportado: number
  sqlReal: number
  ventasReportadas: number
  ventasReales: number
  ingresoReportado: number
  ingresoReal: number
  fugaRojo: number
  malaAtencion: number
}

const ZERO: Agregado = {
  inversion: 0,
  mqlReportado: 0,
  mqlValido: 0,
  sqlReportado: 0,
  sqlReal: 0,
  ventasReportadas: 0,
  ventasReales: 0,
  ingresoReportado: 0,
  ingresoReal: 0,
  fugaRojo: 0,
  malaAtencion: 0,
}

export function agregar(items: Agregado[]): Agregado {
  return items.reduce(
    (acc, x) => ({
      inversion: acc.inversion + x.inversion,
      mqlReportado: acc.mqlReportado + x.mqlReportado,
      mqlValido: acc.mqlValido + x.mqlValido,
      sqlReportado: acc.sqlReportado + x.sqlReportado,
      sqlReal: acc.sqlReal + x.sqlReal,
      ventasReportadas: acc.ventasReportadas + x.ventasReportadas,
      ventasReales: acc.ventasReales + x.ventasReales,
      ingresoReportado: acc.ingresoReportado + x.ingresoReportado,
      ingresoReal: acc.ingresoReal + x.ingresoReal,
      fugaRojo: acc.fugaRojo + x.fugaRojo,
      malaAtencion: acc.malaAtencion + x.malaAtencion,
    }),
    { ...ZERO },
  )
}

/* ───────────────────────── KPIs derivados (reportado vs real) ───────────────────────── */

export interface KpiPar {
  /* Costo por lead */
  cplReportado: number
  cplReal: number
  /* Costo por oportunidad */
  cpoReportado: number
  cpoReal: number
  /* Costo de adquisicion de cliente */
  cacReportado: number
  cacReal: number
  /* ROAS */
  roasReportado: number
  roasReal: number
  /* ROMI (%) */
  romiReportado: number
  romiReal: number
  /* Conversion MQL -> SQL (%) */
  convReportado: number
  convReal: number
  /* Dinero que marketing reclama y el CRM no confirma (fantasma) */
  dineroFantasma: number
  /* % de inflado del reporte sobre la realidad */
  inflado: number
  /* Tasa de validez de leads (CRM valida / marketing dice) */
  validezLeads: number
}

const safe = (a: number, b: number) => (b > 0 ? a / b : 0)

export function kpis(a: Agregado): KpiPar {
  return {
    cplReportado: safe(a.inversion, a.mqlReportado),
    cplReal: safe(a.inversion, a.mqlValido),
    cpoReportado: safe(a.inversion, a.sqlReportado),
    cpoReal: safe(a.inversion, a.sqlReal),
    cacReportado: safe(a.inversion, a.ventasReportadas),
    cacReal: safe(a.inversion, a.ventasReales),
    roasReportado: safe(a.ingresoReportado, a.inversion),
    roasReal: safe(a.ingresoReal, a.inversion),
    romiReportado: safe(a.ingresoReportado - a.inversion, a.inversion) * 100,
    romiReal: safe(a.ingresoReal - a.inversion, a.inversion) * 100,
    convReportado: safe(a.sqlReportado, a.mqlReportado) * 100,
    convReal: safe(a.sqlReal, a.mqlValido) * 100,
    dineroFantasma: a.ingresoReportado - a.ingresoReal,
    inflado: safe(a.ingresoReportado - a.ingresoReal, a.ingresoReal) * 100,
    validezLeads: safe(a.mqlValido, a.mqlReportado) * 100,
  }
}

/* ───────────────────────── Formato de dinero (COP) ───────────────────────── */

/** Compacto: $167.5M / $820k / $540 */
export function money(n: number): string {
  const sign = n < 0 ? "-" : ""
  const v = Math.abs(n)
  if (v >= 1_000_000) return `${sign}$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${sign}$${Math.round(v / 1_000)}k`
  return `${sign}$${Math.round(v)}`
}

/** Preciso con separador de miles es-CO: $306.814 */
export function pesos(n: number): string {
  return `$${Math.round(n).toLocaleString("es-CO")}`
}

/* ───────────────────────── Motor de insight IA ───────────────────────── */

export type Severidad = "critico" | "alerta" | "sano"

export interface InsightIA {
  severidad: Severidad
  titular: string
  detalle: string
  /* sucursal con la peor brecha de dinero (para el foco / drill-down sugerido) */
  focoSucursalId: string | null
}

/**
 * "La IA cruza marketing contra CRM". Detecta la brecha total, el dinero fantasma
 * y la sucursal que mas infla, y lo narra en lenguaje de dinero real.
 */
export function generarInsight(
  registros: SucursalRealidad[],
  nombreSucursal: (id: string) => string,
): InsightIA {
  if (registros.length === 0) {
    return { severidad: "sano", titular: "Sin datos en el alcance actual", detalle: "Ajusta los filtros para ver el contraste.", focoSucursalId: null }
  }
  const total = agregar(registros)
  const k = kpis(total)

  // Sucursal que mas infla en proporcion (el verdadero infractor, no solo el mas grande)
  const inflaPct = (r: SucursalRealidad) =>
    r.ingresoReal > 0 ? (r.ingresoReportado - r.ingresoReal) / r.ingresoReal : 0
  const foco = [...registros].sort((a, b) => inflaPct(b) - inflaPct(a))[0]
  const focoK = kpis(agregar([foco]))

  const severidad: Severidad = k.inflado >= 35 ? "critico" : k.inflado >= 15 ? "alerta" : "sano"

  const titular =
    severidad === "sano"
      ? `Marketing y CRM cuadran: ${money(k.dineroFantasma)} sin respaldo (${Math.round(k.inflado)}%)`
      : `Marketing reporta ${money(total.ingresoReportado)} y el CRM solo confirma ${money(total.ingresoReal)}`

  const detalle =
    severidad === "sano"
      ? `El reporte esta alineado con la realidad. Aun asi, vigila ${money(total.fugaRojo)} de fuga en semaforo rojo y ${money(total.malaAtencion)} cerrados con mala atencion.`
      : `Hay ${money(k.dineroFantasma)} (${Math.round(k.inflado)}% inflado) que ninguna venta del CRM respalda. ` +
        `El foco es ${nombreSucursal(foco.sucursalId)}: reporta ${focoK.roasReportado.toFixed(1)}x pero cierra ${focoK.roasReal.toFixed(1)}x, ` +
        `${money(foco.ingresoReportado - foco.ingresoReal)} de humo. Suma ademas ${money(total.fugaRojo)} perdidos en rojo.`

  return { severidad, titular, detalle, focoSucursalId: foco.sucursalId }
}
