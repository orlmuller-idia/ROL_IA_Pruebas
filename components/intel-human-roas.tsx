"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ScaleIcon,
  Megaphone,
  Database,
  Ghost,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react"
import { HelpHint } from "@/components/help-hint"
import { useScopedSucursales, sucursalNombre, empresaNombre } from "@/components/branch-scope"
import { sucursalesSeed } from "@/components/config/config-types"
import {
  REALIDAD_SEED,
  campanasDeSucursal,
  agregar,
  kpis,
  generarInsight,
  money,
  pesos,
  type SucursalRealidad,
  type CampanaRealidad,
  type Severidad,
} from "@/lib/realidad-data"

/**
 * Realidad vs Marketing — contrasta, en DINERO REAL, lo que reporta marketing contra
 * lo que el CRM confirma. La IA detecta la brecha y senala el foco. Navegacion drill-down:
 * Grupo (consolidado + desglose por sucursal) -> Sucursal (campanas) -> Campana (detalle).
 * Cada nivel es clickeable hacia abajo; el breadcrumb regresa hacia arriba.
 */

const HELP_BY_SCREEN: Record<Screen, string> = {
  grupo:
    "Vista CEO. La IA cruza lo que reporta marketing contra lo que el CRM confirma, en pesos. El 'dinero fantasma' es lo atribuido que ninguna venta respalda. Abajo, el desglose por sucursal: haz clic en una para entrar a su detalle.",
  sucursal:
    "Detalle de la sucursal. Mismo contraste reportado vs real, su embudo (MQL, conversion, CAC) y sus campanas. Haz clic en una campana para ver el detalle fino.",
  campana:
    "Detalle de campana. Lo que la plataforma atribuyo frente a lo que de verdad cerro el CRM, mas la fuga en semaforo rojo y los cierres con mala atencion.",
}

type Screen = "grupo" | "sucursal" | "campana"

const tones = {
  reportado: { text: "text-violet-600", bg: "bg-violet-50", bar: "bg-violet-500", border: "border-violet-200" },
  real: { text: "text-emerald-600", bg: "bg-emerald-50", bar: "bg-emerald-500", border: "border-emerald-200" },
  fantasma: { text: "text-red-600", bg: "bg-red-50", bar: "bg-red-400", border: "border-red-200" },
  alerta: { text: "text-amber-600", bg: "bg-amber-50", bar: "bg-amber-500", border: "border-amber-200" },
}

