"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  PhoneCall,
  Brain,
  AlertTriangle,
  Target,
  User,
  ChevronDown,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"

/**
 * Agenda G8 - Bloques de Rescate (10 min)
 * G8 crea bloques de 10 minutos para que el asesor atienda los leads que cayeron en
 * semaforo rojo. Cada bloque trae un perfil psicometrico y un script de abordaje listo,
 * para que el asesor entre a la conversacion sabiendo exactamente como tratar al cliente.
 *  - Global:   indice de bloques de rescate activos y su impacto en dinero por recuperar.
 *  - Equipo:   bloques agrupados por asesor, con foco en quien tiene mas rescates pendientes.
 *  - Personal: los bloques del asesor con el perfil psicometrico y el script completo.
 */

type RiskLevel = "critico" | "alto"

interface RescueBlock {
  id: string
  lead: string
  phone: string
  slot: string
  seller: string
  minutesRed: number
  ticket: number
  risk: RiskLevel
  /* Perfil psicometrico detectado por G9 */
  profile: string
  profileTags: string[]
  /* Motivo por el que entro a semaforo rojo */
  reason: string
  /* Script de abordaje / contraargumentacion sugerido */
  script: string
}

const SELLERS = ["Ricardo Quiroga", "Oscar Puentes", "Viviana Comercial"]

/* 3 ejemplos de bloques de rescate G8 con perfil psicometrico */
const BLOCKS: RescueBlock[] = [
  {
    id: "R8-001",
    lead: "Orlando Restrepo",
    phone: "+573058170043",
    slot: "10:30 - 10:40",
    seller: "Ricardo Quiroga",
    minutesRed: 14,
    ticket: 4200,
    risk: "critico",
    profile: "Directivo y Analitico",
    profileTags: ["Directivo", "Analitico"],
    reason: "Pidio cotizacion hace 14 min y nadie respondio. Comparando con competencia.",
    script:
      "Este cliente es de perfil Directivo y Analitico: se conciso, ve directo al numero. Abre con el ROI y un dato duro. Usa el script de contraargumentacion de precio: 'Entiendo que el costo importa; veamos el retorno en 6 meses frente a la alternativa'. Evita rodeos y small talk.",
  },
  {
    id: "R8-002",
    lead: "Maria Lopez Vega",
    phone: "+573008619763",
    slot: "10:40 - 10:50",
    seller: "Ricardo Quiroga",
    minutesRed: 11,
    ticket: 2800,
    risk: "alto",
    profile: "Expresivo y Amigable",
    profileTags: ["Expresivo", "Amigable"],
    reason: "Mostro interes alto por WhatsApp pero la conversacion se enfrio sin cierre.",
    script:
      "Cliente de perfil Expresivo y Amigable: genera rapport antes de vender. Reconoce su entusiasmo, usa lenguaje calido y testimonios de otros clientes. Cierra con una pregunta abierta para que se proyecte usando el producto. Evita saturarla de datos tecnicos.",
  },
  {
    id: "R8-003",
    lead: "Juan Ruiz Mesa",
    phone: "+573183349419",
    slot: "10:50 - 11:00",
    seller: "Oscar Puentes",
    minutesRed: 18,
    ticket: 5600,
    risk: "critico",
    profile: "Esceptico y Analitico",
    profileTags: ["Esceptico", "Analitico"],
    reason: "Objeto el precio dos veces y dejo de responder. Necesita pruebas para avanzar.",
    script:
      "Cliente de perfil Esceptico y Analitico: no presiones, aporta evidencia. Lleva un caso de exito con cifras y una garantia clara. Usa el script de contraargumentacion 'precio vs valor' apoyado en datos verificables. Deja que el cliente llegue a la conclusion con preguntas guiadas.",
  },
]

