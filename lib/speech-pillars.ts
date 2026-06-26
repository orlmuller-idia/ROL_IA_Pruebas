/**
 * Modelo de evaluacion de Speech Analytics por 4 pilares (version Enterprise).
 * Cada pilar agrupa subniveles y tiene un peso configurable por sucursal.
 * La suma de los 4 pesos no debe superar el 100%.
 */

export interface SpeechSubItem {
  id: string
  label: string
  /** ejemplo de guion / criterio de referencia que se comparara para validar cumplimiento */
  placeholder: string
}

export interface SpeechPillar {
  id: string
  label: string
  /** descripcion corta para la configuracion */
  hint: string
  /** color hex para barras / puntos en los informes */
  color: string
  /** clases de acento para tarjetas */
  accent: { text: string; bg: string; border: string }
  /** peso por defecto (suman 100 entre los 4) */
  defaultWeight: number
  subItems: SpeechSubItem[]
}

export const SPEECH_PILLARS: SpeechPillar[] = [
  {
    id: "proceso",
    label: "Adherencia al proceso y protocolo",
    hint: "Cumplimiento del guion corporativo y los pasos obligatorios.",
    color: "#3b82f6",
    accent: { text: "text-info", bg: "bg-info/10", border: "border-info/20" },
    defaultWeight: 30,
    subItems: [
      {
        id: "proceso-apertura",
        label: "Apertura y saludo",
        placeholder:
          "Ej: \"Buenos dias, le saluda [nombre] de [empresa]. Gracias por contactarnos, con quien tengo el gusto?\"",
      },
      {
        id: "proceso-checklist",
        label: "Check list / validacion de datos",
        placeholder:
          "Ej: Confirmar nombre completo, documento, telefono y correo antes de continuar con la gestion.",
      },
      {
        id: "proceso-cierre",
        label: "Manejo del cierre",
        placeholder:
          "Ej: \"Resumo lo acordado: [...]. Quedamos asi y le envio la confirmacion al correo. Algo mas en lo que pueda ayudarle?\"",
      },
    ],
  },
  {
    id: "skills",
    label: "Sales skills",
    hint: "Habilidades comerciales del asesor durante la conversacion.",
    color: "#22c55e",
    accent: { text: "text-rescue", bg: "bg-rescue/10", border: "border-rescue/20" },
    defaultWeight: 25,
    subItems: [
      {
        id: "skills-indagacion",
        label: "Indagacion y deteccion de necesidades",
        placeholder:
          "Ej: Hacer al menos 3 preguntas abiertas para entender necesidad, presupuesto y urgencia antes de ofrecer.",
      },
      {
        id: "skills-objeciones",
        label: "Manejo de objeciones",
        placeholder:
          "Ej: Reconocer la objecion, validar la preocupacion y responder con un beneficio concreto. No discutir.",
      },
      {
        id: "skills-valor",
        label: "Presentacion de valor",
        placeholder:
          "Ej: Conectar al menos 2 beneficios con la necesidad detectada antes de mencionar el precio.",
      },
    ],
  },
  {
    id: "experiencia",
    label: "Experiencia del cliente",
    hint: "Calidad de la interaccion percibida por el cliente.",
    color: "#a855f7",
    accent: { text: "text-aura", bg: "bg-aura/10", border: "border-aura/20" },
    defaultWeight: 25,
    subItems: [
      {
        id: "exp-sentimiento",
        label: "Analisis de sentimiento",
        placeholder:
          "Ej: El cliente termina la llamada con sentimiento neutro o positivo; sin frustracion detectada.",
      },
      {
        id: "exp-escucha",
        label: "Escucha activa",
        placeholder:
          "Ej: Parafrasear lo que dice el cliente y no interrumpir. Confirmar entendimiento antes de avanzar.",
      },
      {
        id: "exp-tono",
        label: "Lenguaje y tono",
        placeholder:
          "Ej: Tono calido y profesional, sin tecnicismos ni muletillas. Tratamiento de usted durante toda la llamada.",
      },
    ],
  },
  {
    id: "negociacion",
    label: "Resolucion y negociacion",
    hint: "Capacidad de convertir resistencias en avance comercial.",
    color: "#f59e0b",
    accent: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    defaultWeight: 20,
    subItems: [
      {
        id: "neg-conversion",
        label: "Conversion de objeciones",
        placeholder:
          "Ej: Tras una objecion de precio, ofrecer alternativa o plan de pago y lograr que el cliente reconsidere.",
      },
      {
        id: "neg-intencion",
        label: "Intencion de compra",
        placeholder:
          "Ej: Identificar senales de compra (\"cuando\", \"como pago\") y proponer el siguiente paso de forma directa.",
      },
    ],
  },
]

/** Suma de los pesos por defecto (debe ser 100). */
export const DEFAULT_WEIGHT_TOTAL = SPEECH_PILLARS.reduce((s, p) => s + p.defaultWeight, 0)

/** Indice rapido de pilar por id. */
export const PILLAR_BY_ID: Record<string, SpeechPillar> = Object.fromEntries(
  SPEECH_PILLARS.map((p) => [p.id, p]),
)

/** Nivel base de calidad por sucursal (alineado con el % de guion del dataset). */
export const SPEECH_BRANCH_BASE: Record<string, number> = {
  s1: 82,
  s2: 68,
  s3: 91,
  s4: 61,
  s5: 88,
}

/* Hash determinista para generar scores estables (mock de diseno). */
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Score de cumplimiento (0-100) de un subnivel en una sucursal.
 * Determinista: gira alrededor del nivel base de la sucursal con variacion estable.
 */
export function subItemScore(sucursalId: string, subItemId: string): number {
  const base = SPEECH_BRANCH_BASE[sucursalId] ?? 75
  const variation = (hash(`${sucursalId}|${subItemId}`) % 21) - 10 // -10..+10
  return Math.max(38, Math.min(99, base + variation))
}

/**
 * Score de un pilar (0-100) para una sucursal: promedio de los subniveles
 * marcados como "debe cumplirse". Si no hay ninguno requerido, promedia todos.
 */
export function pillarScore(
  sucursalId: string,
  pillar: SpeechPillar,
  required: Record<string, boolean>,
): number {
  const relevant = pillar.subItems.filter((s) => required[s.id] !== false)
  const items = relevant.length > 0 ? relevant : pillar.subItems
  const sum = items.reduce((acc, s) => acc + subItemScore(sucursalId, s.id), 0)
  return Math.round(sum / items.length)
}

/**
 * Score global ponderado (0-100) de una sucursal segun los pesos configurados.
 * Normaliza por la suma de pesos para que el resultado sea comparable aunque
 * los pesos no sumen exactamente 100.
 */
export function weightedScore(
  sucursalId: string,
  weights: Record<string, number>,
  required: Record<string, boolean>,
): number {
  let weighted = 0
  let totalWeight = 0
  for (const pillar of SPEECH_PILLARS) {
    const w = weights[pillar.id] ?? 0
    if (w <= 0) continue
    weighted += w * pillarScore(sucursalId, pillar, required)
    totalWeight += w
  }
  if (totalWeight === 0) return 0
  return Math.round(weighted / totalWeight)
}
