"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { Rocket, TrendingUp, Building2, type LucideIcon } from "lucide-react"

/* ─────────────────────────────────────────────────────────────
   Versionamiento del producto (planes comerciales)
   Lite  → operar   | Grow → optimizar | Enterprise → gobernar
   ───────────────────────────────────────────────────────────── */

export type VersionTier = "lite" | "grow" | "enterprise"

/** Nivel del chat/agente segun la version contratada */
export type ChatLevel = "basico" | "asistido" | "avanzado"

export interface VersionMeta {
  id: VersionTier
  /** orden ascendente para comparaciones (lite=0, grow=1, enterprise=2) */
  rank: number
  name: string
  /** verbo-promesa de la version */
  tagline: string
  /** a quien va dirigida */
  audience: string
  icon: LucideIcon
  /** token de color semantico para el acento visual */
  accent: string
  /** nivel de chat incluido */
  chatLevel: ChatLevel
  /** etiqueta corta del chat para la UI */
  chatLabel: string
  /** descripcion del chat en esta version */
  chatDescription: string
  /** que incluye (bullets para el selector) */
  highlights: string[]
  /** capacidades comerciales concretas de la version */
  capabilities: VersionCapabilities
}

/** Modelo de venta soportado por la version */
export type SalesModel = "single" | "dual-product"

export interface VersionCapabilities {
  /** maximo de usuarios permitidos */
  maxUsers: number
  /** canales de notificacion habilitados */
  notifications: string[]
  /** modelo de venta: un solo tipo (B2B o B2C) o ambos con producto */
  salesModel: SalesModel
  /** ids de canales de pauta digital habilitados */
  adChannels: string[]
  /** permite heredar usuarios y grupos desde el CRM */
  crmInheritance: boolean
  /** permite integraciones con plataformas no estandar */
  nonStandardIntegrations: boolean
  /** nota sobre la fuente de datos del diagnostico de fuga (CRM-only en Lite) */
  leakSourceNote?: string
}

export const VERSIONS: Record<VersionTier, VersionMeta> = {
  lite: {
    id: "lite",
    rank: 0,
    name: "Lite",
    tagline: "Operar con claridad",
    audience: "Equipos pequenos que arrancan a medir",
    icon: Rocket,
    accent: "info",
    chatLevel: "basico",
    chatLabel: "Chat Basico",
    chatDescription:
      "Asistente que entiende tu pregunta y te lleva al reporte correcto. Sin analisis conversacional ni acciones.",
    highlights: [
      "Auditoria y control del dinero (esencial)",
      "Diagnostico de fuga (solo con datos del CRM)",
      "Pauta offline + Meta y Google Ads",
      "Notificaciones por email · hasta 5 usuarios",
      "Un solo tipo de venta (B2B o B2C)",
    ],
    capabilities: {
      maxUsers: 5,
      notifications: ["Email"],
      salesModel: "single",
      adChannels: ["offline", "meta", "google"],
      crmInheritance: false,
      nonStandardIntegrations: false,
      leakSourceNote:
        "En Lite el diagnostico de fuga se calcula unicamente con la conexion del CRM. No incluye speech analytics de llamadas ni WhatsApp.",
    },
  },
  grow: {
    id: "grow",
    rank: 1,
    name: "Grow",
    tagline: "Optimizar y proyectar",
    audience: "Empresas en expansion que ya quieren forecast",
    icon: TrendingUp,
    accent: "rescue",
    chatLevel: "asistido",
    chatLabel: "Chat Asistido",
    chatDescription:
      "El agente responde con analisis contextual, detecta cuellos de botella y recomienda el siguiente paso.",
    highlights: [
      "Todo lo de Lite",
      "Suma OpenAI Ads, TikTok y LinkedIn",
      "Proyecciones de cierre y ventana dorada",
      "Notificaciones por email y WhatsApp · hasta 15 usuarios",
      "Chat asistido con analisis y recomendaciones",
    ],
    capabilities: {
      maxUsers: 15,
      notifications: ["Email", "WhatsApp"],
      salesModel: "single",
      adChannels: ["offline", "meta", "google", "openai", "tiktok", "linkedin"],
      crmInheritance: false,
      nonStandardIntegrations: false,
    },
  },
  enterprise: {
    id: "enterprise",
    rank: 2,
    name: "Enterprise",
    tagline: "Gobernar con evidencia",
    audience: "Organizaciones que auditan y rinden cuentas",
    icon: Building2,
    accent: "warning",
    chatLevel: "avanzado",
    chatLabel: "Chat Avanzado Fijo",
    chatDescription:
      "Copiloto anclado siempre visible: deteccion de fraude, speech analytics, acciones y vigilancia proactiva en cada pantalla.",
    highlights: [
      "Todo lo de Grow",
      "Integraciones con plataformas no estandar",
      "Notificaciones por Slack y Teams",
      "Ambos tipos de venta (B2B y B2C) con producto",
      "Herencia de usuarios y grupos del CRM · hasta 40 usuarios",
      "Deteccion de fraude CRM vs realidad + speech analytics",
    ],
    capabilities: {
      maxUsers: 40,
      notifications: ["Email", "WhatsApp", "Slack", "Teams"],
      salesModel: "dual-product",
      adChannels: ["offline", "meta", "google", "openai", "tiktok", "linkedin", "custom"],
      crmInheritance: true,
      nonStandardIntegrations: true,
    },
  },
}

