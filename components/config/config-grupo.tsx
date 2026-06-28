"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Network, Save, Receipt, Building2, Layers, SplitSquareHorizontal } from "lucide-react"
import { toast } from "sonner"
import type { EsquemaFacturacion } from "./config-types"
import { useConfigStore } from "./config-store"

export function ConfigGrupo() {
  const {
    grupo,
    setGrupo,
    empresas,
    empresasDelGrupo,
  } = useConfigStore()

  const esConsolidada = grupo.esquemaFacturacion === "consolidada"
  const empresasGrupo = empresas.filter((e) => empresasDelGrupo.includes(e.id))
  const matriz = empresasGrupo.find((e) => e.id === grupo.empresaMatrizId) ?? empresasGrupo[0]

  return (
    <div className="flex flex-col gap-5">
      {/* Identidad del grupo */}
      <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Network className="text-aura h-4 w-4" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Grupo empresarial</h4>
            <p className="text-muted-foreground text-xs">
              Agrupa varias empresas que comparten gobernanza y reportes consolidados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre del grupo">
            <Input
              value={grupo.nombre}
              onChange={(e) => setGrupo((prev) => ({ ...prev, nombre: e.target.value }))}
              className="bg-secondary/40 h-9 text-sm"
            />
          </Field>
          <Field label="Empresas en el grupo">
            <div className="flex h-9 items-center">
              <Badge variant="outline" className="text-xs">
                <Building2 className="mr-1 h-3 w-3" />
                {empresasGrupo.length} de {empresas.length} empresas
              </Badge>
            </div>
          </Field>
        </div>
      </div>

      {/* Esquema de facturacion */}
      <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
            <Receipt className="h-4 w-4 text-[#22c55e]" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Esquema de facturacion</h4>
            <p className="text-muted-foreground text-xs">
              Decide si el grupo factura de forma consolidada o cada empresa por separado
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EsquemaCard
            active={esConsolidada}
            onClick={() => setGrupo((prev) => ({ ...prev, esquemaFacturacion: "consolidada" as EsquemaFacturacion }))}
            icon={<Layers className="h-4 w-4" />}
            title="Consolidada"
            desc="Toda la facturacion del grupo se dirige a una sola empresa matriz."
          />
          <EsquemaCard
            active={!esConsolidada}
            onClick={() => setGrupo((prev) => ({ ...prev, esquemaFacturacion: "individual" as EsquemaFacturacion }))}
            icon={<SplitSquareHorizontal className="h-4 w-4" />}
            title="Por empresa"
            desc="Cada empresa del grupo se factura por separado con sus propios datos."
          />
        </div>

        {esConsolidada && (
          <div className="mt-4">
            <Field label="Empresa matriz (recibe la factura consolidada)">
              <Select
                value={matriz?.id ?? ""}
                onValueChange={(v) => setGrupo((prev) => ({ ...prev, empresaMatrizId: v }))}
              >
                <SelectTrigger className="bg-secondary/40 h-9 text-sm sm:w-72">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {empresasGrupo.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-sm">
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => toast.success("Configuracion de grupo y facturacion guardada")}
          className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}

function EsquemaCard({
  active,
  onClick,
  icon,
  title,
  desc,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-all ${
        active
          ? "border-[#22c55e]/40 bg-[#22c55e]/5"
          : "border-border/40 hover:border-border/60 bg-secondary/20"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={active ? "text-[#22c55e]" : "text-muted-foreground"}>{icon}</span>
        <span className={`text-sm font-semibold ${active ? "text-[#22c55e]" : "text-foreground"}`}>{title}</span>
      </div>
      <span className="text-muted-foreground text-xs leading-relaxed">{desc}</span>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  )
}
