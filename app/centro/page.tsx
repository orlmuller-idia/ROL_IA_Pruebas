"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import { didInternalNav } from "@/lib/nav-intent"
import { LoginScreen } from "@/components/login-screen"
import { HelpPanel } from "@/components/help-panel"
import { ProfileProvider } from "@/contexts/profile-context"
import { OnboardingProvider } from "@/contexts/onboarding-context"
import { DateRangeProvider } from "@/contexts/date-range-context"
import { ForecastProvider } from "@/contexts/forecast-context"
import { SpeechConfigProvider } from "@/contexts/speech-config-context"
import { VersionProvider } from "@/lib/versioning"
import { VersionSelector } from "@/components/version-selector"
import { ProfileSelector } from "@/components/profile-selector"
import { OnboardingToggle } from "@/components/onboarding-toggle"
import { JarvisAssistant } from "@/components/jarvis-assistant"
import { OnboardingTour } from "@/components/onboarding-tour"
import { ConfigCenter } from "@/components/config/config-center"
import { AppSidebar, type ActiveView } from "@/components/app-sidebar"
import { ChatHome } from "@/components/chat-home"
import { ReportView } from "@/components/report-view"

export default function Centro() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [view, setView] = useState<ActiveView>({ type: "home" })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  // Solo se llega legítimamente a /centro por el CTA del landing (navegación interna).
  // Un reload o un acceso directo reinician el flag → devolvemos al inicio (la sesión
  // vive en memoria y se pierde igual). Se calcula en el render inicial para que en
  // SSR/reload coincida la hidratación y no parpadee el login.
  const [redirecting] = useState(() => !didInternalNav())

  useEffect(() => {
    if (redirecting) router.replace("/")
  }, [redirecting, router])

  // Fondo neutro mientras se resuelve la redirección (evita parpadeo del login).
  if (redirecting) {
    return <div className="bg-background min-h-screen" />
  }

  return (
    <AnimatePresence mode="wait">
      {!authenticated ? (
        <motion.div key="login" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
          <LoginScreen onAuthenticated={() => setAuthenticated(true)} />
        </motion.div>
      ) : (
        <ProfileProvider>
          <OnboardingProvider>
            <VersionProvider>
            <DateRangeProvider>
            <ForecastProvider>
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-background text-foreground flex h-screen overflow-hidden"
            >
              {/* Sidebar izquierdo con menus desplegables + onboarding */}
              <AppSidebar
                active={view}
                onNavigate={setView}
                mobileOpen={mobileNavOpen}
                onMobileClose={() => setMobileNavOpen(false)}
              />

              {/* Columna principal */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Topbar */}
                <header className="border-border bg-card/80 sticky top-0 z-40 flex items-center justify-between gap-2 border-b px-3 py-2.5 backdrop-blur-xl sm:px-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      onClick={() => setMobileNavOpen(true)}
                      className="hover:bg-muted rounded-lg p-2 lg:hidden"
                      aria-label="Abrir menu"
                    >
                      <Menu className="text-muted-foreground h-5 w-5" />
                    </button>
                    <span className="text-muted-foreground truncate text-[11px] font-medium">
                      {view.type === "home"
                        ? "Inicio · Conversacion con tu agente"
                        : view.type === "config"
                          ? "Configuracion del sistema"
                          : "Reporte de inteligencia"}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <OnboardingToggle />
                    <div className="bg-border hidden h-6 w-px sm:block" />
                    <VersionSelector />
                    <div className="bg-border hidden h-6 w-px sm:block" />
                    <ProfileSelector />
                    <div className="bg-border hidden h-6 w-px sm:block" />
                    <HelpPanel />
                  </div>
                </header>

                {/* Contenido */}
                <main className="flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {view.type === "home" && <ChatHome key="home" onNavigate={setView} />}
                    {view.type === "report" && <ReportView key={view.id} id={view.id} onNavigate={setView} />}
                    {view.type === "config" && (
                      <motion.div
                        key="config"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6"
                      >
                        <ConfigCenter />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>

              {/* Asistente flotante */}
              <JarvisAssistant />

              {/* Paseo guiado por el sistema (modo explicativo) */}
              <OnboardingTour onNavigate={setView} />
            </motion.div>
            </ForecastProvider>
            </DateRangeProvider>
            </VersionProvider>
          </OnboardingProvider>
        </ProfileProvider>
      )}
    </AnimatePresence>
  )
}
