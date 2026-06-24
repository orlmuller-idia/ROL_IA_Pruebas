"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Home, Settings, Sparkles, PanelLeftClose, PanelLeft, Lock, X, Compass } from "lucide-react"
import { REPORT_SECTIONS, accentClasses } from "@/lib/navigation"
import { OnboardingGuide } from "@/components/onboarding-guide"
import { HelpPanel } from "@/components/help-panel"
import { RolIcon } from "@/components/rol-logo"
import { useProfile } from "@/contexts/profile-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { AGENTS } from "@/lib/navigation"
import { useVersion, isReportAvailable, reportRequiredTier, VERSIONS } from "@/lib/versioning"

export type ActiveView = { type: "home" } | { type: "report"; id: string } | { type: "config" }

/* Marcador visual que senala "estas aqui" durante el paseo guiado */
function TourMarker() {
  return (
    <span className="relative ml-auto flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
      <span className="bg-aura absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
      <span className="bg-aura relative inline-flex h-2.5 w-2.5 rounded-full" />
    </span>
  )
}

interface AppSidebarProps {
  active: ActiveView
  onNavigate: (view: ActiveView) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function SectionGroup({
  section,
  active,
  onNavigate,
  defaultOpen,
}: {
  section: (typeof REPORT_SECTIONS)[number]
  active: ActiveView
  onNavigate: (view: ActiveView) => void
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const { version } = useVersion()
  const { tourActive } = useOnboarding()
  const SectionIcon = section.icon
  const ac = accentClasses(section.accent)

  // Si el tour navega a un reporte de esta seccion, la abrimos para que se vea resaltado
  const containsActive = active.type === "report" && section.reports.some((r) => r.id === active.id)
  const isOpen = open || (tourActive && containsActive)

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen((o) => !o)}
        className="hover:bg-muted/60 group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
      >
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ac.bg}`}>
          <SectionIcon className={`h-3.5 w-3.5 ${ac.text}`} />
        </div>
        <span className="text-foreground flex-1 text-left text-[12px] font-semibold tracking-tight">
          {section.title}
        </span>
        <ChevronRight
          className={`text-muted-foreground h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-3.5 flex flex-col gap-0.5 border-l border-border/60 pl-2 pt-0.5">
              {section.reports.map((r) => {
                const isActive = active.type === "report" && active.id === r.id
                const ItemIcon = r.icon
                const rac = accentClasses(r.accent)
                const available = isReportAvailable(r.id, version)
                const reqTier = reportRequiredTier(r.id)
                if (!available) {
                  return (
                    <button
                      key={r.id}
                      onClick={() => onNavigate({ type: "report", id: r.id })}
                      className="group flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-muted-foreground/60 transition-colors hover:bg-muted/40"
                      title={`Disponible en Rol ${VERSIONS[reqTier].name}`}
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-[11.5px] leading-tight line-through decoration-muted-foreground/40">
                        {r.title}
                      </span>
                      <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                        {VERSIONS[reqTier].name}
                      </span>
                    </button>
                  )
                }
                return (
                  <button
                    key={r.id}
                    onClick={() => onNavigate({ type: "report", id: r.id })}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
                      isActive ? `${rac.bg} ${rac.text} font-medium` : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    } ${tourActive && isActive ? "ring-aura ring-offset-card ring-2 ring-offset-1" : ""}`}
                  >
                    <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11.5px] leading-tight">{r.title}</span>
                    {tourActive && isActive && <TourMarker />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AppSidebar({ active, onNavigate, mobileOpen = false, onMobileClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { currentProfile } = useProfile()
  const { meta: versionMeta } = useVersion()
  const { tourActive } = useOnboarding()
  const agent = AGENTS[currentProfile.level]
  const AgentIcon = agent.icon

  // Al navegar desde el drawer movil, cerrarlo automaticamente
  const handleNavigate = (view: ActiveView) => {
    onNavigate(view)
    onMobileClose?.()
  }

  if (collapsed) {
    return (
      <aside className="border-border bg-card hidden w-14 shrink-0 flex-col items-center gap-3 border-r py-4 lg:flex">
        <button onClick={() => setCollapsed(false)} className="hover:bg-muted rounded-lg p-2" aria-label="Expandir menu">
          <PanelLeft className="text-muted-foreground h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate({ type: "home" })}
          className={`rounded-lg p-2 ${active.type === "home" ? "bg-aura/10 text-aura" : "text-muted-foreground hover:bg-muted"}`}
          aria-label="Inicio"
        >
          <Home className="h-4 w-4" />
        </button>
        {REPORT_SECTIONS.map((s) => {
          const Icon = s.icon
          const ac = accentClasses(s.accent)
          return (
            <button
              key={s.id}
              onClick={() => onNavigate({ type: "report", id: s.reports[0].id })}
              className={`rounded-lg p-2 ${ac.text} hover:bg-muted`}
              aria-label={s.title}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </aside>
    )
  }

  return (
    <>
      {/* Overlay movil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`border-border bg-card flex w-72 max-w-[85vw] shrink-0 flex-col border-r transition-transform duration-300 ${
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 translate-x-0 shadow-2xl lg:static lg:shadow-none"
            : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:static lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <RolIcon size={26} animate={false} />
            <div className="flex flex-col gap-2.5">
              <span className="text-foreground text-sm font-semibold leading-none">Rol.IA</span>
              <span className="text-muted-foreground text-[10px] leading-tight">Centro de Comando</span>
              <span className="bg-aura/10 text-aura inline-flex w-fit items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                {versionMeta.name}
              </span>
            </div>
          </div>
          {/* Cerrar en movil */}
          <button onClick={onMobileClose} className="hover:bg-muted rounded-lg p-1.5 lg:hidden" aria-label="Cerrar menu">
            <X className="text-muted-foreground h-4 w-4" />
          </button>
          {/* Colapsar en escritorio */}
          <button onClick={() => setCollapsed(true)} className="hover:bg-muted hidden rounded-lg p-1.5 lg:block" aria-label="Colapsar menu">
            <PanelLeftClose className="text-muted-foreground h-4 w-4" />
          </button>
        </div>

        {/* Scrollable nav */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Inicio (chat) */}
          <button
            onClick={() => handleNavigate({ type: "home" })}
            className={`mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
              active.type === "home" ? "bg-aura/10 text-aura font-medium" : "text-foreground hover:bg-muted/60"
            } ${tourActive && active.type === "home" ? "ring-aura ring-offset-card ring-2 ring-offset-1" : ""}`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${active.type === "home" ? "bg-aura/15" : "bg-muted"}`}>
              <Sparkles className={`h-3.5 w-3.5 ${active.type === "home" ? "text-aura" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[12px] font-semibold tracking-tight">Inicio · Chat con Rol</span>
            {tourActive && active.type === "home" && <TourMarker />}
          </button>

          <div className="my-2 px-2.5">
            <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
              Inteligencia
            </span>
          </div>

          <div className="flex flex-col gap-0.5">
            {REPORT_SECTIONS.map((section, i) => (
              <SectionGroup
                key={section.id}
                section={section}
                active={active}
                onNavigate={handleNavigate}
                defaultOpen={i === 0}
              />
            ))}
          </div>

          <div className="my-2 px-2.5 pt-2">
            <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">Sistema</span>
          </div>
          <button
            onClick={() => handleNavigate({ type: "config" })}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
              active.type === "config" ? "bg-aura/10 text-aura font-medium" : "text-foreground hover:bg-muted/60"
            } ${tourActive && active.type === "config" ? "ring-aura ring-offset-card ring-2 ring-offset-1" : ""}`}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-md ${active.type === "config" ? "bg-aura/15" : "bg-muted"}`}>
              <Settings className={`h-3.5 w-3.5 ${active.type === "config" ? "text-aura" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[12px] font-semibold tracking-tight">Configuracion</span>
            {tourActive && active.type === "config" && <TourMarker />}
          </button>
        </div>

        {/* Onboarding + guia navegable + agente activo */}
        <div className="border-border flex flex-col gap-2.5 border-t p-3">
          <OnboardingGuide />

          {/* Guia de uso navegable: estructura y navegacion del producto */}
          <HelpPanel
            trigger={
              <button className="border-border bg-card hover:bg-muted/60 hover:border-info/30 group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors">
                <div className="bg-info/10 text-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                  <Compass className="h-4 w-4" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-foreground text-xs font-semibold">Guia de uso</span>
                  <span className="text-muted-foreground text-[11px] leading-tight">Estructura y navegacion del sistema</span>
                </div>
                <ChevronRight className="text-muted-foreground group-hover:text-info h-4 w-4" />
              </button>
            }
          />
          <div className="bg-muted/50 flex items-center gap-2.5 rounded-xl p-2.5">
            <div className="bg-aura/15 text-aura flex h-8 w-8 items-center justify-center rounded-lg">
              <AgentIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-[11.5px] font-semibold leading-tight">{agent.name}</span>
              <span className="text-muted-foreground text-[10px] leading-tight">{agent.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
