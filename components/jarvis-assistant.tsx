"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Send,
  Sparkles,
  Building2,
  Monitor,
  Smartphone,
  Minimize2,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useProfile, type ProfileLevel } from "@/contexts/profile-context"
import { useVersion } from "@/lib/versioning"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const jarvisPersonality: Record<ProfileLevel, {
  title: string
  subtitle: string
  icon: typeof Building2
  color: string
  bgColor: string
  greeting: string
  suggestions: string[]
}> = {
  macro: {
    title: "Jarvis Estrategico",
    subtitle: "Consultor de Alto Nivel",
    icon: Building2,
    color: "text-[#8b5cf6]",
    bgColor: "bg-[#8b5cf6]",
    greeting: "Buenos dias. Estoy analizando los indicadores consolidados de la organizacion. El ROAS global actual es de 2.4x con $127M COP en friccion detectada por el Auditor Forense G5. ¿Que desea revisar?",
    suggestions: [
      "¿Cual es el ROAS global?",
      "Dinero perdido en fricciones",
      "Indice de cumplimiento",
      "Alertas institucionales"
    ]
  },
  meso: {
    title: "Jarvis Tactico",
    subtitle: "Estratega de Productividad",
    icon: Monitor,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]",
    greeting: "Hola. He detectado un cuello de botella en la celula comercial Norte: 23 leads acumulados en semaforo amarillo. El cumplimiento proyectado de metas es del 78%. ¿Desea ver el balanceo de cargas?",
    suggestions: [
      "Balanceo de cargas",
      "Cumplimiento de metas",
      "Cuellos de botella",
      "Comparativo de equipos"
    ]
  },
  micro: {
    title: "Jarvis Copiloto",
    subtitle: "Tu Asistente Operativo",
    icon: Smartphone,
    color: "text-[#22c55e]",
    bgColor: "bg-[#22c55e]",
    greeting: "¡Hey! Tienes 3 leads en semaforo verde que necesitan atencion para proteger tu comision. El lead #7742 (Juan Perez) tiene alta probabilidad de cierre. ¿Te muestro el script de objeciones?",
    suggestions: [
      "Mis leads en riesgo",
      "Script de objeciones",
      "Agenda de hoy G8",
      "Mi comision proyectada"
    ]
  }
}

