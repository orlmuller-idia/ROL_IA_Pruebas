import type React from "react"

export interface AdChannel {
  id: string
  nombre: string
  descripcion: string
  /* clase tailwind de color de marca (token-friendly hex permitido para iconografia de marca) */
  color: string
  bg: string
  activo: boolean
  presupuestoPct: number
  nuevo?: boolean
}

export const adChannelsSeed: AdChannel[] = [
  {
    id: "google",
    nombre: "Google Ads",
    descripcion: "Busqueda, Display y YouTube",
    color: "#4285F4",
    bg: "#4285F4",
    activo: true,
    presupuestoPct: 32,
  },
  {
    id: "meta",
    nombre: "Meta Ads",
    descripcion: "Facebook e Instagram",
    color: "#0866FF",
    bg: "#0866FF",
    activo: true,
    presupuestoPct: 30,
  },
  {
    id: "linkedin",
    nombre: "LinkedIn Ads",
    descripcion: "Segmentacion B2B y profesional",
    color: "#0A66C2",
    bg: "#0A66C2",
    activo: true,
    presupuestoPct: 14,
    nuevo: true,
  },
  {
    id: "tiktok",
    nombre: "TikTok Ads",
    descripcion: "Video corto y alcance joven",
    color: "#000000",
    bg: "#000000",
    activo: true,
    presupuestoPct: 16,
    nuevo: true,
  },
  {
    id: "openai",
    nombre: "OpenAI Ads",
    descripcion: "Pauta conversacional en asistentes IA",
    color: "#10A37F",
    bg: "#10A37F",
    activo: false,
    presupuestoPct: 8,
    nuevo: true,
  },
]
