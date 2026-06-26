"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageSquareWarning,
  ShieldAlert,
  ClipboardCheck,
  ShieldX,
  TrendingDown,
  Building2,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { useScopedSucursales, sucursalNombre } from "@/components/branch-scope"
import { HelpHint } from "@/components/help-hint"
import { SPEECH_PILLARS } from "@/lib/speech-pillars"
import { useSpeechConfig } from "@/contexts/speech-config-context"
import { Layers } from "lucide-react"

const HELP_BY_LEVEL: Record<ProfileLevel, string> = {
  macro:
    "Indice ejecutivo de calidad humana. Compara entre sucursales el cumplimiento del guion corporativo y las alertas de palabras prohibidas para detectar donde se esta perdiendo calidad de conversacion.",
  meso:
    "Detalle de incidencias: las palabras prohibidas mas detectadas y su severidad, el cumplimiento del guion y las resistencias del cliente mas frecuentes que frenan el cierre.",
  micro:
    "Tus alertas de calidad. Las palabras prohibidas que usaste en tus conversaciones y como ajustar el guion para mejorar tu cierre.",
}

/**
 * Speech Analytics (Sugerido -- Fugas Silenciosas y Calidad Humana)
 * Detecta uso de palabras prohibidas, cumplimiento del guion corporativo
 * y registro de resistencias del cliente en el chat.
 * Se adapta al nivel de perfil y respeta el filtro de sucursales:
 *  - macro: indice ejecutivo de calidad por sucursal (comparativo).
 *  - meso: desglose de incidencias y cumplimiento del guion.
 *  - micro: alertas concretas de mis conversaciones.
 */

interface BranchSpeech {
  sucursalId: string
  prohibidas: number // # palabras prohibidas detectadas
  guion: number // % cumplimiento del guion corporativo
  resistencias: number // # resistencias registradas
  conversaciones: number
}

const dataset: BranchSpeech[] = [
  { sucursalId: "s1", prohibidas: 7, guion: 82, resistencias: 34, conversaciones: 312 },
  { sucursalId: "s2", prohibidas: 14, guion: 68, resistencias: 51, conversaciones: 268 },
  { sucursalId: "s3", prohibidas: 3, guion: 91, resistencias: 22, conversaciones: 190 },
  { sucursalId: "s4", prohibidas: 19, guion: 61, resistencias: 63, conversaciones: 240 },
  { sucursalId: "s5", prohibidas: 5, guion: 88, resistencias: 28, conversaciones: 205 },
]

const palabrasProhibidas = [
  { palabra: "\u201cno puedo\u201d", veces: 18, severidad: "alta" as const },
  { palabra: "\u201cno se\u201d", veces: 12, severidad: "media" as const },
  { palabra: "\u201ces imposible\u201d", veces: 9, severidad: "alta" as const },
  { palabra: "\u201cllame despues\u201d", veces: 7, severidad: "media" as const },
]

const resistenciasTop = [
  { tipo: "Precio elevado", veces: 41 },
  { tipo: "Lo voy a pensar", veces: 33 },
  { tipo: "Falta de tiempo", veces: 25 },
  { tipo: "Comparando opciones", veces: 19 },
]

const severidadColor = {
  alta: "text-alert border-alert/20 bg-alert/10",
  media: "text-warning border-warning/20 bg-warning/10",
}

const scoreColor = (s: number) => (s >= 85 ? "bg-emerald-500" : s >= 70 ? "bg-amber-500" : "bg-red-500")

/**
 * Resultados del modelo de 4 pilares para una sucursal, ponderados con la
 * configuracion Enterprise (peso por pilar + subniveles requeridos).
 * Se muestra el score por pilar, su peso y su aporte al indice global.
 */
