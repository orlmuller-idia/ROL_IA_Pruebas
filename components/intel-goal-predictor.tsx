"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Legend,
} from "recharts"
import { TrendingUp, Target, AlertTriangle, Gauge, Zap } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { useDateRange } from "@/contexts/date-range-context"
import { resampleSeries, type Period } from "@/lib/date-range"

/**
 * Predictor de Metas (Predictivo)
 * Vista acumulada dia a dia con banda de negocio (optimista / pesimista) y meta.
 * Se adapta al nivel de perfil siguiendo el principio "de lo general a lo particular":
 *  - macro: lectura ejecutiva -> meta, proyeccion esperada, brecha, % cumplimiento + grafico acumulado.
 *  - meso: gerencial -> grafico + indicadores clave del cierre + plan de accion semanal.
 *  - micro: operativo -> SUS leads en proceso con probabilidad de cierre y accion sugerida.
 */

const MONTHLY_GOAL = 150_000_000 // COP $150M

interface DayPoint {
  date: string
  historico?: number
  esperado: number
  pesimista: number
  optimista: number
}

/* Curvas base (en millones COP) que se re-muestrean a los periodos del rango */
const HISTORICO_BASE = [20, 20, 18, 22, 30, 48, 78, 92, 110, 138, 152, 170, 192]
const ESPERADO_BASE = [16, 18, 14, 20, 28, 38, 48, 58, 70, 82, 92, 102, 112]
const PESIMISTA_BASE = [16, 16, 10, 16, 22, 28, 36, 42, 50, 52, 60, 66, 84]
const OPTIMISTA_BASE = [18, 22, 16, 26, 38, 50, 64, 80, 96, 114, 126, 140, 150]

/* Serie acumulada re-alineada a los periodos del rango elegido (eje X claro) */
function buildSeries(periods: Period[]): DayPoint[] {
  const n = Math.max(periods.length, 1)
  const historico = resampleSeries(HISTORICO_BASE, n)
  const esperado = resampleSeries(ESPERADO_BASE, n)
  const pesimista = resampleSeries(PESIMISTA_BASE, n)
  const optimista = resampleSeries(OPTIMISTA_BASE, n)
  // El historico (real) solo llega hasta "hoy": ~72% del periodo
  const histCount = Math.max(1, Math.round(n * 0.72))

  return periods.map((p, i) => ({
    date: p.label,
    historico: i < histCount ? Math.round(historico[i]) : undefined,
    esperado: Math.round(esperado[i]),
    pesimista: Math.round(pesimista[i]),
    optimista: Math.round(optimista[i]),
  })) as DayPoint[]
}

interface LeadRow {
  id: string
  etapa: string
  valor: number
  prob: "Alta" | "Media" | "Baja"
  crmPct: number
  rango: string
  cierreP50: string
  queFalta: string
  accionLabel: string
  accionSugerida: string
  owner: string
}

const LEADS: LeadRow[] = [
  {
    id: "29292365",
    etapa: "Reunion inicial",
    valor: 24_000_000,
    prob: "Alta",
    crmPct: 40,
    rango: "Abierta",
    cierreP50: "2026-05-29",
    queFalta: "Cierre esperado vencido; falta confirmar decisor y siguiente reunion.",
    accionLabel: "Escalar cierre",
    accionSugerida:
      "Ricardo debe llamar hoy, confirmar decisor y mover la oportunidad a negociacion o reprogramar fecha de cierre.",
    owner: "Carlos Martinez",
  },
  {
    id: "29265737",
    etapa: "Documentacion",
    valor: 6_231_996,
    prob: "Alta",
    crmPct: 10,
    rango: "Abierta",
    cierreP50: "2026-05-30",
    queFalta: "Esta en documentacion con cierre esperado vencido; falta desbloquear requisitos.",
    accionLabel: "Desbloquear docs",
    accionSugerida:
      "Catalina debe pedir el documento pendiente y dejar fecha de firma confirmada en CRM.",
    owner: "Carlos Martinez",
  },
  {
    id: "29529870",
    etapa: "Seguimiento propuesta economica",
    valor: 4_160_050,
    prob: "Media",
    crmPct: 10,
    rango: "Abierta",
    cierreP50: "2026-06-24",
    queFalta: "Propuesta enviada; falta validar si aprobaron precio y alcance.",
    accionLabel: "Validar propuesta",
    accionSugerida:
      "Sonia debe confirmar aceptacion de la propuesta economica y registrar objecion concreta si el precio esta frenando el cierre.",
    owner: "Laura Garcia",
  },
  {
    id: "29457900",
    etapa: "Seguimiento propuesta economica",
    valor: 6_231_996,
    prob: "Media",
    crmPct: 10,
    rango: "Abierta",
    cierreP50: "2026-06-25",
    queFalta: "Valor alto en propuesta; falta validar autoridad de compra.",
    accionLabel: "Confirmar decisor",
    accionSugerida:
      "Sonia debe pedir reunion con el decisor para cerrar respuesta sobre alcance.",
    owner: "Laura Garcia",
  },
]

interface ActionItem {
  title: string
  body: string
}

