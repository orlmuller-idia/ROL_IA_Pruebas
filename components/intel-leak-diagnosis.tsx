"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  DollarSign,
  Users,
  ChevronRight,
  Lightbulb,
  Database,
  Search,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { useDateRange } from "@/contexts/date-range-context"
import { rangeScaleFactor } from "@/lib/date-range"

/**
 * Auditor de Fuga (Diagnostico)
 * Reporte de leads fugados clasificados por Machine Learning.
 * Se adapta al nivel de perfil siguiendo el principio "de lo general a lo particular":
 *  - macro: lectura ejecutiva -> KPIs + responsabilidad + diagnostico IA estrategico.
 *  - meso: analisis completo -> frecuencia, radares (frecuencia vs dinero) y acciones por categoria.
 *  - micro: operativo -> tabla de detalle de SUS leads + sugerencias de recuperacion.
 */

interface Category {
  name: string
  frequency: number // % de afectacion
  count: number
  money: number // dinero afectado (relativo 0-100 para radar)
  moneyAbs: number // valor absoluto COP
  responsible: "Marketing" | "Comercial" | "Mixta"
  confidence: number
  examples: string[]
}

const CATEGORIES: Category[] = [
  { name: "Test", frequency: 20.59, count: 7, money: 95, moneyAbs: 12400000, responsible: "Comercial", confidence: 0.91, examples: ["PSA - Test", "Candidato en evaluacion interna"] },
  { name: "Busca de empleo", frequency: 14.7, count: 5, money: 70, moneyAbs: 8200000, responsible: "Marketing", confidence: 0.88, examples: ["Buscaba vacante, no servicio", "Perfil laboral no comercial"] },
  { name: "Candidato aplicando pruebas", frequency: 11.8, count: 4, money: 62, moneyAbs: 6900000, responsible: "Mixta", confidence: 0.84, examples: ["Aplicando pruebas psicotecnicas", "Proceso de seleccion"] },
  { name: "Oportunidad duplicada", frequency: 11.8, count: 4, money: 48, moneyAbs: 5100000, responsible: "Comercial", confidence: 0.86, examples: ["Lead ya existente en CRM", "Doble registro misma persona"] },
  { name: "Sin comunicacion", frequency: 11.7, count: 4, money: 55, moneyAbs: 5600000, responsible: "Comercial", confidence: 0.79, examples: ["No respondio 5 intentos", "Numero fuera de servicio"] },
  { name: "Otro tipo de servicio/Producto", frequency: 8.8, count: 3, money: 40, moneyAbs: 3800000, responsible: "Marketing", confidence: 0.82, examples: ["Buscaba otro producto", "Fuera de portafolio"] },
  { name: "Datos errados", frequency: 5.9, count: 2, money: 28, moneyAbs: 2100000, responsible: "Marketing", confidence: 0.9, examples: ["Telefono invalido", "Correo inexistente"] },
  { name: "Compro con un competidor", frequency: 5.9, count: 2, money: 75, moneyAbs: 7400000, responsible: "Comercial", confidence: 0.77, examples: ["Eligio competencia por precio", "Cerro con otra marca"] },
  { name: "Proyecto Aplazado", frequency: 3.0, count: 1, money: 35, moneyAbs: 2900000, responsible: "Mixta", confidence: 0.8, examples: ["Decision postergada", "Sin presupuesto este Q"] },
  { name: "Comunicacion perdida", frequency: 3.0, count: 1, money: 22, moneyAbs: 1500000, responsible: "Comercial", confidence: 0.74, examples: ["Conversacion abandonada", "Sin seguimiento"] },
]

const RESPONSIBLE_COLORS: Record<string, string> = {
  Marketing: "#7c3aed",
  Comercial: "#ef4444",
  Mixta: "#eab308",
  "Sin categoria": "#9ca3af",
}

interface LeadRow {
  id: string
  category: string
  motivo: string
  confidence: number
  lectura: string
  seller: string
}

