"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CalendarCheck,
  Clock,
  PhoneCall,
  Video,
  CheckCircle2,
  CloudOff,
  Cloud,
  User,
  ChevronDown,
  CalendarClock,
} from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import type { ProfileLevel } from "@/contexts/profile-context"
import { ReportViewToggle } from "@/components/report-view-toggle"

/**
 * Agenda en Vivo
 * Reporte descriptivo de citas agendadas y estado de sincronizacion con el CRM.
 * Se mantiene como componente visual (mas rapido para escanear) y se adapta por nivel:
 *  - macro: KPIs de agenda consolidada (tasa confirmacion, sincronizacion).
 *  - meso: agenda agrupada por asesor del equipo.
 *  - micro: las citas del asesor + estado de sincronizacion individual.
 */

type ApptStatus = "confirmada" | "pendiente" | "en-curso"

interface Appt {
  id: string
  lead: string
  phone: string
  time: string
  channel: "voz" | "whatsapp"
  status: ApptStatus
  seller: string
  synced: boolean
}

const SELLERS = ["Ricardo Quiroga", "Oscar Puentes", "Viviana Comercial", "Soporte"]

const BASE: Appt[] = [
  { id: "C-001", lead: "Orlando Restrepo", phone: "+573058170043", time: "10:30", channel: "voz", status: "confirmada", seller: "Ricardo Quiroga", synced: true },
  { id: "C-002", lead: "Maria Lopez Vega", phone: "+573008619763", time: "11:00", channel: "whatsapp", status: "en-curso", seller: "Ricardo Quiroga", synced: false },
  { id: "C-003", lead: "Juan Ruiz Mesa", phone: "+573183349419", time: "11:45", channel: "voz", status: "pendiente", seller: "Oscar Puentes", synced: true },
  { id: "C-004", lead: "Sofia Diaz Toro", phone: "+573107488199", time: "14:00", channel: "voz", status: "pendiente", seller: "Oscar Puentes", synced: false },
  { id: "C-005", lead: "Luis Torres Arango", phone: "+573166918033", time: "15:30", channel: "whatsapp", status: "pendiente", seller: "Viviana Comercial", synced: true },
  { id: "C-006", lead: "Camila Zapata", phone: "+573009988776", time: "16:15", channel: "voz", status: "confirmada", seller: "Viviana Comercial", synced: true },
  { id: "C-007", lead: "Andres Marin", phone: "+573145566778", time: "17:00", channel: "whatsapp", status: "pendiente", seller: "Soporte", synced: false },
]

const statusConfig: Record<ApptStatus, { label: string; dot: string; text: string; soft: string }> = {
  confirmada: { label: "Confirmada", dot: "bg-emerald-500", text: "text-emerald-600", soft: "bg-emerald-50 border-emerald-200" },
  "en-curso": { label: "En curso", dot: "bg-amber-500", text: "text-amber-600", soft: "bg-amber-50 border-amber-200" },
  pendiente: { label: "Pendiente", dot: "bg-slate-400", text: "text-slate-500", soft: "bg-muted/40 border-border" },
}

