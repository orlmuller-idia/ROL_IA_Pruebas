"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  Clock,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  MessageCircle,
  Target,
  Activity,
  Building2,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"
import { sucursalesSeed } from "@/components/config/config-types"

/**
 * Semaforo de Abandono
 * Reporte descriptivo que muestra leads en riesgo de abandono segun el tiempo
 * de espera ("tiempo agonia"). Se adapta al nivel de perfil:
 *  - macro: KPIs de salud global, sin detalle de leads individuales.
 *  - meso: ranking de responsabilidad por vendedor + tabla filtrable.
 *  - micro: solo los leads del asesor, vista operativa para actuar.
 */

type StatusType = "critico" | "riesgo" | "atiempo"

interface Lead {
  id: string
  name: string
  phone: string
  tag: "cold-lead" | "sin-clasificar" | "caliente"
  seller: string
  source: string
  agonyMin: number // minutos en agonia
  sucursalId: string
}

const SELLERS = [
  "ricardo.quiroga@psicoalianza.com",
  "oscarpuentes@psicoalianza.com",
  "viviana.comercial@psicoalianza.com",
  "soporte@psicoalianza.com",
]

const SOURCES = ["En frio/propio", "Google", "Clientify", "Meta"]
const NAMES = [
  "Isabel Cristina Hurtado", "Jenny Romero", "Grecia Manuela Bocanegra",
  "Juanita Garcia Gallego", "Alejandra Velez Ocampo", "Mateo Restrepo Ruiz",
  "Valentina Osorio Mesa", "Santiago Arango Vela", "Daniela Cardona Rios",
  "Sebastian Henao Loaiza", "Camila Zapata Toro", "Andres Felipe Marin",
]
const TAGS: Lead["tag"][] = ["cold-lead", "sin-clasificar", "caliente"]

// Genera dataset mock realista
function buildLeads(): Lead[] {
  const leads: Lead[] = []
  const sucursalIds = sucursalesSeed.map((s) => s.id)
  for (let i = 0; i < 24; i++) {
    const agony = Math.floor(Math.random() * 6000) // 0 a 100h en min
    leads.push({
      id: `L-${String(i + 1).padStart(3, "0")}`,
      name: NAMES[i % NAMES.length],
      phone: `+5730${Math.floor(10000000 + Math.random() * 89999999)}`,
      tag: TAGS[i % TAGS.length],
      seller: SELLERS[i % SELLERS.length],
      source: SOURCES[i % SOURCES.length],
      agonyMin: agony,
      sucursalId: sucursalIds[i % sucursalIds.length],
    })
  }
  return leads
}

function getStatus(min: number): {
  type: StatusType
  label: string
  dot: string
  text: string
  soft: string
  bar: string
} {
  if (min > 12) {
    return {
      type: "critico",
      label: "Critico",
      dot: "bg-red-500",
      text: "text-red-600",
      soft: "bg-red-50 border-red-200",
      bar: "bg-red-500",
    }
  }
  if (min > 2) {
    return {
      type: "riesgo",
      label: "En riesgo",
      dot: "bg-amber-500",
      text: "text-amber-600",
      soft: "bg-amber-50 border-amber-200",
      bar: "bg-amber-500",
    }
  }
  return {
    type: "atiempo",
    label: "A tiempo",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    soft: "bg-emerald-50 border-emerald-200",
    bar: "bg-emerald-500",
  }
}