// Simulated responses based on profile
const getJarvisResponse = (level: ProfileLevel, userMessage: string): string => {
  const msg = userMessage.toLowerCase()
  
  if (level === "macro") {
    if (msg.includes("roas")) {
      return "El ROAS consolidado de todas las lineas de negocio es **2.4x** en el periodo actual. Linea Software lidera con 3.1x, mientras que Hardware presenta un ROAS critico de 1.2x. Recomiendo revisar la pausa automatica que G2 ejecuto hace 2 horas en la campana HW-Promocion-Q4."
    }
    if (msg.includes("dinero") || msg.includes("friccion")) {
      return "El Auditor Forense G5 ha detectado **$127.4M COP** en fricciones de atencion humana este mes. El 62% corresponde a demoras de contacto superiores a 10 minutos. Los vendedores Monica Urrea y Pedro Sanchez concentran el 45% de esta fuga."
    }
    if (msg.includes("cumplimiento")) {
      return "El indice de cumplimiento institucional es del **84%**. 3 de 5 celulas comerciales estan en verde. La celula Norte presenta riesgo de incumplimiento con proyeccion al 67% de meta. Sugiero escalar revision a Gerencia Comercial."
    }
    return "Entendido. Estoy procesando su solicitud con vision consolidada. ¿Desea que profundice en algun indicador especifico del dashboard ejecutivo?"
  }
  
  if (level === "meso") {
    if (msg.includes("balanceo") || msg.includes("carga")) {
      return "Analisis de cargas por asesor:\n\n• **Carlos M.:** 45 leads (12 rojos) - SOBRECARGADO\n• **Ana R.:** 28 leads (2 rojos) - OPTIMO\n• **Pedro S.:** 52 leads (18 rojos) - CRITICO\n\nRecomiendo redistribuir 15 leads de Pedro a Ana para equilibrar la celula."
    }
    if (msg.includes("meta") || msg.includes("cumplimiento")) {
      return "Proyeccion de cumplimiento por celula:\n\n• Celula Norte: **67%** (Riesgo)\n• Celula Sur: **94%** (En meta)\n• Celula Centro: **82%** (Aceptable)\n\nG4 proyecta que sin intervencion, la meta global quedara en 78%. Con redistribucion de leads criticos, podemos alcanzar 89%."
    }
    if (msg.includes("cuello") || msg.includes("botella")) {
      return "Detectados **3 cuellos de botella** criticos:\n\n1. **23 leads** en amarillo en celula Norte (promedio 6.2 dias sin movimiento)\n2. **Vendedor Pedro S.** con 18 leads en rojo (bloqueo de asignacion activado)\n3. **Linea Hardware** con tasa de conversion 40% menor al benchmark\n\n¿Activo protocolo de redistribucion?"
    }
    return "Procesando con vision gerencial. Tengo acceso a metricas de tus celulas comerciales asignadas. ¿Necesitas un drill-down especifico?"
  }
  
  // Micro level
  if (msg.includes("lead") || msg.includes("riesgo")) {
    return "Tus leads en riesgo de estancamiento:\n\n🟡 **Juan Perez** (#7742) - 4 dias en amarillo - Ticket: $2.5M\n🟡 **Maria Lopez** (#7743) - 3 dias en amarillo - Ticket: $1.8M\n🟢 **Carlos Ruiz** (#7744) - 1 dia en verde - Ticket: $3.2M\n\nPrioridad: Juan Perez tiene perfil G9 de alta decision. ¡Llamalo ahora!"
  }
  if (msg.includes("script") || msg.includes("objeciones")) {
    return "**Script para Juan Perez (Linea Software):**\n\n*Apertura:* \"Juan, vi que estuviste revisando nuestra solucion de automatizacion. ¿Que parte te genero mas interes?\"\n\n*Objecion precio:* \"Entiendo la preocupacion. Dejame mostrarte el ROI: clientes similares recuperan la inversion en 4 meses.\"\n\n*Cierre:* \"¿Te parece si agendamos una demo de 15 min para esta semana?\""
  }
  if (msg.includes("agenda") || msg.includes("g8")) {
    return "**Tu agenda G8 de hoy:**\n\n• 09:00 - Llamar a Juan Perez (Prioridad Alta)\n• 09:10 - Follow-up Maria Lopez\n• 09:20 - Revisar propuesta Carlos Ruiz\n• 10:00 - Cita confirmada con nuevo lead\n\nG8 ha optimizado tu dia en bloques de 10 min. ¡Vamos con todo!"
  }
  if (msg.includes("comision")) {
    return "**Tu comision proyectada este mes:**\n\n• Ventas cerradas: $8.2M COP\n• Comision ganada: **$820K COP**\n• Leads en pipeline: $12.5M potencial\n• Comision potencial adicional: **$1.25M COP**\n\n¡Si cierras a Juan Perez hoy, sumas $250K mas!"
  }
  return "¡Entendido! Estoy aqui para ayudarte a cerrar mas ventas. ¿Necesitas ver tu agenda G8, scripts de objeciones, o el estado de tus leads?"
}

