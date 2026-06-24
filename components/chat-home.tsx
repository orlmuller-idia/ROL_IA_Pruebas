"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, ArrowUpRight, FileBarChart, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useProfile } from "@/contexts/profile-context"
import {
  AGENTS,
  REPORT_SECTIONS,
  ALL_REPORTS,
  findReportByQuery,
  accentClasses,
} from "@/lib/navigation"
import { useVersion, isReportAvailable, reportRequiredTier, VERSIONS } from "@/lib/versioning"
import type { ActiveView } from "@/components/app-sidebar"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  reportId?: string
}

interface ChatHomeProps {
  onNavigate: (view: ActiveView) => void
}

export function ChatHome({ onNavigate }: ChatHomeProps) {
  const { currentProfile } = useProfile()
  const { version, meta: versionMeta } = useVersion()
  const agent = AGENTS[currentProfile.level]
  const AgentIcon = agent.icon
  const ac = accentClasses("aura")

  // Bienvenida personalizada por perfil + version del producto
  const chatCapability =
    versionMeta.chatLevel === "basico"
      ? "te oriento y te llevo directo al reporte correcto"
      : versionMeta.chatLevel === "asistido"
        ? "analizo tus datos, te doy el reporte indicado y mi recomendacion"
        : "trabajo como tu copiloto fijo: analizo, recomiendo y me anticipo a la siguiente accion"
  const welcomeMessage = `Hola ${currentProfile.name}, soy ${agent.name}, ${agent.role.toLowerCase()}. Estas en el plan Rol ${versionMeta.name}, asi que ${chatCapability}.`

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const started = messages.length > 0

  useEffect(() => {
    setMessages([])
  }, [currentProfile.id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const send = (text: string, reportId?: string) => {
    if (!text.trim()) return
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const target = reportId ?? findReportByQuery(text)?.id
      const report = ALL_REPORTS.find((r) => r.id === target)
      let reply: Message
      if (report && !isReportAvailable(report.id, version)) {
        // Reporte existe pero la version no lo cubre
        const reqMeta = VERSIONS[reportRequiredTier(report.id)]
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `"${report.title}" forma parte del plan Rol ${reqMeta.name}. Tu version actual (${versionMeta.name}) aun no lo incluye. Actualiza a ${reqMeta.name} para ${reqMeta.tagline.toLowerCase()} y desbloquear este reporte.`,
          reportId: report.id,
        }
      } else if (report) {
        // Disponible: respuesta segun nivel de chat de la version
        const lead =
          versionMeta.chatLevel === "basico"
            ? `Te llevo al reporte "${report.title}".`
            : versionMeta.chatLevel === "asistido"
              ? `Analice tu pregunta y el reporte "${report.title}" es el indicado. Ahi veras el detalle y mi recomendacion.`
              : `Listo. Abro "${report.title}" y dejo el copiloto activo para sugerirte la siguiente accion sobre estos datos.`
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: `${lead} Responde: ${report.question}`,
          reportId: report.id,
        }
      } else {
        reply = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Puedo abrir cualquiera de tus reportes de inteligencia. Elige una de las sugerencias o dime, por ejemplo, si quieres revisar el ROAS real, las fugas de dinero o tus leads en riesgo.",
        }
      }
      setMessages((prev) => [...prev, reply])
      setIsTyping(false)
    }, 700)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col">
      {/* Conversacion / Hero */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!started ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center pt-8 text-center"
          >
            <div className="bg-aura/10 text-aura mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
              <AgentIcon className="h-7 w-7" />
            </div>
            <Badge variant="outline" className={`mb-3 gap-1 border-current text-[10px] ${ac.text}`}>
              <Sparkles className="h-3 w-3" />
              {agent.name} · {agent.role}
            </Badge>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {agent.openingQuestion}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed text-pretty">
              Escribe lo que necesitas saber del negocio. Rol interpreta tu pregunta y te lleva al
              reporte exacto, sin que tengas que buscar en menus.
            </p>
            <div className="border-border bg-card/60 mt-5 flex items-center gap-2 rounded-full border px-3 py-1.5">
              <Sparkles className="text-aura h-3.5 w-3.5" />
              <span className="text-muted-foreground text-[11px]">
                Plan <span className="text-foreground font-semibold">Rol {versionMeta.name}</span> · {versionMeta.chatLabel}
              </span>
            </div>

            {/* Saludo de bienvenida segun perfil + version */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="border-border bg-muted/50 mt-6 flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 text-left"
            >
              <div className="bg-aura/15 text-aura flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                <AgentIcon className="h-4.5 w-4.5" />
              </div>
              <p className="text-foreground text-sm leading-relaxed">{welcomeMessage}</p>
            </motion.div>

            {/* Informes destacados */}
            <div className="mt-8 w-full max-w-xl text-left">
              <p className="text-muted-foreground mb-2 text-[11px] font-medium">Informes destacados</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {REPORT_SECTIONS.flatMap((s) => s.reports)
                  .slice(0, 4)
                  .map((r) => {
                    const Icon = r.icon
                    const rac = accentClasses(r.accent)
                    const available = isReportAvailable(r.id, version)
                    const reqMeta = VERSIONS[reportRequiredTier(r.id)]
                    return (
                      <button
                        key={r.id}
                        onClick={() => onNavigate({ type: "report", id: r.id })}
                        className={`group flex items-center gap-3 rounded-xl border bg-white p-3 text-left transition-colors ${
                          available ? "border-border hover:border-aura/30" : "border-dashed border-border/70 hover:border-border"
                        }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${available ? rac.bg : "bg-muted"}`}>
                          {available ? (
                            <Icon className={`h-4 w-4 ${rac.text}`} />
                          ) : (
                            <Lock className="text-muted-foreground h-4 w-4" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className={`text-xs font-semibold leading-tight ${available ? "text-foreground" : "text-muted-foreground"}`}>
                            {r.title}
                          </span>
                          <span className="text-muted-foreground text-[11px] leading-tight">
                            {available ? r.question : `Disponible en Rol ${reqMeta.name}`}
                          </span>
                        </div>
                        {available ? (
                          <ArrowUpRight className="text-muted-foreground group-hover:text-aura h-4 w-4 shrink-0" />
                        ) : (
                          <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
                            {reqMeta.name}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user" ? "bg-aura text-white" : "bg-muted/70 text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  {m.reportId && (
                    <button
                      onClick={() => onNavigate({ type: "report", id: m.reportId! })}
                      className="border-aura/30 bg-aura/5 text-aura hover:bg-aura/10 mt-2.5 flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      <FileBarChart className="h-3.5 w-3.5" />
                      Abrir reporte
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/70 flex items-center gap-2 rounded-2xl px-4 py-3">
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "0ms" }} />
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "150ms" }} />
                  <span className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input + sugerencias */}
      <div className="border-border bg-card/40 border-t px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Pregunta a ${agent.name}...`}
            className="border-border bg-white flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="bg-aura text-white hover:opacity-90">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Preguntas sugeridas por perfil */}
        <div className="mt-3">
          <p className="text-muted-foreground mb-2 text-[11px] font-medium">Sugerencias para tu rol</p>
          <div className="flex flex-wrap gap-2">
            {agent.prompts.map((p) => (
              <button
                key={p.label}
                onClick={() => send(p.label, p.reportId)}
                className="border-border bg-white text-foreground hover:border-aura/40 hover:bg-aura/5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
