"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp, Layers, CalendarRange, Copy, Check, Target } from "lucide-react"
import { toast } from "sonner"
import { useForecast } from "@/contexts/forecast-context"

function formatCOP(v: number) {
  return "$" + Math.round(v).toLocaleString("es-CO")
}

export function G4ForecastConfig() {
  const {
    lines,
    months,
    activeMonth,
    setActiveMonth,
    activeLineIds,
    toggleLine,
    isLineActive,
    getGoal,
    setGoal,
    goalForMonth,
  } = useForecast()

  const [mesEdicion, setMesEdicion] = useState<number>(activeMonth)
  const mesLabel = months[mesEdicion]?.label ?? ""

  const aplicarATodoElAnio = (lineId: string) => {
    const value = getGoal(lineId, mesEdicion)
    for (let m = 0; m < 12; m++) setGoal(lineId, m, value)
    toast.success(`Meta de ${formatCOP(value)} aplicada a los 12 meses`)
  }

  const totalMesEdicion = lines
    .filter((l) => isLineActive(l.id))
    .reduce((acc, l) => acc + getGoal(l.id, mesEdicion), 0)

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div className="border-border/50 flex items-start gap-3 rounded-xl border bg-white/80 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3b82f6]/10">
          <TrendingUp className="h-5 w-5 text-[#3b82f6]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-foreground text-sm font-semibold">G4 · Guardian de Forecast</p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Define que lineas de negocio entran al modelo predictivo y configura la meta de ventas
            por linea y por mes. El predictor proyecta la cobertura de cada meta y emite alertas
            tempranas.
          </p>
        </div>
      </div>

      {/* Seccion 1: lineas del modelo */}
      <div className="border-border/50 flex flex-col gap-3 rounded-xl border bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground text-sm font-semibold">Lineas en el modelo predictivo</span>
          </div>
          <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
            {activeLineIds.length} de {lines.length} activas
          </Badge>
        </div>
        <p className="text-muted-foreground text-[11px]">
          Solo las lineas activas se incluyen en la prediccion consolidada y aparecen como filtro en
          el grafico del reporte.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {lines.map((l) => {
            const active = isLineActive(l.id)
            return (
              <div
                key={l.id}
                className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                  active ? "border-border/60 bg-secondary/30" : "border-border/30 bg-white/40 opacity-70"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-7 w-7 shrink-0 rounded-lg"
                    style={{ background: `${l.color}1a`, border: `1.5px solid ${l.color}` }}
                  >
                    <span
                      className="m-2 block h-3 w-3 rounded-full"
                      style={{ background: l.color }}
                    />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-foreground text-xs font-medium">{l.nombre}</span>
                    <span className="text-muted-foreground text-[10px]">
                      Meta {mesLabel}: {formatCOP(getGoal(l.id, mesEdicion))}
                    </span>
                  </div>
                </div>
                <Switch
                  checked={active}
                  onCheckedChange={() => toggleLine(l.id)}
                  className="data-[state=checked]:bg-[#3b82f6]"
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Seccion 2: metas por linea y por mes */}
      <div className="border-border/50 flex flex-col gap-4 rounded-xl border bg-white/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground text-sm font-semibold">Meta por linea y por mes</span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-muted-foreground text-[11px]">Mes:</Label>
            <Select value={String(mesEdicion)} onValueChange={(v) => setMesEdicion(Number(v))}>
              <SelectTrigger className="bg-secondary/40 h-8 w-40 text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.key} value={m.key} className="text-xs capitalize">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {lines.map((l) => {
            const active = isLineActive(l.id)
            return (
              <div
                key={l.id}
                className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-3 ${
                  active ? "border-border/50 bg-secondary/20" : "border-border/20 bg-white/30 opacity-60"
                }`}
              >
                <div className="flex min-w-[150px] items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
                  <span className="text-foreground text-xs font-medium">{l.nombre}</span>
                  {!active && (
                    <span className="text-muted-foreground text-[10px]">(fuera del modelo)</span>
                  )}
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs">
                      $
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={1_000_000}
                      value={getGoal(l.id, mesEdicion)}
                      onChange={(e) => setGoal(l.id, mesEdicion, Number(e.target.value))}
                      className="border-border/50 bg-secondary/50 h-8 pl-6 text-xs font-mono"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => aplicarATodoElAnio(l.id)}
                    className="text-muted-foreground hover:text-foreground h-8 shrink-0 gap-1 px-2 text-[11px]"
                    title="Aplicar esta meta a los 12 meses"
                  >
                    <Copy className="h-3 w-3" /> Todo el ano
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total del mes */}
        <div className="border-aura/30 bg-aura/5 flex items-center justify-between rounded-lg border px-4 py-3">
          <span className="text-foreground flex items-center gap-2 text-xs font-medium">
            <Target className="text-aura h-3.5 w-3.5" />
            Meta consolidada de <span className="capitalize">{mesLabel}</span> (lineas activas)
          </span>
          <span className="text-foreground font-mono text-sm font-bold">{formatCOP(totalMesEdicion)}</span>
        </div>
      </div>

      {/* Guardar */}
      <div className="border-border/30 bg-secondary/30 flex items-center justify-between rounded-lg border px-4 py-3">
        <span className="text-muted-foreground text-xs">
          Meta consolidada del mes en foco: <b className="text-foreground">{formatCOP(goalForMonth(activeMonth))}</b>
        </span>
        <Button
          size="sm"
          onClick={() => toast.success("Configuracion de G4 guardada")}
          className="bg-aura hover:bg-aura/90 gap-1.5"
        >
          <Check className="h-3.5 w-3.5" />
          Guardar Configuracion
        </Button>
      </div>
    </div>
  )
}