function PillarBreakdown({ sucursalId, dense = false }: { sucursalId: string; dense?: boolean }) {
  const { getConfig, pillarScore, weightedScore } = useSpeechConfig()
  const config = getConfig(sucursalId)
  const sumWeights = SPEECH_PILLARS.reduce((s, p) => s + (config.weights[p.id] ?? 0), 0)
  const global = weightedScore(sucursalId)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
          <Layers className="h-3 w-3" /> Modelo de evaluacion · 4 pilares
        </span>
        <span className="text-foreground text-xs">
          Indice ponderado: <span className="font-mono font-bold">{global}%</span>
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {SPEECH_PILLARS.map((pillar) => {
          const weight = config.weights[pillar.id] ?? 0
          const score = pillarScore(sucursalId, pillar.id)
          const contribution = sumWeights > 0 ? Math.round((weight / sumWeights) * score) : 0
          return (
            <div key={pillar.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: pillar.color }} aria-hidden />
                  <span className="text-foreground truncate">{pillar.label}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px]">
                  peso {weight}% · <span className="text-foreground font-mono font-semibold">{score}%</span>
                </span>
              </div>
              <div className="bg-muted flex h-2 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.6 }}
                  className={scoreColor(score)}
                />
              </div>
              {!dense && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {pillar.subItems.map((sub) => {
                    const required = config.required[sub.id] !== false
                    return (
                      <span
                        key={sub.id}
                        className={`rounded border px-1.5 py-0.5 text-[9px] ${
                          required
                            ? "border-border/60 text-muted-foreground bg-secondary/40"
                            : "border-border/30 text-muted-foreground/50 line-through"
                        }`}
                      >
                        {sub.label}
                      </span>
                    )
                  })}
                  <span className="text-muted-foreground/70 ml-auto text-[9px] self-center">aporta {contribution} pts</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function IntelSpeechAnalytics() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const { activeIds } = useScopedSucursales()
  const { weightedScore } = useSpeechConfig()

  const scoped = useMemo(
    () => dataset.filter((d) => activeIds.includes(d.sucursalId)),
    [activeIds],
  )

  const totals = useMemo(() => {
    const prohibidas = scoped.reduce((s, d) => s + d.prohibidas, 0)
    const resistencias = scoped.reduce((s, d) => s + d.resistencias, 0)
    const conversaciones = scoped.reduce((s, d) => s + d.conversaciones, 0)
    const guion = scoped.length
      ? Math.round(scoped.reduce((s, d) => s + d.guion, 0) / scoped.length)
      : 0
    return { prohibidas, resistencias, conversaciones, guion }
  }, [scoped])

  const peor = useMemo(
    () => scoped.reduce((w, d) => (d.guion < w.guion ? d : w), scoped[0] ?? dataset[0]),
    [scoped],
  )

  const subtitle =
    level === "macro"
      ? "Indice ejecutivo de calidad humana por sucursal"
      : level === "meso"
        ? "Palabras prohibidas, guion corporativo y resistencias"
        : "Alertas de calidad en tus conversaciones"

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex flex-col gap-1 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <div className="bg-aura/10 flex h-7 w-7 items-center justify-center rounded-lg">
                <MessageSquareWarning className="text-aura h-4 w-4" />
              </div>
              Speech Analytics
              <HelpHint text={HELP_BY_LEVEL[level]} />
            </span>
            <span className="text-muted-foreground pl-9 text-[11px] font-normal">{subtitle}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* KPIs comunes */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Palabras prohibidas</span>
            <span className="text-alert font-mono text-lg font-bold">{totals.prohibidas}</span>
          </div>
          <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Cumple guion</span>
            <span className="text-foreground font-mono text-lg font-bold">{totals.guion}%</span>
          </div>
          <div className="bg-secondary/40 border-border/40 flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Resistencias</span>
            <span className="text-warning font-mono text-lg font-bold">{totals.resistencias}</span>
          </div>
        </div>

        {/* ═══ MACRO: comparativo por sucursal ═══ */}
        {level === "macro" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#8b5cf6]" />
              <span className="text-foreground text-sm font-medium">Calidad del guion por sucursal</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {scoped.map((d) => (
                <div key={d.sucursalId} className="flex items-center gap-3">
                  <span className="text-foreground w-40 shrink-0 truncate text-xs">{sucursalNombre(d.sucursalId)}</span>
                  <div className="bg-muted flex h-2 flex-1 overflow-hidden rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.guion}%` }}
                      transition={{ duration: 0.6 }}
                      className={d.guion >= 85 ? "bg-emerald-500" : d.guion >= 70 ? "bg-amber-500" : "bg-red-500"}
                    />
                  </div>
                  <span className="text-muted-foreground w-24 shrink-0 text-right text-xs font-medium">
                    {d.guion}% · {d.prohibidas} alertas
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-aura/5 border-aura/15 flex items-start gap-2 rounded-lg border p-3">
              <ShieldAlert className="text-aura mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-muted-foreground text-xs leading-relaxed">
                <span className="text-foreground font-semibold">{sucursalNombre(peor.sucursalId)}</span> presenta el menor
                cumplimiento del guion (<span className="text-alert font-semibold">{peor.guion}%</span>). Recomendamos
                refuerzo de coaching y revision de scripts en esa sede.
              </p>
            </div>

            {/* Indice ponderado de 4 pilares por sucursal */}
            <div className="border-border/50 mt-1 flex flex-col gap-3 rounded-xl border p-3">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
                <Layers className="h-3 w-3" /> Indice ponderado por pilares · por sucursal
              </span>
              <div className="flex flex-col gap-2.5">
                {scoped.map((d) => (
                  <div key={d.sucursalId} className="flex items-center gap-3">
                    <span className="text-foreground w-40 shrink-0 truncate text-xs">{sucursalNombre(d.sucursalId)}</span>
                    <div className="bg-muted flex h-2 flex-1 overflow-hidden rounded-full">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${weightedScore(d.sucursalId)}%` }}
                        transition={{ duration: 0.6 }}
                        className={scoreColor(weightedScore(d.sucursalId))}
                      />
                    </div>
                    <span className="text-foreground w-12 shrink-0 text-right font-mono text-xs font-semibold">
                      {weightedScore(d.sucursalId)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground/70 text-[10px] leading-relaxed">
                Resultado ponderado segun los pesos de cada pilar configurados por sucursal (Enterprise).
              </p>
            </div>
          </div>
        )}

        {/* ═══ MESO: pilares + incidencias + guion + resistencias ═══ */}
        {level === "meso" && (
          <div className="flex flex-col gap-4">
            {/* Desglose por pilares de la sucursal con menor cumplimiento del scope */}
            <div className="border-border/50 rounded-xl border p-3">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-foreground text-xs font-medium">
                  Evaluacion por pilares · {sucursalNombre(peor.sucursalId)}
                </span>
                <span className="text-muted-foreground text-[10px]">sucursal con mayor oportunidad</span>
              </div>
              <PillarBreakdown sucursalId={peor.sucursalId} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
                <ShieldX className="h-3 w-3" /> Palabras prohibidas detectadas
              </span>
              {palabrasProhibidas.map((p) => (
                <div
                  key={p.palabra}
                  className="border-border/40 bg-secondary/30 flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-foreground text-xs">{p.palabra}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[11px]">{p.veces}x</span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${severidadColor[p.severidad]}`}
                    >
                      {p.severidad}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
                <ClipboardCheck className="h-3 w-3" /> Resistencias registradas del cliente
              </span>
              <div className="grid grid-cols-2 gap-2">
                {resistenciasTop.map((r) => (
                  <div
                    key={r.tipo}
                    className="border-border/40 bg-secondary/30 flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-foreground text-xs">{r.tipo}</span>
                    <span className="text-warning font-mono text-xs font-semibold">{r.veces}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MICRO: mis pilares + alertas operativas ═══ */}
        {level === "micro" && (
          <div className="flex flex-col gap-2">
            {/* Mi evaluacion por pilares (sede del asesor) */}
            <div className="border-border/50 mb-1 rounded-xl border p-3">
              <span className="text-foreground mb-2.5 block text-xs font-medium">Mi evaluacion por pilares</span>
              <PillarBreakdown sucursalId={scoped[0]?.sucursalId ?? "s1"} dense />
            </div>

            <div className="bg-alert/5 border-alert/15 flex items-center gap-2 rounded-lg border px-3 py-2">
              <TrendingDown className="text-alert h-3.5 w-3.5 shrink-0" />
              <p className="text-muted-foreground text-[11px] leading-snug">
                Evita las palabras prohibidas y sigue el guion corporativo para mejorar tu cierre.
              </p>
            </div>
            {palabrasProhibidas.map((p) => (
              <div
                key={p.palabra}
                className="border-border/40 bg-secondary/30 flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground text-xs font-medium">{p.palabra}</span>
                  <span className="text-muted-foreground text-[10px]">Detectada {p.veces} veces este mes</span>
                </div>
                <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${severidadColor[p.severidad]}`}>
                  {p.severidad}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
