"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Lock } from "lucide-react"
import { adChannelsSeed } from "./ad-channels"
import type { AdChannel } from "./ad-channels"
import { PautaOfflineUpload } from "./pauta-offline-upload"
import { useVersion, isChannelAvailable, channelRequiredTier, VERSIONS } from "@/lib/versioning"

export function ConfigPauta() {
  const { version } = useVersion()
  const [channels, setChannels] = useState<AdChannel[]>(adChannelsSeed)

  const toggle = (id: string) =>
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c)))

  const setPct = (id: string, val: number) =>
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, presupuestoPct: val } : c)))

  const totalActivo = channels
    .filter((c) => c.activo && isChannelAvailable(c.id, version))
    .reduce((s, c) => s + c.presupuestoPct, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-foreground text-sm font-semibold">Canales digitales</h3>
            <p className="text-muted-foreground text-xs">
              Activa los canales y distribuye el presupuesto de pauta digital
            </p>
          </div>
          <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
            {totalActivo}% asignado
          </Badge>
        </div>

      <div className="flex flex-col gap-2.5">
        {channels.map((c, i) => {
          const unlocked = isChannelAvailable(c.id, version)
          const reqMeta = VERSIONS[channelRequiredTier(c.id)]
          return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border bg-white p-4 shadow-sm transition-opacity ${
              !unlocked ? "border-border/60 border-dashed opacity-80" : c.activo ? "border-border" : "border-border opacity-60"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                  style={{ background: unlocked ? c.bg : undefined }}
                >
                  {unlocked ? <Megaphone className="h-4 w-4" /> : <Lock className="text-muted-foreground h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
                      {c.nombre}
                    </span>
                    {unlocked && c.nuevo && (
                      <Badge variant="outline" className="border-rescue/30 text-rescue text-[9px]">Nuevo</Badge>
                    )}
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
                <Switch checked={c.activo} onCheckedChange={() => toggle(c.id)} />
              ) : (
                <Lock className="text-muted-foreground/60 h-4 w-4" />
              )}
            </div>

            {unlocked && c.activo && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-muted-foreground w-20 shrink-0 text-[11px]">Presupuesto</span>
                <Slider
                  value={[c.presupuestoPct]}
                  onValueChange={([v]) => setPct(c.id, v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-foreground w-10 text-right text-xs font-semibold">{c.presupuestoPct}%</span>
              </div>
            )}
          </motion.div>
          )
        })}
      </div>
      </div>

      {/* Pauta offline via Excel con lectura IA */}
      <div className="border-border/60 flex flex-col gap-3 border-t pt-5">
        <div>
          <h3 className="text-foreground text-sm font-semibold">Pauta offline</h3>
          <p className="text-muted-foreground text-xs">
            Medios sin API (radio, TV, vallas, prensa). Se cargan por Excel y la IA los integra a los informes.
          </p>
        </div>
        <PautaOfflineUpload />
      </div>
    </div>
  )
}