const LEAD_ROWS: LeadRow[] = [
  { id: "29360890", category: "Lead perdido", motivo: "Proyecto Aplazado", confidence: 0.8, lectura: "PSA - Proyecto Aplazado · Etapa: Seguimiento revision propuesta economica · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29288527", category: "Lead perdido", motivo: "Datos errados", confidence: 0.9, lectura: "PSA - Datos errados · Etapa: Seguimiento lead · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29536840", category: "Lead perdido", motivo: "PSA - Test", confidence: 0.91, lectura: "PSA - Test · Etapa: Leads · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29531482", category: "Lead perdido", motivo: "PSA - Test", confidence: 0.91, lectura: "PSA - Test · Etapa: Leads · Estado: Perdida", seller: "Laura Garcia" },
  { id: "29530161", category: "Lead perdido", motivo: "PSA - Test", confidence: 0.88, lectura: "PSA - Test · Etapa: Leads · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29530096", category: "Lead perdido", motivo: "PSA - Test", confidence: 0.87, lectura: "PSA - Test · Etapa: Leads · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29526859", category: "Lead perdido", motivo: "Candidato aplicando pruebas", confidence: 0.84, lectura: "PSA - Candidato aplicando pruebas · Etapa: Seguimiento Lead · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29529007", category: "Lead perdido", motivo: "Candidato aplicando pruebas", confidence: 0.82, lectura: "PSA - Candidato aplicando pruebas · Etapa: Leads · Estado: Perdida", seller: "Laura Garcia" },
  { id: "29527311", category: "Lead perdido", motivo: "Sin comunicacion", confidence: 0.79, lectura: "PSA - Sin comunicacion · Etapa: Seguimiento Lead · Estado: Perdida", seller: "Carlos Martinez" },
  { id: "29524880", category: "Lead perdido", motivo: "Busca de empleo", confidence: 0.88, lectura: "PSA - Busca de empleo · Etapa: Leads · Estado: Perdida", seller: "Carlos Martinez" },
]

const TOTAL_LEADS = 34
const UNCLASSIFIED = 0
const QUALITY_ALERTS = 0

function formatCOP(v: number) {
  return "$" + v.toLocaleString("es-CO")
}

