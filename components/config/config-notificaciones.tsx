"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Slack, Users, Lock, Plug, ArrowUpRight } from "lucide-react"
import { useVersion, nextTier, VERSIONS, tierCovers, type VersionTier } from "@/lib/versioning"

interface CanalNotif {
  id: string
  nombre: string
  descripcion: string
  icon: React.ReactNode
  tier: VersionTier
}

const CANALES: CanalNotif[] = [
  { id: "Email", nombre: "Email", descripcion: "Resumenes y alertas al correo del responsable.", icon: <Mail className="h-4 w-4" />, tier: "lite" },
  { id: "WhatsApp", nombre: "WhatsApp", descripcion: "Avisos inmediatos al movil del equipo comercial.", icon: <MessageCircle className="h-4 w-4" />, tier: "grow" },
  { id: "Slack", nombre: "Slack", descripcion: "Notificaciones al canal del equipo en Slack.", icon: <Slack className="h-4 w-4" />, tier: "enterprise" },
  { id: "Teams", nombre: "Microsoft Teams", descripcion: "Alertas en los canales de Microsoft Teams.", icon: <Users className="h-4 w-4" />, tier: "enterprise" },
]

export function ConfigNotificaciones() {
  const { version, meta } = useVersion()
  const up = nextTier(version)
  const [activos, setActivos] = useState<Record<string, boolean>>({ Email: true })

  const toggle = (id: string) => setActivos((p) => ({ ...p, [id]: !p[id] }))

  return (
    <div className="flex flex-col gap-6">
      {/* Canales de notificacion */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Canales de notificacion</h3>
            <p className="text-muted-foreground text-xs">Por donde te avisa Rol cuando algo necesita tu atencion</p>
          </div>
          <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">Plan Rol {meta.name}</Badge>
        </div>

        <div className="flex flex-col gap-2.5">
          {CANALES.map((c, i) => {
            const unlocked = tierCovers(version, c.tier)
            const reqMeta = VERSIONS[c.tier]
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-sm ${
                  unlocked ? "border-border" : "border-border/60 border-dashed opacity-80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      unlocked ? "bg-aura/10 text-aura" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {unlocked ? c.icon : <Lock className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                        {c.nombre}
                      </span>
                      {!unlocked && (
                        <Badge variant="outline" className="border-border text-muted-foreground text-[9px]">
                          Rol {reqMeta.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {unlocked ? c.descripcion : `Disponible al subir a Rol ${reqMeta.name}`}
                    </p>
                  </div>
                </div>
                {unlocked ? (
                  <Switch checked={!!activos[c.id]} onCheckedChange={() => toggle(c.id)} />
                ) : (
                  <Lock className="text-muted-foreground/60 h-4 w-4" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Integraciones con plataformas no estandar (Enterprise) */}
      <div className="border-border/60 flex flex-col gap-3 border-t pt-5">
        <div>
          <h3 className="text-foreground text-sm font-semibold">Integraciones con plataformas no estandar</h3>
          <p className="text-muted-foreground text-xs">
            Conecta CRMs propietarios, ERPs o herramientas a medida que no estan en el catalogo estandar.
          </p>
        </div>

        {meta.capabilities.nonStandardIntegrations ? (
          <div className="border-aura/30 bg-aura/5 flex items-center gap-3 rounded-xl border p-4">
            <div className="bg-aura/10 text-aura flex h-9 w-9 items-center justify-center rounded-lg">
              <Plug className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <span className="text-foreground text-sm font-semibold">Conectores a medida habilitados</span>
              <p className="text-muted-foreground text-xs">
                Tu plan Enterprise permite integraciones personalizadas. Solicita un conector con tu equipo de implementacion.
              </p>
            </div>
            <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">Activo</Badge>
          </div>
        ) : (
          <div className="border-border/60 bg-muted/30 flex items-start gap-2.5 rounded-xl border border-dashed p-4">
            <Lock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <span className="text-muted-foreground text-[12px] leading-relaxed">
              Las integraciones con plataformas no estandar son exclusivas de{" "}
              <span className="text-foreground font-semibold">Rol Enterprise</span>.
            </span>
          </div>
        )}
      </div>

      {/* Sugerencia de upgrade */}
      {up && (
        <div className="border-border from-card to-muted/20 flex flex-col gap-3 rounded-xl border bg-gradient-to-br p-4">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="text-aura h-4 w-4" />
            <span className="text-foreground text-sm font-semibold">Desbloquea mas al subir a Rol {VERSIONS[up].name}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {VERSIONS[up].capabilities.notifications
              .filter((n) => !meta.capabilities.notifications.includes(n))
              .map((n) => (
                <li key={n} className="text-muted-foreground flex items-center gap-2 text-xs">
                  <span className="bg-aura h-1.5 w-1.5 rounded-full" />
                  Notificaciones por {n}
                </li>
              ))}
            <li className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="bg-aura h-1.5 w-1.5 rounded-full" />
              Hasta {VERSIONS[up].capabilities.maxUsers} usuarios
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
