"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Bot,
  HelpCircle,
  ListTodo,
  ArrowUpRight,
  Plus,
  Users,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { asistentesSeed, perfilesSeed } from "./config-types"
import type { AsistentePerfil, CapacidadId } from "./config-types"

interface CapacidadMeta {
  id: CapacidadId
  titulo: string
  descripcion: string
  icon: React.ReactNode
  color: string
  comingSoon?: boolean
}

const CAPACIDADES: CapacidadMeta[] = [
  { id: "resolver", titulo: "Resolver dudas", descripcion: "Responde preguntas dentro de su alcance", icon: <HelpCircle className="h-4 w-4" />, color: "#3b82f6" },
  { id: "tareas", titulo: "Tareas y alertas del dia", descripcion: "Resumen diario de pendientes", icon: <ListTodo className="h-4 w-4" />, color: "#22c55e" },
  { id: "escalar", titulo: "Escalar a otro usuario o perfil", descripcion: "Deriva cuando se cumple una condicion", icon: <ArrowUpRight className="h-4 w-4" />, color: "#ef4444", comingSoon: true },
]

const PERFILES_DISPONIBLES = perfilesSeed.map((p) => ({ id: p.id, nombre: p.rol }))

const capacidadVacia = () =>
  ({
    resolver: { enabled: true, reglas: { alcance: "Solo sus leads" } },
    alertas: { enabled: true, reglas: { canales: "In-app", severidad: "Media" } },
    tareas: { enabled: true, reglas: { hora: "08:00", incluye: "Pendientes del dia" } },
    escalar: { enabled: false, reglas: { destino: "—", condicion: "—" } },
  }) as AsistentePerfil["capacidades"]

