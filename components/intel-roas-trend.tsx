"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, TrendingDown, ChevronDown, Layers, FileSpreadsheet } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from "recharts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { useDateRange } from "@/contexts/date-range-context"
import { resampleSeries } from "@/lib/date-range"

/**
 * Tendencia ROAS Semanal por Campana (Diagnostico)
 * Sigue el principio "de lo general a lo particular" segun el nivel de perfil:
 *  - macro: vista agregada de la cuenta (ROAS total Meta vs Google) + KPIs ejecutivos.
 *  - meso: selector de campana + tendencia y metricas de esa campana.
 *  - micro: detalle de SU campana con metricas operativas (ticket, leads, gasto, ROAS, CPA).
 */

type Platform = "meta" | "google" | "tiktok" | "openai" | "offline"

const PLATFORMS: Platform[] = ["meta", "google", "tiktok", "openai", "offline"]

const PLATFORM_LABEL: Record<Platform, string> = {
  meta: "Meta",
  google: "Google",
  tiktok: "TikTok",
  openai: "OpenAI",
  offline: "Offline",
}

const PLATFORM_ACCENT: Record<Platform, string> = {
  meta: "#6366f1",
  google: "#a855f7",
  tiktok: "#ec4899",
  openai: "#10b981",
  offline: "#f59e0b",
}

const WEEKS = ["20 abr", "27 abr", "4 may", "11 may", "18 may", "25 may", "1 jun"]

interface Campaign {
  id: string
  name: string
  platform: Platform
  owner: string
  series: number[] // ROAS por semana
  ticket: number
  leads: number
  gasto: number
  cpa: number
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "g-search-ats",
    name: "Search | ATS | Plataforma | Optimizada",
    platform: "google",
    owner: "Carlos Martinez",
    series: [0, 0, 0, 0, 0, 0.0, 0.85],
    ticket: 100000,
    leads: 3,
    gasto: 835631,
    cpa: 300000,
  },
  {
    id: "g-pmax-marca",
    name: "PMax | Marca | Conversion",
    platform: "google",
    owner: "Laura Garcia",
    series: [2.1, 2.3, 2.0, 1.8, 1.6, 1.4, 1.2],
    ticket: 180000,
    leads: 12,
    gasto: 1240000,
    cpa: 103000,
  },
  {
    id: "m-leads-frio",
    name: "Meta | Leads | Publico Frio",
    platform: "meta",
    owner: "Carlos Martinez",
    series: [3.2, 2.9, 2.5, 2.1, 1.8, 1.4, 1.1],
    ticket: 150000,
    leads: 18,
    gasto: 2100000,
    cpa: 116000,
  },
  {
    id: "m-retarget",
    name: "Meta | Retargeting | 30 dias",
    platform: "meta",
    owner: "Laura Garcia",
    series: [4.1, 3.8, 3.9, 3.5, 3.2, 3.0, 2.8],
    ticket: 220000,
    leads: 9,
    gasto: 690000,
    cpa: 76000,
  },
  {
    id: "t-spark-frio",
    name: "TikTok | Spark Ads | Publico Frio",
    platform: "tiktok",
    owner: "Laura Garcia",
    series: [1.2, 1.6, 2.0, 2.4, 2.7, 3.1, 3.4],
    ticket: 130000,
    leads: 22,
    gasto: 1450000,
    cpa: 66000,
  },
  {
    id: "t-creators",
    name: "TikTok | Creators | UGC",
    platform: "tiktok",
    owner: "Carlos Martinez",
    series: [0.9, 1.1, 1.3, 1.2, 1.5, 1.7, 1.9],
    ticket: 110000,
    leads: 14,
    gasto: 880000,
    cpa: 63000,
  },
  {
    id: "ai-chatbot",
    name: "OpenAI | Chatbot Captacion Web",
    platform: "openai",
    owner: "Carlos Martinez",
    series: [2.4, 3.0, 3.6, 4.2, 4.8, 5.3, 5.9],
    ticket: 160000,
    leads: 27,
    gasto: 420000,
    cpa: 15500,
  },
  {
    id: "ai-qualifier",
    name: "OpenAI | Calificador de Leads | API",
    platform: "openai",
    owner: "Laura Garcia",
    series: [3.1, 3.5, 4.0, 4.4, 4.9, 5.5, 6.2],
    ticket: 175000,
    leads: 19,
    gasto: 310000,
    cpa: 16300,
  },
  {
    id: "off-ferias",
    name: "Offline | Ferias y Eventos (Excel)",
    platform: "offline",
    owner: "Laura Garcia",
    series: [1.8, 1.6, 2.1, 1.9, 2.3, 2.0, 2.4],
    ticket: 320000,
    leads: 11,
    gasto: 1800000,
    cpa: 163000,
  },
  {
    id: "off-referidos",
    name: "Offline | Referidos y Voz a Voz (Excel)",
    platform: "offline",
    owner: "Carlos Martinez",
    series: [3.4, 3.6, 3.2, 3.8, 4.0, 3.7, 4.1],
    ticket: 280000,
    leads: 8,
    gasto: 540000,
    cpa: 67500,
  },
]

const THRESHOLD = 1.5

function formatCOP(v: number) {
  return "$" + v.toLocaleString("es-CO")
}

function avgSeries(campaigns: Campaign[]): number[] {
  return WEEKS.map((_, i) => {
    const vals = campaigns.map((c) => c.series[i])
    return Number((vals.reduce((s, v) => s + v, 0) / (vals.length || 1)).toFixed(2))
  })
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-muted-foreground text-[11px]">{label}:</span>
      <span className="text-foreground text-xs font-semibold">{value}</span>
    </div>
  )
}