export function JarvisAssistant() {
  const { currentProfile } = useProfile()
  const { meta: versionMeta } = useVersion()
  const profileLevel = currentProfile.level

  // El chat siempre inicia cerrado como burbuja. Se abre bajo demanda en cualquier plan.
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const prevProfileRef = useRef<string>(currentProfile.id)

  const personality = jarvisPersonality[profileLevel]
  const PersonalityIcon = personality.icon

  // Reset chat when profile changes
  useEffect(() => {
    if (prevProfileRef.current !== currentProfile.id) {
      prevProfileRef.current = currentProfile.id
      setMessages([])
      // Add new greeting after profile change
      if (isOpen) {
        setTimeout(() => {
          setMessages([{
            id: `greeting-${Date.now()}`,
            role: "assistant",
            content: `¡Hola, ${currentProfile.name}! ` + jarvisPersonality[currentProfile.level].greeting,
            timestamp: new Date()
          }])
        }, 300)
      }
    }
  }, [currentProfile, isOpen])

  // Add initial greeting when opening chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        const greeting =
          versionMeta.chatLevel === "basico"
            ? `Hola, ${currentProfile.name}. Soy tu asistente de navegacion. Dime que necesitas y te llevo al reporte correcto.`
            : `¡Hola, ${currentProfile.name}! ` + personality.greeting
        setMessages([{
          id: "greeting",
          role: "assistant",
          content: greeting,
          timestamp: new Date()
        }])
      }, 500)
    }
  }, [isOpen, messages.length, personality.greeting, currentProfile.name, versionMeta.chatLevel])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response (nivel segun version)
    setTimeout(() => {
      let response: string
      if (versionMeta.chatLevel === "basico") {
        // Lite: el chat orienta, no analiza en profundidad
        response =
          "En tu plan Lite puedo orientarte y llevarte al reporte indicado. Para esta consulta, revisa el panel correspondiente en el menu lateral. " +
          "Si quieres que yo analice los datos y te recomiende la siguiente accion, activa el plan Grow (Chat Asistido) o Enterprise (Chat Avanzado Fijo)."
      } else {
        response = getJarvisResponse(profileLevel, input)
      }
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion)
    setTimeout(() => handleSend(), 100)
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-black/20 transition-transform hover:scale-105 ${personality.bgColor}`}
          >
            <Sparkles className="h-6 w-6 text-white" />
            <span className="absolute -bottom-6 right-0 whitespace-nowrap rounded-full bg-foreground px-2 py-0.5 text-[9px] font-semibold text-background">
              {versionMeta.chatLabel}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`border-border/40 fixed z-50 flex flex-col overflow-hidden border bg-white shadow-2xl shadow-black/40 inset-x-3 bottom-3 top-3 rounded-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto ${
              isExpanded ? "sm:h-[600px] sm:w-[500px]" : "sm:h-[500px] sm:w-[380px]"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 ${personality.bgColor}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <PersonalityIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{personality.title}</h3>
                  <p className="text-[11px] text-white/70">{versionMeta.chatLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Cerrar chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Profile Badge */}
            <div className="border-border/30 flex items-center gap-2 border-b bg-white px-4 py-2">
              <Badge variant="outline" className={`gap-1 border-current text-[10px] ${personality.color}`}>
                <PersonalityIcon className="h-3 w-3" />
                {profileLevel.toUpperCase()}
              </Badge>
              <span className="text-muted-foreground text-[11px]">
                Hola, {currentProfile.name}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? `${personality.bgColor} text-white`
                          : "bg-secondary/60 text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-white/60" : "text-muted-foreground"}`}>
                        {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-secondary/60 flex items-center gap-2 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "0ms" }} />
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "150ms" }} />
                        <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "300ms" }} />
                      </div>
                      <span className="text-muted-foreground text-xs">Jarvis esta escribiendo...</span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="border-border/30 border-t px-4 py-3">
                <p className="text-muted-foreground mb-2 text-[11px]">Sugerencias rapidas:</p>
                <div className="flex flex-wrap gap-2">
                  {personality.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestion(suggestion)}
                      className="border-border/40 hover:border-aura/30 hover:bg-aura/5 rounded-full border bg-secondary/40 px-3 py-1.5 text-xs transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-border/30 border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="border-border/40 bg-secondary/40 flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className={`${personality.bgColor} hover:opacity-90`}
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
