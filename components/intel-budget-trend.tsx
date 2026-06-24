"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { TrendingUp, ChevronDown, FileSpreadsheet } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { OfflineExcelUpload } from "@/components/offline-excel-upload"
import { useDateRange } from "@/contexts/date-range-context"
import { resampleSeries, periodDays, type Period } from "@/lib/date-range"

/**
 * Tendencia de Presupuesto vs Leads por Campana
 * Reporte descriptivo que cruza gasto publicitario (Gasto) contra leads generados
 * a lo largo del tiempo, por plataforma (Meta / Google) y campana.
 * Niveles:
 *  - macro: tendencia consolidada de toda la cuenta (Gasto total vs Leads totales).
 *  - meso: comparativa por plataforma + selector de campana (vista de la imagen).
 *  - micro: leads recibidos por su fuente, sin gestion de presupuesto.
 */

type Platform = "Meta" | "Google" | "TikTok" | "OpenAI" | "Offline"

const PLATFORMS: Platform[] = ["Meta", "Google", "TikTok", "OpenAI", "Offline"]

interface DayPoint {
  date: string
  gasto: number
  leads: number
}

interface Campaign {
  id: string
  name: string
  platform: Platform
  series: DayPoint[]
}

const DATES = [
  "26 may", "27 may", "28 may", "29 may", "30 may", "31 may",
  "1 jun", "2 jun", "3 jun", "4 jun", "5 jun", "6 jun",
]

// Genera una curva de gasto/leads con un pico en el centro
function buildSeries(seed: number, scale: number): DayPoint[] {
  const gastoCurve = [118, 110, 72, 76, 70, 80, 160, 105, 18, 2, 1, 1]
  const leadsCurve = [0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0]
  return DATES.map((date, i) => ({
    date,
    gasto: Math.round((gastoCurve[(i + seed) % 12] * scale) * 1000),
    leads: Math.max(0, Math.round(leadsCurve[(i + seed) % 12] * scale + (i === 6 ? seed % 2 : 0))),
  }))
}

/**
 * Re-alinea una serie base (curva diaria) a los periodos del rango elegido y
 * escala los montos/volumenes por la cantidad de dias de cada periodo, de modo
 * que el eje del grafico cambia de forma clara segun las fechas seleccionadas.
 */
function alignSeries(base: DayPoint[], periods: Period[], mult: number): DayPoint[] {
  const gasto = resampleSeries(base.map((d) => d.gasto), periods.length)
  const leads = resampleSeries(base.map((d) => d.leads), periods.length)
  return periods.map((p, i) => ({
    date: p.label,
    gasto: Math.round(gasto[i] * mult),
    leads: Math.max(0, Math.round(leads[i] * mult)),
  }))
}

const CAMPAIGNS: Campaign[] = [
  { id: "g1", name: "Search | ATS | Plataforma | Optimizada", platform: "Google", series: buildSeries(0, 1) },
  { id: "g2", name: "Search | Branding | Exacta", platform: "Google", series: buildSeries(2, 0.7) },
  { id: "m1", name: "Advantage+ | Conversiones | Frio", platform: "Meta", series: buildSeries(1, 1.3) },
  { id: "m2", name: "Reels | Retargeting | Calientes", platform: "Meta", series: buildSeries(3, 0.9) },
  { id: "t1", name: "Spark Ads | Publico Frio", platform: "TikTok", series: buildSeries(4, 1.5) },
  { id: "t2", name: "Creators | UGC", platform: "TikTok", series: buildSeries(2, 1.1) },
  { id: "ai1", name: "Chatbot Captacion Web", platform: "OpenAI", series: buildSeries(5, 0.5) },
  { id: "ai2", name: "Calificador de Leads | API", platform: "OpenAI", series: buildSeries(1, 0.4) },
  { id: "off1", name: "Ferias y Eventos (Excel)", platform: "Offline", series: buildSeries(3, 1.8) },
  { id: "off2", name: "Referidos y Voz a Voz (Excel)", platform: "Offline", series: buildSeries(0, 0.6) },
]

function fmtMoney(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
  return `$${n}`
}