// Formato tiempo agonia tipo "3d 1h" o "2h 14m"
function formatAgony(min: number): string {
  const d = Math.floor(min / 1440)
  const h = Math.floor((min % 1440) / 60)
  const m = min % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const tagStyle: Record<Lead["tag"], string> = {
  "cold-lead": "border-blue-300 text-blue-600 bg-blue-50",
  "sin-clasificar": "border-amber-300 text-amber-600 bg-amber-50",
  caliente: "border-red-300 text-red-600 bg-red-50",
}

const tagLabel: Record<Lead["tag"], string> = {
  "cold-lead": "cold-lead",
  "sin-clasificar": "Sin clasificar",
  caliente: "Caliente",
}

export function IntelAbandonment() {
  const { currentProfile, branchFilter } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level

  const [leads, setLeads] = useState<Lead[]>(() => buildLeads())
  const [query, setQuery] = useState("")
  const [sellerFilter, setSellerFilter] = useState("all")

  // Incrementa la agonia en tiempo real (simulacion)
  useEffect(() => {
    const id = setInterval(() => {
      setLeads((prev) => prev.map((l) => ({ ...l, agonyMin: l.agonyMin + 1 })))
    }, 4000)
    return () => clearInterval(id)
  }, [])

  // Para micro: asume que el asesor logueado es el primer seller
  const myEmail = SELLERS[0]

  // Alcance multi-sucursal: respeta el filtro interactivo del banner
  const branchIds = branchFilter.length ? branchFilter : currentProfile.sucursales ?? []
  const branchLeads = useMemo(
    () => leads.filter((l) => branchIds.includes(l.sucursalId)),
    [leads, branchIds]
  )

  const scoped = useMemo(() => {
    let list = [...branchLeads]
    if (level === "micro") {
      list = list.filter((l) => l.seller === myEmail)
    } else if (sellerFilter !== "all") {
      list = list.filter((l) => l.seller === sellerFilter)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q)
      )
    }
    return list.sort((a, b) => b.agonyMin - a.agonyMin)
  }, [branchLeads, level, sellerFilter, query, myEmail])

  const critical = branchLeads.filter((l) => l.agonyMin > 12).length
  const atRisk = branchLeads.filter((l) => l.agonyMin > 2 && l.agonyMin <= 12).length
  const onTime = branchLeads.filter((l) => l.agonyMin <= 2).length
  const avgAgony = branchLeads.length
    ? Math.round(branchLeads.reduce((acc, l) => acc + l.agonyMin, 0) / branchLeads.length)
    : 0
  const abandonRate = branchLeads.length
    ? Math.round((critical / branchLeads.length) * 100)
    : 0

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">Semaforo de Abandono</h3>
              <p className="text-muted-foreground text-xs">
                {level === "macro"
                  ? "Salud global de respuesta a leads"
                  : level === "meso"
                  ? "Responsabilidad por vendedor"
                  : "Tus leads por atender"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge
              variant="outline"
              className="border-red-200 bg-red-50 text-red-600 font-medium"
            >
              {critical} criticos
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {level === "macro" && (
          <MacroView
            critical={critical}
            atRisk={atRisk}
            onTime={onTime}
            avgAgony={avgAgony}
            abandonRate={abandonRate}
            total={branchLeads.length}
          />
        )}

        {level === "meso" && (
          <MesoView
            leads={branchLeads}
            scoped={scoped}
            query={query}
            setQuery={setQuery}
            sellerFilter={sellerFilter}
            setSellerFilter={setSellerFilter}
          />
        )}

        {level === "micro" && (
          <MicroView scoped={scoped} query={query} setQuery={setQuery} />
        )}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── MACRO ───────────────────────── */
function MacroView({
  critical,
  atRisk,
  onTime,
  avgAgony,
  abandonRate,
  total,
}: {
  critical: number
  atRisk: number
  onTime: number
  avgAgony: number
  abandonRate: number
  total: number
}) {
  const kpis = [
    {
      label: "Tasa de abandono",
      value: `${abandonRate}%`,
      icon: TrendingDown,
      tone: "text-red-600",
      bg: "bg-red-50",
      sub: `${critical} de ${total} leads criticos`,
    },
    {
      label: "Tiempo agonia promedio",
      value: formatAgony(avgAgony),
      icon: Clock,
      tone: "text-amber-600",
      bg: "bg-amber-50",
      sub: "antes del primer contacto",
    },
    {
      label: "Leads a tiempo",
      value: `${Math.round((onTime / total) * 100)}%`,
      icon: Target,
      tone: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: `${onTime} respondidos en SLA`,
    },
  ]

  const distribution = [
    { label: "Critico", value: critical, color: "bg-red-500", text: "text-red-600" },
    { label: "En riesgo", value: atRisk, color: "bg-amber-500", text: "text-amber-600" },
    { label: "A tiempo", value: onTime, color: "bg-emerald-500", text: "text-emerald-600" },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* KPI cards */}
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
                <k.icon className={`h-3.5 w-3.5 ${k.tone}`} />
              </div>
            </div>
            <span className={`text-2xl font-semibold tracking-tight ${k.tone}`}>{k.value}</span>
            <span className="text-muted-foreground text-[11px]">{k.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* Distribution bar */}
      <div className="border-border flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-foreground text-sm font-medium">Distribucion de cartera</span>
          <span className="text-muted-foreground text-xs">{total} leads activos</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {distribution.map((d) => (
            <div
              key={d.label}
              className={d.color}
              style={{ width: `${(d.value / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          {distribution.map((d) => (
            <div key={d.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${d.color}`} />
              <span className="text-muted-foreground text-xs">
                {d.label} <span className={`font-medium ${d.text}`}>{d.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-aura/15 bg-aura/5 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-aura" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          Vista ejecutiva: {abandonRate}% de la cartera esta en estado critico. El detalle por
          vendedor y lead esta disponible en los perfiles de Gerencia y Asesor.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── MESO ───────────────────────── */
function MesoView({
  leads,
  scoped,
  query,
  setQuery,
  sellerFilter,
  setSellerFilter,
}: {
  leads: Lead[]
  scoped: Lead[]
  query: string
  setQuery: (v: string) => void
  sellerFilter: string
  setSellerFilter: (v: string) => void
}) {
  // Ranking de responsabilidad: criticos por vendedor
  const ranking = useMemo(() => {
    const map = new Map<string, { total: number; critical: number }>()
    leads.forEach((l) => {
      const entry = map.get(l.seller) ?? { total: 0, critical: 0 }
      entry.total += 1
      if (l.agonyMin > 12) entry.critical += 1
      map.set(l.seller, entry)
    })
    return Array.from(map.entries())
      .map(([seller, v]) => ({ seller, ...v }))
      .sort((a, b) => b.critical - a.critical)
  }, [leads])

  const maxCritical = Math.max(...ranking.map((r) => r.critical), 1)

  // Comparativo por sucursal (modo "comparativo" del nivel meso)
  const byBranch = useMemo(() => {
    const map = new Map<string, { total: number; critical: number }>()
    leads.forEach((l) => {
      const entry = map.get(l.sucursalId) ?? { total: 0, critical: 0 }
      entry.total += 1
      if (l.agonyMin > 12) entry.critical += 1
      map.set(l.sucursalId, entry)
    })
    return Array.from(map.entries())
      .map(([sucursalId, v]) => ({
        sucursalId,
        nombre: sucursalesSeed.find((s) => s.id === sucursalId)?.nombre ?? sucursalId,
        rate: v.total ? Math.round((v.critical / v.total) * 100) : 0,
        ...v,
      }))
      .sort((a, b) => b.rate - a.rate)
  }, [leads])

  const showBranchCompare = byBranch.length > 1

  return (
    <div className="flex flex-col gap-5">
      {/* Comparativo por sucursal -- solo si el perfil consolida varias */}
      {showBranchCompare && (
        <div className="border-border flex flex-col gap-3 rounded-xl border bg-[#3b82f6]/5 p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#3b82f6]" />
            <span className="text-foreground text-sm font-medium">Comparativo por sucursal</span>
            <Badge variant="outline" className="border-[#3b82f6]/30 text-[#3b82f6] text-[10px]">
              {byBranch.length} sedes
            </Badge>
          </div>
          <div className="flex flex-col gap-2.5">
            {byBranch.map((b) => (
              <div key={b.sucursalId} className="flex items-center gap-3">
                <span className="text-foreground w-40 shrink-0 truncate text-xs">{b.nombre}</span>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${b.rate}%` }}
                    transition={{ duration: 0.6 }}
                    className={b.rate > 30 ? "bg-red-500" : b.rate > 15 ? "bg-amber-500" : "bg-emerald-500"}
                  />
                </div>
                <span className="text-muted-foreground w-28 shrink-0 text-right text-xs font-medium">
                  {b.rate}% · {b.critical}/{b.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranking de responsabilidad */}
      <div className="border-border flex flex-col gap-3 rounded-xl border bg-muted/30 p-4">
        <span className="text-foreground text-sm font-medium">Responsabilidad por vendedor</span>
        <div className="flex flex-col gap-2.5">
          {ranking.map((r) => (
            <div key={r.seller} className="flex items-center gap-3">
              <span className="text-foreground w-44 shrink-0 truncate text-xs">
                {r.seller.split("@")[0]}
              </span>
              <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.critical / maxCritical) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="bg-red-500"
                />
              </div>
              <span className="text-red-600 w-16 shrink-0 text-right text-xs font-medium">
                {r.critical} crit.
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre o telefono"
            className="border-border bg-white pl-9"
          />
        </div>
        <Select value={sellerFilter} onValueChange={setSellerFilter}>
          <SelectTrigger className="border-border bg-white sm:w-72">
            <SelectValue placeholder="Todos los vendedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los vendedores</SelectItem>
            {SELLERS.map((s) => (
              <SelectItem key={s} value={s}>
                {s.split("@")[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <LeadTable leads={scoped.slice(0, 8)} showSeller />
    </div>
  )
}

/* ───────────────────────── MICRO ───────────────────────── */
function MicroView({
  scoped,
  query,
  setQuery,
}: {
  scoped: Lead[]
  query: string
  setQuery: (v: string) => void
}) {
  const critical = scoped.filter((l) => l.agonyMin > 12).length

  return (
    <div className="flex flex-col gap-4">
      {/* Mi resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-red-50 p-3">
          <span className="text-red-600 text-xl font-semibold">{critical}</span>
          <span className="text-muted-foreground text-[11px]">Criticos por atender</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-muted/30 p-3">
          <span className="text-foreground text-xl font-semibold">{scoped.length}</span>
          <span className="text-muted-foreground text-[11px]">Total asignados</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-emerald-50 p-3">
          <span className="text-emerald-600 text-xl font-semibold">
            {scoped.filter((l) => l.agonyMin <= 2).length}
          </span>
          <span className="text-muted-foreground text-[11px]">A tiempo</span>
        </div>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en mis leads"
          className="border-border bg-white pl-9"
        />
      </div>

      <LeadTable leads={scoped} actionable />
    </div>
  )
}

/* ───────────────────────── TABLA COMPARTIDA ───────────────────────── */
function LeadTable({
  leads,
  showSeller = false,
  actionable = false,
}: {
  leads: Lead[]
  showSeller?: boolean
  actionable?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 px-1 pb-1">
        <Legend dot="bg-red-500" label="Critico (> 12 min)" />
        <Legend dot="bg-amber-500" label="En riesgo (> 2 min)" />
        <Legend dot="bg-emerald-500" label="A tiempo (<= 2 min)" />
      </div>

      {/* Header */}
      <div className="text-muted-foreground hidden grid-cols-[1fr_auto] items-center gap-3 px-3 text-[10px] font-medium uppercase tracking-wider sm:grid">
        <span>Gestion {showSeller && "/ Vendedor"}</span>
        <span className="flex items-center gap-6">
          <span className="w-20 text-center">Estado</span>
          <span className="w-16 text-right">Agonia</span>
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {leads.map((lead, i) => {
            const status = getStatus(lead.agonyMin)
            const pct = Math.min((lead.agonyMin / 6000) * 100, 100)
            return (
              <motion.div
                key={lead.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`relative overflow-hidden rounded-xl border p-3.5 transition-all hover:shadow-md ${status.soft}`}
              >
                <div className="flex items-center gap-3">
                  {/* Semaforo - jerarquia maxima */}
                  <div className="relative flex-shrink-0">
                    <span className={`block h-3.5 w-3.5 rounded-full ${status.dot}`} />
                    {status.type === "critico" && (
                      <span className={`absolute inset-0 h-3.5 w-3.5 rounded-full ${status.dot} animate-ping opacity-60`} />
                    )}
                  </div>

                  {/* Gestion */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-foreground truncate text-sm font-medium">{lead.name}</span>
                      <span className="text-muted-foreground text-xs">{lead.phone}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] font-normal ${tagStyle[lead.tag]}`}>
                        {tagLabel[lead.tag]}
                      </Badge>
                      <span className="text-muted-foreground text-[11px]">{lead.source}</span>
                      {showSeller && (
                        <span className="text-muted-foreground/80 text-[11px]">
                          - {lead.seller.split("@")[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="hidden w-20 justify-center sm:flex">
                    <Badge variant="outline" className={`${status.text} border-current/20 bg-white/60 text-[10px]`}>
                      {status.label}
                    </Badge>
                  </div>

                  {/* Tiempo agonia - jerarquia alta */}
                  <div className={`flex w-16 shrink-0 items-center justify-end gap-1 font-mono text-sm font-semibold ${status.text}`}>
                    <Clock className="h-3.5 w-3.5" />
                    {formatAgony(lead.agonyMin)}
                  </div>

                  {/* Accion rapida solo en micro */}
                  {actionable && (
                    <button
                      className="bg-aura/10 text-aura hover:bg-aura/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                      aria-label="Contactar lead"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Progreso sutil */}
                <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-black/5">
                  <div className={`h-full ${status.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {leads.length === 0 && (
        <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
          <Activity className="h-6 w-6 opacity-40" />
          <span className="text-sm">Sin leads que coincidan</span>
        </div>
      )}
    </div>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="text-muted-foreground text-[11px]">{label}</span>
    </div>
  )
}