/* ─── Canal de pauta → version minima requerida ─── */
export const CHANNEL_MIN_TIER: Record<string, VersionTier> = {
  offline: "lite",
  meta: "lite",
  google: "lite",
  openai: "grow",
  tiktok: "grow",
  linkedin: "grow",
  custom: "enterprise",
}

/** Indica si un canal de pauta esta disponible en la version actual */
export function isChannelAvailable(channelId: string, current: VersionTier): boolean {
  const required = CHANNEL_MIN_TIER[channelId] ?? "lite"
  return tierCovers(current, required)
}

/** Version minima requerida por un canal de pauta (fallback lite) */
export function channelRequiredTier(channelId: string): VersionTier {
  return CHANNEL_MIN_TIER[channelId] ?? "lite"
}

export const VERSION_LIST: VersionMeta[] = [VERSIONS.lite, VERSIONS.grow, VERSIONS.enterprise]

/* ─── Mapa de reportes → version minima requerida ─── */
export const REPORT_MIN_TIER: Record<string, VersionTier> = {
  // Auditoria del dinero
  abandonment: "lite",
  scheduling: "lite",
  "budget-trend": "lite",
  rescue: "grow",
  "human-roas": "grow",
  "roas-trend": "grow",
  // Fugas silenciosas
  leak: "lite", // disponible desde Lite, pero solo con datos del CRM
  copywriter: "grow",
  golden: "grow",
  fraud: "enterprise",
  speech: "enterprise",
  // Proyecciones
  predictor: "grow",
}

/** Compara si la version actual cubre la version minima requerida */
export function tierCovers(current: VersionTier, required: VersionTier): boolean {
  return VERSIONS[current].rank >= VERSIONS[required].rank
}

/** Indica si un reporte esta disponible en la version actual */
export function isReportAvailable(reportId: string, current: VersionTier): boolean {
  const required = REPORT_MIN_TIER[reportId] ?? "lite"
  return tierCovers(current, required)
}

/** Version minima requerida por un reporte (fallback lite) */
export function reportRequiredTier(reportId: string): VersionTier {
  return REPORT_MIN_TIER[reportId] ?? "lite"
}

/** La siguiente version por encima de la actual (null si ya es la mayor) */
export function nextTier(current: VersionTier): VersionTier | null {
  if (current === "lite") return "grow"
  if (current === "grow") return "enterprise"
  return null
}

/** Razones concretas para subir de la version actual a la siguiente */
export const UPGRADE_BENEFITS: Record<VersionTier, string[]> = {
  lite: [
    "Suma OpenAI Ads, TikTok y LinkedIn a tu pauta",
    "Activa notificaciones por WhatsApp",
    "Proyecciones de cierre y ventana dorada",
    "Crece hasta 15 usuarios",
  ],
  grow: [
    "Integra plataformas no estandar a tu medida",
    "Notificaciones por Slack y Teams",
    "Maneja ambos tipos de venta (B2B y B2C) con producto",
    "Hereda usuarios y grupos directo del CRM",
    "Deteccion de fraude y speech analytics · hasta 40 usuarios",
  ],
  enterprise: [],
}

/** Beneficios que se desbloquean al pasar a la siguiente version (vacio si ya es la mayor) */
export function upgradeBenefits(current: VersionTier): string[] {
  return UPGRADE_BENEFITS[current] ?? []
}

/** Clases de color por token semantico de la version */
export function accentForTier(accent: string) {
  const map: Record<string, { text: string; bg: string; border: string }> = {
    info: { text: "text-info", bg: "bg-info/10", border: "border-info/40" },
    rescue: { text: "text-rescue", bg: "bg-rescue/10", border: "border-rescue/40" },
    warning: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/40" },
  }
  return map[accent] ?? map.info
}

/* ─── Contexto de version activa ─── */

interface VersionContextType {
  version: VersionTier
  setVersion: (v: VersionTier) => void
  meta: VersionMeta
}

const VersionContext = createContext<VersionContextType | undefined>(undefined)

export function VersionProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<VersionTier>("enterprise")
  return (
    <VersionContext.Provider value={{ version, setVersion, meta: VERSIONS[version] }}>
      {children}
    </VersionContext.Provider>
  )
}

export function useVersion() {
  const ctx = useContext(VersionContext)
  if (!ctx) throw new Error("useVersion must be used within a VersionProvider")
  return ctx
}