export function ConfigAsistentes() {
  const [asistentes, setAsistentes] = useState<AsistentePerfil[]>(asistentesSeed)
  const [activeId, setActiveId] = useState<string>(asistentesSeed[0].perfilId)
  const [crearOpen, setCrearOpen] = useState(false)
  const [nuevoAgente, setNuevoAgente] = useState({
    nombre: "",
    tono: "cercano" as AsistentePerfil["tono"],
    perfilesAsignados: [] as string[],
  })

  const active = asistentes.find((a) => a.perfilId === activeId)!

  const update = (fn: (a: AsistentePerfil) => AsistentePerfil) =>
    setAsistentes((prev) => prev.map((a) => (a.perfilId === activeId ? fn(a) : a)))

  const toggleCap = (cap: CapacidadId) =>
    update((a) => ({
      ...a,
      capacidades: { ...a.capacidades, [cap]: { ...a.capacidades[cap], enabled: !a.capacidades[cap].enabled } },
    }))

  const setRegla = (cap: CapacidadId, key: string, value: string) =>
    update((a) => ({
      ...a,
      capacidades: { ...a.capacidades, [cap]: { ...a.capacidades[cap], reglas: { ...a.capacidades[cap].reglas, [key]: value } } },
    }))

  const togglePerfilActivo = (perfilId: string) =>
    update((a) => ({
      ...a,
      perfilesAsignados: a.perfilesAsignados.includes(perfilId)
        ? a.perfilesAsignados.filter((p) => p !== perfilId)
        : [...a.perfilesAsignados, perfilId],
    }))

  const togglePerfilNuevo = (perfilId: string) =>
    setNuevoAgente((p) => ({
      ...p,
      perfilesAsignados: p.perfilesAsignados.includes(perfilId)
        ? p.perfilesAsignados.filter((x) => x !== perfilId)
        : [...p.perfilesAsignados, perfilId],
    }))

  const crearAgente = () => {
    if (!nuevoAgente.nombre.trim()) {
      toast.error("Asigna un nombre al agente")
      return
    }
    if (nuevoAgente.perfilesAsignados.length === 0) {
      toast.error("Asigna al menos un perfil al agente")
      return
    }
    const id = `agente-${Date.now()}`
    const iniciales = nuevoAgente.nombre.trim().split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    setAsistentes((prev) => [
      ...prev,
      {
        perfilId: id,
        perfilNombre: nuevoAgente.nombre.trim(),
        perfilNivel: "micro",
        nombreAsistente: nuevoAgente.nombre.trim(),
        avatar: iniciales || "AG",
        tono: nuevoAgente.tono,
        perfilesAsignados: nuevoAgente.perfilesAsignados,
        capacidades: capacidadVacia(),
      },
    ])
    setActiveId(id)
    toast.success(`Agente "${nuevoAgente.nombre.trim()}" creado`)
    setNuevoAgente({ nombre: "", tono: "cercano", perfilesAsignados: [] })
    setCrearOpen(false)
  }

  const activeCount = CAPACIDADES.filter((c) => active.capacidades[c.id].enabled).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          Crea agentes (Jarvis) y asignales uno o varios perfiles. Activa capacidades y define sus reglas.
        </p>
        <Button onClick={() => setCrearOpen(true)} size="sm" className="bg-aura hover:bg-aura/90 text-white gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Nuevo agente
        </Button>
      </div>

      {/* Selector de agente */}
      <div className="flex flex-wrap gap-2">
        {asistentes.map((a) => (
          <button
            key={a.perfilId}
            onClick={() => setActiveId(a.perfilId)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
              activeId === a.perfilId ? "border-aura bg-aura/5 shadow-sm" : "border-border bg-white hover:border-aura/40"
            }`}
          >
            <div className="bg-aura/10 text-aura flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold">
              {a.avatar}
            </div>
            <div>
              <span className="text-foreground block text-xs font-semibold">{a.nombreAsistente}</span>
              <span className="text-muted-foreground block text-[10px]">
                {a.perfilesAsignados.length} perfil{a.perfilesAsignados.length === 1 ? "" : "es"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Identidad del agente */}
      <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-aura/10 flex h-9 w-9 items-center justify-center rounded-lg">
              <Bot className="text-aura h-5 w-5" />
            </div>
            <div>
              <h4 className="text-foreground text-sm font-semibold">Identidad del agente</h4>
              <p className="text-muted-foreground text-xs">Personalidad, nombre y perfiles asignados</p>
            </div>
          </div>
          <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
            {activeCount}/{CAPACIDADES.length} capacidades activas
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Nombre del agente</Label>
            <Input
              value={active.nombreAsistente}
              onChange={(e) => update((a) => ({ ...a, nombreAsistente: e.target.value }))}
              className="bg-secondary/40 h-9 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Tono / personalidad</Label>
            <Select value={active.tono} onValueChange={(v) => update((a) => ({ ...a, tono: v as AsistentePerfil["tono"] }))}>
              <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formal" className="text-sm">Formal</SelectItem>
                <SelectItem value="cercano" className="text-sm">Cercano</SelectItem>
                <SelectItem value="directo" className="text-sm">Directo</SelectItem>
                <SelectItem value="motivador" className="text-sm">Motivador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Perfiles asignados */}
        <div className="mt-4 flex flex-col gap-1.5">
          <Label className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
            <Users className="h-3 w-3" /> Perfiles asignados (uno o varios)
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {PERFILES_DISPONIBLES.map((p) => {
              const activo = active.perfilesAsignados.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePerfilActivo(p.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                    activo
                      ? "border-aura bg-aura/10 text-aura"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-aura/40"
                  }`}
                >
                  {activo && <Check className="h-3 w-3" />}
                  {p.nombre}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Capacidades con toggle + reglas */}
      <div className="flex flex-col gap-2.5">
        {CAPACIDADES.map((cap) => {
          const conf = active.capacidades[cap.id]
          return (
            <div key={cap.id} className={`border-border overflow-hidden rounded-xl border bg-white shadow-sm ${cap.comingSoon ? "opacity-80" : ""}`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: `${cap.color}1a`, color: cap.color }}
                  >
                    {cap.icon}
                  </div>
                  <div>
                    <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                      {cap.titulo}
                      {cap.comingSoon && (
                        <Badge variant="outline" className="border-aura/40 text-aura bg-aura/5 text-[10px] font-medium">
                          Proximamente
                        </Badge>
                      )}
                    </span>
                    <p className="text-muted-foreground text-xs">{cap.descripcion}</p>
                  </div>
                </div>
                {cap.comingSoon ? (
                  <span className="text-muted-foreground text-[11px] italic">No disponible</span>
                ) : (
                  <Switch checked={conf.enabled} onCheckedChange={() => toggleCap(cap.id)} />
                )}
              </div>

              <AnimatePresence initial={false}>
                {!cap.comingSoon && conf.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-border/50 bg-secondary/20 grid grid-cols-1 gap-3 border-t p-4 sm:grid-cols-2">
                      {renderReglas(cap.id, conf.reglas, setRegla)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Dialogo Nuevo agente */}
      <Dialog open={crearOpen} onOpenChange={setCrearOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Bot className="text-aura h-4 w-4" />
              Nuevo agente
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Crea un agente Jarvis y asignale uno o varios perfiles. Luego podras activar sus capacidades.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Nombre del agente</Label>
              <Input
                value={nuevoAgente.nombre}
                onChange={(e) => setNuevoAgente((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="ARIA Comercial"
                className="bg-secondary/40 h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Tono / personalidad</Label>
              <Select value={nuevoAgente.tono} onValueChange={(v) => setNuevoAgente((p) => ({ ...p, tono: v as AsistentePerfil["tono"] }))}>
                <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal" className="text-sm">Formal</SelectItem>
                  <SelectItem value="cercano" className="text-sm">Cercano</SelectItem>
                  <SelectItem value="directo" className="text-sm">Directo</SelectItem>
                  <SelectItem value="motivador" className="text-sm">Motivador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
                <Users className="h-3 w-3" /> Perfiles asignados
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PERFILES_DISPONIBLES.map((p) => {
                  const activo = nuevoAgente.perfilesAsignados.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePerfilNuevo(p.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                        activo
                          ? "border-aura bg-aura/10 text-aura"
                          : "border-border bg-secondary/30 text-muted-foreground hover:border-aura/40"
                      }`}
                    >
                      {activo && <Check className="h-3 w-3" />}
                      {p.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={crearAgente} className="bg-aura hover:bg-aura/90 text-white gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Crear agente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* Reglas especificas por capacidad */
function renderReglas(
  cap: CapacidadId,
  reglas: Record<string, string>,
  setRegla: (cap: CapacidadId, key: string, value: string) => void,
) {
  const F = ({ label, k, options }: { label: string; k: string; options?: string[] }) => (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{label}</Label>
      {options ? (
        <Select value={reglas[k]} onValueChange={(v) => setRegla(cap, k, v)}>
          <SelectTrigger className="bg-background h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input value={reglas[k] ?? ""} onChange={(e) => setRegla(cap, k, e.target.value)} className="bg-background h-8 text-xs" />
      )}
    </div>
  )

  switch (cap) {
    case "resolver":
      return <F label="Alcance de conocimiento" k="alcance" options={["Todo el ecosistema", "Su sucursal y equipo", "Solo sus leads"]} />
    case "alertas":
      return (
        <>
          <F label="Canales" k="canales" />
          <F label="Severidad minima" k="severidad" options={["Baja", "Media", "Alta", "Critica"]} />
        </>
      )
    case "tareas":
      return (
        <>
          <F label="Hora del resumen" k="hora" />
          <F label="Que incluye" k="incluye" />
        </>
      )
    case "escalar":
      return (
        <>
          <F label="Escalar a (usuario o perfil)" k="destino" options={["CEO / Junta Directiva", "Gerencia Comercial", "Asesor Comercial", "Gerente directo", "Junta Directiva"]} />
          <F label="Condicion de escalamiento" k="condicion" />
        </>
      )
    default:
      return null
  }
}