const riskConfig: Record<RiskLevel, { label: string; dot: string; text: string; soft: string }> = {
  critico: { label: "Critico", dot: "bg-red-500", text: "text-red-600", soft: "bg-red-50 border-red-200" },
  alto: { label: "Alto", dot: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50 border-amber-200" },
}

const money = (n: number) => `$${n.toLocaleString("es-CO")}`

export function IntelRescueAgenda() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  const myName = SELLERS[0]
  const scoped = level === "micro" ? BLOCKS.filter((b) => b.seller === myName) : BLOCKS

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/20">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">Agenda G8 - Bloques de Rescate</h3>
              <p className="text-muted-foreground text-xs">
                {level === "macro"
                  ? "Bloques de 10 min para leads en semaforo rojo"
                  : level === "meso"
                  ? "Rescates de 10 min por asesor"
                  : "Tus bloques de rescate con perfil de abordaje"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 font-mono">
              {scoped.length} bloques 10 min
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {level === "macro" && <GlobalRescue blocks={BLOCKS} />}
        {level === "meso" && <TeamRescue blocks={BLOCKS} />}
        {level === "micro" && <PersonalRescue blocks={scoped} />}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── GLOBAL ───────────────────────── */
function GlobalRescue({ blocks }: { blocks: RescueBlock[] }) {
  const total = blocks.length
  const critico = blocks.filter((b) => b.risk === "critico").length
  const enRiesgo = blocks.reduce((s, b) => s + b.ticket, 0)

  const kpis = [
    { label: "Bloques de rescate activos", value: String(total), tone: "text-red-600", bg: "bg-red-50", sub: "ventanas de 10 min asignadas" },
    { label: "Casos criticos", value: String(critico), tone: "text-amber-600", bg: "bg-amber-50", sub: "+12 min en semaforo rojo" },
    { label: "Dinero por recuperar", value: money(enRiesgo), tone: "text-aura", bg: "bg-aura/10", sub: "ticket sumado de los bloques" },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="border-border flex flex-col gap-2 rounded-xl border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">{k.label}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${k.bg}`}>
                <Clock className={`h-3.5 w-3.5 ${k.tone}`} />
              </div>
            </div>
            <span className={`text-2xl font-semibold tracking-tight ${k.tone}`}>{k.value}</span>
            <span className="text-muted-foreground text-[11px]">{k.sub}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          G8 reserva ventanas de 10 minutos en la agenda del asesor para atacar los leads en semaforo
          rojo. Cada bloque incluye el perfil psicometrico del cliente (detectado por G9) y un script de
          abordaje, para entrar a la llamada sabiendo como tratarlo. El detalle por asesor y el guion
          completo estan en los perfiles de Equipo y Personal.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── EQUIPO ───────────────────────── */
function TeamRescue({ blocks }: { blocks: RescueBlock[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, RescueBlock[]>()
    blocks.forEach((b) => {
      const arr = map.get(b.seller) ?? []
      arr.push(b)
      map.set(b.seller, arr)
    })
    return Array.from(map.entries())
  }, [blocks])

  return (
    <div className="flex flex-col gap-3">
      {grouped.map(([seller, list]) => {
        const critico = list.filter((b) => b.risk === "critico").length
        const enRiesgo = list.reduce((s, b) => s + b.ticket, 0)
        return (
          <SellerRescueGroup key={seller} seller={seller} list={list} critico={critico} enRiesgo={enRiesgo} />
        )
      })}
    </div>
  )
}

function SellerRescueGroup({
  seller,
  list,
  critico,
  enRiesgo,
}: {
  seller: string
  list: RescueBlock[]
  critico: number
  enRiesgo: number
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-border overflow-hidden rounded-xl border bg-muted/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-red-50 flex h-7 w-7 items-center justify-center rounded-lg">
            <User className="h-3.5 w-3.5 text-red-500" />
          </div>
          <span className="text-foreground text-sm font-medium">{seller}</span>
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 text-[10px]">
            {list.length} bloques
          </Badge>
          {critico > 0 && (
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-600 text-[10px]">
              {critico} critico{critico > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-[11px] sm:block">{money(enRiesgo)} en riesgo</span>
          <ChevronDown className={`text-muted-foreground h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="flex flex-col gap-2 px-3 pb-3"
        >
          {list.map((b) => (
            <RescueCard key={b.id} block={b} compact />
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────────────── PERSONAL ───────────────────────── */
function PersonalRescue({ blocks }: { blocks: RescueBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-red-50 p-3">
          <span className="text-red-600 text-xl font-semibold">{blocks.length}</span>
          <span className="text-muted-foreground text-[11px]">Bloques hoy</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-amber-50 p-3">
          <span className="text-amber-600 text-xl font-semibold">
            {blocks.filter((b) => b.risk === "critico").length}
          </span>
          <span className="text-muted-foreground text-[11px]">Criticos</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-muted/30 p-3">
          <span className="text-foreground text-xl font-semibold">10</span>
          <span className="text-muted-foreground text-[11px]">Min por bloque</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {blocks.map((b) => (
          <RescueCard key={b.id} block={b} />
        ))}
        {blocks.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
            <ShieldAlert className="h-6 w-6 opacity-40" />
            <span className="text-sm">No tienes bloques de rescate asignados</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── TARJETA DE BLOQUE ───────────────────────── */
function RescueCard({ block, compact = false }: { block: RescueBlock; compact?: boolean }) {
  const cfg = riskConfig[block.risk]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-3 rounded-xl border p-3.5 ${cfg.soft}`}
    >
      {/* Encabezado del bloque */}
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-foreground truncate text-sm font-medium">{block.lead}</span>
            <Badge variant="outline" className={`${cfg.text} border-current/20 bg-white/60 text-[10px]`}>
              {cfg.label}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {block.slot}
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="h-3 w-3" />
              {block.phone}
            </span>
            <span className="hidden sm:inline">{money(block.ticket)}</span>
          </div>
        </div>
        <Badge variant="outline" className="border-red-200 bg-white/60 text-red-600 text-[10px] font-mono">
          {block.minutesRed} min en rojo
        </Badge>
      </div>

      {/* Motivo del riesgo */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-white/60 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-muted-foreground text-[11px] leading-relaxed">{block.reason}</p>
      </div>

      {/* Perfil psicometrico */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium">
          <Brain className="h-3.5 w-3.5 text-aura" />
          Perfil:
        </span>
        {block.profileTags.map((t) => (
          <Badge key={t} variant="outline" className="border-aura/30 bg-aura/10 text-aura text-[10px]">
            {t}
          </Badge>
        ))}
      </div>

      {/* Script de abordaje (siempre visible en Personal; tambien en Equipo) */}
      <div className="flex items-start gap-2 rounded-lg border border-aura/20 bg-aura/5 px-3 py-2.5">
        <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-aura" />
        <div className="flex flex-col gap-1">
          <span className="text-aura flex items-center gap-1 text-[11px] font-semibold">
            <Sparkles className="h-3 w-3" />
            Script de abordaje
          </span>
          <p className="text-muted-foreground text-[11px] leading-relaxed">{block.script}</p>
        </div>
      </div>
    </motion.div>
  )
}
