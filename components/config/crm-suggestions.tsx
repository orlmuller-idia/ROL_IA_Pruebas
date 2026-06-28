"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Plus,
  X,
  Check,
  Database,
  UserPlus,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

export type CrmSugerenciaUsuario = {
  id: string
  nombre: string
  rol: string
  email: string
  // pista de mapeo: como viene del CRM
  origenCrm: string
}

export type CrmSugerenciaGrupo = {
  id: string
  nombre: string
  descripcion: string
  miembrosCrm: number
  origenCrm: string
}

// Vendedores detectados en el CRM conectado (mapeo sugerido, NO obligatorio)
const VENDEDORES_CRM: CrmSugerenciaUsuario[] = [
  { id: "crm-u1", nombre: "Laura Gimenez", rol: "Asesor Comercial", email: "laura.gimenez@grupoandina.com", origenCrm: "HubSpot · Equipo Bogota" },
  { id: "crm-u2", nombre: "Andres Patino", rol: "Asesor Comercial", email: "andres.patino@grupoandina.com", origenCrm: "HubSpot · Equipo Bogota" },
  { id: "crm-u3", nombre: "Mariana Ruiz", rol: "Lider de Ventas", email: "mariana.ruiz@grupoandina.com", origenCrm: "HubSpot · Equipo Medellin" },
  { id: "crm-u4", nombre: "Felipe Castano", rol: "Asesor Comercial", email: "felipe.castano@grupoandina.com", origenCrm: "HubSpot · Equipo Medellin" },
]

// Equipos del CRM que pueden convertirse en grupos
const EQUIPOS_CRM: CrmSugerenciaGrupo[] = [
  { id: "crm-g1", nombre: "Equipo Bogota", descripcion: "Pipeline B2C - Linea Premium", miembrosCrm: 6, origenCrm: "HubSpot" },
  { id: "crm-g2", nombre: "Equipo Medellin", descripcion: "Pipeline B2B - Linea Corporativa", miembrosCrm: 4, origenCrm: "HubSpot" },
]

type Props = {
  vista: "usuarios" | "grupos"
  onConvertirUsuario?: (u: CrmSugerenciaUsuario) => void
  onConvertirGrupo?: (g: CrmSugerenciaGrupo) => void
}

export function CrmSuggestions({ vista, onConvertirUsuario, onConvertirGrupo }: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [open, setOpen] = useState(true)
  const [importadosU, setImportadosU] = useState<string[]>([])
  const [importadosG, setImportadosG] = useState<string[]>([])
  const [ocultosU, setOcultosU] = useState<string[]>([])
  const [ocultosG, setOcultosG] = useState<string[]>([])

  if (dismissed) return null

  const usuariosPendientes = VENDEDORES_CRM.filter((u) => !ocultosU.includes(u.id))
  const gruposPendientes = EQUIPOS_CRM.filter((g) => !ocultosG.includes(g.id))
  const pendientes = vista === "usuarios" ? usuariosPendientes.length : gruposPendientes.length

  if (pendientes === 0) return null

  const convertirU = (u: CrmSugerenciaUsuario) => {
    onConvertirUsuario?.(u)
    setImportadosU((p) => [...p, u.id])
    setTimeout(() => setOcultosU((p) => [...p, u.id]), 600)
  }
  const convertirG = (g: CrmSugerenciaGrupo) => {
    onConvertirGrupo?.(g)
    setImportadosG((p) => [...p, g.id])
    setTimeout(() => setOcultosG((p) => [...p, g.id]), 600)
  }

  return (
    <div className="border-aura/30 from-aura/5 overflow-hidden rounded-xl border bg-gradient-to-r to-transparent">
      {/* Encabezado */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="bg-aura/15 text-aura flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Database className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-foreground text-sm font-semibold">Sugerencias desde tu CRM</span>
            <Badge variant="outline" className="border-aura/30 text-aura gap-0.5 text-[9px]">
              <Sparkles className="h-2.5 w-2.5" /> {pendientes} sin importar
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            {vista === "usuarios"
              ? "Detectamos vendedores en tu CRM. Conviertelos en usuarios cuando quieras; es opcional."
              : "Detectamos equipos en tu CRM. Replicalos como grupos si te sirve; no es obligatorio."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-muted-foreground hover:bg-aura/10 hover:text-foreground rounded-md p-1.5 transition-colors"
            aria-label={open ? "Contraer sugerencias" : "Expandir sugerencias"}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:bg-aura/10 hover:text-foreground rounded-md p-1.5 transition-colors"
            aria-label="Descartar sugerencias"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 px-4 pb-4">
              {vista === "usuarios" &&
                usuariosPendientes.map((u) => {
                  const hecho = importadosU.includes(u.id)
                  return (
                    <motion.div
                      key={u.id}
                      layout
                      exit={{ opacity: 0, x: -12 }}
                      className="border-border/60 flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5"
                    >
                      <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold">
                        {u.nombre.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">{u.nombre}</p>
                        <p className="text-muted-foreground truncate text-[11px]">
                          {u.rol} · {u.origenCrm}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={hecho ? "outline" : "default"}
                        disabled={hecho}
                        onClick={() => convertirU(u)}
                        className={
                          hecho
                            ? "border-rescue/40 text-rescue gap-1 text-xs"
                            : "bg-aura hover:bg-aura/90 text-white gap-1 text-xs"
                        }
                      >
                        {hecho ? <Check className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                        {hecho ? "Creado" : "Convertir"}
                      </Button>
                    </motion.div>
                  )
                })}

              {vista === "grupos" &&
                gruposPendientes.map((g) => {
                  const hecho = importadosG.includes(g.id)
                  return (
                    <motion.div
                      key={g.id}
                      layout
                      exit={{ opacity: 0, x: -12 }}
                      className="border-border/60 flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5"
                    >
                      <div className="bg-aura/10 text-aura flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">{g.nombre}</p>
                        <p className="text-muted-foreground truncate text-[11px]">
                          {g.descripcion} · {g.miembrosCrm} miembros en {g.origenCrm}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={hecho ? "outline" : "default"}
                        disabled={hecho}
                        onClick={() => convertirG(g)}
                        className={
                          hecho
                            ? "border-rescue/40 text-rescue gap-1 text-xs"
                            : "bg-aura hover:bg-aura/90 text-white gap-1 text-xs"
                        }
                      >
                        {hecho ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        {hecho ? "Creado" : "Crear grupo"}
                      </Button>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
