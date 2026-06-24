"use client"

import {
  Eye,
  Search,
  TrendingUp,
  Settings,
  Scale,
  PhoneOff,
  CalendarClock,
  LifeBuoy,
  PenLine,
  BarChart3,
  Clock,
  MessageSquareWarning,
  ShieldAlert,
  Target,
  FileSearch,
  Building2,
  Monitor,
  Smartphone,
  type LucideIcon,
} from "lucide-react"
import type { ProfileLevel } from "@/contexts/profile-context"

/* ─── Reportes (paneles) del Centro de Comando ─── */

export interface ReportMeta {
  id: string
  title: string
  /** Pregunta-respuesta en lenguaje natural que resuelve este reporte */
  question: string
  icon: LucideIcon
  /** key de color de la seccion (token semantico) */
  accent: string
  /** palabras clave para que el chat enrute hacia este reporte */
  keywords: string[]
}

export interface ReportSection {
  id: string
  title: string
  subtitle: string
  icon: LucideIcon
  accent: string
  badge: string
  reports: ReportMeta[]
}

export const REPORT_SECTIONS: ReportSection[] = [
  {
    id: "dinero",
    title: "Auditoria y Control del Dinero",
    subtitle: "Donde esta y como se mueve el dinero",
    icon: Eye,
    accent: "info",
    badge: "En Vivo",
    reports: [
      { id: "abandonment", title: "Semaforo de Abandono", question: "Que leads estoy a punto de perder?", icon: PhoneOff, accent: "info", keywords: ["abandono", "semaforo", "leads", "perder", "fuga"] },
      { id: "scheduling", title: "Agenda Inteligente", question: "Como esta distribuida la carga de citas?", icon: CalendarClock, accent: "info", keywords: ["agenda", "citas", "carga", "calendario"] },
      { id: "rescue", title: "Agenda de Rescate", question: "A quien debo rescatar hoy para no perder la venta?", icon: LifeBuoy, accent: "info", keywords: ["rescate", "recuperar", "salvar", "agenda"] },
      { id: "human-roas", title: "Realidad vs Marketing", question: "Lo que reporta marketing es verdad o esta inflado?", icon: Scale, accent: "info", keywords: ["roas", "marketing", "realidad", "crm", "inflado", "dinero", "fantasma"] },
      { id: "budget-trend", title: "Tendencia Presupuesto vs Leads", question: "Mi inversion esta generando los leads esperados?", icon: TrendingUp, accent: "info", keywords: ["presupuesto", "tendencia", "leads", "inversion", "offline", "excel"] },
      { id: "roas-trend", title: "Tendencia de ROAS", question: "Como evoluciona mi retorno en el tiempo?", icon: BarChart3, accent: "info", keywords: ["roas", "tendencia", "retorno", "evolucion"] },
    ],
  },
  {
    id: "fugas",
    title: "Fugas Silenciosas y Calidad Humana",
    subtitle: "Por que se escapan las ventas",
    icon: Search,
    accent: "warning",
    badge: "Analisis",
    reports: [
      { id: "leak", title: "Diagnostico de Fuga", question: "En que punto del embudo se pierde el dinero?", icon: FileSearch, accent: "warning", keywords: ["fuga", "diagnostico", "embudo", "perdida"] },
      { id: "fraud", title: "Deteccion de Fraude: CRM vs Realidad", question: "Lo que escriben en el CRM coincide con la realidad?", icon: ShieldAlert, accent: "warning", keywords: ["fraude", "crm", "realidad", "mentira", "notas"] },
      { id: "copywriter", title: "Copywriter IA", question: "Que mensaje convierte mejor a mis leads?", icon: PenLine, accent: "warning", keywords: ["copy", "mensaje", "texto", "copywriter", "guion"] },
      { id: "golden", title: "Ventana Dorada", question: "Cual es el mejor momento del dia para cerrar?", icon: Clock, accent: "warning", keywords: ["ventana", "dorada", "hora", "momento", "cierre"] },
      { id: "speech", title: "Speech Analytics", question: "Mi equipo cumple el guion y la calidad?", icon: MessageSquareWarning, accent: "warning", keywords: ["speech", "guion", "calidad", "palabras", "conversacion"] },
    ],
  },
  {
    id: "proyecciones",
    title: "Proyecciones de Cierre",
    subtitle: "Que va a pasar -- forecast con IA",
    icon: TrendingUp,
    accent: "rescue",
    badge: "Forecasting",
    reports: [
      { id: "predictor", title: "Predictor de Metas", question: "Voy a cumplir la meta del mes?", icon: Target, accent: "rescue", keywords: ["predictor", "meta", "forecast", "proyeccion", "cierre"] },
    ],
  },
]

