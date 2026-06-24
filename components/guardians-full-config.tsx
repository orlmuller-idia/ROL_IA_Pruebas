"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Shield,
  Radio,
  TrendingUp,
  ChevronRight,
  Settings2,
  Info,
  Check,
  AlertTriangle,
} from "lucide-react"
import { G1SalesProcess } from "@/components/g1-sales-process"
import { ConfigPauta } from "@/components/config/config-pauta"

interface GuardianDef {
  id: string
  name: string
  fullName: string
  icon: React.ReactNode
  color: string
  bgColor: string
  description: string
  category: "operativo" | "estrategico" | "inteligencia"
  defaultEnabled: boolean
  params: {
    key: string
    label: string
    type: "slider" | "input" | "select"
    min?: number
    max?: number
    step?: number
    default: number | string
    unit?: string
    tooltip: string
  }[]
}

const guardians: GuardianDef[] = [
  {
    id: "g1",
    name: "G1",
    fullName: "El Rescatista",
    icon: <Shield className="h-4 w-4" />,
    color: "text-[#22c55e]",
    bgColor: "bg-[#22c55e]/10",
    description: "Rescata leads abandonados con secuencia omnicanal y semaforo de abandono",
    category: "operativo",
    defaultEnabled: true,
    params: [
      { key: "slaWhatsapp", label: "Tiempo de espera WhatsApp", type: "slider", min: 1, max: 30, step: 1, default: 1, unit: "min", tooltip: "Tiempo antes de que Rol.IA envie WhatsApp automatico si el asesor no responde" },
      { key: "slaLlamada", label: "Tiempo de espera Llamada", type: "slider", min: 1, max: 30, step: 1, default: 1, unit: "min", tooltip: "Tiempo de espera antes de realizar llamada automatica si el lead no responde el WhatsApp" },
      { key: "maxIntentos", label: "Maximo de intentos de llamada", type: "slider", min: 1, max: 5, step: 1, default: 3, unit: "veces", tooltip: "Si el lead no contesta, se reintenta la llamada hasta este maximo" },
      { key: "estadoCrm", label: "Estado CRM no atendido", type: "input", default: "en oportunidad", tooltip: "Estado del CRM que significa que el lead NO ha sido atendido" },
      { key: "semVerde", label: "Semaforo verde (a tiempo)", type: "slider", min: 1, max: 10, step: 1, default: 2, unit: "min", tooltip: "Hasta cuantos minutos un lead se considera atendido a tiempo" },
      { key: "semAmarillo", label: "Semaforo amarillo (en riesgo)", type: "slider", min: 5, max: 30, step: 1, default: 10, unit: "min", tooltip: "Limite del rango en riesgo; mas alla pasa a rojo (critico)" },
    ],
  },
  {
    id: "g2",
    name: "G2",
    fullName: "Guardian de Pauta",
    icon: <Radio className="h-4 w-4" />,
    color: "text-[#f97316]",
    bgColor: "bg-[#f97316]/10",
    description: "Vigila ROAS por campana (Meta/Google) y pausa la pauta ineficiente",
    category: "operativo",
    defaultEnabled: true,
    params: [
      { key: "roasThreshold", label: "Umbral de referencia ROAS", type: "input", default: "1.5", tooltip: "Linea de referencia visible en el grafico de ROAS. No dispara acciones automaticas" },
      { key: "ticketPromedio", label: "Ticket promedio (valor por lead)", type: "input", default: "100000", tooltip: "Valor monetario por lead. Se usa para el ROAS: (leads x ticket) / gasto" },
      { key: "maxPeriodos", label: "Maximo de periodos en graficas", type: "slider", min: 4, max: 12, step: 1, default: 12, unit: "periodos", tooltip: "Cuantos periodos muestra cada reporte de G2 en su linea de tendencia" },
      { key: "periodicidad", label: "Periodicidad de consulta", type: "slider", min: 1, max: 30, step: 1, default: 1, unit: "dias", tooltip: "Cada cuantos dias se evalua el rendimiento" },
      { key: "periodosPausa", label: "Periodos consecutivos para pausar", type: "slider", min: 1, max: 10, step: 1, default: 5, unit: "", tooltip: "Periodos seguidos con presupuesto al alza y leads a la baja antes de pausar la campana" },
    ],
  },
  {
    id: "g4",
    name: "G4",
    fullName: "Guardian de Forecast",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/10",
    description: "Proyecta cobertura de la meta de ventas y emite alertas tempranas",
    category: "estrategico",
    defaultEnabled: true,
    params: [
      { key: "metaVentas", label: "Meta de ventas / ingresos", type: "input", default: "80000000", tooltip: "Monto objetivo del periodo (entero). Dejalo vacio para dejar la meta sin configurar" },
    ],
  },
]

const categoryLabels = {
  operativo: { label: "Operativos", color: "text-[#22c55e]", desc: "Ejecutan en tiempo real" },
  estrategico: { label: "Estrategicos", color: "text-[#3b82f6]", desc: "Analizan y proponen" },
  inteligencia: { label: "Inteligencia", color: "text-[#8b5cf6]", desc: "ML y coordinacion" },
}

