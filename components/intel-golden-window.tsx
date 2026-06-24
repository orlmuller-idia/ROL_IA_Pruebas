"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Sparkles,
  Brain,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Target,
} from "lucide-react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { HelpHint } from "@/components/help-hint"
import { useDateRange } from "@/contexts/date-range-context"
import { rangeScaleFactor } from "@/lib/date-range"

const HELP_BY_LEVEL: Record<ProfileLevel, string> = {
  macro:
    "Lectura ejecutiva con IA. Resume las franjas horarias clave del dia: el mejor momento para cerrar, la hora de las ventas mas caras y la franja con mas friccion operativa, con la recomendacion estrategica.",
  meso:
    "Analisis horario con Machine Learning. Cruza por cada franja la probabilidad de cierre, el ticket promedio y el indice de friccion para ubicar con precision la ventana dorada del equipo.",
  micro:
    "Tu plan por horas. En que franja reservar tus mejores leads para maximizar el cierre y cual evitar por exceso de friccion.",
}

/**
 * Ventana Dorada (Diagnostico)
 * Lectura horaria con Machine Learning e IA para identificar el mejor momento de cierre,
 * la franja de mayor valor y los momentos con mas friccion operativa.
 * Se adapta al nivel de perfil ("de lo general a lo particular"):
 *  - macro: lectura ejecutiva -> franjas clave + recomendacion estrategica IA.
 *  - meso: analisis completo -> grafico horario (cierre vs valor vs friccion) por franja.
 *  - micro: operativo -> tu mejor franja personal + plan de accion por hora.
 */

interface HourSlot {
  hour: string // etiqueta 12h
  h24: number
  closeRate: number // % probabilidad de cierre (modelo)
  avgTicket: number // ticket promedio COP
  friction: number // indice de friccion 0-100
  volume: number // # de interacciones
}

// Datos horarios modelados (8 AM - 7 PM)
const HOURS: HourSlot[] = [
  { hour: "8 AM", h24: 8, closeRate: 18, avgTicket: 1_850_000, friction: 22, volume: 14 },
  { hour: "9 AM", h24: 9, closeRate: 31, avgTicket: 2_100_000, friction: 18, volume: 28 },
  { hour: "10 AM", h24: 10, closeRate: 44, avgTicket: 2_480_000, friction: 24, volume: 41 },
  { hour: "11 AM", h24: 11, closeRate: 52, avgTicket: 2_900_000, friction: 30, volume: 47 },
  { hour: "12 PM", h24: 12, closeRate: 49, avgTicket: 3_420_000, friction: 38, volume: 38 },
  { hour: "1 PM", h24: 13, closeRate: 27, avgTicket: 2_650_000, friction: 71, volume: 19 },
  { hour: "2 PM", h24: 14, closeRate: 38, avgTicket: 2_540_000, friction: 44, volume: 33 },
  { hour: "3 PM", h24: 15, closeRate: 51, avgTicket: 2_780_000, friction: 27, volume: 45 },
  { hour: "4 PM", h24: 16, closeRate: 63, avgTicket: 3_050_000, friction: 19, volume: 52 },
  { hour: "5 PM", h24: 17, closeRate: 57, avgTicket: 2_820_000, friction: 26, volume: 44 },
  { hour: "6 PM", h24: 18, closeRate: 41, avgTicket: 2_300_000, friction: 33, volume: 29 },
  { hour: "7 PM", h24: 19, closeRate: 24, avgTicket: 1_950_000, friction: 40, volume: 12 },
]

function formatCOP(v: number) {
  if (v >= 1_000_000) return "$" + (v / 1_000_000).toFixed(1) + "M"
  return "$" + v.toLocaleString("es-CO")
}

