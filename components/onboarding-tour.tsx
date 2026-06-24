"use client"

import { useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  GraduationCap,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  Check,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Compass,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/contexts/profile-context"
import { useOnboarding } from "@/contexts/onboarding-context"
import { AGENTS, ALL_REPORTS, accentClasses } from "@/lib/navigation"
import { isReportAvailable, upgradeBenefits, nextTier, VERSIONS, type VersionTier } from "@/lib/versioning"
import type { ActiveView } from "@/components/app-sidebar"
import type { ProfileLevel } from "@/contexts/profile-context"
import { useVersion } from "@/lib/versioning"
import { ArrowUpRight } from "lucide-react"

interface TourStep {
  target: ActiveView
  chip: string
  icon: LucideIcon
  accent: string
  title: string
  body: string
  focus?: string[]
  focusLabel?: string
  /* Capas de profundidad opcionales (super guia) */
  read?: string[]
  decide?: string
  avoid?: string
  proTip?: string
}

/* Encuadre del valor segun el perfil (primer y ultimo paso) */
const LEVEL_FRAMING: Record<ProfileLevel, { intro: string; outro: string }> = {
  macro: {
    intro:
      "Como direccion, no entras a buscar datos: le preguntas a Rol y el audita el negocio por ti. Escribe en lenguaje natural y te lleva a la evidencia exacta.",
    outro:
      "Eso es todo: pregunta, audita y decide con evidencia. Rol vigila el dinero del grupo 24/7 y te avisa antes de que un problema cueste caro.",
  },
  meso: {
    intro:
      "Como gerencia, tu inicio es una conversacion. Pregunta por tu celula o indicador y Rol te lleva al reporte que necesitas para mover al equipo.",
    outro:
      "Listo: pregunta, diagnostica y corrige con tu equipo. Rol te muestra donde se escapa la venta y a quien rescatar primero.",
  },
  micro: {
    intro:
      "Hey, esto es simple: preguntale a Rol que hacer hoy y te arma el plan para cerrar mas. No tienes que buscar nada en menus.",
    outro:
      "Eso es: pregunta, recibe tu plan y cierra. Rol te dice a quien llamar, cuando y con que mensaje para no perder ventas.",
  },
}

/* Insight por reporte: capas de profundidad para una guia completa */
interface ReportInsight {
  note: string
  focus: string[]
  read?: string[]
  decide?: string
  avoid?: string
  proTip?: string
}
const REPORT_INSIGHTS: Record<string, ReportInsight> = {
  "human-roas": {
    note: "Aqui contrastas lo que reporta marketing contra lo que confirma el CRM. Si el ROAS esta inflado, lo ves al instante.",
    focus: [
      "Mira la brecha 'ROAS reportado vs real': si supera 20%, hay cifras infladas.",
      "Ordena las campanas por brecha para ver cual exagera mas.",
      "Cruza con el % de leads confirmados, no solo los clics.",
    ],
    read: [
      "Compara fila por fila la columna 'reportado' contra 'confirmado por CRM'.",
      "Fijate en el costo por venta REAL, no por lead: ahi vive la rentabilidad verdadera.",
      "El ranking de campanas te dice cuales financian el negocio (verdes) y cuales drenan caja (rojas).",
    ],
    decide: "Recorta o pausa el presupuesto de las campanas con brecha > 20% y reasignalo a las verdes.",
    avoid: "No celebres un ROAS alto sin confirmar que esos leads existen de verdad en el CRM.",
    proTip: "Cruza este reporte con Tendencia de Presupuesto para ver si la brecha crece mes a mes.",
  },
  leak: {
    note: "Te muestra en que punto exacto del embudo se esta yendo el dinero, con cifras, no opiniones.",
    focus: [
      "Identifica la etapa con mayor caida % en el embudo.",
      "Revisa el monto $ asociado a esa fuga, no solo el volumen.",
      "Compara la fuga de esta semana contra la anterior.",
    ],
    read: [
      "Lee el embudo de arriba (contactos) hacia abajo (cierres) y marca el mayor salto de caida.",
      "Cada etapa muestra % de paso y $ perdido: prioriza por dinero, no por cantidad.",
      "Pasa el cursor por cada etapa para ver el motivo dominante de esa fuga.",
    ],
    decide: "Ataca primero la etapa con mas $ perdido: ahi esta el retorno mas rapido.",
    avoid: "No confundas mucha caida en volumen con mucha caida en dinero; el ticket lo cambia todo.",
    proTip: "Si la fuga esta al inicio del embudo es contactabilidad; si esta al final es cierre o precio.",
  },
  fraud: {
    note: "Compara lo que escriben los asesores en el CRM contra la realidad de las llamadas. Detecta el maquillaje de datos.",
    focus: [
      "Filtra por 'discrepancia alta' para ver los casos mas graves primero.",
      "Mira que asesores concentran las inconsistencias.",
      "Revisa las llamadas marcadas como 'sin evidencia' de gestion.",
    ],
    read: [
      "Cada fila contrasta la nota del CRM contra la transcripcion real de la llamada.",
      "El score de discrepancia mide cuanto se aleja lo escrito de lo que realmente se dijo.",
      "Las banderas rojas marcan promesas de gestion sin evidencia de contacto.",
    ],
    decide: "Convoca a los asesores con discrepancia alta recurrente y exige respaldo de cada gestion.",
    avoid: "No sanciones por un caso aislado; busca el patron que se repite en el tiempo.",
    proTip: "Apoyate en Speech Analytics junto a este reporte para tener la prueba textual en mano.",
  },
  predictor: {
    note: "Proyecta con IA si vas a cumplir la meta del mes y te alerta temprano si vas corto.",
    focus: [
      "Mira primero el % de cumplimiento proyectado vs la meta.",
      "Revisa la fecha estimada de cierre de meta.",
      "Atiende las alertas rojas: son los dias que definen el mes.",
    ],
    read: [
      "Compara la linea de proyeccion contra la meta: la brecha al cierre es tu riesgo real.",
      "Revisa el ritmo diario requerido frente al ritmo actual del equipo.",
      "Las alertas tempranas marcan los dias bisagra donde se decide el resultado.",
    ],
    decide: "Si la proyeccion va corta, sube el ritmo diario hoy, no en la ultima semana.",
    avoid: "No esperes a fin de mes para reaccionar; la curva ya te avisa con anticipacion.",
    proTip: "Combinalo con Agenda de Rescate para inyectar cierres adicionales esta misma semana.",
  },
  scheduling: {
    note: "Ves como esta repartida la carga de citas del equipo para reequilibrar antes de que alguien colapse.",
    focus: [
      "Detecta los asesores sobrecargados (barras mas altas).",
      "Mira las franjas horarias con huecos sin citas.",
      "Reequilibra moviendo citas de los saturados a los libres.",
    ],
    read: [
      "Barras altas = saturacion; barras bajas = capacidad ociosa lista para usar.",
      "Detecta las franjas horarias con huecos sin citas agendadas.",
      "Cruza carga vs tasa de cierre: a veces el mas saturado no es el mas efectivo.",
    ],
    decide: "Mueve citas de los asesores saturados hacia los que tienen capacidad libre.",
    avoid: "No premies al que mas citas tiene si su cierre es bajo; mide resultado, no volumen.",
    proTip: "Reserva las franjas doradas del dia para tus mejores cerradores.",
  },
  speech: {
    note: "Audita si tu equipo cumple el guion y la calidad en las conversaciones reales.",
    focus: [
      "Mira el % de adherencia al guion por asesor.",
      "Revisa los pasos del guion que mas se saltan.",
      "Escucha 1-2 llamadas con menor score para coaching.",
    ],
    read: [
      "Revisa el score de adherencia por asesor y por etapa de la llamada.",
      "Identifica los pasos del guion que mas se omiten en todo el equipo.",
      "Escucha los fragmentos que la IA marca como criticos.",
    ],
    decide: "Arma un coaching puntual sobre el paso del guion mas omitido del equipo.",
    avoid: "No generalices: el problema suele ser un paso especifico, no toda la llamada.",
    proTip: "Compara el guion de tus mejores cerradores contra el resto para crear el estandar.",
  },
  rescue: {
    note: "Tu lista priorizada de leads para rescatar hoy, ordenada por probabilidad de cierre.",
    focus: [
      "Empieza por los leads del tope: mayor probabilidad de cierre.",
      "Mira el tiempo sin contacto de cada uno.",
      "Usa el motivo sugerido para personalizar tu mensaje.",
    ],
    read: [
      "La lista ya viene ordenada por probabilidad de cierre: respeta ese orden.",
      "Cada lead muestra el tiempo sin contacto y la razon del riesgo.",
      "El motivo sugerido te explica por que se enfrio y como reabrir la conversacion.",
    ],
    decide: "Llama hoy a los primeros de la lista; cada hora que pasa baja su probabilidad.",
    avoid: "No empieces por los faciles; empieza por los de mayor valor en riesgo.",
    proTip: "Usa Copywriter IA para generar el mensaje de reapertura de cada lead.",
  },
  "budget-trend": {
    note: "Cruza tu inversion (incluida la pauta offline del Excel) contra los leads que realmente genero.",
    focus: [
      "Mira que canal trae el menor costo por lead.",
      "Detecta canales con inversion alta y pocos leads.",
      "Compara la tendencia: la inversion sube pero los leads no?",
    ],
    read: [
      "Cruza inversion (incluida la pauta offline) contra leads generados por canal.",
      "Fijate en el costo por lead por canal, no en el gasto absoluto.",
      "Observa la tendencia: si la inversion sube y los leads no, hay saturacion del canal.",
    ],
    decide: "Reasigna presupuesto del canal mas caro por lead hacia el mas eficiente.",
    avoid: "No mires solo el gasto total; un canal caro puede traer leads de mayor calidad.",
    proTip: "Sube tu pauta offline en Excel para que el costo por lead sea real y completo.",
  },
  abandonment: {
    note: "Los leads que estas a punto de perder por falta de contacto, en tiempo real.",
    focus: [
      "Atiende primero los leads en rojo (riesgo critico).",
      "Mira el contador de tiempo desde el ultimo contacto.",
      "Actua antes de que pasen al estado 'perdido'.",
    ],
    read: [
      "Los leads en rojo son riesgo critico: requieren contacto inmediato.",
      "El contador marca el tiempo transcurrido desde el ultimo toque con cada lead.",
      "Amarillo es tu ventana de accion; verde esta bajo control.",
    ],
    decide: "Contacta los rojos en los proximos minutos antes de que pasen a perdido.",
    avoid: "No dejes que un amarillo se vuelva rojo por esperar 'un rato mas'.",
    proTip: "Configura el semaforo de abandono en G1 para que los tiempos calcen con tu negocio.",
  },
  golden: {
    note: "La franja del dia con mayor probabilidad de cierre para que llames en el momento correcto.",
    focus: [
      "Identifica la franja dorada (barra mas alta del dia).",
      "Agenda tus llamadas clave en ese horario.",
      "Compara tu hora actual de llamadas vs la optima.",
    ],
    read: [
      "La barra mas alta del dia es tu franja dorada de mayor cierre.",
      "Compara tu horario actual de llamadas contra el optimo sugerido.",
      "Revisa si la franja cambia segun el dia de la semana.",
    ],
    decide: "Agenda tus llamadas y cierres clave dentro de la franja dorada.",
    avoid: "No quemes tus mejores leads en horarios de baja respuesta.",
    proTip: "Crea bloqueos de agenda recurrentes en la franja dorada para todo tu equipo.",
  },
  copywriter: {
    note: "Genera el mensaje que mejor convierte para cada lead, listo para enviar.",
    focus: [
      "Elige el tono segun la etapa del lead.",
      "Revisa la variante con mayor tasa de respuesta.",
      "Copia y ajusta el mensaje sugerido antes de enviar.",
    ],
    read: [
      "Elige el tono segun la etapa del lead (frio, tibio o caliente).",
      "Revisa la variante con mayor tasa de respuesta historica.",
      "Lee el porque de cada mensaje, no solo el texto sugerido.",
    ],
    decide: "Personaliza el mensaje con un dato real del lead antes de enviarlo.",
    avoid: "No envies la plantilla tal cual a todos; el detalle personal es lo que convierte.",
    proTip: "Guarda tus variantes ganadoras para reutilizarlas con leads similares.",
  },
}

/* Guia de conversacion segun el perfil: como hablarle a Rol (uso conceptual) */
const CHAT_GUIDE: Record<ProfileLevel, { title: string; body: string; examples: string[]; proTip: string }> = {
  macro: {
    title: "Hablale como a tu mejor analista de confianza",
    body:
      "No necesitas saber donde vive cada reporte. Escribe tu pregunta de negocio en lenguaje natural y Rol elige la evidencia, la abre y te la explica.",
    examples: [
      "'Donde estoy perdiendo mas dinero este mes?'",
      "'Que campana me esta inflando el ROAS?'",
      "'Voy a cumplir la meta del grupo?'",
    ],
    proTip: "Entre mas concreta tu pregunta (periodo, sucursal, canal), mas precisa la respuesta de Rol.",
  },
  meso: {
    title: "Preguntale por tu celula y el responde con el reporte",
    body:
      "Olvidate de buscar en menus. Pregunta por tu equipo, un indicador o un vendedor y Rol te lleva directo al reporte con el analisis ya hecho.",
    examples: [
      "'Quien de mi equipo esta dejando escapar leads?'",
      "'Como va mi tasa de cierre esta semana?'",
      "'A quien debo rescatar primero hoy?'",
    ],
    proTip: "Pidele comparativos ('vs la semana pasada') para ver tendencia, no solo la foto del momento.",
  },
  micro: {
    title: "Solo preguntale que hacer y manos a la obra",
    body:
      "No tienes que aprenderte el sistema. Escribele como a un companero de trabajo y te arma el plan de cierre del dia, paso a paso.",
    examples: [
      "'A quien llamo primero hoy?'",
      "'Que le escribo a este lead que no responde?'",
      "'Cual es mi mejor hora para llamar?'",
    ],
    proTip: "Si no sabes que preguntar, escribe 'que hago hoy' y Rol te ordena el dia completo.",
  },
}

function buildSteps(level: ProfileLevel, version: VersionTier, userName: string): TourStep[] {
  const agent = AGENTS[level]
  const framing = LEVEL_FRAMING[level]
  const firstName = userName.split(" ")[0]

  const chat = CHAT_GUIDE[level]

  const steps: TourStep[] = [
    {
      target: { type: "home" },
      chip: "Inicio · Chat",
      icon: MessageSquare,
      accent: "aura",
      title: `${firstName}, este es tu punto de partida`,
      body: `${framing.intro} Soy ${agent.name}, ${agent.role.toLowerCase()}, y te acompano en este recorrido.`,
    },
    // Paso conceptual: como conversar con Rol (sacar valor sin capacitacion)
    {
      target: { type: "home" },
      chip: "Como preguntar",
      icon: MessageSquare,
      accent: "aura",
      title: chat.title,
      body: chat.body,
      focus: chat.examples,
      focusLabel: "Pregunta asi",
      proTip: chat.proTip,
    },
  ]

  // Reportes clave del perfil (los que ya sugiere su agente),
  // solo los que tu version actual tiene habilitados.
  const seen = new Set<string>()
  for (const p of agent.prompts) {
    if (!p.reportId || seen.has(p.reportId)) continue
    const r = ALL_REPORTS.find((rr) => rr.id === p.reportId)
    if (!r) continue
    seen.add(p.reportId)
    // No mostramos opciones que tu plan no cubre: el tour solo recorre lo accesible.
    if (!isReportAvailable(r.id, version)) continue
    const insight = REPORT_INSIGHTS[r.id]
    steps.push({
      target: { type: "report", id: r.id },
      chip: r.title,
      icon: r.icon,
      accent: r.accent,
      title: r.question,
      body: insight?.note ?? r.question,
      focus: insight?.focus,
      focusLabel: "Empieza mirando esto",
      read: insight?.read,
      decide: insight?.decide,
      avoid: insight?.avoid,
      proTip: insight?.proTip,
    })
  }

  // Paso conceptual: los guardianes autonomos que trabajan sin que se lo pidas
  steps.push({
    target: { type: "config" },
    chip: "Guardianes",
    icon: ShieldCheck,
    accent: "rescue",
    title: "Los Guardianes trabajan por ti 24/7",
    body:
      "Rol no solo responde cuando preguntas: tambien vigila tu operacion solo. Tres guardianes autonomos cuidan el negocio en segundo plano y te avisan antes de que algo cueste caro.",
    focus: [
      "G1 El Rescatista: detecta leads abandonados y los recupera antes de perderlos.",
      "G2 El Vigilante: monitorea calidad y comportamiento del equipo en tiempo real.",
      "G4 El Estratega: proyecta resultados y te alerta temprano si vas corto de meta.",
    ],
    focusLabel: "Quien te cuida",
    proTip:
      level === "micro"
        ? "Tu lider ajusta los guardianes; tu solo recibes sus avisos y actuas."
        : "Cada guardian se configura a tu operacion desde el menu lateral de Configuracion.",
  })

  // Configuracion como ultima parada
  steps.push({
    target: { type: "config" },
    chip: "Configuracion",
    icon: Settings,
    accent: "aura",
    title: "Ajusta el sistema a tu operacion",
    body:
      level === "micro"
        ? "Aqui defines tus datos y preferencias. Tu lider configura guardianes y equipos; tu te enfocas en cerrar."
        : "Empresas, sucursales, usuarios, perfiles y los guardianes autonomos (G1, G2, G4) se configuran aqui, todo desde el menu lateral.",
  })

  // Cierre
  steps.push({
    target: { type: "home" },
    chip: "Listo",
    icon: Sparkles,
    accent: "aura",
    title: `Listo ${firstName}, ya sabes sacarle valor a Rol`,
    body: framing.outro,
  })

  return steps
}

export function OnboardingTour({ onNavigate }: { onNavigate: (view: ActiveView) => void }) {
  const { currentProfile } = useProfile()
  const { version, meta: versionMeta, setVersion } = useVersion()
  const { tourActive, tourStep, exitTour, goToStep, setTourTotal } = useOnboarding()

  const up = nextTier(version)
  const upBenefits = upgradeBenefits(version)

  const steps = useMemo(
    () => buildSteps(currentProfile.level, version, currentProfile.name),
    [currentProfile.level, currentProfile.name, version],
  )

  // Reportes que el agente sugiere pero que tu version aun no cubre (no se muestran como pasos)
  const lockedCount = useMemo(() => {
    const ids = new Set<string>()
    for (const p of AGENTS[currentProfile.level].prompts) {
      if (p.reportId && !isReportAvailable(p.reportId, version)) ids.add(p.reportId)
    }
    return ids.size
  }, [currentProfile.level, version])

  const total = steps.length
  const step = Math.min(tourStep, total - 1)
  const current = steps[step]
  const isLast = step === total - 1
  const isFirst = step === 0

  // Mantener el total sincronizado para indicadores externos
  useEffect(() => {
    setTourTotal(total)
  }, [total, setTourTotal])

  // Navegar de verdad a la vista del paso actual
  useEffect(() => {
    if (tourActive && current) onNavigate(current.target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourActive, step])

  if (!tourActive || !current) return null

  const ac = accentClasses(current.accent)
  const StepIcon = current.icon
  const progress = ((step + 1) / total) * 100

  const firstName = currentProfile.name.split(" ")[0]

  return (
    <AnimatePresence>
      {/* Capa de cierre transparente: NO desenfoca ni oscurece, la vista detras se ve nitida */}
      <motion.div
        key="tour-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[65]"
        onClick={exitTour}
        aria-hidden="true"
      />
      <motion.div
        key="tour-coach"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-4 sm:px-4 sm:pb-6"
      >
        <div className="border-border pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl border bg-white shadow-2xl">
          {/* Barra de progreso */}
          <div className="bg-muted h-1 w-full">
            <motion.div
              className="bg-aura h-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Encabezado */}
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ac.bg}`}>
                <StepIcon className={`h-5 w-5 ${ac.text}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-aura/10 text-aura inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    <GraduationCap className="h-3 w-3" />
                    Paso {step + 1} de {total}
                  </span>
                  <span className="text-muted-foreground truncate text-[11px] font-medium">{current.chip}</span>
                </div>
                <h4 className="text-foreground mt-1 text-sm font-semibold text-balance leading-snug">
                  {current.title}
                </h4>
                <p className="text-muted-foreground mt-1 text-[11px] leading-tight">
                  Recorrido para <span className="text-foreground font-medium">{firstName}</span> · Plan{" "}
                  <span className="text-aura font-semibold">Rol {versionMeta.name}</span>
                </p>
              </div>
              <button
                onClick={exitTour}
                className="text-muted-foreground hover:bg-muted hover:text-foreground -mr-1 -mt-1 shrink-0 rounded-lg p-1.5 transition-colors"
                aria-label="Salir del tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cuerpo explicativo */}
            <p className="text-muted-foreground text-[13px] leading-relaxed text-pretty">{current.body}</p>

            {/* En que enfocarse primero: valor inmediato sin tener que analizar todo */}
            {current.focus && current.focus.length > 0 && (
              <div className={`rounded-xl border ${ac.border ?? "border-aura/20"} ${ac.bg} p-3`}>
                <div className="mb-2 flex items-center gap-1.5">
                  <Target className={`h-3.5 w-3.5 ${ac.text}`} />
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${ac.text}`}>
                    {current.focusLabel ?? "Empieza por aqui"}
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {current.focus.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${ac.text}`} />
                      <span className="text-foreground/80 text-[12px] leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Como leerlo a fondo: profundidad de lectura del reporte */}
            {current.read && current.read.length > 0 && (
              <div className="border-border bg-muted/40 rounded-xl border p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <BookOpen className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wide">
                    Como leerlo a fondo
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {current.read.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="bg-muted-foreground/50 mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                      <span className="text-foreground/80 text-[12px] leading-snug">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* La decision que tomas: convierte el dato en accion */}
            {current.decide && (
              <div className="border-rescue/20 bg-rescue/5 flex items-start gap-2 rounded-xl border p-3">
                <Compass className="text-rescue mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-rescue text-[11px] font-semibold uppercase tracking-wide">La decision que tomas</span>
                  <span className="text-foreground/80 text-[12px] leading-snug">{current.decide}</span>
                </div>
              </div>
            )}

            {/* Error comun a evitar */}
            {current.avoid && (
              <div className="border-warning/30 bg-warning/5 flex items-start gap-2 rounded-xl border p-3">
                <AlertTriangle className="text-warning mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-warning text-[11px] font-semibold uppercase tracking-wide">Evita este error</span>
                  <span className="text-foreground/80 text-[12px] leading-snug">{current.avoid}</span>
                </div>
              </div>
            )}

            {/* Truco de experto */}
            {current.proTip && (
              <div className="border-aura/20 bg-aura/5 flex items-start gap-2 rounded-xl border p-3">
                <Lightbulb className="text-aura mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-aura text-[11px] font-semibold uppercase tracking-wide">Truco de experto</span>
                  <span className="text-foreground/80 text-[12px] leading-snug">{current.proTip}</span>
                </div>
              </div>
            )}

            {/* Sugerencia de upgrade: que mas podrias hacer subiendo de plan */}
            {isLast && up && upBenefits.length > 0 && (
              <div className="border-aura/20 bg-aura/5 flex flex-col gap-2 rounded-lg border px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="text-aura h-3.5 w-3.5 shrink-0" />
                  <span className="text-foreground text-[12px] font-semibold">
                    Con Rol {VERSIONS[up].name} podrias hacer mas
                  </span>
                </div>
                <ul className="flex flex-col gap-1">
                  {upBenefits.slice(0, 4).map((b) => (
                    <li key={b} className="text-muted-foreground flex items-start gap-1.5 text-[11.5px] leading-snug">
                      <span className="bg-aura mt-1.5 h-1 w-1 shrink-0 rounded-full" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {lockedCount > 0 && (
                  <span className="text-muted-foreground text-[11px] leading-relaxed">
                    Ademas, se desbloquean {lockedCount} {lockedCount === 1 ? "reporte" : "reportes"} mas para tu rol.
                  </span>
                )}
                <button
                  onClick={() => setVersion(up)}
                  className="bg-aura mt-0.5 inline-flex w-fit items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Probar Rol {VERSIONS[up].name}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "bg-aura w-5" : "bg-border w-1.5 hover:bg-muted-foreground/40"}`}
                  aria-label={`Ir al paso ${i + 1}`}
                />
              ))}
            </div>

            {/* Controles */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={exitTour}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
              >
                Salir del tour
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToStep(Math.max(0, step - 1))}
                  disabled={isFirst}
                  className="gap-1 text-xs disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Volver
                </Button>
                <Button
                  size="sm"
                  onClick={() => (isLast ? exitTour() : goToStep(step + 1))}
                  className="bg-aura gap-1 text-xs text-white hover:opacity-90"
                >
                  {isLast ? "Finalizar" : "Siguiente"}
                  {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