/* indice plano para busquedas y enrutamiento desde el chat */
export const ALL_REPORTS: ReportMeta[] = REPORT_SECTIONS.flatMap((s) => s.reports)

export function findReportByQuery(query: string): ReportMeta | null {
  const q = query.toLowerCase()
  let best: { report: ReportMeta; score: number } | null = null
  for (const r of ALL_REPORTS) {
    let score = 0
    for (const kw of r.keywords) {
      if (q.includes(kw)) score += 2
    }
    if (q.includes(r.title.toLowerCase())) score += 5
    if (best === null || score > best.score) {
      if (score > 0) best = { report: r, score }
    }
  }
  return best?.report ?? null
}

/* ─── Agentes IA por perfil ─── */

export interface AgentMeta {
  level: ProfileLevel
  name: string
  role: string
  icon: LucideIcon
  /** pregunta de bienvenida que ancla el inicio del chat */
  openingQuestion: string
  /** sugerencias de reportes/preguntas que aparecen bajo el chat */
  prompts: { label: string; reportId?: string }[]
}

export const AGENTS: Record<ProfileLevel, AgentMeta> = {
  macro: {
    level: "macro",
    name: "Rol Estratega",
    role: "Agente para Direccion General",
    icon: Building2,
    openingQuestion: "Roberto, soy Rol. Por donde quieres empezar a auditar el negocio hoy?",
    prompts: [
      { label: "Marketing me esta inflando el ROAS?", reportId: "human-roas" },
      { label: "Cuanto dinero se esta fugando?", reportId: "leak" },
      { label: "Donde el CRM no coincide con la realidad?", reportId: "fraud" },
      { label: "Vamos a cumplir la meta del mes?", reportId: "predictor" },
    ],
  },
  meso: {
    level: "meso",
    name: "Rol Tactica",
    role: "Agente para Gerencia Comercial",
    icon: Monitor,
    openingQuestion: "Laura, soy Rol. Que celula o indicador quieres revisar con tu equipo?",
    prompts: [
      { label: "Como esta la carga de mi equipo?", reportId: "scheduling" },
      { label: "Mi equipo cumple el guion?", reportId: "speech" },
      { label: "A quien rescatamos hoy?", reportId: "rescue" },
      { label: "Tendencia de inversion vs leads", reportId: "budget-trend" },
    ],
  },
  micro: {
    level: "micro",
    name: "Rol Copiloto",
    role: "Tu Agente Operativo",
    icon: Smartphone,
    openingQuestion: "Hey Carlos, soy Rol. Quieres que te arme el plan para cerrar mas hoy?",
    prompts: [
      { label: "Que leads estoy por perder?", reportId: "abandonment" },
      { label: "Cual es la mejor hora para llamar?", reportId: "golden" },
      { label: "Dame un copy para este lead", reportId: "copywriter" },
      { label: "Mi agenda de rescate de hoy", reportId: "rescue" },
    ],
  },
}

export const SECTION_ICON_BY_ID: Record<string, LucideIcon> = Object.fromEntries(
  REPORT_SECTIONS.map((s) => [s.id, s.icon]),
)

/* helpers de color por token semantico */
export function accentClasses(accent: string) {
  const map: Record<string, { text: string; bg: string; border: string }> = {
    info: { text: "text-info", bg: "bg-info/10", border: "border-info/30" },
    warning: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    rescue: { text: "text-rescue", bg: "bg-rescue/10", border: "border-rescue/30" },
    aura: { text: "text-aura", bg: "bg-aura/10", border: "border-aura/30" },
  }
  return map[accent] ?? map.aura
}

export { Settings }
