"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle2, RotateCcw, Save } from "lucide-react"
import { toast } from "sonner"
import { SPEECH_PILLARS } from "@/lib/speech-pillars"
import { useSpeechConfig } from "@/contexts/speech-config-context"

/**
 * Configuracion de Speech Analytics por sucursal (solo Enterprise).
 * Permite repartir el peso de los 4 pilares (suma <= 100%) y marcar si cada
 * subnivel debe cumplirse. Estos parametros alimentan el informe de Speech.
 */
export function ConfigSpeechAnalytics({
  sucursalId,
  scopeLabel,
}: {
  sucursalId: string
  scopeLabel: string
}) {
  const { getConfig, setWeight, toggleRequired, setCriteria, resetToDefault, weightsSum } =
    useSpeechConfig()
  const config = getConfig(sucursalId)
  const sum = weightsSum(sucursalId)
  const over = sum > 100
  const remaining = 100 - sum

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-muted-foreground text-xs">
          Define el modelo de evaluacion de Speech Analytics para{" "}
          <span className="text-foreground font-medium">{scopeLabel}</span>. Reparte el peso de los 4 pilares, marca
          que subniveles deben cumplirse y escribe el guion de referencia de cada subnivel — ese texto es el que la
          IA comparara contra la llamada para validar el cumplimiento. Estos parametros ponderan los resultados del informe.
        </p>
      </div>

      {/* Medidor de pesos */}
      <div
        className={`flex items-center justify-between rounded-lg border px-4 py-2.5 ${
          over
            ? "border-destructive/40 bg-destructive/5"
            : sum === 100
              ? "border-rescue/30 bg-rescue/5"
              : "border-border bg-secondary/40"
        }`}
      >
        <div className="flex items-center gap-2">
          {over ? (
            <AlertTriangle className="text-destructive h-4 w-4" />
          ) : (
            <CheckCircle2 className={`h-4 w-4 ${sum === 100 ? "text-rescue" : "text-muted-foreground"}`} />
          )}
          <span className="text-foreground text-xs font-medium">
            Suma de pesos: <span className={over ? "text-destructive" : ""}>{sum}%</span>
          </span>
        </div>
        <span className="text-muted-foreground text-[11px]">
          {over
            ? `Excede ${sum - 100}% — reduce algun pilar`
            : remaining > 0
              ? `Quedan ${remaining}% por asignar`
              : "Reparto completo"}
        </span>
      </div>

      {/* Pilares */}
      <div className="flex flex-col gap-3">
        {SPEECH_PILLARS.map((pillar) => {
          const weight = config.weights[pillar.id] ?? 0
          return (
            <div key={pillar.id} className={`rounded-xl border ${pillar.accent.border} bg-white p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-sm"
                    style={{ backgroundColor: pillar.color }}
                    aria-hidden
                  />
                  <div className="flex flex-col">
                    <h5 className="text-foreground text-sm font-semibold">{pillar.label}</h5>
                    <p className="text-muted-foreground text-[11px]">{pillar.hint}</p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums ${pillar.accent.bg} ${pillar.accent.text}`}
                >
                  {weight}%
                </span>
              </div>

              {/* Slider de peso */}
              <div className="mt-3">
                <Slider
                  value={[weight]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(v) => setWeight(sucursalId, pillar.id, v[0])}
                  aria-label={`Peso de ${pillar.label}`}
                />
              </div>

              {/* Subniveles: debe cumplirse + texto de referencia a comparar */}
              <div className="border-border/60 mt-3 flex flex-col gap-3 border-t pt-3">
                <span className="text-muted-foreground text-[10px] font-medium uppercase tracking-wide">
                  Subniveles — criterio de referencia y cumplimiento
                </span>
                {pillar.subItems.map((sub) => {
                  const isRequired = config.required[sub.id] !== false
                  return (
                    <div key={sub.id} className="border-border/50 bg-secondary/30 flex flex-col gap-2 rounded-lg border p-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-xs font-medium ${isRequired ? "text-foreground" : "text-muted-foreground line-through"}`}
                        >
                          {sub.label}
                        </span>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-muted-foreground text-[10px]">Debe cumplirse</span>
                          <Switch
                            checked={isRequired}
                            onCheckedChange={() => toggleRequired(sucursalId, sub.id)}
                            aria-label={`${sub.label} debe cumplirse`}
                          />
                        </div>
                      </div>
                      <Textarea
                        value={config.criteria[sub.id] ?? ""}
                        onChange={(e) => setCriteria(sucursalId, sub.id, e.target.value)}
                        placeholder={sub.placeholder}
                        disabled={!isRequired}
                        rows={2}
                        className="bg-white text-xs disabled:opacity-50"
                        aria-label={`Criterio de referencia para ${sub.label}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Acciones */}
      <div className="border-border flex items-center justify-between border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            resetToDefault(sucursalId)
            toast.success("Modelo restablecido a los valores por defecto")
          }}
          className="text-muted-foreground gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer
        </Button>
        <Button
          size="sm"
          disabled={over}
          onClick={() => toast.success(`Modelo de Speech Analytics guardado para ${scopeLabel}`)}
          className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          Guardar modelo
        </Button>
      </div>
    </div>
  )
}
