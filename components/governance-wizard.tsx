"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Eye,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Monitor,
  Smartphone,
  Target,
  Upload,
  Shield,
  Sparkles,
  LayoutGrid,
  BarChart3,
  Table2,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReportViewConfig {
  id: string
  name: string
  viewModes: string[]
  visible: boolean
}

interface ProfileConfig {
  name: string
  reportsTo: string
  abstraction: "macro" | "meso" | "micro"
  sources: {
    pautaDigital: boolean
    campanasExternas: boolean
  }
  reports: ReportViewConfig[]
}

const steps = [
  { id: 1, title: "Identidad", subtitle: "Nombre y jerarquia", icon: Users },
  { id: 2, title: "Abstraccion", subtitle: "Nivel visual", icon: Eye },
  { id: 3, title: "Atribucion", subtitle: "Fuentes de leads", icon: Layers },
  { id: 4, title: "Informes", subtitle: "Vistas del dashboard", icon: LayoutGrid },
]

const viewModes = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutGrid className="h-3.5 w-3.5" />, level: "macro", description: "KPIs consolidados" },
  { id: "chart", label: "Grafico", icon: <BarChart3 className="h-3.5 w-3.5" />, level: "macro", description: "Tendencias visuales" },
  { id: "cards", label: "Cards", icon: <Layers className="h-3.5 w-3.5" />, level: "meso", description: "Detalle intermedio" },
  { id: "table", label: "Tabla", icon: <Table2 className="h-3.5 w-3.5" />, level: "micro", description: "Datos completos" },
]

const defaultReports: ReportViewConfig[] = [
  { id: "cpa", name: "CPA Real-Time", viewModes: ["chart", "dashboard"], visible: true },
  { id: "abandonment", name: "Semaforo de Abandono", viewModes: ["cards", "table"], visible: true },
  { id: "optimizer", name: "Optimizador de Conversion", viewModes: ["chart"], visible: true },
  { id: "scheduling", name: "Agenda en Vivo", viewModes: ["table", "cards"], visible: true },
  { id: "leak", name: "Diagnostico de Fuga", viewModes: ["chart", "cards"], visible: true },
  { id: "roas", name: "Tendencia ROAS", viewModes: ["chart", "dashboard"], visible: true },
  { id: "predictor", name: "Predictor de Metas", viewModes: ["chart", "dashboard"], visible: true },
]

const levelColors = {
  macro: { bg: "bg-[#8b5cf6]/10", text: "text-[#8b5cf6]", border: "border-[#8b5cf6]/30" },
  meso: { bg: "bg-[#3b82f6]/10", text: "text-[#3b82f6]", border: "border-[#3b82f6]/30" },
  micro: { bg: "bg-[#22c55e]/10", text: "text-[#22c55e]", border: "border-[#22c55e]/30" },
}

const abstractionLevels = [
  {
    id: "macro",
    title: "Global",
    subtitle: "Vision CEO / Consolidados",
    description: "Graficos consolidados en dinero real, ROAS general de todas las lineas, alertas institucionales.",
    icon: Building2,
    color: "text-[#8b5cf6]",
    bgColor: "bg-[#8b5cf6]/10",
    borderColor: "border-[#8b5cf6]/30",
  },
  {
    id: "meso",
    title: "Equipo",
    subtitle: "Vision Gerencial / Grupos",
    description: "Analisis comparativos, metricas de fuga por celulas comerciales, drill-down disponible.",
    icon: Monitor,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/10",
    borderColor: "border-[#3b82f6]/30",
  },
  {
    id: "micro",
    title: "Personal",
    subtitle: "Vision Operativa / Individual",
    description: "Plan de trabajo diario G8, semaforo personal, sin costos globales ni utilidades de grupo.",
    icon: Smartphone,
    color: "text-[#22c55e]",
    bgColor: "bg-[#22c55e]/10",
    borderColor: "border-[#22c55e]/30",
  },
]

const existingProfiles = [
  { id: "ceo", name: "CEO / Junta Directiva", level: "macro" },
  { id: "gerente", name: "Gerencia Comercial", level: "meso" },
  { id: "director", name: "Director de Ventas", level: "meso" },
]

