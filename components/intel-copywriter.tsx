"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Pencil,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Copy,
  Check,
  TrendingUp,
  Target,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"

/**
 * Copywriter IA (Diagnostico)
 * Genera variaciones de copy y brief de diseno cuando un guardian pausa una campana.
 * Se adapta al nivel de perfil siguiendo el principio "de lo general a lo particular":
 *  - macro: lectura ejecutiva -> resumen de cobertura, mejor angulo y recomendacion estrategica.
 *  - meso: analisis completo -> todas las variaciones, sentimiento, brief y guardian.
 *  - micro: operativo -> hooks listos para copiar y usar en su campana.
 */

interface HookVariation {
  id: number
  hook: string
  angle: string
  sentiment: "positive" | "neutral" | "negative"
  score: number
}

const hooks: HookVariation[] = [
  {
    id: 1,
    hook: "Tu competencia ya automatizo sus ventas. Tu equipo sigue copiando y pegando mensajes.",
    angle: "Dolor / Comparacion",
    sentiment: "positive",
    score: 87,
  },
  {
    id: 2,
    hook: "Cada 7 minutos pierdes un cliente. Rol.IA los rescata en 30 segundos.",
    angle: "Urgencia / Estadistica",
    sentiment: "positive",
    score: 92,
  },
  {
    id: 3,
    hook: "Deja de pagar publicidad para que tus vendedores la ignoren.",
    angle: "Frustracion / Inversion",
    sentiment: "neutral",
    score: 78,
  },
]

interface BriefItem {
  label: string
  value: string
}

const designBrief: BriefItem[] = [
  { label: "Tono visual", value: "Urgente, limpio, profesional" },
  { label: "Paleta sugerida", value: "Oscuro + acento violeta + rojo CTA" },
  { label: "Formato", value: "Video corto 15s o Carrusel 3 slides" },
  { label: "CTA principal", value: "Agenda tu demo en 30 segundos" },
]

const sentimentIcon = {
  positive: <ThumbsUp className="h-3 w-3" />,
  neutral: <Minus className="h-3 w-3" />,
  negative: <ThumbsDown className="h-3 w-3" />,
}

const sentimentColor = {
  positive: "text-rescue border-rescue/20 bg-rescue/10",
  neutral: "text-warning border-warning/20 bg-warning/10",
  negative: "text-alert border-alert/20 bg-alert/10",
}

export function IntelCopywriter() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const [selectedHook, setSelectedHook] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const bestHook = useMemo(
    () => hooks.reduce((best, h) => (h.score > best.score ? h : best), hooks[0]),
    [],
  )
  const avgScore = useMemo(
    () => Math.round(hooks.reduce((s, h) => s + h.score, 0) / hooks.length),
    [],
  )

  const handleCopy = (h: HookVariation) => {
    navigator.clipboard?.writeText(h.hook)
    setCopiedId(h.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const subtitle =
    level === "macro"
      ? "Lectura ejecutiva: cobertura creativa y angulo recomendado"
      : level === "meso"
        ? "Variaciones, sentimiento y brief de diseno"
        : "Hooks listos para reactivar tu campana"

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex flex-col gap-1 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <div className="bg-aura/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <Pencil className="text-aura h-4 w-4" />
              </div>
              Copywriter IA
            </span>
            <span className="text-muted-foreground pl-9 text-[11px] font-normal">{subtitle}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-rescue/30 text-rescue text-xs">
              <Sparkles className="mr-1 h-3 w-3" />
              {hooks.length} hooks generados
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* ═══════════════ MACRO: ejecutivo ═══════════════ */}
        {level === "macro" && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Hooks generados</span>
                <span className="text-foreground font-mono text-lg font-bold">{hooks.length}</span>
              </div>
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Score promedio</span>
                <span className="text-rescue font-mono text-lg font-bold">{avgScore}%</span>
              </div>
              <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Mejor angulo</span>
                <span className="text-foreground text-xs font-semibold leading-tight">{bestHook.angle}</span>
              </div>
            </div>
            <div className="bg-aura/5 border-aura/15 flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Target className="text-aura h-4 w-4" />
                <h4 className="text-foreground text-sm font-semibold">Recomendacion estrategica</h4>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                El angulo de mayor desempeno es{" "}
                <span className="text-foreground font-semibold">&ldquo;{bestHook.angle}&rdquo;</span> con{" "}
                <span className="text-rescue font-semibold">{bestHook.score}%</span> de afinidad proyectada. Recomendamos
                priorizar la reactivacion con este angulo y un formato de video corto de alta urgencia.
              </p>
            </div>
          </>
        )}

        {/* ═══════════════ MESO: analisis completo ═══════════════ */}
        {level === "meso" && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Variaciones de Hook
              </span>
              {hooks.map((h) => (
                <motion.button
                  key={h.id}
                  onClick={() => setSelectedHook(selectedHook === h.id ? null : h.id)}
                  className={`border-border/40 hover:border-aura/20 flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
                    selectedHook === h.id ? "border-aura/30 bg-aura/5" : "bg-secondary/30"
                  }`}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-foreground text-xs leading-relaxed">&ldquo;{h.hook}&rdquo;</p>
                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${sentimentColor[h.sentiment]}`}
                      >
                        {sentimentIcon[h.sentiment]}
                        {h.score}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-border/40 text-muted-foreground text-[10px]">
                      {h.angle}
                    </Badge>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                Brief de Diseno
              </span>
              <div className="bg-secondary/30 border-border/40 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-3">
                {designBrief.map((item) => (
                  <div key={item.label} className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">{item.label}</span>
                    <span className="text-foreground text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ MICRO: operativo ═══════════════ */}
        {level === "micro" && (
          <>
            <div className="bg-rescue/5 border-rescue/15 flex items-center gap-2 rounded-lg border px-3 py-2">
              <TrendingUp className="text-rescue h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground text-[11px] leading-snug">
                Usa el hook recomendado para reactivar tu campana. Toca copiar y pegalo en tu anuncio.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {[...hooks]
                .sort((a, b) => b.score - a.score)
                .map((h, idx) => (
                  <div
                    key={h.id}
                    className={`border-border/40 flex flex-col gap-2 rounded-lg border p-3 ${
                      idx === 0 ? "border-rescue/30 bg-rescue/5" : "bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-foreground text-xs leading-relaxed">&ldquo;{h.hook}&rdquo;</p>
                      <button
                        onClick={() => handleCopy(h)}
                        aria-label="Copiar hook"
                        className="text-muted-foreground hover:text-foreground border-border/50 shrink-0 rounded-md border p-1.5 transition-colors"
                      >
                        {copiedId === h.id ? (
                          <Check className="text-rescue h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {idx === 0 && (
                        <Badge variant="outline" className="border-rescue/30 text-rescue text-[10px]">
                          Recomendado
                        </Badge>
                      )}
                      <Badge variant="outline" className="border-border/40 text-muted-foreground text-[10px]">
                        {h.angle}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