export function IntelROASTrend() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  const [platform, setPlatform] = useState<Platform>("google")

  const platformCampaigns = useMemo(
    () => CAMPAIGNS.filter((c) => c.platform === platform),
    [platform],
  )

  // micro: solo campanas del asesor; si no tiene en esta plataforma, mostramos las de la plataforma
  const selectableCampaigns = useMemo(() => {
    if (level === "micro") {
      const own = platformCampaigns.filter((c) => c.owner === currentProfile.name)
      return own.length ? own : platformCampaigns
    }
    return platformCampaigns
  }, [level, platformCampaigns, currentProfile.name])

  const [campaignId, setCampaignId] = useState<string>(CAMPAIGNS[0].id)
  const selectedCampaign =
    selectableCampaigns.find((c) => c.id === campaignId) ?? selectableCampaigns[0]

  // Rango de fechas compartido: define los periodos del eje X
  const { periods, selectionLabel, granularity } = useDateRange()

  // macro = vista agregada de toda la plataforma; meso/micro = campana seleccionada
  const baseSeries =
    level === "macro" ? avgSeries(platformCampaigns) : selectedCampaign?.series ?? []

  // El ROAS es una tasa: re-muestreamos la curva al numero de periodos (sin escalar)
  const series = resampleSeries(baseSeries, periods.length)

  const data = periods.map((p, i) => ({
    week: p.label,
    roas: Number((series[i] ?? 0).toFixed(2)),
    threshold: THRESHOLD,
  }))
  const latest = series[series.length - 1] ?? 0
  const belowThreshold = latest < THRESHOLD

  const accent = PLATFORM_ACCENT[platform]

  const subtitle =
    level === "macro"
      ? "Vista agregada de la cuenta: ROAS promedio por plataforma"
      : level === "meso"
        ? "Tendencia y metricas por campana"
        : "Detalle operativo de tu campana"

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex flex-col gap-1 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <div className="bg-alert/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <Radio className="text-alert h-4 w-4" />
              </div>
              Tendencia ROAS Semanal por Campana
            </span>
            <span className="text-muted-foreground pl-9 text-[11px] font-normal">{subtitle}</span>
          </CardTitle>
          <div className="flex items-center gap-3">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            {belowThreshold && (
              <Badge variant="outline" className="border-alert/30 text-alert text-xs">
                <TrendingDown className="mr-1 h-3 w-3" />
                Bajo umbral
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* ─── Controles: plataforma + (meso/micro) selector de campana ─── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="border-border/60 bg-secondary/40 inline-flex flex-wrap items-center gap-1 rounded-lg border p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  platform === p
                    ? "bg-aura/15 text-aura"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "offline" && <FileSpreadsheet className="h-3 w-3" />}
                {PLATFORM_LABEL[p]}
              </button>
            ))}
          </div>

          {level === "macro" ? (
            <Badge variant="outline" className="border-info/30 text-info text-[11px]">
              <Layers className="mr-1 h-3 w-3" />
              {platformCampaigns.length} campanas agregadas
            </Badge>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border-border/60 bg-secondary/40 hover:border-aura/30 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors">
                  <span className="bg-rescue h-2 w-2 rounded-full" />
                  <span className="text-foreground max-w-[220px] truncate font-medium">
                    {selectedCampaign?.name}
                  </span>
                  <ChevronDown className="text-muted-foreground h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-[300px]">
                {selectableCampaigns.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => setCampaignId(c.id)}
                    className="text-xs"
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* ─── Metricas (meso/micro) ─── */}
        {level !== "macro" && selectedCampaign && (
          <div className="bg-secondary/40 border-border/40 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border px-4 py-2.5">
            <MetricPill label="Ticket promedio" value={formatCOP(selectedCampaign.ticket)} />
            <MetricPill label="Leads" value={String(selectedCampaign.leads)} />
            <MetricPill label="Gasto" value={formatCOP(selectedCampaign.gasto)} />
            <MetricPill label="ROAS" value={`${latest.toFixed(2)}x`} />
            <MetricPill label="CPA" value={formatCOP(selectedCampaign.cpa)} />
          </div>
        )}

        {/* ─── Grafico ─── */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="roasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="week"
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                stroke="#71717a"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}x`}
                width={36}
                tickCount={6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f0f13",
                  border: "1px solid #1e1e24",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#fafafa",
                }}
                formatter={(v: number) => [`${v.toFixed(2)}x`, "ROAS"]}
              />
              <ReferenceLine y={THRESHOLD} stroke="#ef4444" strokeDasharray="6 3" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey="roas"
                stroke={accent}
                fill="url(#roasGrad)"
                strokeWidth={2}
                dot={{ fill: accent, r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ─── MACRO: KPIs ejecutivos por plataforma ─── */}
        {level === "macro" && (
          <div className="bg-secondary/50 grid grid-cols-2 gap-4 rounded-lg px-4 py-3 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                ROAS {PLATFORM_LABEL[platform]} hoy
              </span>
              <span className={`font-mono text-lg font-bold ${belowThreshold ? "text-alert" : "text-rescue"}`}>
                {latest.toFixed(2)}x
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Campanas</span>
              <span className="text-foreground font-mono text-lg font-bold">{platformCampaigns.length}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Gasto total</span>
              <span className="text-foreground font-mono text-sm font-bold">
                {formatCOP(platformCampaigns.reduce((s, c) => s + c.gasto, 0))}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Leads totales</span>
              <span className="text-foreground font-mono text-lg font-bold">
                {platformCampaigns.reduce((s, c) => s + c.leads, 0)}
              </span>
            </div>
          </div>
        )}

        <p className="text-muted-foreground/70 text-right text-[10px]">
          Periodo: {selectionLabel} &middot; escala {granularity === "week" ? "semanal" : "mensual"}
        </p>
      </CardContent>
    </Card>
  )
}
