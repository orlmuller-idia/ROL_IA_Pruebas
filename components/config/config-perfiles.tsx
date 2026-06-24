"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Eye, Building2, Pencil, GraduationCap, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { GovernanceWizard } from "@/components/governance-wizard"
import { BulkActionsBar } from "./bulk-actions-bar"
import { useOnboarding } from "@/contexts/onboarding-context"

// El perfil define SOLO el nivel de visualización (jerarquía + abstracción), jerárquico macro→meso→micro.
// El ALCANCE de acceso (empresas/sucursales/líneas) NO vive en el perfil: es del usuario/grupo → sin cruce de permisos.
interface PerfilCard {
  id: string
  nombre: string
  nivel: "macro" | "meso" | "micro"
  jerarquia: string
  abstraccion: string
}

const perfilesInit: PerfilCard[] = [
  { id: "macro", nombre: "Perfil Global", nivel: "macro", jerarquia: "CEO / Junta Directiva", abstraccion: "Vision consolidada (KPIs y tendencias)" },
  { id: "meso", nombre: "Perfil Equipo", nivel: "meso", jerarquia: "Gerencia Comercial", abstraccion: "Vision de equipo (tableros y rankings)" },
  { id: "micro", nombre: "Perfil Personal", nivel: "micro", jerarquia: "Asesor Comercial", abstraccion: "Vision operativa (mis leads y tareas)" },
]

const nivelColor: Record<string, string> = {
  macro: "#a855f7",
  meso: "#3b82f6",
  micro: "#22c55e",
}

export function ConfigPerfiles() {
  const [perfiles, setPerfiles] = useState<PerfilCard[]>(perfilesInit)
  const [selected, setSelected] = useState<string[]>([])
  const [borrarId, setBorrarId] = useState<string | null>(null)
  const { enabledByLevel, toggleLevel } = useOnboarding()

  const porBorrar = perfiles.find((p) => p.id === borrarId)
  const eliminarPerfil = () => {
    if (!porBorrar) return
    setPerfiles((prev) => prev.filter((p) => p.id !== porBorrar.id))
    setSelected((prev) => prev.filter((x) => x !== porBorrar.id))
    toast.success(`Perfil "${porBorrar.nombre}" eliminado`)
    setBorrarId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {perfiles.length} perfiles de gobernanza · cada uno define su nivel de visualización (cómo se agregan los datos)
        </p>
        <GovernanceWizard />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {perfiles.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`border-border flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm ${
              selected.includes(p.id) ? "ring-aura/40 ring-2" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={selected.includes(p.id)}
                  onCheckedChange={() =>
                    setSelected((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))
                  }
                  className="mt-0.5"
                />
                <div>
                  <span className="text-foreground text-sm font-semibold">{p.nombre}</span>
                  <Badge
                    variant="outline"
                    className="ml-1.5 text-[10px] capitalize"
                    style={{ borderColor: `${nivelColor[p.nivel]}55`, color: nivelColor[p.nivel] }}
                  >
                    {p.nivel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <Row icon={<Building2 className="h-3.5 w-3.5" />} label="Jerarquia">{p.jerarquia}</Row>
              <Row icon={<Eye className="h-3.5 w-3.5" />} label="Abstraccion">{p.abstraccion}</Row>
            </div>

            <div className="border-border/50 flex items-center justify-between gap-2 border-t pt-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
                <GraduationCap className="h-3.5 w-3.5" /> Onboarding de uso
              </span>
              <Switch
                checked={enabledByLevel[p.nivel]}
                onCheckedChange={() => toggleLevel(p.nivel)}
                className="data-[state=checked]:bg-aura"
                aria-label={`Onboarding para ${p.nombre}`}
              />
            </div>

            <div className="flex items-center justify-end gap-1">
              <GovernanceWizard
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs"
                  >
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBorrarId(p.id)}
                className="text-muted-foreground hover:text-destructive h-7 gap-1 px-2 text-xs"
              >
                <Trash2 className="h-3 w-3" /> Eliminar
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <BulkActionsBar
        selectedCount={selected.length}
        itemLabel="perfil"
        onClear={() => setSelected([])}
        onDuplicate={() => setSelected([])}
        replicableBlocks={[
          { id: "abstraccion", label: "Nivel de abstraccion" },
          { id: "asistente", label: "Asistente Jarvis" },
        ]}
        replicaTargets={perfiles.filter((p) => !selected.includes(p.id)).map((p) => ({ id: p.id, label: p.nombre }))}
        onReplicate={() => {}}
      />

      {/* Dialogo Eliminar perfil */}
      <Dialog open={!!borrarId} onOpenChange={(o) => !o && setBorrarId(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Trash2 className="text-destructive h-4 w-4" />
              Eliminar perfil
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Vas a eliminar <span className="text-foreground font-medium">{porBorrar?.nombre}</span>. El perfil define solo la visualización: el acceso de los usuarios (empresas/sucursales/líneas) no se ve afectado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBorrarId(null)} className="text-xs">Cancelar</Button>
            <Button
              size="sm"
              onClick={eliminarPerfil}
              className="bg-destructive hover:bg-destructive/90 gap-1.5 text-xs text-white"
            >
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <span className="text-muted-foreground">{label}: </span>
        <span className="text-foreground">{children}</span>
      </div>
    </div>
  )
}
