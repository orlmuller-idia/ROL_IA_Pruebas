"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Timer,
  Megaphone,
  PenTool,
  TrendingUp,
  Search,
  Rocket,
  CalendarCheck,
} from "lucide-react"
import { RolIcon } from "@/components/rol-logo"

/**
 * Centro de Comando — elemento firma de la landing.
 * El hub neural de la marca como núcleo, con los guardianes en órbita.
 * El núcleo "despacha" un pulso a un guardián por vez y un ticker mono narra la acción.
 */

type Guardian = {
  code: string
  name: string
  accent: string
  icon: typeof Timer
  ticker: string
}

const GUARDIANS: Guardian[] = [
  { code: "G1", name: "Proceso de Ventas", accent: "#6366f1", icon: Timer, ticker: "lead sin respuesta 8 min · alertó al vendedor" },
  { code: "G2", name: "Guardián de Pauta", accent: "#7c3aed", icon: Megaphone, ticker: "pausó campaña 'Verano-3' · ahorró $1.240.000" },
  { code: "G3", name: "Copywriter Estratégico", accent: "#3b82f6", icon: PenTool, ticker: "3 hooks nuevos para 'Promo-Julio'" },
  { code: "G4", name: "Analista Predictivo", accent: "#10b981", icon: TrendingUp, ticker: "proyección del mes: 92% de la meta" },
  { code: "G5", name: "Auditor de Fugas", accent: "#d97706", icon: Search, ticker: "41% de pérdidas por 'precio' este mes" },
  { code: "G6", name: "Optimizador de Conversión", accent: "#ec4899", icon: Rocket, ticker: "movió $600.000 al anuncio ganador" },
  { code: "G7", name: "Agente de Agendamiento", accent: "#dc2626", icon: CalendarCheck, ticker: "cita agendada · jue 10:30 · Meet enviado" },
]

// Geometría en espacio 0..100 (centro 50,50, radio 37)
const R = 37
const positions = GUARDIANS.map((_, i) => {
  const angle = (-90 + i * (360 / GUARDIANS.length)) * (Math.PI / 180)
  return { x: 50 + R * Math.cos(angle), y: 50 + R * Math.sin(angle) }
})

export function GuardianOrbital() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(1) // arranca en G2 (la historia más vendedora)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      setActive((a) => (a + 1) % GUARDIANS.length)
    }, 2800)
    return () => clearInterval(id)
  }, [reduce])

  const activeG = GUARDIANS[active]
  const ActiveIcon = activeG.icon

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="relative aspect-square w-full max-w-[460px]">
        {/* Anillos guía */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="border-foreground/[0.06] h-[78%] w-[78%] rounded-full border" />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="border-foreground/[0.04] h-[96%] w-[96%] rounded-full border border-dashed" />
        </div>

        {/* Líneas de despacho (núcleo → guardianes) */}
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {positions.map((p, i) => (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={GUARDIANS[i].accent}
              strokeWidth={i === active ? 0.55 : 0.3}
              strokeOpacity={i === active ? 0.85 : 0.14}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity .5s ease, stroke-width .5s ease" }}
            />
          ))}
          {/* Pulso viajando del núcleo al guardián activo */}
          {!reduce && (
            <motion.circle
              key={active}
              r="1.5"
              fill={activeG.accent}
              initial={{ cx: 50, cy: 50, opacity: 0 }}
              animate={{
                cx: positions[active].x,
                cy: positions[active].y,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />
          )}
        </svg>

        {/* Núcleo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative flex items-center justify-center rounded-full bg-card"
            style={{ width: 92, height: 92 }}
            animate={
              reduce
                ? {}
                : {
                    boxShadow: [
                      `0 0 0 0 ${activeG.accent}00`,
                      `0 0 38px 6px ${activeG.accent}26`,
                      `0 0 0 0 ${activeG.accent}00`,
                    ],
                  }
            }
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="border-foreground/10 absolute inset-0 rounded-full border" />
            <RolIcon size={56} />
          </motion.div>
        </div>

        {/* Guardianes en órbita */}
        {GUARDIANS.map((g, i) => {
          const p = positions[i]
          const isActive = i === active
          const Icon = g.icon
          return (
            <div
              key={g.code}
              className="absolute"
              style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)" }}
            >
              <motion.div
                className="bg-card relative flex items-center justify-center rounded-2xl border shadow-sm"
                style={{ width: 58, height: 58 }}
                animate={{
                  scale: isActive && !reduce ? 1.12 : 1,
                  borderColor: isActive ? g.accent : "rgba(31,41,55,0.10)",
                }}
                transition={{ duration: 0.4 }}
                aria-label={g.name}
              >
                {/* Halo del activo */}
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-2xl"
                    style={{ boxShadow: `0 0 0 3px ${g.accent}22` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
                <Icon
                  className="h-6 w-6"
                  style={{ color: isActive ? g.accent : "var(--muted-foreground)" }}
                />
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Ticker de estado en vivo */}
      <div className="border-border/70 bg-card flex w-full max-w-[460px] items-center gap-3 rounded-xl border px-4 py-2.5 shadow-sm">
        <span className="relative flex h-2 w-2 shrink-0">
          {!reduce && (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: activeG.accent }}
            />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: activeG.accent }} />
        </span>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex min-w-0 items-center gap-2"
        >
          <ActiveIcon className="h-4 w-4 shrink-0" style={{ color: activeG.accent }} />
          <p className="text-muted-foreground truncate font-mono text-[12px]">{activeG.ticker}</p>
        </motion.div>
        <span className="text-muted-foreground/60 ml-auto hidden shrink-0 font-mono text-[10px] uppercase tracking-wider sm:inline">
          en vivo
        </span>
      </div>
    </div>
  )
}