export function GuardiansFullConfig({ only }: { only?: string } = {}) {
  const visibleGuardians = only ? guardians.filter((g) => g.id === only) : guardians
  const [enabledGuardians, setEnabledGuardians] = useState<Record<string, boolean>>(
    guardians.reduce((acc, g) => ({ ...acc, [g.id]: g.defaultEnabled }), {})
  )
  const [guardianParams, setGuardianParams] = useState<Record<string, Record<string, number | string>>>(
    guardians.reduce((acc, g) => ({
      ...acc,
      [g.id]: g.params.reduce((p, param) => ({ ...p, [param.key]: param.default }), {}),
    }), {})
  )
  const [expandedGuardian, setExpandedGuardian] = useState<string | null>(null)

  const toggleGuardian = (id: string) => {
    setEnabledGuardians((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const updateParam = (guardianId: string, paramKey: string, value: number | string) => {
    setGuardianParams((prev) => ({
      ...prev,
      [guardianId]: { ...prev[guardianId], [paramKey]: value },
    }))
  }

  const enabledCount = Object.values(enabledGuardians).filter(Boolean).length

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Header Stats */}
        {!only && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22c55e]/10">
              <Shield className="h-5 w-5 text-[#22c55e]" />
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">{enabledCount} de {guardians.length} Activos</p>
              <p className="text-muted-foreground text-[11px]">Guardianes configurables</p>
            </div>
          </div>
          <div className="bg-border/30 hidden h-8 w-px sm:block" />
          {Object.entries(categoryLabels).map(([key, val]) => {
            const count = guardians.filter((g) => g.category === key && enabledGuardians[g.id]).length
            const total = guardians.filter((g) => g.category === key).length
            if (total === 0) return null
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${val.color}`}>{val.label}:</span>
                <Badge variant="outline" className="border-border/50 text-[10px]">
                  {count}/{total}
                </Badge>
              </div>
            )
          })}
        </div>
        )}

        {only === "g1" && <G1SalesProcess />}

        {only === "g2" && (
          <div className="border-border/50 rounded-xl border bg-white/80 p-4">
            <ConfigPauta />
          </div>
        )}

        {/* Guardian Grid */}
        <div className={`grid grid-cols-1 gap-3 ${only ? "" : "lg:grid-cols-2 xl:grid-cols-3"}`}>
          {visibleGuardians.map((guardian) => {
            const isEnabled = enabledGuardians[guardian.id]
            const isExpanded = expandedGuardian === guardian.id

            return (
              <motion.div
                key={guardian.id}
                layout
                className={`rounded-xl border transition-all ${
                  isEnabled
                    ? "border-border/50 bg-white/80"
                    : "border-border/20 bg-white/40 opacity-60"
                }`}
              >
                {/* Guardian Header */}
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${guardian.bgColor}`}>
                      <span className={guardian.color}>{guardian.icon}</span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">{guardian.name}</span>
                        <span className="text-muted-foreground text-xs">- {guardian.fullName}</span>
                      </div>
                      <span className="text-muted-foreground text-[11px] leading-tight">{guardian.description}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleGuardian(guardian.id)}
                      className="data-[state=checked]:bg-[#22c55e]"
                    />
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                <Collapsible open={isExpanded} onOpenChange={() => setExpandedGuardian(isExpanded ? null : guardian.id)}>
                  <CollapsibleTrigger asChild>
                    <button
                      className={`flex w-full items-center justify-center gap-1 border-t py-2 text-[11px] transition-colors ${
                        isEnabled
                          ? "border-border/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                          : "border-border/10 text-muted-foreground/50 cursor-not-allowed"
                      }`}
                      disabled={!isEnabled}
                    >
                      <Settings2 className="h-3 w-3" />
                      Configurar parametros
                      <ChevronRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border/30 bg-secondary/20 p-4"
                        >
                          <div className="flex flex-col gap-4">
                            {guardian.params.map((param) => (
                              <div key={param.key} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Label className="text-foreground text-xs font-medium">{param.label}</Label>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="text-muted-foreground h-3 w-3" />
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[200px] text-xs">
                                        {param.tooltip}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  {param.type === "slider" && (
                                    <Badge variant="outline" className="border-aura/30 text-aura font-mono text-[10px]">
                                      {guardianParams[guardian.id][param.key]} {param.unit}
                                    </Badge>
                                  )}
                                </div>
                                {param.type === "slider" ? (
                                  <Slider
                                    value={[guardianParams[guardian.id][param.key] as number]}
                                    onValueChange={(v) => updateParam(guardian.id, param.key, v[0])}
                                    min={param.min}
                                    max={param.max}
                                    step={param.step}
                                    className="[&_[data-slot=slider-range]]:bg-aura [&_[data-slot=slider-thumb]]:border-aura"
                                  />
                                ) : (
                                  <Input
                                    value={guardianParams[guardian.id][param.key] as string}
                                    onChange={(e) => updateParam(guardian.id, param.key, e.target.value)}
                                    className="border-border/50 bg-secondary/50 h-8 text-xs"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-[#eab308]" />
            <span className="text-muted-foreground text-xs">Los cambios se aplicaran en el proximo ciclo de sincronizacion</span>
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
