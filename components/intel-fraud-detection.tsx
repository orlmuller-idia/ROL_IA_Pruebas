"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  FileText,
  AlertTriangle,
  User,
  ChevronDown,
  ScanSearch,
  Bot,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { HelpHint } from "@/components/help-hint"

const HELP_BY_LEVEL: Record<ProfileLevel, string> = {
  macro:
    "Indice global de fraude. La IA cruza cada nota del CRM contra la data real de llamadas y WhatsApp y mide cuantos registros no coinciden y cuanto dinero queda comprometido en notas falsas.",
  meso:
    "Casos agrupados por asesor para rendicion de cuentas. Contrasta lo que cada uno escribio en el CRM contra lo que realmente paso en los canales, con la evidencia textual de la conversacion.",
  micro:
    "Tus casos marcados por la IA. Donde lo que registraste en el CRM (un 'no contesta', un 'no interesado') no coincide con la conversacion real del cliente.",
}

/**
 * Deteccion de Fraude - CRM vs. Realidad
 * Cruza lo que el asesor ESCRIBIO en el CRM contra lo que REALMENTE pasó en los
 * canales (llamadas y WhatsApp, conectados a la data pura). La IA detecta discrepancias:
 * notas falsas, contactos inexistentes o cierres mal reportados.
 *  - Global:   indice de fraude por sucursal y dinero comprometido.
 *  - Equipo:   casos agrupados por asesor para rendicion de cuentas.
 *  - Personal: solo lectura de los propios casos marcados.
 */

type Severity = "fraude" | "discrepancia"
type Channel = "voz" | "whatsapp"

interface FraudCase {
  id: string
  lead: string
  seller: string
  channel: Channel
  /* Lo que el asesor escribio en el CRM */
  crmNote: string
  /* Lo que la IA detecto que realmente paso en el canal */
  realityNote: string
  /* Evidencia textual del canal (transcripcion / mensaje) */
  evidence: string
  severity: Severity
  confidence: number
  ticket: number
}

const SELLERS = ["Ricardo Quiroga", "Oscar Puentes", "Viviana Comercial"]

const CASES: FraudCase[] = [
  {
    id: "F-001",
    lead: "Orlando Restrepo",
    seller: "Ricardo Quiroga",
    channel: "voz",
    crmNote: "Cliente no contesta, buzon de voz. Sin interes.",
    realityNote: "Hubo llamada conectada de 4 min 12 s. El cliente pidio una cotizacion al cierre.",
    evidence: "Transcripcion 09:41 - Cliente: \"Mandame la propuesta hoy y lo reviso con mi socio.\"",
    severity: "fraude",
    confidence: 96,
    ticket: 4200,
  },
  {
    id: "F-002",
    lead: "Juan Ruiz Mesa",
    seller: "Oscar Puentes",
    channel: "whatsapp",
    crmNote: "No interesado. Se cierra el lead.",
    realityNote: "WhatsApp activo: el cliente pidio precio y disponibilidad dos veces sin respuesta.",
    evidence: "WhatsApp 11:02 - Cliente: \"Sigues ahi? Necesito el precio para decidir esta semana.\"",
    severity: "fraude",
    confidence: 92,
    ticket: 5600,
  },
  {
    id: "F-003",
    lead: "Sofia Diaz Toro",
    seller: "Oscar Puentes",
    channel: "voz",
    crmNote: "Cita agendada y confirmada para mañana 10am.",
    realityNote: "No hay llamada ni mensaje que confirme la cita. Registro inflado.",
    evidence: "Sin eventos en voz/WhatsApp en las ultimas 24 h para este lead.",
    severity: "discrepancia",
    confidence: 78,
    ticket: 3100,
  },
  {
    id: "F-004",
    lead: "Luis Torres Arango",
    seller: "Viviana Comercial",
    channel: "whatsapp",
    crmNote: "Cliente pidio mas tiempo, hacer seguimiento en 15 dias.",
    realityNote: "El cliente confirmo compra por WhatsApp; el seguimiento diferido lo perdio.",
    evidence: "WhatsApp 16:20 - Cliente: \"Listo, lo quiero. Como hago el pago?\"",
    severity: "discrepancia",
    confidence: 84,
    ticket: 2900,
  },
]

