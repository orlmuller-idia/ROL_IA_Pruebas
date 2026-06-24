"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Bot, Handshake, Layers, Boxes, Info, RotateCcw, Lock } from "lucide-react"
import { lineasProductoSeed, gruposSeed } from "@/components/config/config-types"
import { useVersion } from "@/lib/versioning"

type ProcesoVenta = "b2c" | "b2b"
type Override = ProcesoVenta | "heredar"

const PROCESOS: Record<
  ProcesoVenta,
  { label: string; short: string; desc: string; icon: React.ReactNode; accent: string; bg: string; border: string }
> = {
  b2c: {
    label: "B2C Automatizado",
    short: "B2C",
    desc: "Rol.IA ejecuta la secuencia omnicanal automatica (WhatsApp + llamada) para rescatar al lead sin intervencion del asesor.",
    icon: <Bot className="h-4 w-4" />,
    accent: "text-[#22c55e]",
    bg: "bg-[#22c55e]/5",
    border: "border-[#22c55e]/40",
  },
  b2b: {
    label: "B2B Directo",
    short: "B2B",
    desc: "El asesor lidera el contacto. Rol.IA solo asiste y notifica; no dispara secuencias automaticas hacia el cliente.",
    icon: <Handshake className="h-4 w-4" />,
    accent: "text-[#3b82f6]",
    bg: "bg-[#3b82f6]/5",
    border: "border-[#3b82f6]/40",
  },
}

export function G1SalesProcess() {
  const { meta: versionMeta } = useVersion()
  const dualProduct = versionMeta.capabilities.salesModel === "dual-product"
  const [global, setGlobal] = useState<ProcesoVenta>("b2c")
  const [overrides, setOverrides] = useState<Record<string, Override>>({})

  const setOverride = (id: string, value: Override) =>
    setOverrides((prev) => {
      const next = { ...prev }
      if (value === "heredar") delete next[id]
      else next[id] = value
      return next
    })

  const efectivo = (id: string): ProcesoVenta => {
    const o = overrides[id]
    return o && o !== "heredar" ? o : global
  }

  const overrideCount = Object.keys(overrides).length

  return (
    <TooltipProvider>
      <div className="border-border bg-white rounded-xl border p-4 shadow-sm">
        {/* Encabezado */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Handshake className="text-aura h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-foreground text-sm font-semibold">Tipo de Proceso de Venta</h4>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="text-muted-foreground h-3 w-3" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px] text-xs">
                  Define como el Rescatista (G1) interviene: automatizado de punta a punta (B2C) o asistiendo al asesor que lleva la venta (B2B).
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground text-xs">
              {dualProduct
                ? "Aplica un esquema global y, si lo necesitas, sobreescribelo por linea de producto o grupo"
                : `Rol ${versionMeta.name} maneja un unico tipo de venta. Elige B2B o B2C para toda la operacion.`}
            </p>
          </div>
          {overrideCount > 0 && (
            <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
              {overrideCount} {overrideCount === 1 ? "override" : "overrides"}
            </Badge>
          )}
        </div>

        {/* Selector global */}
        <span className="text-muted-foreground mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
          Esquema global
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(Object.keys(PROCESOS) as ProcesoVenta[]).map((key) => {
            const p = PROCESOS[key]
            const active = global === key
            return (
              <button
                key={key}
                onClick={() => setGlobal(key)}
                aria-pressed={active}
                className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all ${
                  active ? `${p.border} ${p.bg}` : "border-border/40 bg-secondary/20 hover:border-border/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={active ? p.accent : "text-muted-foreground"}>{p.icon}</span>
                  <span className={`text-sm font-semibold ${active ? p.accent : "text-foreground"}`}>{p.label}</span>
                </div>
                <span className="text-muted-foreground text-xs leading-relaxed">{p.desc}</span>
              </button>
            )
          })}
        </div>

        {/* Overrides: combinar ambos tipos de venta por producto es exclusivo de Enterprise */}
        {dualProduct ? (
          <div className="border-border/50 mt-5 border-t pt-4">
            <OverrideGroup
              title="Por linea de producto"
              icon={<Layers className="h-3.5 w-3.5" />}
              items={lineasProductoSeed.map((l) => ({ id: `lp:${l.id}`, label: l.nombre, dot: l.color }))}
              overrides={overrides}
              efectivo={efectivo}
              onSet={setOverride}
            />

            <OverrideGroup
              title="Por grupo"
              icon={<Boxes className="h-3.5 w-3.5" />}
              items={gruposSeed.map((g) => ({ id: `g:${g.id}`, label: g.nombre }))}
              overrides={overrides}
              efectivo={efectivo}
              onSet={setOverride}
              className="mt-4"
            />
          </div>
        ) : (
          <div className="border-border/50 mt-5 border-t pt-4">
            <div className="border-border/60 bg-muted/30 flex items-start gap-2.5 rounded-xl border border-dashed p-3.5">
              <Lock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-xs font-semibold">Combina B2B y B2C por producto con Rol Enterprise</span>
                <span className="text-muted-foreground text-[12px] leading-relaxed">
                  En Enterprise puedes manejar ambos tipos de venta a la vez y sobreescribir el esquema por linea de producto o grupo.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function OverrideGroup({
  title,
  icon,
  items,
  overrides,
  efectivo,
  onSet,
  className = "",
}: {
  title: string
  icon: React.ReactNode
  items: { id: string; label: string; dot?: string }[]
  overrides: Record<string, Override>
  efectivo: (id: string) => ProcesoVenta
  onSet: (id: string, value: Override) => void
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
        {icon} {title}
      </span>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const hasOverride = item.id in overrides
          const eff = efectivo(item.id)
          const p = PROCESOS[eff]
          return (
            <div
              key={item.id}
              className="border-border/50 bg-secondary/20 flex items-center justify-between gap-3 rounded-lg border p-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                {item.dot && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.dot }} />}
                <span className="text-foreground truncate text-xs font-medium">{item.label}</span>
                {!hasOverride && (
                  <Badge variant="outline" className="border-border/50 text-muted-foreground shrink-0 text-[9px]">
                    Hereda global
                  </Badge>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <div className="bg-muted/60 border-border flex gap-0.5 rounded-md border p-0.5">
                  {(Object.keys(PROCESOS) as ProcesoVenta[]).map((key) => {
                    const active = eff === key
                    return (
                      <button
                        key={key}
                        onClick={() => onSet(item.id, key)}
                        className={`rounded px-2 py-1 text-[10px] font-semibold transition-all ${
                          active ? `bg-white shadow-sm ${PROCESOS[key].accent}` : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {PROCESOS[key].short}
                      </button>
                    )
                  })}
                </div>
                {hasOverride && (
                  <button
                    onClick={() => onSet(item.id, "heredar")}
                    className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                    aria-label="Volver a heredar el esquema global"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
