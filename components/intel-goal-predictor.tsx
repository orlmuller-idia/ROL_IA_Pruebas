"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { TrendingUp, Target, AlertTriangle, Gauge, Zap, Sparkles, Filter } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { useDateRange } from "@/contexts/date-range-context"
import { useForecast } from "@/contexts/forecast-context"
import {
  buildForecastSeries,
  sumForecastSeries,
  buildPredictionAnalysis,
  type ScenarioId,
  type ForecastPoint,
  type PredictionInsight,
} from "@/lib/forecast-model"

/**
 * Predictor de Metas (G4).
 * Meta por LINEA y por MES (configurable en G4). El grafico se filtra por linea
 * (o consolidado de las lineas activas) y la seccion de analisis explica el
 * porque de cada escenario (optimista / normal / pesimista) como soporte verbal.
 */

const CONSOLIDADO = "consolidado"

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
    accionSugerida: "Sonia debe pedir reunion con el decisor para cerrar respuesta sobre alcance.",
    owner: "Laura Garcia",
  },
]

interface ActionItem {
  title: string
  body: string
}

const ACTION_PLAN: ActionItem[] = [
  {
    title: "Riesgo de incumplimiento proyectado",
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

/* ── Analisis de la prediccion ── */

const TONE_STYLES: Record<PredictionInsight["tone"], { card: string; title: string }> = {
  positive: { card: "border-rescue/30 bg-rescue/5", title: "text-rescue" },
  info: { card: "border-info/30 bg-info/5", title: "text-info" },
  warning: { card: "border-warning/30 bg-warning/5", title: "text-warning" },
}

function InsightCard({ insight }: { insight: PredictionInsight }) {
  const tone = TONE_STYLES[insight.tone]
  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${tone.card}`}>
      <span className={`text-sm font-semibold ${tone.title}`}>{insight.title}</span>
      <div className="flex flex-col gap-1.5">
        {insight.paragraphs.map((p, i) => (
          <p key={i} className="text-foreground/80 text-xs leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  )
}

const SCENARIOS: { id: ScenarioId; label: string; cls: string }[] = [
  { id: "optimista", label: "Optimista", cls: "border-info/40 bg-info/10 text-info" },
  { id: "esperado", label: "Normal", cls: "border-rescue/40 bg-rescue/10 text-rescue" },
  { id: "pesimista", label: "Pesimista", cls: "border-warning/40 bg-warning/10 text-warning" },
]

export function IntelGoalPredictor() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const { periods, selectionLabel } = useDateRange()
  const { lines, activeLineIds, getGoal, goalForMonth, activeMonth, months, year } = useForecast()

  // Filtro de linea del grafico (consolidado o una linea activa).
  const [lineFilter, setLineFilter] = useState<string>(CONSOLIDADO)
  // Escenario en foco para el analisis de la prediccion.
  const [scenario, setScenario] = useState<ScenarioId>("esperado")

  const activeLines = useMemo(
    () => lines.filter((l) => activeLineIds.includes(l.id)),
    [lines, activeLineIds],
  )

  // Si la linea filtrada deja de estar activa, volvemos a consolidado.
  const effectiveFilter =
    lineFilter !== CONSOLIDADO && !activeLineIds.includes(lineFilter) ? CONSOLIDADO : lineFilter

  const labels = useMemo(() => periods.map((p) => p.label), [periods])

  // Meta del periodo segun el filtro.
  const metaCOP =
    effectiveFilter === CONSOLIDADO
      ? goalForMonth(activeMonth)
      : getGoal(effectiveFilter, activeMonth)

  // Serie acumulada (en millones) segun el filtro.
  const data = useMemo<ForecastPoint[]>(() => {
    if (effectiveFilter === CONSOLIDADO) {
      const perLine = activeLines.map((l) => buildForecastSeries(labels, getGoal(l.id, activeMonth)))
      return perLine.length ? sumForecastSeries(perLine) : buildForecastSeries(labels, 0)
    }
    return buildForecastSeries(labels, metaCOP)
  }, [effectiveFilter, activeLines, labels, getGoal, activeMonth, metaCOP])

  const last = data[data.length - 1] ?? { esperado: 0, optimista: 0, pesimista: 0, date: "" }
  const projected = last.esperado * 1_000_000
  const optimistic = last.optimista * 1_000_000
  const pessimistic = last.pesimista * 1_000_000
  const gap = metaCOP - projected
  const pct = metaCOP > 0 ? Math.round((projected / metaCOP) * 100) : 0
  const belowGoal = projected < metaCOP

  const metaM = metaCOP / 1_000_000
  const yMax = Math.max(10, Math.ceil((metaM * 1.2) / 10) * 10)

  const filterLabel =
    effectiveFilter === CONSOLIDADO
      ? "Consolidado"
      : (lines.find((l) => l.id === effectiveFilter)?.nombre ?? "Linea")
  const lineaNombre = effectiveFilter === CONSOLIDADO ? "el portafolio" : filterLabel
  const mesLabel = months[activeMonth]?.label ?? ""
  const mesLabelCap = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1)

  const insights = useMemo(
    () => buildPredictionAnalysis(scenario, lineaNombre, metaCOP, mesLabelCap, year),
    [scenario, lineaNombre, metaCOP, mesLabelCap, year],
  )

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
            Para <span className="font-semibold">{filterLabel}</span> en{" "}
            <span className="font-semibold capitalize">{mesLabel}</span>, la lectura actual ubica el cierre esperado{" "}
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
            <KpiCard label="Meta del mes" value={formatCOP(metaCOP)} />
            <KpiCard label="Proyeccion esperada" value={formatCOP(projected)} accent="rescue" />
            <KpiCard
              label="Brecha contra meta"
              value={formatCOP(gap)}
              accent={belowGoal ? "alert" : "rescue"}
            />
            <KpiCard
              label="% de cumplimiento"
              value={`${pct}%`}
              accent={belowGoal ? "alert" : "rescue"}
            />
          </div>
        )}

        {/* ═══════════ Grafico acumulado (macro + meso) ═══════════ */}
        {level !== "micro" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-foreground text-sm font-semibold">
                  Historico y prediccion acumulada de ventas
                </h4>
                <p className="text-muted-foreground text-[11px]">
                  Vista acumulada con banda de negocio optimista-pesimista.
                  <span className="text-foreground/70"> Periodo: {selectionLabel}.</span>
                </p>
              </div>
              {/* Filtro por linea */}
              <div className="flex items-center gap-2">
                <Filter className="text-muted-foreground h-3.5 w-3.5" />
                <Select value={effectiveFilter} onValueChange={setLineFilter}>
                  <SelectTrigger className="bg-secondary/40 h-8 w-48 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CONSOLIDADO} className="text-xs">
                      Consolidado ({activeLines.length} lineas)
                    </SelectItem>
                    {activeLines.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: l.color }}
                          />
                          {l.nombre}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
                    domain={[0, yMax]}
                    width={48}
                    tickCount={7}
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
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="line" />
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
                    y={metaM}
                    stroke="#ef4444"
                    strokeDasharray="6 3"
                    strokeWidth={1.5}
                    label={{
                      value: `Meta $${Math.round(metaM)}M`,
                      position: "insideTopRight",
                      fill: "#ef4444",
                      fontSize: 10,
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ═══════════ Analisis de la prediccion (macro + meso) ═══════════ */}
        {level !== "micro" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-aura/10 flex h-7 w-7 items-center justify-center rounded-lg">
                  <Sparkles className="text-aura h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-foreground text-sm font-semibold">Analisis de la prediccion</h4>
                  <p className="text-muted-foreground text-[11px]">
                    Soporte verbal de la IA: por que el modelo proyecta este escenario para {filterLabel}.
                  </p>
                </div>
              </div>
              {/* Selector de escenario */}
              <div className="flex items-center gap-1.5">
                {SCENARIOS.map((s) => {
                  const isActive = scenario === s.id
                  return (
                    <button
                      key={s.id}
                      onClick={() => setScenario(s.id)}
                      className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all ${
                        isActive
                          ? s.cls
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
            <p className="text-muted-foreground/70 text-[10px]">
              Generado por la IA de Rol.IA a partir del historico y la meta configurada en G4. Es un
              apoyo interpretativo, no sustituye el criterio comercial.
            </p>
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
                  Error monetario estimado: {formatCOP(projected * 0.066)}
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
            <h4 className="text-foreground text-sm font-semibold">
              Plan de accion semanal: recuperar la meta
            </h4>
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
