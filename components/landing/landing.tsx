"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  Timer,
  Megaphone,
  PenTool,
  TrendingUp,
  Search,
  Rocket,
  CalendarCheck,
  Eye,
  Shield,
  Sparkles,
  Check,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RolLogo, RolIcon } from "@/components/rol-logo"
import { GuardianOrbital } from "@/components/landing/guardian-orbital"
import { markInternalNav } from "@/lib/nav-intent"

const BRAND_GRADIENT = "linear-gradient(90deg, #f97316 0%, #ec4899 50%, #7c3aed 100%)"

/* Ruta del demo (centro de comando) — destino de los CTA en este proyecto de diseño */
const APP_ROUTE = "/centro"

/* ───────────────────────── helpers ───────────────────────── */

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

function IdiaLogo({ className = "h-4", plate = false }: { className?: string; plate?: boolean }) {
  return (
    <span className={plate ? "inline-flex items-center rounded-md bg-white px-2 py-1" : "inline-flex items-center"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/idia-logo.png"
        alt="IDIA — Intelligent Data & Interactive Automation"
        className={`w-auto select-none ${className}`}
        draggable={false}
      />
    </span>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em]">
      <span className="h-px w-6" style={{ background: BRAND_GRADIENT }} />
      {children}
    </span>
  )
}

/* ───────────────────────── data ───────────────────────── */

type GuardianCard = {
  code: string
  name: string
  solves: string
  accent: string
  icon: LucideIcon
}

const GUARDIANS: GuardianCard[] = [
  { code: "G1", name: "Proceso de Ventas", accent: "#6366f1", icon: Timer, solves: "Vigila los tiempos de respuesta y el SLA de cada lead que entra." },
  { code: "G2", name: "Guardián de Pauta", accent: "#7c3aed", icon: Megaphone, solves: "Monitorea tus anuncios y pausa las campañas que queman presupuesto." },
  { code: "G3", name: "Copywriter Estratégico", accent: "#3b82f6", icon: PenTool, solves: "Cuando un ángulo falla, propone copys nuevos y briefs de diseño." },
  { code: "G4", name: "Analista Predictivo", accent: "#10b981", icon: TrendingUp, solves: "Proyecta tus ventas y avisa si la meta del mes está en riesgo." },
  { code: "G5", name: "Auditor de Fugas", accent: "#d97706", icon: Search, solves: "Lee las notas del CRM y clasifica por qué se pierden los leads." },
  { code: "G6", name: "Optimizador de Conversión", accent: "#ec4899", icon: Rocket, solves: "Detecta los anuncios ganadores y redistribuye el presupuesto." },
  { code: "G7", name: "Agente de Agendamiento", accent: "#dc2626", icon: CalendarCheck, solves: "Voz de IA que cierra citas y confirma por correo y WhatsApp." },
]

const FUNNEL = [
  { stage: "Pauta", pain: "Presupuesto que se quema en anuncios que ya dejaron de convertir." },
  { stage: "Lead", pain: "Contactos que entran y se enfrían antes de la primera respuesta." },
  { stage: "Cierre", pain: "Ventas que se caen sin que sepas exactamente por qué." },
  { stage: "Proyección", pain: "Llegar a fin de mes sin saber si vas a alcanzar la meta." },
]

const GOVERNANCE = [
  {
    step: "Observa",
    icon: Eye,
    body: "Cada guardián arranca en modo observador: aprende tu operación y registra lo que encuentra, sin tocar nada.",
  },
  {
    step: "Confías",
    icon: Check,
    body: "Revisas sus hallazgos y recomendaciones. Cuando su criterio te convence, lo activas con un clic.",
  },
  {
    step: "Actúa",
    icon: Shield,
    body: "El guardián ejecuta solo: pausa, redistribuye, agenda. Tú mantienes el control y puedes volver atrás.",
  },
]

/* ───────────────────────── nav ───────────────────────── */

