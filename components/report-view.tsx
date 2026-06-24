"use client"

import { motion } from "framer-motion"
import { ChevronRight, Lock, Check, ArrowUpRight, Info } from "lucide-react"
import { REPORT_SECTIONS, ALL_REPORTS, accentClasses } from "@/lib/navigation"
import { BranchScopeBanner } from "@/components/branch-scope"
import { DateRangeFilter } from "@/components/date-range-filter"
import { useVersion, isReportAvailable, reportRequiredTier, VERSIONS, accentForTier } from "@/lib/versioning"
import type { ActiveView } from "@/components/app-sidebar"

/* Intel panels */
import { IntelGoalPredictor } from "@/components/intel-goal-predictor"
import { IntelAbandonment } from "@/components/intel-abandonment"
import { IntelLeakDiagnosis } from "@/components/intel-leak-diagnosis"
import { IntelCopywriter } from "@/components/intel-copywriter"
import { IntelBudgetTrend } from "@/components/intel-budget-trend"
import { IntelScheduling } from "@/components/intel-scheduling"
import { IntelRescueAgenda } from "@/components/intel-rescue-agenda"
import { IntelHumanRoas } from "@/components/intel-human-roas"
import { IntelROASTrend } from "@/components/intel-roas-trend"
import { IntelGoldenWindow } from "@/components/intel-golden-window"
import { IntelSpeechAnalytics } from "@/components/intel-speech-analytics"
import { IntelFraudDetection } from "@/components/intel-fraud-detection"

/* Informes temporales: usan el filtro de rango de fechas y escalan sus graficos al periodo */
const TEMPORAL_REPORTS = new Set<string>([
  "budget-trend",
  "roas-trend",
  "predictor",
  "leak",
  "golden",
])

const PANELS: Record<string, React.ComponentType> = {
  abandonment: IntelAbandonment,
  scheduling: IntelScheduling,
  rescue: IntelRescueAgenda,
  "human-roas": IntelHumanRoas,
  "budget-trend": IntelBudgetTrend,
  "roas-trend": IntelROASTrend,
  leak: IntelLeakDiagnosis,
  fraud: IntelFraudDetection,
  copywriter: IntelCopywriter,
  golden: IntelGoldenWindow,
  speech: IntelSpeechAnalytics,
  predictor: IntelGoalPredictor,
}

export function ReportView({ id, onNavigate }: { id: string; onNavigate: (view: ActiveView) => void }) {
  const { version, setVersion } = useVersion()
  const report = ALL_REPORTS.find((r) => r.id === id)
  const section = REPORT_SECTIONS.find((s) => s.reports.some((r) => r.id === id))
  const Panel = PANELS[id]

  if (!report || !Panel) {
    return (
      <div className="text-muted-foreground p-8 text-center text-sm">
        Reporte no encontrado.
      </div>
    )
  }

  const ac = accentClasses(report.accent)
  const ReportIcon = report.icon
  const available = isReportAvailable(id, version)
  const isTemporal = TEMPORAL_REPORTS.has(id)
  const reqTier = reportRequiredTier(id)
  const reqMeta = VERSIONS[reqTier]
  const reqAc = accentForTier(reqMeta.accent)

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 py-6 sm:px-6"
    >
      {/* Breadcrumb + cabecera */}
      <div className="flex flex-col gap-3">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <span>Inteligencia</span>
          <ChevronRight className="h-3 w-3" />
          <span>{section?.title}</span>
          <ChevronRight className="h-3 w-3" />
          <span className={`font-medium ${ac.text}`}>{report.title}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ac.bg}`}>
              <ReportIcon className={`h-5 w-5 ${ac.text}`} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-foreground text-xl font-semibold tracking-tight">{report.title}</h1>
              <p className="text-muted-foreground text-sm">{report.question}</p>
            </div>
          </div>
          {/* Filtro de rango de fechas: solo en informes temporales y desbloqueados */}
          {isTemporal && available && (
            <div className="shrink-0">
              <DateRangeFilter />
            </div>
          )}
        </div>
      </div>

      <BranchScopeBanner />

      {available ? (
        <div className="flex flex-col gap-4">
          {/* Aclaracion de fuente de datos: en Lite, el diagnostico de fuga es solo CRM */}
          {id === "leak" && version === "lite" && VERSIONS.lite.capabilities.leakSourceNote && (
            <div className="border-info/30 bg-info/5 flex items-start gap-2.5 rounded-xl border px-4 py-3">
              <Info className="text-info mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-info text-xs font-semibold">Fuente de datos: solo CRM</span>
                <span className="text-muted-foreground text-[12px] leading-relaxed">
                  {VERSIONS.lite.capabilities.leakSourceNote} Sube a Grow o Enterprise para sumar el analisis
                  conversacional de llamadas y WhatsApp.
                </span>
              </div>
            </div>
          )}
          <Panel />
        </div>
      ) : (
        <div className={`flex flex-col items-center gap-5 rounded-2xl border ${reqAc.border} ${reqAc.bg} px-6 py-12 text-center`}>
          <div className="bg-card flex h-14 w-14 items-center justify-center rounded-2xl border border-border shadow-sm">
            <Lock className={`h-6 w-6 ${reqAc.text}`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${reqAc.text}`}>
              Disponible en Rol {reqMeta.name}
            </span>
            <h2 className="text-foreground text-xl font-semibold tracking-tight text-balance">
              Este reporte es parte del plan {reqMeta.name}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed text-pretty">
              {report.title} responde: {report.question} Actualiza a Rol {reqMeta.name} para desbloquear
              este reporte y {reqMeta.tagline.toLowerCase()}.
            </p>
          </div>

          <ul className="bg-card/70 flex max-w-sm flex-col gap-1.5 rounded-xl border border-border/60 p-4 text-left">
            {reqMeta.highlights.map((h) => (
              <li key={h} className="text-muted-foreground flex items-start gap-2 text-xs leading-snug">
                <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${reqAc.text}`} />
                <span>{h}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setVersion(reqTier)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${
                reqMeta.accent === "warning" ? "bg-warning" : reqMeta.accent === "rescue" ? "bg-rescue" : "bg-info"
              }`}
            >
              Activar Rol {reqMeta.name}
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate({ type: "home" })}
              className="border-border text-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
