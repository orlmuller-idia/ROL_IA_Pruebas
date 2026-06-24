"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Eye, Layers, Building2, Pencil, GraduationCap } from "lucide-react"
import { GovernanceWizard } from "@/components/governance-wizard"
import { lineasProductoSeed, empresasSeed, sucursalesSeed } from "./config-types"
import { BulkActionsBar } from "./bulk-actions-bar"
import { useOnboarding } from "@/contexts/onboarding-context"

interface PerfilCard {
  id: string
  nombre: string
  nivel: "macro" | "meso" | "micro"
  jerarquia: string
  abstraccion: string
  empresas: string[]
  sucursales: string[]
  lineas: string[]
}

const perfiles: PerfilCard[] = [
  { id: "macro", nombre: "Perfil Global", nivel: "macro", jerarquia: "CEO / Junta Directiva", abstraccion: "Vision consolidada (KPIs y tendencias)", empresas: ["e1", "e2", "e3"], sucursales: ["s1", "s2", "s3", "s4", "s5"], lineas: ["lp1", "lp2", "lp3", "lp4", "lp5"] },
  { id: "meso", nombre: "Perfil Equipo", nivel: "meso", jerarquia: "Gerencia Comercial", abstraccion: "Vision de equipo (tableros y rankings)", empresas: ["e1"], sucursales: ["s1", "s2"], lineas: ["lp1", "lp2", "lp3"] },
  { id: "micro", nombre: "Perfil Personal", nivel: "micro", jerarquia: "Asesor Comercial", abstraccion: "Vision operativa (mis leads y tareas)", empresas: ["e1"], sucursales: ["s1"], lineas: ["lp3", "lp5"] },
]

const nivelColor: Record<string, string> = {
  macro: "#a855f7",
  meso: "#3b82f6",
  micro: "#22c55e",
}

export function ConfigPerfiles() {
  const [selected, setSelected] = useState<string[]>([])
  const { enabledByLevel, toggleLevel } = useOnboarding()
  const lineaById = (id: string) => lineasProductoSeed.find((l) => l.id === id)
  const empresaById = (id: string) => empresasSeed.find((e) => e.id === id)
  const sucursalesDeEmpresas = (empresaIds: string[], sucursalIds: string[]) =>
    sucursalesSeed.filter((s) => empresaIds.includes(s.empresaId) && sucursalIds.includes(s.id))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {perfiles.length} perfiles de gobernanza · cada uno define su nivel de abstraccion y lineas
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

            <div className="border-border/50 flex flex-col gap-1.5 border-t pt-2.5">
              <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
                <Building2 className="h-3 w-3" /> Empresas del grupo
              </span>
              <div className="flex flex-wrap gap-1">
                {p.empresas.map((eid) => {
                  const e = empresaById(eid)
                  return (
                    <Badge key={eid} variant="outline" className="text-[10px] font-normal">
                      {e?.nombre ?? eid}
                    </Badge>
                  )
                })}
              </div>
              <span className="text-muted-foreground text-[10px]">
                {sucursalesDeEmpresas(p.empresas, p.sucursales).length} sucursales con acceso
              </span>
            </div>

            <div className="border-border/50 flex flex-col gap-1.5 border-t pt-2.5">
              <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
                <Layers className="h-3 w-3" /> Lineas asignadas
              </span>
              <div className="flex flex-wrap gap-1">
                {p.lineas.map((lid) => {
                  const l = lineaById(lid)
                  return (
                    <span
                      key={lid}
                      className="h-2 w-2 rounded-full"
                      style={{ background: l?.color }}
                      title={l?.nombre}
                    />
                  )
                })}
                <span className="text-muted-foreground text-[10px]">{p.lineas.length} lineas</span>
              </div>
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

            <div className="flex items-center justify-end">
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
          { id: "empresas", label: "Empresas del grupo" },
          { id: "sucursales", label: "Sucursales" },
          { id: "lineas", label: "Lineas de producto" },
          { id: "asistente", label: "Asistente Jarvis" },
        ]}
        replicaTargets={perfiles.filter((p) => !selected.includes(p.id)).map((p) => ({ id: p.id, label: p.nombre }))}
        onReplicate={() => {}}
      />
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
