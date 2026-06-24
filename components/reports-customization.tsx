"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Eye,
  BarChart3,
  TrendingUp,
  Search,
  PieChart,
  Table2,
  LayoutGrid,
  Clock,
  Check,
  Layers,
  Building2,
  Monitor,
  Smartphone,
  Info,
  ArrowRight,
} from "lucide-react"

/* ─────────────────────────────────────────────
   Niveles de detalle: de Global (consolidado) a Personal (operativo)
   ───────────────────────────────────────────── */
const detailLevels = [
  {
    id: "macro",
    label: "Global",
    sublabel: "Vision consolidada",
    icon: <Building2 className="h-4 w-4" />,
    description: "KPIs y tendencias en cards y graficos. Ideal para direccion.",
    color: "#8b5cf6",
  },
  {
    id: "meso",
    label: "Equipo",
    sublabel: "Vision de equipo",
    icon: <Monitor className="h-4 w-4" />,
    description: "Tableros, rankings y comparativos por celula comercial.",
    color: "#3b82f6",
  },
  {
    id: "micro",
    label: "Personal",
    sublabel: "Vision operativa",
    icon: <Smartphone className="h-4 w-4" />,
    description: "Tablas con el detalle completo, lead a lead.",
    color: "#22c55e",
  },
] as const

type DetailLevelId = (typeof detailLevels)[number]["id"]

/* ─────────────────────────────────────────────
   Perfiles configurables
   ───────────────────────────────────────────── */
const profiles = [
  { id: "macro", name: "CEO / Junta Directiva", role: "Perfil Global", color: "#8b5cf6", defaultLevel: "macro" as DetailLevelId },
  { id: "meso", name: "Gerencia Comercial", role: "Perfil Equipo", color: "#3b82f6", defaultLevel: "meso" as DetailLevelId },
  { id: "micro", name: "Asesor Comercial", role: "Perfil Personal", color: "#22c55e", defaultLevel: "micro" as DetailLevelId },
]

/* ─────────────────────────────────────────────
   Informes reales del dashboard (nombres coincidentes)
   ───────────────────────────────────────────── */
interface ReportDef {
  id: string
  name: string
  icon: React.ReactNode
  category: "descriptivo" | "diagnostico" | "predictivo" | "forense"
}

const reports: ReportDef[] = [
  { id: "abandonment", name: "Semaforo de Abandono", icon: <Eye className="h-4 w-4" />, category: "descriptivo" },
  { id: "scheduling", name: "Agenda en Vivo", icon: <Clock className="h-4 w-4" />, category: "descriptivo" },
  { id: "budget", name: "Tendencia de Presupuesto vs Leads", icon: <BarChart3 className="h-4 w-4" />, category: "descriptivo" },
  { id: "leak", name: "Auditor de Fuga", icon: <Search className="h-4 w-4" />, category: "diagnostico" },
  { id: "copywriter", name: "Copywriter IA", icon: <Layers className="h-4 w-4" />, category: "diagnostico" },
  { id: "golden", name: "Ventana Dorada", icon: <Clock className="h-4 w-4" />, category: "diagnostico" },
  { id: "roas", name: "Tendencia ROAS Semanal por Campana", icon: <TrendingUp className="h-4 w-4" />, category: "diagnostico" },
  { id: "predictor", name: "Predictor de Metas", icon: <PieChart className="h-4 w-4" />, category: "predictivo" },
]

const categoryConfig = {
  descriptivo: { label: "Descriptivos", color: "#3b82f6" },
  diagnostico: { label: "Diagnosticos", color: "#eab308" },
  predictivo: { label: "Predictivos", color: "#22c55e" },
  forense: { label: "Forenses", color: "#ef4444" },
} as const

const categoryOrder: (keyof typeof categoryConfig)[] = ["descriptivo", "diagnostico", "predictivo"]

/* Estado por informe dentro de un perfil */
interface ReportState {
  visible: boolean
  level: DetailLevelId
}

type ProfileReportsState = Record<string, Record<string, ReportState>>

function buildInitialState(): ProfileReportsState {
  const state: ProfileReportsState = {}
  for (const profile of profiles) {
    state[profile.id] = {}
    for (const report of reports) {
      state[profile.id][report.id] = { visible: true, level: profile.defaultLevel }
    }
  }
  return state
}