const sevStyle: Record<Severidad, { ring: string; bg: string; text: string; chip: string; label: string }> = {
  critico: { ring: "border-red-200", bg: "bg-red-50/70", text: "text-red-700", chip: "bg-red-100 text-red-700", label: "Critico" },
  alerta: { ring: "border-amber-200", bg: "bg-amber-50/70", text: "text-amber-700", chip: "bg-amber-100 text-amber-700", label: "Alerta" },
  sano: { ring: "border-emerald-200", bg: "bg-emerald-50/70", text: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700", label: "Alineado" },
}

export function IntelHumanRoas() {
  const { activeIds } = useScopedSucursales()

  // Registros en alcance segun el filtro de sucursales (el desglose reacciona al filtro)
  const scoped: SucursalRealidad[] = useMemo(() => {
    const ids = activeIds.length ? activeIds : REALIDAD_SEED.map((r) => r.sucursalId)
    return REALIDAD_SEED.filter((r) => ids.includes(r.sucursalId))
  }, [activeIds])

  // Estado de navegacion drill-down
  const [screen, setScreen] = useState<Screen>("grupo")
  const [sucursalId, setSucursalId] = useState<string | null>(null)
  const [campanaId, setCampanaId] = useState<string | null>(null)

  const goGrupo = () => {
    setScreen("grupo")
    setSucursalId(null)
    setCampanaId(null)
  }
  const goSucursal = (id: string) => {
    setSucursalId(id)
    setCampanaId(null)
    setScreen("sucursal")
  }
  const goCampana = (id: string) => {
    setCampanaId(id)
    setScreen("campana")
  }

  // Si el filtro deja fuera la sucursal seleccionada, regresa a grupo
  const sucursalValida = sucursalId && scoped.some((s) => s.sucursalId === sucursalId)
  const currentScreen: Screen = screen !== "grupo" && !sucursalValida ? "grupo" : screen

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg shadow-teal-500/20">
              <ScaleIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-foreground text-base font-semibold">Realidad vs Marketing</h3>
                <HelpHint text={HELP_BY_SCREEN[currentScreen]} />
              </div>
              <p className="text-muted-foreground text-xs">
                La IA cruza lo que reporta marketing contra lo que el CRM confirma, peso por peso
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-teal-200 bg-teal-50 font-mono text-teal-600">
            CRM = verdad
          </Badge>
        </div>

        {/* Breadcrumb de navegacion drill-down */}
        <Breadcrumb
          screen={currentScreen}
          sucursalId={sucursalId}
          campanaId={campanaId}
          onGrupo={goGrupo}
          onSucursal={() => sucursalId && goSucursal(sucursalId)}
        />
      </CardHeader>

      <CardContent className="pt-0">
        {currentScreen === "grupo" && (
          <GrupoView records={scoped} onDrill={goSucursal} multi={scoped.length > 1} />
        )}
        {currentScreen === "sucursal" && sucursalId && (
          <SucursalView sucursalId={sucursalId} onDrill={goCampana} />
        )}
        {currentScreen === "campana" && campanaId && sucursalId && (
          <CampanaView sucursalId={sucursalId} campanaId={campanaId} />
        )}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── Breadcrumb ───────────────────────── */
function Breadcrumb({
  screen,
  sucursalId,
  campanaId,
  onGrupo,
  onSucursal,
}: {
  screen: Screen
  sucursalId: string | null
  campanaId: string | null
  onGrupo: () => void
  onSucursal: () => void
}) {
  const campana = sucursalId && campanaId ? campanasDeSucursal(sucursalId).find((c) => c.id === campanaId) : null
  return (
    <nav className="mt-3 flex items-center gap-1 text-xs" aria-label="Navegacion de niveles">
      <Crumb active={screen === "grupo"} onClick={onGrupo}>
        <Building2 className="h-3.5 w-3.5" />
        Grupo
      </Crumb>
      {screen !== "grupo" && sucursalId && (
        <>
          <ChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
          <Crumb active={screen === "sucursal"} onClick={onSucursal}>
            {sucursalNombre(sucursalId)}
          </Crumb>
        </>
      )}
      {screen === "campana" && campana && (
        <>
          <ChevronRight className="text-muted-foreground/50 h-3.5 w-3.5" />
          <Crumb active onClick={() => {}}>
            {campana.plataforma}
          </Crumb>
        </>
      )}
    </nav>
  )
}

function Crumb({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
        active ? "bg-teal-50 text-teal-700" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

/* ───────────────────────── NIVEL GRUPO (CEO) ───────────────────────── */
function GrupoView({
  records,
  onDrill,
  multi,
}: {
  records: SucursalRealidad[]
  onDrill: (id: string) => void
  multi: boolean
}) {
  const total = agregar(records)
  const k = kpis(total)
  const insight = useMemo(() => generarInsight(records, sucursalNombre), [records])

  return (
    <div className="flex flex-col gap-5">
      <InsightBanner insight={insight} onFoco={onDrill} />
      <MoneyHero reportado={total.ingresoReportado} real={total.ingresoReal} fantasma={k.dineroFantasma} inflado={k.inflado} />
      <ReconBar
        reportado={total.ingresoReportado}
        real={total.ingresoReal}
        fuga={total.fugaRojo}
        mala={total.malaAtencion}
      />
      <KpiContrastGrid k={k} total={total} />

      {/* Desglose por sucursal — siempre visible, clickeable hacia meso */}
      {multi && <BranchBreakdown records={records} onDrill={onDrill} />}
    </div>
  )
}

/* Banner de IA */
function InsightBanner({ insight, onFoco }: { insight: ReturnType<typeof generarInsight>; onFoco: (id: string) => void }) {
  const s = sevStyle[insight.severidad]
  return (
    <div className={`flex items-start gap-3 rounded-xl border ${s.ring} ${s.bg} p-4`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        <Sparkles className={`h-4 w-4 ${s.text}`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-foreground text-[11px] font-semibold uppercase tracking-wider">La IA detecto</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.chip}`}>{s.label}</span>
        </div>
        <p className={`text-sm font-semibold ${s.text}`}>{insight.titular}</p>
        <p className="text-muted-foreground text-xs leading-relaxed">{insight.detalle}</p>
        {insight.focoSucursalId && insight.severidad !== "sano" && (
          <button
            onClick={() => onFoco(insight.focoSucursalId!)}
            className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-700 shadow-sm transition-colors hover:bg-teal-50"
          >
            Investigar {sucursalNombre(insight.focoSucursalId)}
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  )
}

/* Hero: marketing dice vs CRM confirma vs fantasma */
function MoneyHero({
  reportado,
  real,
  fantasma,
  inflado,
}: {
  reportado: number
  real: number
  fantasma: number
  inflado: number
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <HeroCard
        icon={<Megaphone className="h-4 w-4" />}
        label="Marketing reporta"
        value={money(reportado)}
        sub="ingreso atribuido a la pauta"
        tone={tones.reportado}
      />
      <HeroCard
        icon={<Database className="h-4 w-4" />}
        label="El CRM confirma"
        value={money(real)}
        sub="cerrado de verdad"
        tone={tones.real}
        emphasize
      />
      <HeroCard
        icon={<Ghost className="h-4 w-4" />}
        label="Dinero fantasma"
        value={money(fantasma)}
        sub={`+${Math.round(inflado)}% inflado sobre la realidad`}
        tone={tones.fantasma}
      />
    </div>
  )
}

function HeroCard({
  icon,
  label,
  value,
  sub,
  tone,
  emphasize,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  tone: (typeof tones)[keyof typeof tones]
  emphasize?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-2 rounded-xl border p-4 ${emphasize ? `${tone.border} ${tone.bg}` : "border-border bg-muted/30"}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${tone.bg} ${tone.text}`}>{icon}</div>
      </div>
      <span className={`text-2xl font-bold tracking-tight ${tone.text}`}>{value}</span>
      <span className="text-muted-foreground text-[11px]">{sub}</span>
    </motion.div>
  )
}

/* Reconciliacion: de lo reportado a lo confiable */
function ReconBar({ reportado, real, fuga, mala }: { reportado: number; real: number; fuga: number; mala: number }) {
  const fantasma = reportado - real
  const realPct = (real / reportado) * 100
  const fantasmaPct = (fantasma / reportado) * 100
  // fuga y mala atencion como proporcion del reportado (riesgo sobre el total atribuido)
  const fugaPct = (fuga / reportado) * 100
  const malaPct = (mala / reportado) * 100

  return (
    <div className="border-border flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
          De lo que dice marketing a lo confiable
        </span>
        <span className="text-muted-foreground text-[11px]">base: {money(reportado)} atribuidos</span>
      </div>

      {/* Barra principal: real (verde) + fantasma (rojo rayado) */}
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        <div
          className="flex items-center justify-center bg-emerald-500 text-[10px] font-semibold text-white"
          style={{ width: `${realPct}%` }}
          title={`Confirmado en CRM: ${money(real)}`}
        >
          {realPct > 18 ? `CRM ${money(real)}` : ""}
        </div>
        <div
          className="flex items-center justify-center bg-red-400 text-[10px] font-semibold text-white"
          style={{
            width: `${fantasmaPct}%`,
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.25) 5px, rgba(255,255,255,0.25) 10px)",
          }}
          title={`Fantasma (no existe en CRM): ${money(fantasma)}`}
        >
          {fantasmaPct > 14 ? `Fantasma ${money(fantasma)}` : ""}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px]">
        <Legend color="bg-emerald-500" label="Confirmado en CRM" value={money(real)} />
        <Legend color="bg-red-400" label="Fantasma (sin respaldo)" value={money(fantasma)} />
      </div>

      {/* Riesgos sobre lo confirmado */}
      <div className="border-border grid grid-cols-2 gap-3 border-t pt-3">
        <RiskRow
          icon={<AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
          label="Fuga semaforo rojo"
          value={money(fuga)}
          pct={fugaPct}
          note="leads en rojo que se perdieron"
        />
        <RiskRow
          icon={<ShieldAlert className="h-3.5 w-3.5 text-amber-600" />}
          label="Cierres con mala atencion"
          value={money(mala)}
          pct={malaPct}
          note="cerrado fuera de SLA o sin calidad"
        />
      </div>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-semibold">{value}</span>
    </span>
  )
}

function RiskRow({
  icon,
  label,
  value,
  pct,
  note,
}: {
  icon: React.ReactNode
  label: string
  value: string
  pct: number
  note: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          {icon}
          {label}
        </span>
        <span className="text-foreground text-sm font-semibold">{value}</span>
      </div>
      <span className="text-muted-foreground text-[10px]">
        {note} · {pct.toFixed(1)}% del atribuido
      </span>
    </div>
  )
}

/* Rejilla de KPIs que el CEO valora, en clave reportado vs real */
function KpiContrastGrid({ k, total }: { k: ReturnType<typeof kpis>; total: ReturnType<typeof agregar> }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
        Embudo y eficiencia: lo que dice marketing vs la realidad del CRM
      </span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile
          label="Leads calificados (MQL)"
          reportado={`${total.mqlReportado}`}
          real={`${total.mqlValido} validos`}
          delta={`${Math.round(k.validezLeads)}% reales`}
          good={k.validezLeads >= 80}
        />
        <KpiTile
          label="Conversion MQL a SQL"
          reportado={`${k.convReportado.toFixed(1)}%`}
          real={`${k.convReal.toFixed(1)}%`}
          delta={k.convReal >= k.convReportado ? "mejor en CRM" : "cae en CRM"}
          good={k.convReal >= k.convReportado}
        />
        <KpiTile
          label="ROAS"
          reportado={`${k.roasReportado.toFixed(1)}x`}
          real={`${k.roasReal.toFixed(1)}x`}
          delta={`${money(total.ingresoReal)} reales`}
          good={k.roasReal >= 3}
        />
        <KpiTile
          label="CPL (costo por lead)"
          reportado={pesos(k.cplReportado)}
          real={pesos(k.cplReal)}
          delta="real = por lead valido"
          good={false}
          invert
        />
        <KpiTile
          label="CAC (costo por cliente)"
          reportado={pesos(k.cacReportado)}
          real={pesos(k.cacReal)}
          delta="real = por venta cerrada"
          good={false}
          invert
        />
        <KpiTile
          label="ROMI (retorno inversion)"
          reportado={`${Math.round(k.romiReportado)}%`}
          real={`${Math.round(k.romiReal)}%`}
          delta={`${money(total.inversion)} invertidos`}
          good={k.romiReal >= 100}
        />
      </div>
    </div>
  )
}

function KpiTile({
  label,
  reportado,
  real,
  delta,
  good,
  invert,
}: {
  label: string
  reportado: string
  real: string
  delta: string
  good: boolean
  invert?: boolean
}) {
  const realTone = invert ? "text-amber-600" : good ? "text-emerald-600" : "text-amber-600"
  return (
    <div className="border-border flex flex-col gap-1.5 rounded-xl border bg-white p-3">
      <span className="text-muted-foreground text-[11px]">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-bold tracking-tight ${realTone}`}>{real}</span>
        <span className="text-muted-foreground text-[11px] line-through decoration-violet-300">{reportado}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-[10px]">marketing decia</span>
        <span className="text-violet-500 text-[10px] font-medium">{reportado}</span>
      </div>
      <span className="text-muted-foreground border-border mt-0.5 border-t pt-1 text-[10px]">{delta}</span>
    </div>
  )
}

/* Desglose por sucursal — el punto clave para el CEO */
function BranchBreakdown({ records, onDrill }: { records: SucursalRealidad[]; onDrill: (id: string) => void }) {
  const maxRep = Math.max(...records.map((r) => r.ingresoReportado), 1)
  const inflaPct = (r: SucursalRealidad) =>
    r.ingresoReal > 0 ? (r.ingresoReportado - r.ingresoReal) / r.ingresoReal : 0
  const ranked = [...records].sort((a, b) => inflaPct(b) - inflaPct(a))

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
          Desglose por sucursal · ordenado por % inflado
        </span>
        <span className="text-muted-foreground text-[10px]">clic para entrar</span>
      </div>
      <div className="flex flex-col gap-2">
        {ranked.map((r, i) => {
          const k = kpis(agregar([r]))
          const fantasma = r.ingresoReportado - r.ingresoReal
          const repPct = (r.ingresoReportado / maxRep) * 100
          const realPct = (r.ingresoReal / maxRep) * 100
          const crit = k.inflado >= 35
          return (
            <button
              key={r.sucursalId}
              onClick={() => onDrill(r.sucursalId)}
              className="group border-border hover:border-teal-300 hover:bg-teal-50/40 flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors"
            >
              <span className="text-muted-foreground bg-muted flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-foreground block truncate text-sm font-medium">
                      {sucursalNombre(r.sucursalId)}
                    </span>
                    <span className="text-muted-foreground text-[10px]">{empresaNombre(branchEmpresa(r.sucursalId))}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className={`text-sm font-bold ${crit ? "text-red-600" : "text-amber-600"}`}>
                      {money(fantasma)}
                    </span>
                    <span className="text-muted-foreground text-[10px]">+{Math.round(k.inflado)}% inflado</span>
                  </div>
                </div>
                {/* Dual bar reportado vs real */}
                <div className="flex flex-col gap-1">
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-violet-400" style={{ width: `${repPct}%` }} />
                  </div>
                  <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${realPct}%` }} />
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px]">
                  <span className="text-violet-500">marketing {money(r.ingresoReportado)}</span>
                  <span className="text-emerald-600">CRM {money(r.ingresoReal)}</span>
                </div>
              </div>
              <ChevronRight className="text-muted-foreground group-hover:text-teal-600 h-4 w-4 shrink-0 transition-colors" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function branchEmpresa(sucursalId: string): string {
  return sucursalesSeed.find((s) => s.id === sucursalId)?.empresaId ?? ""
}

/* ───────────────────────── NIVEL SUCURSAL ───────────────────────── */
function SucursalView({ sucursalId, onDrill }: { sucursalId: string; onDrill: (id: string) => void }) {
  const record = REALIDAD_SEED.find((r) => r.sucursalId === sucursalId)
  const campanas = useMemo(() => campanasDeSucursal(sucursalId), [sucursalId])
  const insight = useMemo(
    () => generarInsight(record ? [record] : [], sucursalNombre),
    [record],
  )
  if (!record) return null
  const total = agregar([record])
  const k = kpis(total)
  const maxRep = Math.max(...campanas.map((c) => c.ingresoReportado), 1)

  return (
    <div className="flex flex-col gap-5">
      <InsightBanner insight={insight} onFoco={() => {}} />
      <MoneyHero reportado={total.ingresoReportado} real={total.ingresoReal} fantasma={k.dineroFantasma} inflado={k.inflado} />
      <ReconBar reportado={total.ingresoReportado} real={total.ingresoReal} fuga={total.fugaRojo} mala={total.malaAtencion} />
      <KpiContrastGrid k={k} total={total} />

      {/* Campanas de la sucursal — clickeable hacia micro */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            Campanas de {sucursalNombre(sucursalId)} · clic para el detalle
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {campanas
            .slice()
            .sort((a, b) => b.ingresoReportado - b.ingresoReal - (a.ingresoReportado - a.ingresoReal))
            .map((c) => {
              const ck = kpis(agregar([c]))
              const fantasma = c.ingresoReportado - c.ingresoReal
              const repPct = (c.ingresoReportado / maxRep) * 100
              const realPct = (c.ingresoReal / maxRep) * 100
              return (
                <button
                  key={c.id}
                  onClick={() => onDrill(c.id)}
                  className="group border-border hover:border-teal-300 hover:bg-teal-50/40 flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors"
                >
                  <PlatBadge plataforma={c.plataforma} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-foreground truncate text-sm font-medium">{c.nombre}</span>
                      <span className={`shrink-0 text-sm font-bold ${ck.inflado >= 35 ? "text-red-600" : "text-amber-600"}`}>
                        {money(fantasma)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div className="h-full rounded-full bg-violet-400" style={{ width: `${repPct}%` }} />
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${realPct}%` }} />
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-teal-600 h-4 w-4 shrink-0 transition-colors" />
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function PlatBadge({ plataforma }: { plataforma: CampanaRealidad["plataforma"] }) {
  const map: Record<CampanaRealidad["plataforma"], string> = {
    Meta: "bg-blue-50 text-blue-600",
    Google: "bg-red-50 text-red-600",
    TikTok: "bg-neutral-100 text-neutral-700",
    Offline: "bg-amber-50 text-amber-600",
  }
  return (
    <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${map[plataforma]}`}>{plataforma}</span>
  )
}

/* ───────────────────────── NIVEL CAMPANA (detalle fino) ───────────────────────── */
function CampanaView({ sucursalId, campanaId }: { sucursalId: string; campanaId: string }) {
  const c = campanasDeSucursal(sucursalId).find((x) => x.id === campanaId)
  if (!c) return null
  const total = agregar([c])
  const k = kpis(total)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlatBadge plataforma={c.plataforma} />
          <span className="text-foreground text-sm font-semibold">{c.nombre}</span>
        </div>
        <Badge variant="outline" className={`gap-1 ${k.inflado >= 35 ? "border-red-200 bg-red-50 text-red-600" : "border-amber-200 bg-amber-50 text-amber-600"}`}>
          {k.inflado >= 35 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          +{Math.round(k.inflado)}% inflado
        </Badge>
      </div>

      <MoneyHero reportado={total.ingresoReportado} real={total.ingresoReal} fantasma={k.dineroFantasma} inflado={k.inflado} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DetailStat icon={<Target className="h-3.5 w-3.5 text-violet-600" />} label="Inversion" value={money(c.inversion)} />
        <DetailStat icon={<Database className="h-3.5 w-3.5 text-emerald-600" />} label="Cerrado CRM" value={money(c.ingresoReal)} />
        <DetailStat icon={<AlertTriangle className="h-3.5 w-3.5 text-red-600" />} label="Fuga rojo" value={money(c.fugaRojo)} />
        <DetailStat icon={<ShieldAlert className="h-3.5 w-3.5 text-amber-600" />} label="Mala atencion" value={money(c.malaAtencion)} />
      </div>

      <ReconBar reportado={total.ingresoReportado} real={total.ingresoReal} fuga={total.fugaRojo} mala={total.malaAtencion} />

      <FormulaBlock />
    </div>
  )
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border-border flex flex-col gap-1 rounded-xl border bg-white p-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
        {icon}
        {label}
      </span>
      <span className="text-foreground text-base font-semibold">{value}</span>
    </div>
  )
}

function FormulaBlock() {
  const items = [
    { label: "ROAS Real", formula: "Ventas cerradas en CRM \u00f7 Inversion de campana" },
    { label: "Dinero fantasma", formula: "Ingreso atribuido por marketing \u2212 Ingreso real del CRM" },
    { label: "Fuga Real", formula: "Valor de leads en rojo perdidos \u00f7 Inversion" },
    { label: "Mala atencion", formula: "Ventas fuera de SLA o sin calidad \u00f7 Inversion" },
  ]
  return (
    <div className="border-border flex flex-col gap-2 rounded-xl border bg-muted/30 p-3">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">Como se calcula</span>
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-[11px] font-medium">{it.label}</span>
          <code className="text-foreground border-border rounded-md border bg-white px-2 py-1 font-mono text-[11px]">
            {it.formula}
          </code>
        </div>
      ))}
    </div>
  )
}