const sevConfig: Record<Severity, { label: string; dot: string; text: string; soft: string }> = {
  fraude: { label: "Fraude", dot: "bg-red-500", text: "text-red-600", soft: "bg-red-50 border-red-200" },
  discrepancia: { label: "Discrepancia", dot: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50 border-amber-200" },
}

const money = (n: number) => `$${n.toLocaleString("es-CO")}`

export function IntelFraudDetection() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  const myName = SELLERS[0]
  const scoped = level === "micro" ? CASES.filter((c) => c.seller === myName) : CASES

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
              <ScanSearch className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-foreground text-base font-semibold">Deteccion de Fraude: CRM vs. Realidad</h3>
                <HelpHint text={HELP_BY_LEVEL[level]} />
              </div>
              <p className="text-muted-foreground text-xs">
                {level === "macro"
                  ? "Indice de notas falsas frente a la data real de canales"
                  : level === "meso"
                  ? "Casos por asesor: lo escrito vs. lo que pasó"
                  : "Tus casos marcados por la IA"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 font-mono">
              {scoped.length} casos
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {level === "macro" && <GlobalFraud cases={CASES} />}
        {level === "meso" && <TeamFraud cases={CASES} />}
        {level === "micro" && <PersonalFraud cases={scoped} />}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── GLOBAL ───────────────────────── */
function GlobalFraud({ cases }: { cases: FraudCase[] }) {
  const fraude = cases.filter((c) => c.severity === "fraude").length
  const comprometido = cases.reduce((s, c) => s + c.ticket, 0)
  const avgConf = Math.round(cases.reduce((s, c) => s + c.confidence, 0) / cases.length)

  const kpis = [
    { label: "Casos de fraude", value: String(fraude), tone: "text-red-600", bg: "bg-red-50", sub: `${cases.length} discrepancias totales` },
    { label: "Dinero comprometido", value: money(comprometido), tone: "text-aura", bg: "bg-aura/10", sub: "ticket de leads mal reportados" },
    { label: "Confianza promedio IA", value: `${avgConf}%`, tone: "text-amber-600", bg: "bg-amber-50", sub: "certeza del cruce de datos" },
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
                <ShieldAlert className={`h-3.5 w-3.5 ${k.tone}`} />
              </div>
            </div>
            <span className={`text-2xl font-semibold tracking-tight ${k.tone}`}>{k.value}</span>
            <span className="text-muted-foreground text-[11px]">{k.sub}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-3">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          La IA cruza cada nota del CRM contra la data pura de llamadas y WhatsApp. Cuando lo escrito no
          coincide con lo que realmente pasó (un &quot;no contesta&quot; con una llamada de 4 minutos, por ejemplo),
          marca el caso. El detalle por asesor y la evidencia textual estan en los perfiles de Equipo y Personal.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── EQUIPO ───────────────────────── */
function TeamFraud({ cases }: { cases: FraudCase[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, FraudCase[]>()
    cases.forEach((c) => {
      const arr = map.get(c.seller) ?? []
      arr.push(c)
      map.set(c.seller, arr)
    })
    return Array.from(map.entries())
  }, [cases])

  return (
    <div className="flex flex-col gap-3">
      {grouped.map(([seller, list]) => {
        const fraude = list.filter((c) => c.severity === "fraude").length
        const comprometido = list.reduce((s, c) => s + c.ticket, 0)
        return (
          <SellerFraudGroup key={seller} seller={seller} list={list} fraude={fraude} comprometido={comprometido} />
        )
      })}
    </div>
  )
}

function SellerFraudGroup({
  seller,
  list,
  fraude,
  comprometido,
}: {
  seller: string
  list: FraudCase[]
  fraude: number
  comprometido: number
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
            {list.length} casos
          </Badge>
          {fraude > 0 && (
            <Badge variant="outline" className="border-red-300 bg-red-100 text-red-700 text-[10px]">
              {fraude} fraude{fraude > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground hidden text-[11px] sm:block">{money(comprometido)} comprometido</span>
          <ChevronDown className={`text-muted-foreground h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="flex flex-col gap-2 px-3 pb-3"
        >
          {list.map((c) => (
            <FraudCard key={c.id} fraudCase={c} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────────────── PERSONAL ───────────────────────── */
function PersonalFraud({ cases }: { cases: FraudCase[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-red-50 p-3">
          <span className="text-red-600 text-xl font-semibold">
            {cases.filter((c) => c.severity === "fraude").length}
          </span>
          <span className="text-muted-foreground text-[11px]">Fraudes</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-amber-50 p-3">
          <span className="text-amber-600 text-xl font-semibold">
            {cases.filter((c) => c.severity === "discrepancia").length}
          </span>
          <span className="text-muted-foreground text-[11px]">Discrepancias</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-muted/30 p-3">
          <span className="text-foreground text-xl font-semibold">{cases.length}</span>
          <span className="text-muted-foreground text-[11px]">Total marcados</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {cases.map((c) => (
          <FraudCard key={c.id} fraudCase={c} />
        ))}
        {cases.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
            <ScanSearch className="h-6 w-6 opacity-40" />
            <span className="text-sm">Sin casos marcados por la IA</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── TARJETA DE CASO ───────────────────────── */
function FraudCard({ fraudCase: c }: { fraudCase: FraudCase }) {
  const cfg = sevConfig[c.severity]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-3 rounded-xl border p-3.5 ${cfg.soft}`}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-foreground truncate text-sm font-medium">{c.lead}</span>
            <Badge variant="outline" className={`${cfg.text} border-current/20 bg-white/60 text-[10px]`}>
              {cfg.label}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              {c.channel === "voz" ? <PhoneCall className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
              {c.channel === "voz" ? "Llamada" : "WhatsApp"}
            </span>
            <span className="hidden sm:inline">{money(c.ticket)}</span>
          </div>
        </div>
        <Badge variant="outline" className="border-aura/30 bg-aura/10 text-aura text-[10px] font-mono">
          {c.confidence}% IA
        </Badge>
      </div>

      {/* Comparativa: CRM vs realidad */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-white/60 px-3 py-2">
          <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide">
            <FileText className="h-3 w-3" />
            CRM (lo que escribio)
          </span>
          <p className="text-foreground text-[11px] leading-relaxed">{c.crmNote}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-red-200 bg-white/60 px-3 py-2">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">
            {c.channel === "voz" ? <PhoneCall className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
            Realidad (lo que pasó)
          </span>
          <p className="text-foreground text-[11px] leading-relaxed">{c.realityNote}</p>
        </div>
      </div>

      {/* Evidencia */}
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
        <p className="text-muted-foreground text-[11px] italic leading-relaxed">{c.evidence}</p>
      </div>
    </motion.div>
  )
}