export function ReportsCustomization() {
  const [activeProfile, setActiveProfile] = useState<string>(profiles[0].id)
  const [state, setState] = useState<ProfileReportsState>(buildInitialState)

  const profile = profiles.find((p) => p.id === activeProfile)!
  const profileState = state[activeProfile]
  const visibleCount = reports.filter((r) => profileState[r.id].visible).length

  const updateReport = (reportId: string, updates: Partial<ReportState>) => {
    setState((prev) => ({
      ...prev,
      [activeProfile]: {
        ...prev[activeProfile],
        [reportId]: { ...prev[activeProfile][reportId], ...updates },
      },
    }))
  }

  const setAllLevel = (level: DetailLevelId) => {
    setState((prev) => {
      const next = { ...prev[activeProfile] }
      for (const report of reports) {
        next[report.id] = { ...next[report.id], level }
      }
      return { ...prev, [activeProfile]: next }
    })
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5">
        {/* Paso 1: elegir perfil */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-aura/10 text-aura flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold">
              1
            </span>
            <h4 className="text-foreground text-sm font-semibold">Elige el perfil a configurar</h4>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {profiles.map((p) => {
              const isActive = p.id === activeProfile
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProfile(p.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    isActive ? "bg-white shadow-sm" : "border-border/40 bg-secondary/20 hover:border-border/60"
                  }`}
                  style={isActive ? { borderColor: `${p.color}66` } : undefined}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${p.color}1a`, color: p.color }}
                  >
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-medium">{p.name}</p>
                    <p className="text-muted-foreground truncate text-[11px]">{p.role}</p>
                  </div>
                  {isActive && <Check className="ml-auto h-4 w-4 shrink-0" style={{ color: p.color }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Paso 2: nivel de detalle global (Macro -> Micro) */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-aura/10 text-aura flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold">
              2
            </span>
            <h4 className="text-foreground text-sm font-semibold">Nivel de detalle por defecto</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="text-muted-foreground/60 h-3.5 w-3.5 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[240px] text-xs">
                Define como ve la informacion este perfil: desde lo consolidado (Global) hasta el maximo detalle operativo (Personal). Puedes ajustarlo informe por informe abajo.
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-3 gap-2">
              {detailLevels.map((level, idx) => (
                <div key={level.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setAllLevel(level.id)}
                    className="flex w-full flex-col gap-1 rounded-xl border bg-white p-3 text-left transition-all hover:shadow-sm"
                    style={{ borderColor: `${level.color}40` }}
                  >
                    <span className="flex items-center gap-2" style={{ color: level.color }}>
                      {level.icon}
                      <span className="text-sm font-semibold">{level.label}</span>
                    </span>
                    <span className="text-muted-foreground text-[11px] leading-snug">{level.description}</span>
                    <span className="text-muted-foreground/60 mt-1 text-[10px]">Aplicar a todos</span>
                  </button>
                  {idx < detailLevels.length - 1 && (
                    <ArrowRight className="text-muted-foreground/40 hidden h-4 w-4 shrink-0 sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Paso 3: lista de informes */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-aura/10 text-aura flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold">
                3
              </span>
              <h4 className="text-foreground text-sm font-semibold">Informes visibles para {profile.name}</h4>
            </div>
            <Badge variant="outline" className="text-[11px]" style={{ borderColor: `${profile.color}55`, color: profile.color }}>
              {visibleCount} de {reports.length} visibles
            </Badge>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeProfile}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col gap-4"
            >
              {categoryOrder.map((cat) => {
                const catReports = reports.filter((r) => r.category === cat)
                const cfg = categoryConfig[cat]
                return (
                  <div key={cat} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: cfg.color }} />
                      <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                        {cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {catReports.map((report) => {
                        const rState = profileState[report.id]
                        return (
                          <div
                            key={report.id}
                            className={`flex flex-col gap-3 rounded-lg border p-3 transition-all sm:flex-row sm:items-center sm:justify-between ${
                              rState.visible ? "border-border/40 bg-white" : "border-border/20 bg-secondary/10 opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={rState.visible}
                                onCheckedChange={(v) => updateReport(report.id, { visible: v })}
                                className="data-[state=checked]:bg-[#22c55e]"
                              />
                              <span className="text-muted-foreground" style={{ color: cfg.color }}>
                                {report.icon}
                              </span>
                              <span
                                className={`text-sm font-medium ${rState.visible ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {report.name}
                              </span>
                            </div>

                            {/* Selector de nivel de detalle por informe */}
                            <div className="flex items-center gap-1 sm:ml-auto">
                              {detailLevels.map((level) => {
                                const isActive = rState.level === level.id
                                return (
                                  <Tooltip key={level.id}>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={() => updateReport(report.id, { level: level.id })}
                                        disabled={!rState.visible}
                                        className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition-all ${
                                          isActive ? "" : "border-border/30 bg-secondary/20 text-muted-foreground hover:border-border/50"
                                        } ${!rState.visible ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                                        style={
                                          isActive
                                            ? { borderColor: `${level.color}66`, background: `${level.color}1a`, color: level.color }
                                            : undefined
                                        }
                                      >
                                        {level.icon}
                                        <span className="hidden sm:inline">{level.label}</span>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <span className="font-medium">{level.label}</span> · {level.sublabel}
                                    </TooltipContent>
                                  </Tooltip>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Guardar */}
        <div className="border-border/30 bg-secondary/20 flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Info className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-xs">
              Los cambios se aplican al dashboard del perfil seleccionado en tiempo real
            </span>
          </div>
          <Button size="sm" className="bg-aura hover:bg-aura/90 gap-1.5">
            <Check className="h-3.5 w-3.5" />
            Guardar Configuracion
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