export function GovernanceWizard({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<ProfileConfig>({
    name: "",
    reportsTo: "",
    abstraction: "meso",
    sources: {
      pautaDigital: true,
      campanasExternas: false,
    },
    reports: defaultReports,
  })

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.name.trim() !== ""
      case 2:
        return config.abstraction !== null
      case 3:
        return config.sources.pautaDigital || config.sources.campanasExternas
      case 4:
        return config.reports.some((r) => r.visible)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    console.log("Profile created:", config)
    setOpen(false)
    setCurrentStep(1)
    setConfig({
      name: "",
      reportsTo: "",
      abstraction: "meso",
      sources: { pautaDigital: true, campanasExternas: false },
      reports: defaultReports,
    })
  }

  const toggleReportVisible = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => (r.id === id ? { ...r, visible: !r.visible } : r)),
    }))
  }

  const toggleReportViewMode = (reportId: string, modeId: string) => {
    setConfig((prev) => ({
      ...prev,
      reports: prev.reports.map((r) => {
        if (r.id !== reportId) return r
        const currentModes = r.viewModes
        let newModes: string[]
        if (currentModes.includes(modeId)) {
          if (currentModes.length === 1) return r
          newModes = currentModes.filter((m) => m !== modeId)
        } else {
          newModes = [...currentModes, modeId]
        }
        const order = ["dashboard", "chart", "cards", "table"]
        newModes.sort((a, b) => order.indexOf(a) - order.indexOf(b))
        return { ...r, viewModes: newModes }
      }),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="border-aura/30 text-aura hover:bg-aura/10 hover:border-aura/50 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Crear Perfil de Gobernanza
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border/40 bg-white sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-lg">
            <Shield className="text-aura h-5 w-5" />
            Wizard de Gobernanza Corporativa
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="border-border/30 flex items-center justify-between border-b pb-4">
          {steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                      isActive
                        ? "border-aura bg-aura/20 text-aura"
                        : isCompleted
                          ? "border-[#22c55e] bg-[#22c55e]/20 text-[#22c55e]"
                          : "border-border/40 bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-[11px] font-medium ${
                        isActive ? "text-aura" : isCompleted ? "text-[#22c55e]" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 ${
                      currentStep > step.id ? "bg-[#22c55e]" : "bg-border/30"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[320px] py-4"
          >
            {/* Step 1: Identity */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-semibold">Paso 1: Identidad del Perfil</h3>
                  <p className="text-muted-foreground text-xs">
                    Define el nombre del perfil que veras al asignar usuarios.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="role-name" className="text-foreground text-xs">
                      Nombre de perfil
                    </Label>
                    <Input
                      id="role-name"
                      placeholder="Ej: Perfil Gerencial"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="border-border/40 bg-secondary/40"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Abstraction Level */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-semibold">Paso 2: Nivel de Abstraccion Visual</h3>
                  <p className="text-muted-foreground text-xs">
                    Selecciona como este perfil vera la informacion del sistema.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {abstractionLevels.map((level) => {
                    const LevelIcon = level.icon
                    const isSelected = config.abstraction === level.id

                    return (
                      <button
                        key={level.id}
                        onClick={() =>
                          setConfig({ ...config, abstraction: level.id as "macro" | "meso" | "micro" })
                        }
                        className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? `${level.borderColor} ${level.bgColor}`
                            : "border-border/30 hover:border-border/50 bg-secondary/20 hover:bg-secondary/40"
                        }`}
                      >
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${level.bgColor}`}
                        >
                          <LevelIcon className={`h-6 w-6 ${level.color}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isSelected ? level.color : "text-foreground"}`}>
                              {level.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${isSelected ? level.borderColor + " " + level.color : ""}`}
                            >
                              {level.subtitle}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-xs leading-relaxed">{level.description}</p>
                        </div>
                        {isSelected && (
                          <Check className={`ml-auto h-5 w-5 flex-shrink-0 ${level.color}`} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Lead Sources */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-semibold">Paso 3: Atribucion Externa de Leads</h3>
                  <p className="text-muted-foreground text-xs">
                    Configura las fuentes de ingresos que este perfil puede ver o auditar.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Pauta Digital */}
                  <div
                    className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                      config.sources.pautaDigital
                        ? "border-[#3b82f6]/30 bg-[#3b82f6]/5"
                        : "border-border/30 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                          config.sources.pautaDigital ? "bg-[#3b82f6]/20" : "bg-secondary/40"
                        }`}
                      >
                        <Target
                          className={`h-5 w-5 ${
                            config.sources.pautaDigital ? "text-[#3b82f6]" : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-foreground text-sm font-medium">Pauta Digital Core</p>
                        <p className="text-muted-foreground text-xs">Google, Meta, LinkedIn, TikTok y OpenAI Ads</p>
                      </div>
                    </div>
                    <Switch
                      checked={config.sources.pautaDigital}
                      onCheckedChange={(v) =>
                        setConfig({ ...config, sources: { ...config.sources, pautaDigital: v } })
                      }
                    />
                  </div>

                  {/* Campanas Externas */}
                  <div
                    className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${
                      config.sources.campanasExternas
                        ? "border-[#22c55e]/30 bg-[#22c55e]/5"
                        : "border-border/30 bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            config.sources.campanasExternas ? "bg-[#22c55e]/20" : "bg-secondary/40"
                          }`}
                        >
                          <Layers
                            className={`h-5 w-5 ${
                              config.sources.campanasExternas ? "text-[#22c55e]" : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">Campanas Tradicionales Externas</p>
                          <p className="text-muted-foreground text-xs">Eventos, Ferias, Vallas, BTL</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.sources.campanasExternas}
                        onCheckedChange={(v) =>
                          setConfig({ ...config, sources: { ...config.sources, campanasExternas: v } })
                        }
                      />
                    </div>

                    {config.sources.campanasExternas && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border-border/30 flex items-center gap-3 border-t pt-3"
                      >
                        <Button variant="outline" size="sm" className="border-border/40 gap-2 text-xs">
                          <Upload className="h-3.5 w-3.5" />
                          Cargar CSV de Presupuestos
                        </Button>
                        <span className="text-muted-foreground/60 text-[11px]">
                          o ingresa manualmente
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Reports */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-semibold">Paso 4: Configuracion de Informes</h3>
                  <p className="text-muted-foreground text-xs">
                    Define que informes vera este perfil y en que formato. Selecciona multiples vistas que se ordenaran automaticamente de Global a Personal.
                  </p>
                </div>

                {/* Legend */}
                <div className="border-border/30 bg-secondary/20 flex flex-wrap items-center gap-2 rounded-lg border p-2">
                  <span className="text-muted-foreground text-[10px] font-medium">Niveles:</span>
                  {viewModes.map((mode) => {
                    const colors = levelColors[mode.level as keyof typeof levelColors]
                    return (
                      <div key={mode.id} className={`flex items-center gap-1 rounded px-1.5 py-0.5 ${colors.bg}`}>
                        <span className={colors.text}>{mode.icon}</span>
                        <span className={`text-[9px] ${colors.text}`}>{mode.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Reports List */}
                <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto pr-1">
                  {config.reports.map((report) => (
                    <div
                      key={report.id}
                      className={`rounded-lg border p-3 transition-all ${
                        report.visible
                          ? "border-border/40 bg-secondary/30"
                          : "border-border/20 bg-secondary/10 opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={report.visible}
                            onCheckedChange={() => toggleReportVisible(report.id)}
                            className="scale-75 data-[state=checked]:bg-[#22c55e]"
                          />
                          <span className={`text-sm font-medium ${report.visible ? "text-foreground" : "text-muted-foreground"}`}>
                            {report.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {viewModes.map((mode) => {
                            const isActive = report.viewModes.includes(mode.id)
                            const colors = levelColors[mode.level as keyof typeof levelColors]
                            const isOnlyOne = report.viewModes.length === 1 && isActive
                            return (
                              <button
                                key={mode.id}
                                onClick={() => toggleReportViewMode(report.id, mode.id)}
                                disabled={!report.visible || isOnlyOne}
                                className={`flex h-7 w-7 items-center justify-center rounded transition-all ${
                                  isActive
                                    ? `${colors.bg} ${colors.border} border ${colors.text}`
                                    : "border-border/20 bg-secondary/20 text-muted-foreground/50 hover:border-border/40 border"
                                } ${!report.visible || isOnlyOne ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                                title={`${mode.label} (${mode.level})`}
                              >
                                {mode.icon}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {report.visible && report.viewModes.length > 1 && (
                        <div className="text-muted-foreground/60 mt-2 flex items-center gap-1 text-[10px]">
                          <span>Orden:</span>
                          {report.viewModes.map((mId, idx) => {
                            const mode = viewModes.find((m) => m.id === mId)
                            return (
                              <span key={mId}>
                                {mode?.label}
                                {idx < report.viewModes.length - 1 && " → "}
                              </span>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-aura/5 border-aura/20 rounded-lg border p-3">
                  <div className="flex items-start gap-2">
                    <Info className="text-aura mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      <strong className="text-aura">{config.reports.filter((r) => r.visible).length} informes</strong> visibles para este perfil.
                      Cuando se seleccionan multiples vistas, se muestran como pestanas ordenadas de Global (consolidado) a Personal (detallado).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className="border-border/30 flex items-center justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="text-muted-foreground gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="text-muted-foreground/60 text-xs">
            Paso {currentStep} de 4
          </div>

          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-aura hover:bg-aura/90 gap-1 text-white"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              className="gap-1 bg-[#22c55e] text-white hover:bg-[#22c55e]/90"
            >
              <Check className="h-4 w-4" />
              Crear Perfil
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