const GASTO_COLOR = "#7c3aed"
const LEADS_COLOR = "#10b981"

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="border-border rounded-lg border bg-white p-3 shadow-lg">
      <p className="text-foreground mb-1.5 text-xs font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.dataKey}:</span>
          <span className="text-foreground font-medium">
            {p.dataKey === "gasto" ? `$${p.value.toLocaleString()}` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function TrendChart({ series }: { series: DayPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={series} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtMoney}
            width={48}
            tickCount={6}
            allowDecimals={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
            tickCount={6}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
            iconType="plainline"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gasto"
            name="Gasto"
            stroke={GASTO_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 3, fill: GASTO_COLOR }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="leads"
            name="Leads"
            stroke={LEADS_COLOR}
            strokeWidth={2.5}
            dot={{ r: 3, fill: LEADS_COLOR }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function IntelBudgetTrend() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  const [platform, setPlatform] = useState<Platform>("Google")
  const [campaignId, setCampaignId] = useState(CAMPAIGNS[0].id)
  const [open, setOpen] = useState(false)

  // Rango de fechas compartido: define los periodos (eje X) y la escala
  const { periods, granularity, selectionLabel } = useDateRange()
  const mult = periodDays(granularity)

  const platformCampaigns = CAMPAIGNS.filter((c) => c.platform === platform)
  const rawActive =
    CAMPAIGNS.find((c) => c.id === campaignId && c.platform === platform) ?? platformCampaigns[0]

  // Campana activa re-alineada al periodo elegido
  const activeCampaign: Campaign = useMemo(
    () => ({ ...rawActive, series: alignSeries(rawActive.series, periods, mult) }),
    [rawActive, periods, mult],
  )

  // Serie consolidada (todas las campanas) re-alineada al periodo elegido
  const consolidated = useMemo(() => {
    const base = DATES.map((date, i) => ({
      date,
      gasto: CAMPAIGNS.reduce((acc, c) => acc + c.series[i].gasto, 0),
      leads: CAMPAIGNS.reduce((acc, c) => acc + c.series[i].leads, 0),
    }))
    return alignSeries(base, periods, mult)
  }, [periods, mult])

  // Serie de la fuente del asesor (micro) - solo leads
  const myCampaign: Campaign = useMemo(
    () => ({ ...platformCampaigns[0], series: alignSeries(platformCampaigns[0].series, periods, mult) }),
    [platformCampaigns, periods, mult],
  )

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">
                Tendencia de Presupuesto vs Leads
              </h3>
              <p className="text-muted-foreground text-xs">
                {level === "macro"
                  ? "Cuenta consolidada -- Gasto vs Leads"
                  : level === "meso"
                  ? "Por plataforma y campana"
                  : "Leads recibidos por tu fuente"}
                <span className="text-foreground/70"> &middot; {selectionLabel}</span>
              </p>
            </div>
          </div>
          <ReportViewToggle value={level} onChange={setViewOverride} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {level === "macro" && <MacroTrend series={consolidated} />}

        {level === "meso" && (
          <MesoTrend
            platform={platform}
            setPlatform={setPlatform}
            campaign={activeCampaign}
            platformCampaigns={platformCampaigns}
            setCampaignId={setCampaignId}
            open={open}
            setOpen={setOpen}
          />
        )}

        {level === "micro" && <MicroTrend campaign={myCampaign} />}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── MACRO ───────────────────────── */
function MacroTrend({ series }: { series: DayPoint[] }) {
  const totalGasto = series.reduce((acc, d) => acc + d.gasto, 0)
  const totalLeads = series.reduce((acc, d) => acc + d.leads, 0)
  const cpl = totalLeads > 0 ? totalGasto / totalLeads : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Gasto total" value={`$${(totalGasto / 1000).toFixed(0)}k`} tone="text-violet-600" />
        <Metric label="Leads totales" value={String(totalLeads)} tone="text-emerald-600" />
        <Metric label="CPL global" value={`$${(cpl / 1000).toFixed(1)}k`} tone="text-foreground" />
      </div>
      <TrendChart series={series} />
      <div className="flex items-start gap-2.5 rounded-xl border border-aura/15 bg-aura/5 p-3">
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-aura" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Vista ejecutiva consolidada de todas las plataformas y campanas. El desglose por campana
          esta disponible en el perfil de Gerencia.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── MESO ───────────────────────── */
function MesoTrend({
  platform,
  setPlatform,
  campaign,
  platformCampaigns,
  setCampaignId,
  open,
  setOpen,
}: {
  platform: Platform
  setPlatform: (p: Platform) => void
  campaign: Campaign
  platformCampaigns: Campaign[]
  setCampaignId: (id: string) => void
  open: boolean
  setOpen: (v: boolean) => void
}) {
  const { granularity } = useDateRange()
  const totalGasto = campaign.series.reduce((acc, d) => acc + d.gasto, 0)
  const totalLeads = campaign.series.reduce((acc, d) => acc + d.leads, 0)
  const cpl = totalLeads > 0 ? totalGasto / totalLeads : 0
  const [uploaded, setUploaded] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle plataforma */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="bg-muted inline-flex flex-wrap items-center rounded-lg p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => {
                setPlatform(p)
                setOpen(false)
              }}
              className={`inline-flex items-center gap-1 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                platform === p
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "Offline" && <FileSpreadsheet className="h-3.5 w-3.5" />}
              {p}
            </button>
          ))}
        </div>
        {platform === "Offline" ? (
          <span className="text-muted-foreground text-xs">
            Campanas sin pixel · importadas por Excel
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            Escala <span className="text-foreground font-medium">{granularity === "week" ? "semanal" : "mensual"}</span>
          </span>
        )}
      </div>

      {platform === "Offline" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {uploaded
                ? "Excel procesado: las campanas offline ya estan sumadas al ROAS consolidado."
                : "Las campanas sin pixel (ferias, radio, volanteo) se cargan por Excel. Sube el archivo y la IA lo analiza para integrarlo al ROAS real."}
            </span>
          </div>
          <OfflineExcelUpload onConfirmed={() => setUploaded(true)} />
        </div>
      )}

      {/* Selector de campana + metricas */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="border-border flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-foreground max-w-[260px] truncate font-medium">{campaign.name}</span>
            <ChevronDown className={`text-muted-foreground h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="border-border absolute z-10 mt-1 w-72 overflow-hidden rounded-lg border bg-white shadow-lg">
              {platformCampaigns.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCampaignId(c.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    c.id === campaign.id ? "bg-muted/60" : ""
                  }`}
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="text-foreground truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <InlineMetric label="Gasto" value={`$${totalGasto.toLocaleString()}`} />
          <InlineMetric label="Leads" value={String(totalLeads)} />
          <InlineMetric label="CPL" value={`$${cpl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
        </div>
      </div>

      <TrendChart series={campaign.series} />
    </div>
  )
}

/* ───────────────────────── MICRO ───────────────────────── */
function MicroTrend({ campaign }: { campaign: Campaign }) {
  const totalLeads = campaign.series.reduce((acc, d) => acc + d.leads, 0)
  const peakDay = campaign.series.reduce((max, d) => (d.leads > max.leads ? d : max), campaign.series[0])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="Leads de tu fuente" value={String(totalLeads)} tone="text-emerald-600" />
        <Metric label="Mejor dia" value={peakDay.date} tone="text-foreground" />
      </div>

      {/* Micro solo ve leads (sin presupuesto) */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={campaign.series} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="leads"
              name="Leads"
              stroke={LEADS_COLOR}
              strokeWidth={2.5}
              dot={{ r: 3, fill: LEADS_COLOR }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/30 p-3">
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px]">
          Solo lectura
        </Badge>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Como asesor ves los leads que llegan por tu fuente. La gestion de presupuesto es exclusiva
          de Gerencia y Direccion.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── HELPERS ───────────────────────── */
function Metric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-border flex flex-col gap-1 rounded-xl border bg-muted/30 p-3"
    >
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <span className={`text-xl font-semibold tracking-tight ${tone}`}>{value}</span>
    </motion.div>
  )
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end">
      <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</span>
      <span className="text-foreground text-sm font-semibold">{value}</span>
    </div>
  )
}