const ACTION_PLAN: ActionItem[] = [
  {
    title: "Riesgo de incumplimiento proyectado ($856.383 por cubrir)",
    body: "La estimacion actual esta por debajo de la meta y el crecimiento es fragil si descuidamos las horas pico. No capitalizar los cierres de mayor conversion diluira el avance acumulado y obligara al equipo a depender de cierres de ultima hora bajo presion.",
  },
  {
    title: "Fuga de esfuerzo comercial por datos erroneos",
    body: "Mantener canales sin auditoria consume tiempo valioso en leads duplicados o fuera de perfil. Ajusta la segmentacion y los filtros de entrada de inmediato para que los ejecutivos concentren energia en oportunidades reales y rentables.",
  },
  {
    title: "Alerta de enfriamiento de prospectos",
    body: "La demora en el primer contacto y el seguimiento insuficiente dejan morir oportunidades analizadas. Implementa alertas diarias de desviacion para forzar contacto inmediato y evitar que la falta de respuesta profundice la brecha.",
  },
]

function formatCOP(v: number) {
  return "$" + Math.round(v).toLocaleString("es-CO")
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint?: string
  accent?: "alert" | "rescue" | "default"
}) {
  const valueColor =
    accent === "alert" ? "text-alert" : accent === "rescue" ? "text-rescue" : "text-foreground"
  return (
    <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-4">
      <span className="text-muted-foreground text-[11px] leading-tight">{label}</span>
      <span className={`font-mono text-2xl font-bold ${valueColor}`}>{value}</span>
      {hint && <span className="text-muted-foreground text-[11px] leading-snug">{hint}</span>}
    </div>
  )
}

function probBadgeClass(prob: LeadRow["prob"]) {
  if (prob === "Alta") return "border-rescue/40 text-rescue bg-rescue/10"
  if (prob === "Media") return "border-warning/40 text-warning bg-warning/10"
  return "border-alert/40 text-alert bg-alert/10"
}