// ─── KPIs (todos los niveles, contextualizados) ──────────────────────────────
function KpiCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  hint: string
  tone?: "default" | "alert" | "warning" | "info"
}) {
  const toneText =
    tone === "alert" ? "text-red-600" : tone === "warning" ? "text-amber-600" : tone === "info" ? "text-violet-600" : "text-gray-900"
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneText}`}>{value}</p>
      <p className="mt-1 text-[11px] leading-snug text-gray-400">{hint}</p>
    </div>
  )
}

function RadarTooltip({ active, payload, suffix }: { active?: boolean; payload?: any[]; suffix?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as Category
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-900">{d.name}</p>
      <p className="text-[11px] text-gray-500">{payload[0].value}{suffix}</p>
    </div>
  )
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-900">{d.name}</p>
      <p className="text-[11px] text-gray-500">Cantidad: {d.count} leads</p>
      <p className="text-[11px] text-gray-500">Participacion: {d.pct}%</p>
      <p className="text-[11px] text-gray-500">Confianza: {Math.round(d.confidence * 100)}%</p>
    </div>
  )
}

export function IntelLeakDiagnosis() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  // Rango de fechas compartido: escala los conteos y montos manteniendo las frecuencias (%)
  const { range, selectionLabel } = useDateRange()
  const factor = rangeScaleFactor(range, 30)

  const categories = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        count: Math.max(1, Math.round(c.count * factor)),
        moneyAbs: Math.round(c.moneyAbs * factor),
      })),
    [factor],
  )

  const totalLeads = Math.max(1, Math.round(TOTAL_LEADS * factor))
  const topCategory = categories[0]
  const totalMoney = categories.reduce((s, c) => s + c.moneyAbs, 0)

  // Responsabilidad agregada para donut
  const responsibility = useMemo(() => {
    const map = new Map<string, { count: number; confidence: number; n: number }>()
    categories.forEach((c) => {
      const cur = map.get(c.responsible) ?? { count: 0, confidence: 0, n: 0 }
      cur.count += c.count
      cur.confidence += c.confidence
      cur.n += 1
      map.set(c.responsible, cur)
    })
    const total = categories.reduce((s, c) => s + c.count, 0)
    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      count: v.count,
      pct: Math.round((v.count / total) * 100),
      confidence: v.confidence / v.n,
      color: RESPONSIBLE_COLORS[name],
    }))
  }, [categories])

  // Leads filtrados por perfil (micro = solo del asesor actual)
  const visibleLeads = useMemo(() => {
    if (level === "micro") return LEAD_ROWS.filter((l) => l.seller === currentProfile.name)
    return LEAD_ROWS
  }, [level, currentProfile.name])

  const radarData = categories.slice(0, 9)

  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Brain className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Auditor de Fuga</h3>
              <p className="text-[11px] text-gray-400">
                {level === "macro"
                  ? "Lectura ejecutiva: volumen e impacto por categoria"
                  : level === "meso"
                    ? "Diagnostico ML por categoria y responsable"
                    : "Tus leads fugados clasificados con IA"}
                <span className="text-gray-500"> &middot; {selectionLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-[10px] text-violet-600">
              <Sparkles className="mr-1 h-3 w-3" /> Machine Learning
            </Badge>
            <Badge variant="outline" className="border-red-200 bg-red-50 text-[10px] text-red-600">
              {topCategory.name} · {topCategory.frequency}%
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-5">
        {/* ─── KPIs (todos los niveles) ─── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard label="Total leads" value={String(totalLeads)} hint="base auditada por el modelo" />
          <KpiCard
            label="Dinero en fuga"
            value={formatCOP(totalMoney)}
            hint="impacto economico estimado"
            tone="alert"
          />
          <KpiCard
            label="Categoria mas frecuente"
            value={topCategory.name}
            hint={`${topCategory.frequency}% de afectacion`}
            tone="warning"
          />
          <KpiCard
            label={level === "micro" ? "Tus leads fugados" : "Alertas de calidad"}
            value={level === "micro" ? String(visibleLeads.length) : String(QUALITY_ALERTS)}
            hint={level === "micro" ? "asignados a ti" : "clasificados con datos dudosos"}
            tone="info"
          />
        </div>

        {/* ═══════════════ MACRO: ejecutivo ═══════════════ */}
        {level === "macro" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Responsabilidad donut */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900">Responsabilidad de la fuga</h4>
              </div>
              <p className="mb-3 text-[11px] text-gray-400">Quien origina la perdida segun el modelo</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={responsibility} dataKey="count" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {responsibility.map((r, i) => (
                        <Cell key={i} fill={r.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {responsibility.map((r) => (
                  <div key={r.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[11px] text-gray-600">
                      {r.name} <span className="text-gray-400">({r.pct}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostico IA estrategico */}
            <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-violet-500" />
                <h4 className="text-sm font-semibold text-gray-900">Lectura estrategica IA</h4>
              </div>
              <ul className="flex flex-col gap-3">
                <li className="flex gap-2.5">
                  <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  <p className="text-[12px] leading-snug text-gray-700">
                    El <span className="font-semibold">{topCategory.frequency}%</span> de las fugas se concentra en
                    "{topCategory.name}", lo que sugiere problemas de calificacion en la etapa inicial.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <p className="text-[12px] leading-snug text-gray-700">
                    Impacto economico estimado de <span className="font-semibold">{formatCOP(totalMoney)}</span> en el
                    periodo. El area <span className="font-semibold">Comercial</span> origina la mayor proporcion.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  <p className="text-[12px] leading-snug text-gray-700">
                    Recomendacion: reforzar el filtro de leads "Busca de empleo" en Marketing podria recuperar hasta
                    el <span className="font-semibold">15%</span> del presupuesto fugado.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ═══════════════ MESO: analisis completo ═══════════════ */}
        {level === "meso" && (
          <>
            {/* Frecuencia por categoria (barras) */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h4 className="mb-1 text-sm font-semibold text-gray-900">Frecuencia por categoria</h4>
              <p className="mb-3 text-[11px] text-gray-400">Top 10 categorias del periodo auditado</p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit="%" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#6b7280"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={150}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
                            <p className="text-xs font-semibold text-gray-900">{payload[0].payload.name}</p>
                            <p className="text-[11px] text-gray-500">{payload[0].payload.frequency}% · {payload[0].payload.count} leads</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="frequency" radius={[0, 4, 4, 0]} fill="#ef4444" barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Dos radares: frecuencia vs dinero */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Frecuencia por categoria</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
                      <Radar dataKey="frequency" stroke="#ef4444" fill="#ef4444" fillOpacity={0.35} dot />
                      <Tooltip content={<RadarTooltip suffix="%" />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-900">Dinero afectado por categoria</h4>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="70%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: "#6b7280" }} />
                      <Radar dataKey="money" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} dot />
                      <Tooltip content={<RadarTooltip suffix=" pts" />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Diagnostico IA accionable por categoria */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-violet-500" />
                <h4 className="text-sm font-semibold text-gray-900">Acciones sugeridas por categoria</h4>
              </div>
              <div className="flex flex-col gap-2">
                {categories.slice(0, 6).map((c) => (
                  <div key={c.name} className="rounded-lg border border-gray-100">
                    <button
                      onClick={() => setOpenCategory(openCategory === c.name ? null : c.name)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: RESPONSIBLE_COLORS[c.responsible] }}
                        />
                        <span className="text-[13px] font-medium text-gray-800">{c.name}</span>
                        <Badge variant="outline" className="border-gray-200 text-[10px] text-gray-500">
                          {c.responsible}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400">{c.count} leads · {c.frequency}%</span>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform ${openCategory === c.name ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>
                    <AnimatePresence>
                      {openCategory === c.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-100 bg-gray-50/60"
                        >
                          <div className="flex flex-col gap-2 px-3 py-3">
                            <p className="text-[11px] text-gray-500">
                              <span className="font-semibold text-gray-700">Por que se clasifico asi:</span>{" "}
                              {c.examples.join(" · ")}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              <span className="font-semibold text-gray-700">Confianza del modelo:</span>{" "}
                              {Math.round(c.confidence * 100)}%
                            </p>
                            <div className="flex items-start gap-2 rounded-lg bg-violet-50 px-2.5 py-2">
                              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                              <p className="text-[11px] leading-snug text-violet-700">
                                {c.responsible === "Marketing"
                                  ? "Ajustar segmentacion de campañas y filtros de formulario para reducir leads no calificados."
                                  : c.responsible === "Comercial"
                                    ? "Reforzar protocolo de seguimiento y validacion de datos en la primera llamada."
                                    : "Coordinar Marketing y Comercial: revisar handoff de leads y criterios de calificacion."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ MICRO: detalle operativo ═══════════════ */}
        {level === "micro" && (
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-400" />
                <h4 className="text-sm font-semibold text-gray-900">Detalle de tus leads clasificados</h4>
              </div>
              <Badge variant="outline" className="border-gray-200 text-[10px] text-gray-500">
                {visibleLeads.length} leads
              </Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wide text-gray-400">
                    <th className="px-4 py-2.5 font-semibold">Lead</th>
                    <th className="px-4 py-2.5 font-semibold">Categoria</th>
                    <th className="px-4 py-2.5 font-semibold">Motivo</th>
                    <th className="px-4 py-2.5 font-semibold">Confianza</th>
                    <th className="px-4 py-2.5 font-semibold">Lectura</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLeads.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                      <td className="px-4 py-3 text-[12px] font-medium text-gray-700">{l.id}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{l.category}</td>
                      <td className="px-4 py-3 text-[12px] text-gray-600">{l.motivo}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full ${l.confidence >= 0.85 ? "bg-emerald-500" : l.confidence >= 0.75 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${l.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-gray-500">{Math.round(l.confidence * 100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-gray-500">{l.lectura}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleLeads.length > 0 && (
              <div className="flex items-start gap-2 border-t border-gray-100 bg-violet-50/50 px-4 py-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <p className="text-[12px] leading-snug text-violet-700">
                  Tienes <span className="font-semibold">{visibleLeads.length} leads</span> recuperables. Prioriza los de
                  motivo "Proyecto Aplazado" y "Sin comunicacion": son los de mayor probabilidad de reactivacion segun el modelo.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