function barColor(rate: number) {
  if (rate >= 55) return "#16a34a" // verde
  if (rate >= 40) return "#eab308" // ambar
  return "#94a3b8" // gris
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as HourSlot
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-900">{d.hour}</p>
      <p className="text-[11px] text-gray-500">Prob. cierre: <span className="font-semibold text-gray-700">{d.closeRate}%</span></p>
      <p className="text-[11px] text-gray-500">Ticket prom.: <span className="font-semibold text-gray-700">{formatCOP(d.avgTicket)}</span></p>
      <p className="text-[11px] text-gray-500">Friccion: <span className="font-semibold text-gray-700">{d.friction}</span></p>
      <p className="text-[11px] text-gray-500">Volumen: <span className="font-semibold text-gray-700">{d.volume} interacciones</span></p>
    </div>
  )
}

export function IntelGoldenWindow() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  // Rango de fechas compartido: escala el volumen agregado de interacciones por franja
  const { range, selectionLabel } = useDateRange()
  const factor = rangeScaleFactor(range, 90)
  const hours = useMemo(
    () => HOURS.map((h) => ({ ...h, volume: Math.max(1, Math.round(h.volume * factor)) })),
    [factor],
  )

  const insights = useMemo(() => {
    const bestClose = [...hours].sort((a, b) => b.closeRate - a.closeRate)[0]
    const highestValue = [...hours].sort((a, b) => b.avgTicket - a.avgTicket)[0]
    const mostFriction = [...hours].sort((a, b) => b.friction - a.friction)[0]
    const lowVolume = bestClose.volume < 30
    return { bestClose, highestValue, mostFriction, lowVolume }
  }, [hours])

  const { bestClose, highestValue, mostFriction, lowVolume } = insights

  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-4.5 w-4.5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-gray-900">Ventana Dorada</h3>
                <HelpHint text={HELP_BY_LEVEL[level]} />
              </div>
              <p className="text-[11px] text-gray-400">
                {level === "macro"
                  ? "Lectura ejecutiva: franjas clave de cierre y valor"
                  : level === "meso"
                    ? "Analisis horario ML: cierre vs valor vs friccion"
                    : "Tu mejor franja para cerrar, calculada con IA"}
                <span className="text-gray-500"> &middot; {selectionLabel}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-[10px] text-violet-600">
              <Brain className="mr-1 h-3 w-3" /> Machine Learning
            </Badge>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[10px] text-amber-600">
              <Sparkles className="mr-1 h-3 w-3" /> IA
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-5">
        {/* ─── Franjas clave (todos los niveles) ─── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SlotCard
            icon={<Trophy className="h-3.5 w-3.5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Mejor momento para cerrar"
            value={bestClose.hour}
            tone="text-emerald-600"
            hint={`${bestClose.closeRate}% prob. de cierre`}
          />
          <SlotCard
            icon={<DollarSign className="h-3.5 w-3.5 text-aura" />}
            iconBg="bg-aura/10"
            label="Ventas mas caras"
            value={highestValue.hour}
            tone="text-aura"
            hint={`ticket prom. ${formatCOP(highestValue.avgTicket)}`}
          />
          <SlotCard
            icon={<AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
            iconBg="bg-red-50"
            label="Momento con mas problemas"
            value={mostFriction.hour}
            tone="text-red-600"
            hint={`indice de friccion ${mostFriction.friction}`}
          />
        </div>

        {/* Advertencia de volumen (macro + meso) */}
        {level !== "micro" && lowVolume && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-[12px] leading-snug text-gray-700">
              <span className="font-semibold">Advertencia de volumen:</span> la franja de mejor cierre tiene bajo
              volumen ({bestClose.volume} interacciones). Valida la recurrencia del patron antes de escalar decisiones
              operativas sobre este horario.
            </p>
          </div>
        )}

        {/* ═══════════════ MACRO: ejecutivo ═══════════════ */}
        {level === "macro" && (
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-violet-500" />
              <h4 className="text-sm font-semibold text-gray-900">Lectura estrategica IA</h4>
            </div>
            <ul className="flex flex-col gap-3">
              <li className="flex gap-2.5">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[12px] leading-snug text-gray-700">
                  La ventana dorada de cierre es a las <span className="font-semibold">{bestClose.hour}</span> con
                  <span className="font-semibold"> {bestClose.closeRate}%</span> de probabilidad. Concentrar el equipo
                  comercial en esta franja maximiza la conversion.
                </p>
              </li>
              <li className="flex gap-2.5">
                <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-aura" />
                <p className="text-[12px] leading-snug text-gray-700">
                  Las ventas de mayor valor ocurren a las <span className="font-semibold">{highestValue.hour}</span>
                  {" "}(ticket promedio <span className="font-semibold">{formatCOP(highestValue.avgTicket)}</span>):
                  ideal para reservar los leads de alto perfil G9.
                </p>
              </li>
              <li className="flex gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-[12px] leading-snug text-gray-700">
                  La franja de <span className="font-semibold">{mostFriction.hour}</span> concentra la mayor friccion
                  operativa (indice {mostFriction.friction}); coincide con el cambio de turno y almuerzo. Activar G7
                  para sostener el contacto en ese horario.
                </p>
              </li>
            </ul>
          </div>
        )}

        {/* ═══════════════ MESO: analisis completo ═══════════════ */}
        {level === "meso" && (
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="mb-1 text-sm font-semibold text-gray-900">Rendimiento por franja horaria</h4>
            <p className="mb-3 text-[11px] text-gray-400">
              Barras: probabilidad de cierre · Linea: indice de friccion
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={hours} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={12}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    unit="%"
                    domain={[0, 100]}
                    tickCount={6}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
                  <ReferenceLine
                    x={bestClose.hour}
                    stroke="#16a34a"
                    strokeDasharray="4 4"
                    label={{ value: "Ventana dorada", position: "top", fill: "#16a34a", fontSize: 10 }}
                  />
                  <Bar dataKey="closeRate" radius={[4, 4, 0, 0]} barSize={20}>
                    {hours.map((h, i) => (
                      <Cell key={i} fill={barColor(h.closeRate)} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="friction"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: "#ef4444" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Legend color="#16a34a" label="Cierre alto (≥55%)" />
              <Legend color="#eab308" label="Cierre medio (40-54%)" />
              <Legend color="#94a3b8" label="Cierre bajo (<40%)" />
              <Legend color="#ef4444" label="Indice de friccion" line />
            </div>
          </div>
        )}

        {/* ═══════════════ MICRO: operativo ═══════════════ */}
        {level === "micro" && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-gray-900">Tu plan de hoy</h4>
              </div>
              <p className="text-[12px] leading-snug text-gray-700">
                Reserva tus leads de alto perfil para las <span className="font-semibold">{bestClose.hour}</span>
                {" "}(tu mejor hora de cierre, {bestClose.closeRate}%) y evita agendar cierres a las{" "}
                <span className="font-semibold">{mostFriction.hour}</span>, la franja con mas friccion.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              {hours.map((h) => {
                const isBest = h.hour === bestClose.hour
                const isWorst = h.hour === mostFriction.hour
                return (
                  <motion.div
                    key={h.hour}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                      isBest
                        ? "border-emerald-200 bg-emerald-50/60"
                        : isWorst
                          ? "border-red-200 bg-red-50/50"
                          : "border-gray-100 bg-white"
                    }`}
                  >
                    <span className="w-12 shrink-0 text-xs font-semibold text-gray-700">{h.hour}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${h.closeRate}%`, backgroundColor: barColor(h.closeRate) }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-mono text-gray-600">{h.closeRate}%</span>
                    {isBest && (
                      <Badge variant="outline" className="border-emerald-200 bg-white text-[9px] text-emerald-600">
                        Mejor
                      </Badge>
                    )}
                    {isWorst && (
                      <Badge variant="outline" className="border-red-200 bg-white text-[9px] text-red-600">
                        Evitar
                      </Badge>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SlotCard({
  icon,
  iconBg,
  label,
  value,
  tone,
  hint,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  tone: string
  hint: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBg}`}>{icon}</div>
      </div>
      <span className={`text-2xl font-bold tracking-tight ${tone}`}>{value}</span>
      <span className="text-[11px] text-gray-400">{hint}</span>
    </div>
  )
}

function Legend({ color, label, line = false }: { color: string; label: string; line?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={line ? "h-0.5 w-4 rounded-full" : "h-2.5 w-2.5 rounded-full"}
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
}