export function IntelGoalPredictor() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const { periods, selectionLabel } = useDateRange()
  const data = useMemo(() => buildSeries(periods), [periods])

  // Proyeccion de cierre = ultimo punto esperado
  const projected = data[data.length - 1].esperado * 1_000_000 // a COP
  const optimistic = data[data.length - 1].optimista * 1_000_000
  const pessimistic = data[data.length - 1].pesimista * 1_000_000
  // Para reflejar las imagenes: proyeccion esperada ~149.143.617
  const projectedReal = 149_143_617
  const gap = MONTHLY_GOAL - projectedReal
  const pct = Math.round((projectedReal / MONTHLY_GOAL) * 100)
  const belowGoal = projectedReal < MONTHLY_GOAL

  // Leads visibles segun nivel (micro = solo los del asesor)
  const visibleLeads = useMemo(() => {
    if (level === "micro") {
      const own = LEADS.filter((l) => l.owner === currentProfile.name)
      return own.length ? own : LEADS
    }
    return LEADS
  }, [level, currentProfile.name])

  const subtitle =
    level === "macro"
      ? "Lectura ejecutiva: proyeccion de cierre vs meta del mes"
      : level === "meso"
        ? "Indicadores clave del cierre y plan de accion semanal"
        : "Tus leads en proceso: que hacer ahora"

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex flex-col gap-1 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <div className="bg-rescue/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <TrendingUp className="text-rescue h-4 w-4" />
              </div>
              Predictor de Metas
            </span>
            <span className="text-muted-foreground pl-9 text-[11px] font-normal">{subtitle}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge
              variant="outline"
              className={`font-mono text-xs ${
                belowGoal ? "border-alert/30 text-alert" : "border-rescue/30 text-rescue"
              }`}
            >
              <Target className="mr-1 h-3 w-3" />
              {pct}% de meta
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* ═══════════ Resumen ejecutivo (todos los niveles) ═══════════ */}
        <div
          className={`flex flex-col gap-1 rounded-lg border px-4 py-3 ${
            belowGoal ? "border-alert/20 bg-alert/5" : "border-rescue/20 bg-rescue/5"
          }`}
        >
          <p className="text-foreground text-xs leading-relaxed">
            La lectura actual ubica el cierre esperado{" "}
            <span className={`font-semibold ${belowGoal ? "text-alert" : "text-rescue"}`}>
              {formatCOP(Math.abs(gap))} {belowGoal ? "por debajo de la meta" : "por encima de la meta"}
            </span>
            .
          </p>
          <p className="text-muted-foreground text-[11px]">
            Escenario pesimista: {formatCOP(pessimistic)} &middot; Escenario optimista: {formatCOP(optimistic)}.
          </p>
        </div>

        {/* ═══════════ MACRO: KPIs ejecutivos ═══════════ */}
        {level === "macro" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard label="Meta del mes" value={formatCOP(MONTHLY_GOAL)} />
            <KpiCard label="Proyeccion esperada" value={formatCOP(projectedReal)} accent="rescue" />
            <KpiCard label="Brecha contra meta" value={formatCOP(gap)} accent={belowGoal ? "alert" : "rescue"} />
            <KpiCard label="% de cumplimiento" value={`${pct}%`} accent={belowGoal ? "alert" : "rescue"} />
          </div>
        )}

        {/* ═══════════ Grafico acumulado (macro + meso) ═══════════ */}
        {level !== "micro" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h4 className="text-foreground text-sm font-semibold">Historico y prediccion acumulada de ventas</h4>
              <p className="text-muted-foreground text-[11px]">
                Vista acumulada construida desde el total vendido y banda de negocio optimista-pesimista.
                <span className="text-foreground/70"> Periodo: {selectionLabel}.</span>
              </p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}M`}
                    domain={[0, 210]}
                    width={44}
                    tickCount={8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#1f2937",
                    }}
                    formatter={(v: number, name: string) => [`COP $${v}M`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                    iconType="line"
                  />
                  {/* Banda de negocio: relleno entre pesimista y optimista */}
                  <Area
                    type="monotone"
                    dataKey="optimista"
                    name="Optimista"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#bandGrad)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="pesimista"
                    name="Pesimista"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="#ffffff"
                    fillOpacity={1}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="esperado"
                    name="Esperado"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="historico"
                    name="Historico"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                  <ReferenceLine
                    y={MONTHLY_GOAL / 1_000_000}
                    stroke="#ef4444"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{ value: "Meta", position: "right", fill: "#ef4444", fontSize: 10 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══════════ MESO: indicadores clave del cierre ═══════════ */}
        {level === "meso" && (
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-semibold">Indicadores clave del cierre</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1.5 rounded-lg border p-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="h-3 w-3" /> Probabilidad de error de la prediccion
                </span>
                <span className="text-foreground font-mono text-2xl font-bold">6.6%</span>
                <span className="text-muted-foreground text-[11px] leading-snug">
                  Error monetario estimado: $4.994.244
                </span>
              </div>
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1.5 rounded-lg border p-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Target className="h-3 w-3" /> Cierres dentro del rango esperado
                </span>
                <span className="text-rescue font-mono text-2xl font-bold">83.3%</span>
              </div>
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1.5 rounded-lg border p-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Gauge className="h-3 w-3" /> Ritmo de traccion comercial
                </span>
                <span className="text-alert font-mono text-2xl font-bold">-0.1%</span>
                <span className="text-muted-foreground text-[11px] leading-snug">
                  Alerta de aceleracion: conviene presionar cierres y recuperar ritmo.
                </span>
              </div>
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1.5 rounded-lg border p-4">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Zap className="h-3 w-3" /> Nivel de confianza del cierre
                </span>
                <span className="text-rescue font-mono text-2xl font-bold">ALTA</span>
                <span className="text-muted-foreground text-[11px] leading-snug">
                  Certeza del modelo para apoyar decisiones de presupuesto o inversion.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ MESO: plan de accion semanal ═══════════ */}
        {level === "meso" && (
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-semibold">Plan de accion semanal: recuperar la meta</h4>
            <div className="flex flex-col gap-2.5">
              {ACTION_PLAN.map((item) => (
                <div
                  key={item.title}
                  className="bg-secondary/30 border-rescue/40 flex flex-col gap-1 rounded-lg border-l-2 py-3 pl-4 pr-4"
                >
                  <span className="text-foreground text-xs font-semibold">{item.title}:</span>
                  <span className="text-muted-foreground text-xs leading-relaxed">{item.body}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ MICRO: leads en proceso ═══════════ */}
        {level === "micro" && (
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-semibold">Leads en proceso: que hacer ahora</h4>
            <div className="border-border/50 overflow-hidden rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-xs">
                  <thead className="bg-secondary/60 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Lead</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Etapa</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Valor</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Prob. cierre</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Cierre P50</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Que falta</th>
                      <th className="px-3 py-2 font-medium uppercase tracking-wider text-[10px]">Accion sugerida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLeads.map((lead) => (
                      <tr key={lead.id} className="border-border/40 border-t align-top">
                        <td className="text-foreground px-3 py-3 font-mono">{lead.id}</td>
                        <td className="text-foreground px-3 py-3">{lead.etapa}</td>
                        <td className="text-foreground px-3 py-3 font-mono">{formatCOP(lead.valor)}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${probBadgeClass(lead.prob)}`}
                          >
                            {lead.prob} (CRM {lead.crmPct}%)
                          </span>
                        </td>
                        <td className="text-muted-foreground px-3 py-3 font-mono whitespace-nowrap">{lead.cierreP50}</td>
                        <td className="text-muted-foreground max-w-[200px] px-3 py-3 leading-snug">{lead.queFalta}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-info border-info/30 bg-info/10 inline-flex w-fit items-center rounded-md border px-2 py-1 text-[11px] font-medium">
                              {lead.accionLabel}
                            </span>
                            <span className="text-muted-foreground max-w-[260px] leading-snug">{lead.accionSugerida}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <p className="text-muted-foreground/70 text-right text-[10px]">
          Forecasting IA &middot; Banda de negocio optimista-pesimista &middot; Se recalcula diariamente
        </p>
      </CardContent>
    </Card>
  )
}
