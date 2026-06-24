"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Network,
  MapPin,
  Users,
  User,
  IdCard,
  Bot,
  Search,
  ChevronRight,
  SlidersHorizontal,
  Bell,
  Tag,
} from "lucide-react"
import { ConfigEmpresa } from "./config-empresa"
import { ConfigGrupo } from "./config-grupo"
import { ConfigSucursales } from "./config-sucursales"
import { ConfigLineas } from "./config-lineas"
import { ConfigUsuarios } from "./config-usuarios"
import { ConfigAsistentes } from "./config-asistentes"
import { ConfigPerfiles } from "./config-perfiles"
import { ConfigNotificaciones } from "./config-notificaciones"
import { ConfigStoreProvider } from "./config-store"

type SectionId =
  | "empresa"
  | "grupo"
  | "sucursales"
  | "lineas"
  | "usuarios"
  | "grupos"
  | "perfiles"
  | "asistentes"
  | "notificaciones"

interface SectionDef {
  id: SectionId
  label: string
  icon: React.ReactNode
  description: string
  grupo: string
  jerarquia: number
  badge?: string
}

const SECTIONS: SectionDef[] = [
  { id: "empresa", label: "Empresas", icon: <Building2 className="h-4 w-4" />, description: "Crea y administra las empresas del grupo: identidad, zona horaria y moneda base.", grupo: "Organizacion", jerarquia: 0 },
  { id: "grupo", label: "Grupo y Facturacion", icon: <Network className="h-4 w-4" />, description: "Define que empresas integran el grupo y su esquema de facturacion (consolidada o por empresa).", grupo: "Organizacion", jerarquia: 1 },
  { id: "sucursales", label: "Sucursales", icon: <MapPin className="h-4 w-4" />, description: "Pais, ciudad, idioma, moneda y boveda de seguridad por sede, asignada a su empresa.", grupo: "Organizacion", jerarquia: 2 },
  { id: "lineas", label: "Lineas de producto", icon: <Tag className="h-4 w-4" />, description: "Lineas de producto por empresa; se asignan a las sucursales al crearlas.", grupo: "Organizacion", jerarquia: 3 },
  { id: "usuarios", label: "Usuarios", icon: <User className="h-4 w-4" />, description: "Usuarios y sus accesos a empresas, sucursales y lineas de producto.", grupo: "Personas", jerarquia: 2 },
  { id: "grupos", label: "Grupos", icon: <Users className="h-4 w-4" />, description: "Grupos que asignan lineas de producto a varios usuarios a la vez.", grupo: "Personas", jerarquia: 3 },
  { id: "perfiles", label: "Perfiles", icon: <IdCard className="h-4 w-4" />, description: "Perfiles de gobernanza Global / Equipo / Personal.", grupo: "Personas", jerarquia: 4 },
  { id: "asistentes", label: "Asistentes (Jarvis)", icon: <Bot className="h-4 w-4" />, description: "Un asistente IA por perfil, con capacidades y reglas configurables.", grupo: "Personas", jerarquia: 5, badge: "IA" },
  { id: "notificaciones", label: "Notificaciones e Integraciones", icon: <Bell className="h-4 w-4" />, description: "Canales por donde Rol te avisa (email, WhatsApp, Slack, Teams) e integraciones a medida segun tu plan.", grupo: "Organizacion", jerarquia: 3 },
]

const GRUPOS = ["Organizacion", "Personas"]

// Acento visual por grupo de configuracion
const GRUPO_ACCENT: Record<string, { bg: string; text: string; dot: string }> = {
  Organizacion: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  Personas: { bg: "bg-aura/10", text: "text-aura", dot: "bg-aura" },
}

export function ConfigCenter() {
  const [active, setActive] = useState<SectionId>("empresa")
  const [query, setQuery] = useState("")

  const filtered = SECTIONS.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()))
  const activeSection = SECTIONS.find((s) => s.id === active)!
  const activeAccent = GRUPO_ACCENT[activeSection.grupo]

  return (
    <ConfigStoreProvider>
      <div className="border-border flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm lg:flex-row">
        {/* Menu lateral */}
        <aside className="border-border from-muted/50 to-muted/20 flex shrink-0 flex-col gap-3 border-b bg-gradient-to-b p-4 lg:w-72 lg:border-b-0 lg:border-r">
          {/* Encabezado del panel de configuracion */}
          <div className="hidden items-center gap-2.5 px-1 pb-1 lg:flex">
            <div className="bg-aura/10 text-aura flex h-9 w-9 items-center justify-center rounded-xl">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-sm font-semibold leading-none">Configuracion</span>
              <span className="text-muted-foreground text-[10px] leading-tight">Centro de control del sistema</span>
            </div>
          </div>

          <div className="relative">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ajuste..."
              className="bg-background h-9 pl-8 text-xs"
            />
          </div>

          {/* movil: scroll horizontal de chips; desktop: lista agrupada */}
          <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {GRUPOS.map((grupo) => {
              const items = filtered.filter((s) => s.grupo === grupo)
              if (items.length === 0) return null
              const gc = GRUPO_ACCENT[grupo]
              return (
                <div key={grupo} className="flex shrink-0 gap-1.5 lg:mt-4 lg:flex-col lg:gap-1 lg:first:mt-1">
                  <span className="text-muted-foreground hidden items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider lg:flex">
                    <span className={`h-1.5 w-1.5 rounded-full ${gc.dot}`} />
                    {grupo}
                  </span>
                  {items.map((s) => {
                    const isActive = active === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs font-medium transition-all ${
                          isActive
                            ? "bg-card text-foreground shadow-sm ring-border/60 ring-1"
                            : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                        }`}
                      >
                        {/* Barra de acento activa (solo desktop) */}
                        {isActive && (
                          <span className="bg-aura absolute -left-0 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full lg:block" />
                        )}
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            isActive ? `${gc.bg} ${gc.text}` : "bg-muted text-muted-foreground group-hover:bg-card"
                          }`}
                        >
                          {s.icon}
                        </span>
                        <span className="whitespace-nowrap">{s.label}</span>
                        {s.badge && (
                          <Badge variant="outline" className="border-aura/30 text-aura ml-auto hidden text-[9px] lg:inline-flex">
                            {s.badge}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Panel de detalle */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-border from-card to-muted/20 flex items-center gap-3 border-b bg-gradient-to-r px-5 py-4 sm:px-6">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${activeAccent.bg} ${activeAccent.text}`}>
              {activeSection.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                Configuracion
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground font-medium">{activeSection.label}</span>
              </div>
              <p className="text-muted-foreground truncate text-xs">{activeSection.description}</p>
            </div>
          </div>

          <div className="min-h-[420px] p-5 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                {active === "empresa" && <ConfigEmpresa />}
                {active === "grupo" && <ConfigGrupo />}
                {active === "sucursales" && <ConfigSucursales />}
                {active === "lineas" && <ConfigLineas />}
                {active === "usuarios" && <ConfigUsuarios soloVista="usuarios" />}
                {active === "grupos" && <ConfigUsuarios soloVista="grupos" />}
                {active === "perfiles" && <ConfigPerfiles />}
                {active === "asistentes" && <ConfigAsistentes />}
                {active === "notificaciones" && <ConfigNotificaciones />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ConfigStoreProvider>
  )
}