function LandingNav() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  // Marca la navegación como interna para que /centro muestre el login (no rebote al inicio).
  const goToApp = () => {
    markInternalNav()
    router.push(APP_ROUTE)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-border/70 bg-background/80 border-b backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="shrink-0" aria-label="Rol.IA — inicio">
          <RolLogo size="sm" />
        </a>

        <nav className="text-muted-foreground hidden items-center gap-8 text-sm md:flex" aria-label="Secciones">
          <a href="#guardianes" className="hover:text-foreground transition-colors">Guardianes</a>
          <a href="#gobernanza" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#aura" className="hover:text-foreground transition-colors">Aura</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={goToApp}
            className="text-foreground hover:bg-secondary hidden h-9 px-4 text-sm font-medium sm:inline-flex"
          >
            Iniciar sesión
          </Button>
          <Button
            onClick={goToApp}
            className="bg-aura hover:bg-aura/90 h-9 px-4 text-sm font-medium text-white"
          >
            Solicitar acceso
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ───────────────────────── page ───────────────────────── */

export function Landing() {
  const router = useRouter()
  const reduce = useReducedMotion()
  const topRef = useRef<HTMLDivElement>(null)

  // Marca la navegación como interna para que /centro muestre el login (no rebote al inicio).
  const goToApp = () => {
    markInternalNav()
    router.push(APP_ROUTE)
  }

  return (
    <div ref={topRef} id="top" className="bg-background text-foreground min-h-screen overflow-x-hidden">
      {/* Acento de marca en el borde superior */}
      <div className="fixed inset-x-0 top-0 z-[60] h-[3px]" style={{ background: BRAND_GRADIENT }} />

      <LandingNav />

      <main>
        {/* ── HERO ── */}
        <section className="relative px-5 pb-20 pt-28 sm:px-8 sm:pt-36" aria-label="Presentación">
          {/* Atmósfera de fondo: rejilla técnica sutil */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(124,58,237,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.6) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent 75%)",
            }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Columna izquierda */}
            <div className="flex flex-col items-start gap-7">
              <Reveal>
                <Eyebrow>Inteligencia comercial autónoma</Eyebrow>
              </Reveal>

              <Reveal delay={0.05}>
                <h1 className="max-w-xl text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  Cada fuga de tu embudo,
                  <br className="hidden sm:block" />{" "}
                  vigilada por{" "}
                  <span className="text-foreground font-semibold">tus guardianes</span>.
                </h1>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="text-muted-foreground max-w-lg text-base leading-relaxed sm:text-lg">
                  Rol.IA monitorea tu pauta, diagnostica por qué no cierras y proyecta tus ventas
                  en tiempo real. Tú decides cuándo cada guardián deja de observar y empieza a actuar.
                </p>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={goToApp}
                    className="bg-aura hover:bg-aura/90 group h-12 px-6 text-sm font-medium text-white"
                  >
                    Solicitar acceso
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToApp}
                    className="border-border hover:bg-secondary h-12 px-6 text-sm font-medium"
                  >
                    Iniciar sesión
                  </Button>
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <dl className="border-border/70 mt-2 flex flex-wrap items-center gap-x-8 gap-y-4 border-t pt-6">
                  {[
                    { v: "24/7", l: "vigilancia del embudo" },
                    { v: "100%", l: "gobernanza humana" },
                    { v: "Tiempo real", l: "diagnóstico y proyección" },
                  ].map((s) => (
                    <div key={s.l} className="flex flex-col">
                      <dt className="text-foreground font-mono text-2xl font-semibold tabular-nums">{s.v}</dt>
                      <dd className="text-muted-foreground text-xs">{s.l}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            {/* Columna derecha: elemento firma */}
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center lg:justify-end"
            >
              <GuardianOrbital />
            </motion.div>
          </div>
        </section>

        {/* ── PROBLEMA: la fuga invisible ── */}
        <section className="border-border/60 bg-card/40 border-y px-5 py-20 sm:px-8 sm:py-24" aria-label="El problema">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>La fuga invisible</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                El dinero no se pierde de golpe.{" "}
                <span className="text-muted-foreground">Se escapa por grietas que nadie está mirando.</span>
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 sm:grid-cols-2 lg:grid-cols-4">
              {FUNNEL.map((f, i) => (
                <Reveal key={f.stage} delay={i * 0.06}>
                  <div className="bg-card flex h-full flex-col gap-3 p-6">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground/60 font-mono text-[11px] tabular-nums">
                        0{i + 1}
                      </span>
                      <span className="text-foreground font-mono text-xs font-semibold uppercase tracking-widest">
                        {f.stage}
                      </span>
                      {i < FUNNEL.length - 1 && (
                        <ArrowRight className="text-muted-foreground/40 ml-auto hidden h-3.5 w-3.5 lg:block" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.pain}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOS GUARDIANES ── */}
        <section id="guardianes" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28" aria-label="Los guardianes">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>El equipo</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                <span className="font-semibold">Una operación que se cuida sola.</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
                Cada uno cubre un punto del embudo donde hoy se te escapa dinero. Juntos, no dejan
                un ángulo sin vigilar.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GUARDIANS.map((g, i) => {
                const Icon = g.icon
                return (
                  <Reveal key={g.code} delay={(i % 3) * 0.05}>
                    <article className="group bg-card hover:border-foreground/15 relative flex h-full flex-col gap-4 rounded-2xl border border-border/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <div className="flex items-center">
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${g.accent}15`, color: g.accent }}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="text-foreground text-base font-semibold tracking-tight">{g.name}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{g.solves}</p>
                      </div>
                      <span
                        className="mt-auto h-0.5 w-0 rounded-full transition-all duration-300 group-hover:w-12"
                        style={{ backgroundColor: g.accent }}
                      />
                    </article>
                  </Reveal>
                )
              })}

              {/* Card de cierre del grid */}
              <Reveal delay={0.1}>
                <article
                  className="relative flex h-full flex-col justify-between gap-6 rounded-2xl p-6 text-white"
                  style={{ background: "linear-gradient(145deg, #2a1958 0%, #1f2937 60%, #7c3aed 200%)" }}
                >
                  <Sparkles className="h-5 w-5 text-white/80" />
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold tracking-tight">Coordinados por Aura</h3>
                    <p className="text-sm leading-relaxed text-white/70">
                      Todos reportan a un mismo cerebro. Pregúntale en lenguaje natural y te
                      responde con datos de tu operación.
                    </p>
                  </div>
                  <button
                    onClick={goToApp}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
                  >
                    Conocer Aura <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── GOBERNANZA ── */}
        <section
          id="gobernanza"
          className="border-border/60 bg-card/40 scroll-mt-20 border-y px-5 py-20 sm:px-8 sm:py-28"
          aria-label="Cómo funciona"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <Eyebrow>Gobernanza humana</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                La IA no piensa por uno.{" "}
                <span className="font-semibold">Piensa con uno.</span>
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed">
                Ningún guardián toma el control sin tu permiso. Pasa de observar a actuar solo
                cuando tú lo decides.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {GOVERNANCE.map((g, i) => {
                const Icon = g.icon
                return (
                  <Reveal key={g.step} delay={i * 0.08}>
                    <div className="bg-card flex h-full flex-col gap-4 rounded-2xl border border-border/70 p-7">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground/50 font-mono text-sm tabular-nums">0{i + 1}</span>
                        <span className="bg-aura/10 text-aura flex h-9 w-9 items-center justify-center rounded-lg">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-foreground text-lg font-semibold tracking-tight">{g.step}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{g.body}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>

            {/* Estados Observador → Activo */}
            <Reveal delay={0.1}>
              <div className="bg-card mt-4 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/70 p-6 sm:flex-row sm:gap-6">
                <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" /> Modo observador
                </span>
                <span className="text-muted-foreground/40 hidden sm:inline">→</span>
                <span className="text-aura inline-flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" /> Guardián activo
                </span>
                <span className="border-border bg-secondary/60 text-muted-foreground rounded-full border px-3 py-1 font-mono text-[11px] sm:ml-2">
                  reversible en cualquier momento
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── AURA ── */}
        <section id="aura" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28" aria-label="Aura">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="flex flex-col items-start gap-6">
                <Eyebrow>El copiloto</Eyebrow>
                <h2 className="text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                  Habla con tu operación.{" "}
                  <span className="font-semibold">Aura te responde con datos.</span>
                </h2>
                <p className="text-muted-foreground max-w-md text-base leading-relaxed">
                  Aura es el cerebro que coordina a todos tus guardianes. Pregúntale en lenguaje
                  natural por el estado de tu pauta, tus fugas o tu proyección — y obtén la respuesta
                  al instante, sin abrir un solo reporte.
                </p>
                <Button
                  onClick={goToApp}
                  className="bg-aura hover:bg-aura/90 group h-12 px-6 text-sm font-medium text-white"
                >
                  Empezar con Rol.IA
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="bg-card rounded-2xl border border-border/70 p-5 shadow-sm">
                <div className="border-border/60 mb-4 flex items-center gap-2.5 border-b pb-3">
                  <RolIcon size={26} />
                  <span className="text-foreground text-sm font-semibold">Aura</span>
                  <span className="text-rescue ml-auto inline-flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="bg-rescue h-1.5 w-1.5 rounded-full" /> en línea
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-secondary/70 ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5">
                    <p className="text-foreground text-sm">¿Cómo va la pauta esta semana?</p>
                  </div>
                  <div className="bg-aura/[0.07] border-aura/10 max-w-[88%] rounded-2xl rounded-tl-sm border px-4 py-2.5">
                    <p className="text-foreground text-sm leading-relaxed">
                      El Guardián de Pauta pausó 2 campañas con CPL alto y el Optimizador movió ese
                      presupuesto al anuncio ganador. <span className="text-aura font-medium">CPL −18%</span>{" "}
                      vs. la semana pasada.
                    </p>
                  </div>
                  <div className="text-muted-foreground/70 flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="bg-muted-foreground/40 h-1 w-1 animate-pulse rounded-full" />
                    Aura está analizando tus fuentes…
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="px-5 pb-24 sm:px-8" aria-label="Solicitar acceso">
          <Reveal>
            <div
              className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-16 text-center sm:py-20"
              style={{ background: "linear-gradient(135deg, #1a1430 0%, #1f2937 55%, #3a1d6e 120%)" }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
                style={{ background: BRAND_GRADIENT }}
              />
              <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
                <RolIcon size={48} />
                <h2 className="text-3xl font-light leading-tight tracking-tight text-white sm:text-4xl">
                  Convierte tu operación comercial en{" "}
                  <span className="font-semibold">un sistema que se vigila solo.</span>
                </h2>
                <p className="max-w-md text-base leading-relaxed text-white/70">
                  Pon a tus guardianes a cuidar tu embudo hoy. Tú mantienes el control;
                  ellos no descansan.
                </p>
                <Button
                  onClick={goToApp}
                  className="bg-white text-[#1f2937] hover:bg-white/90 group mt-2 h-12 px-7 text-sm font-semibold"
                >
                  Solicitar acceso
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                    powered by
                  </span>
                  <IdiaLogo className="h-4" plate />
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-border/60 border-t px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-3">
            <RolLogo size="sm" />
            <p className="text-muted-foreground text-xs">La IA no piensa por uno, piensa con uno.</p>
            <a
              href="https://idiasolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 transition-opacity hover:opacity-100"
            >
              <span className="text-muted-foreground/70 text-[11px] uppercase tracking-wider">Una solución de</span>
              <IdiaLogo className="h-4" />
            </a>
          </div>
          <nav className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm" aria-label="Pie de página">
            <a href="#guardianes" className="hover:text-foreground transition-colors">Guardianes</a>
            <a href="#gobernanza" className="hover:text-foreground transition-colors">Cómo funciona</a>
            <button onClick={goToApp} className="hover:text-foreground transition-colors">
              Iniciar sesión
            </button>
            <button onClick={goToApp} className="hover:text-foreground transition-colors">
              Solicitar acceso
            </button>
          </nav>
        </div>
        <div className="border-border/50 text-muted-foreground/70 mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-2 border-t pt-6 text-xs sm:flex-row">
          <span>© 2026 Rol.IA. Todos los derechos reservados.</span>
          <span className="font-mono">rolia.idiasolutions.com</span>
        </div>
      </footer>
    </div>
  )
}