export function IntelScheduling() {
  const { currentProfile } = useProfile()
  const [viewOverride, setViewOverride] = useState<ProfileLevel | null>(null)
  const level = viewOverride ?? currentProfile.level
  const [appts, setAppts] = useState<Appt[]>(BASE)

  // Simulacion: confirma y sincroniza citas con el tiempo
  useEffect(() => {
    const id = setInterval(() => {
      setAppts((prev) =>
        prev.map((a) => {
          if (a.status === "pendiente" && Math.random() > 0.85) {
            return { ...a, status: "confirmada" }
          }
          if (!a.synced && Math.random() > 0.9) {
            return { ...a, synced: true }
          }
          return a
        })
      )
    }, 5000)
    return () => clearInterval(id)
  }, [])

  const myName = SELLERS[0]
  const scoped = level === "micro" ? appts.filter((a) => a.seller === myName) : appts

  const confirmed = scoped.filter((a) => a.status === "confirmada").length
  const synced = scoped.filter((a) => a.synced).length

  return (
    <Card className="border-border bg-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
              <CalendarCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-foreground text-base font-semibold">Agenda en Vivo</h3>
              <p className="text-muted-foreground text-xs">
                {level === "macro"
                  ? "Estado consolidado de citas"
                  : level === "meso"
                  ? "Agenda por asesor del equipo"
                  : "Tus citas de hoy"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ReportViewToggle value={level} onChange={setViewOverride} />
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 font-mono">
              {confirmed}/{scoped.length} confirmadas
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {level === "macro" && (
          <MacroAgenda appts={appts} confirmed={appts.filter((a) => a.status === "confirmada").length} synced={appts.filter((a) => a.synced).length} />
        )}
        {level === "meso" && <MesoAgenda appts={appts} />}
        {level === "micro" && <MicroAgenda appts={scoped} synced={synced} />}
      </CardContent>
    </Card>
  )
}

/* ───────────────────────── MACRO ───────────────────────── */
function MacroAgenda({ appts, confirmed, synced }: { appts: Appt[]; confirmed: number; synced: number }) {
  const total = appts.length
  const confirmRate = Math.round((confirmed / total) * 100)
  const syncRate = Math.round((synced / total) * 100)
  const pending = appts.filter((a) => a.status === "pendiente").length

  const kpis = [
    { label: "Tasa de confirmacion", value: `${confirmRate}%`, tone: "text-emerald-600", bg: "bg-emerald-50", sub: `${confirmed} de ${total} citas` },
    { label: "Sincronizadas con CRM", value: `${syncRate}%`, tone: "text-aura", bg: "bg-aura/10", sub: `${total - synced} sin sincronizar` },
    { label: "Pendientes por confirmar", value: String(pending), tone: "text-amber-600", bg: "bg-amber-50", sub: "requieren gestion G7" },
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
                <CalendarClock className={`h-3.5 w-3.5 ${k.tone}`} />
              </div>
            </div>
            <span className={`text-2xl font-semibold tracking-tight ${k.tone}`}>{k.value}</span>
            <span className="text-muted-foreground text-[11px]">{k.sub}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-aura/15 bg-aura/5 p-3">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-aura" />
        <p className="text-muted-foreground text-xs leading-relaxed">
          G7 confirma citas via WhatsApp + correo y sincroniza Google Calendar automaticamente. El
          detalle por asesor y cita esta en los perfiles de Gerencia y Asesor.
        </p>
      </div>
    </div>
  )
}

/* ───────────────────────── MESO ───────────────────────── */
function MesoAgenda({ appts }: { appts: Appt[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Appt[]>()
    appts.forEach((a) => {
      const arr = map.get(a.seller) ?? []
      arr.push(a)
      map.set(a.seller, arr)
    })
    return Array.from(map.entries())
  }, [appts])

  return (
    <div className="flex flex-col gap-3">
      {grouped.map(([seller, list]) => {
        const confirmed = list.filter((a) => a.status === "confirmada").length
        const unsynced = list.filter((a) => !a.synced).length
        return (
          <SellerGroup key={seller} seller={seller} list={list} confirmed={confirmed} unsynced={unsynced} />
        )
      })}
    </div>
  )
}

function SellerGroup({ seller, list, confirmed, unsynced }: { seller: string; list: Appt[]; confirmed: number; unsynced: number }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-border overflow-hidden rounded-xl border bg-muted/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
      >
        <div className="flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-7 w-7 items-center justify-center rounded-lg">
            <User className="text-aura h-3.5 w-3.5" />
          </div>
          <span className="text-foreground text-sm font-medium">{seller}</span>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-600 text-[10px]">
            {confirmed}/{list.length}
          </Badge>
          {unsynced > 0 && (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600 text-[10px]">
              {unsynced} sin sincronizar
            </Badge>
          )}
        </div>
        <ChevronDown className={`text-muted-foreground h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-1.5 px-3 pb-3"
          >
            {list.map((a) => (
              <ApptRow key={a.id} appt={a} compact />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────── MICRO ───────────────────────── */
function MicroAgenda({ appts, synced }: { appts: Appt[]; synced: number }) {
  const unsynced = appts.length - synced
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-emerald-50 p-3">
          <span className="text-emerald-600 text-xl font-semibold">
            {appts.filter((a) => a.status === "confirmada").length}
          </span>
          <span className="text-muted-foreground text-[11px]">Confirmadas</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-muted/30 p-3">
          <span className="text-foreground text-xl font-semibold">{appts.length}</span>
          <span className="text-muted-foreground text-[11px]">Total hoy</span>
        </div>
        <div className="border-border flex flex-col gap-1 rounded-xl border bg-red-50 p-3">
          <span className="text-red-600 text-xl font-semibold">{unsynced}</span>
          <span className="text-muted-foreground text-[11px]">Sin sincronizar</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {appts.map((a) => (
          <ApptRow key={a.id} appt={a} />
        ))}
        {appts.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-center">
            <CalendarCheck className="h-6 w-6 opacity-40" />
            <span className="text-sm">No tienes citas agendadas</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ───────────────────────── FILA DE CITA ───────────────────────── */
function ApptRow({ appt, compact = false }: { appt: Appt; compact?: boolean }) {
  const cfg = statusConfig[appt.status]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 rounded-lg border px-3.5 py-3 ${cfg.soft}`}
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${cfg.dot}`} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-foreground truncate text-sm font-medium">{appt.lead}</span>
        <div className="text-muted-foreground flex items-center gap-2 text-[11px]">
          {appt.channel === "voz" ? <PhoneCall className="h-3 w-3" /> : <Video className="h-3 w-3" />}
          <span>{appt.phone}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {appt.time}
          </span>
        </div>
      </div>

      {!compact && (
        <Badge variant="outline" className={`${cfg.text} border-current/20 bg-white/60 text-[10px]`}>
          {cfg.label}
        </Badge>
      )}

      {/* Estado de sincronizacion */}
      <div className={`flex shrink-0 items-center gap-1.5 text-[11px] font-medium ${appt.synced ? "text-emerald-600" : "text-red-600"}`}>
        {appt.synced ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
        <span className="hidden sm:inline">{appt.synced ? "Sincronizado" : "Sin sincronizar"}</span>
      </div>
    </motion.div>
  )
}
