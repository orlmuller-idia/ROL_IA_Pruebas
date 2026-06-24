"use client"

import { useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building2, Save, Globe, Coins, Plus } from "lucide-react"
import { toast } from "sonner"
import { MONEDAS } from "./config-types"
import type { Empresa, MonedaCode } from "./config-types"
import { useConfigStore } from "./config-store"

const nuevaEmpresaVacia = () => ({
  nombre: "",
  industria: "",
  zonaHoraria: "America/Bogota (GMT-5)",
  monedaCorporativa: "COP" as MonedaCode,
  sitioWeb: "",
  identidadFiscal: "",
})

export function ConfigEmpresa() {
  const { empresas, setEmpresas, addEmpresa, grupo } = useConfigStore()
  const [selectedId, setSelectedId] = useState<string>(empresas[0]?.id ?? "")
  const [crearOpen, setCrearOpen] = useState(false)
  const [nueva, setNueva] = useState(nuevaEmpresaVacia())

  const empresa = empresas.find((e) => e.id === selectedId) ?? empresas[0]

  const set = <K extends keyof Empresa>(key: K, value: Empresa[K]) =>
    setEmpresas((prev) => prev.map((e) => (e.id === selectedId ? { ...e, [key]: value } : e)))

  const crearEmpresa = () => {
    if (!nueva.nombre.trim()) {
      toast.error("Asigna un nombre a la empresa")
      return
    }
    const id = `e${Date.now()}`
    addEmpresa({
      id,
      grupoId: grupo.id,
      nombre: nueva.nombre.trim(),
      industria: nueva.industria.trim() || "Sin industria",
      zonaHoraria: nueva.zonaHoraria,
      monedaCorporativa: nueva.monedaCorporativa,
      sitioWeb: nueva.sitioWeb.trim(),
      identidadFiscal: nueva.identidadFiscal.trim(),
      datosFacturacion: {
        razonSocial: nueva.nombre.trim(),
        identidadFiscal: nueva.identidadFiscal.trim(),
        direccionFiscal: "",
        correoFacturacion: "",
      },
    })
    toast.success(`Empresa "${nueva.nombre.trim()}" creada y agregada al grupo`)
    setSelectedId(id)
    setNueva(nuevaEmpresaVacia())
    setCrearOpen(false)
  }

  if (!empresa) return null

  return (
    <div className="flex flex-col gap-5">
      {/* Cabecera: empresas del grupo + crear */}
      <div className="border-border flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Building2 className="text-aura h-4 w-4" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">{grupo.nombre}</h4>
            <p className="text-muted-foreground text-xs">
              {empresas.length} {empresas.length === 1 ? "empresa" : "empresas"} · crea o selecciona cual editar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="bg-secondary/40 h-9 w-full text-sm sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id} className="text-sm">
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCrearOpen(true)} size="sm" className="bg-aura hover:bg-aura/90 text-foreground shrink-0 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Chips de empresas */}
      <div className="flex flex-wrap gap-1.5">
        {empresas.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedId(e.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
              e.id === selectedId
                ? "border-aura bg-aura/10 text-aura"
                : "border-border bg-secondary/30 text-muted-foreground hover:border-aura/40"
            }`}
          >
            <Building2 className="h-3 w-3" />
            {e.nombre}
          </button>
        ))}
      </div>

      {/* Identidad */}
      <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Building2 className="text-aura h-4 w-4" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Identidad corporativa</h4>
            <p className="text-muted-foreground text-xs">Datos raiz que heredan las sucursales de esta empresa</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre de la empresa">
            <Input value={empresa.nombre} onChange={(e) => set("nombre", e.target.value)} className="bg-secondary/40 h-9 text-sm" />
          </Field>
          <Field label="Industria">
            <Input value={empresa.industria} onChange={(e) => set("industria", e.target.value)} className="bg-secondary/40 h-9 text-sm" />
          </Field>
          <Field label="Sitio web">
            <Input value={empresa.sitioWeb} onChange={(e) => set("sitioWeb", e.target.value)} className="bg-secondary/40 h-9 text-sm" />
          </Field>
          <Field label="Identidad fiscal">
            <Input value={empresa.identidadFiscal} onChange={(e) => set("identidadFiscal", e.target.value)} className="bg-secondary/40 h-9 text-sm" />
          </Field>
        </div>
      </div>

      {/* Localizacion base */}
      <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b82f6]/10">
            <Globe className="h-4 w-4 text-[#3b82f6]" />
          </div>
          <div>
            <h4 className="text-foreground text-sm font-semibold">Localizacion y moneda base</h4>
            <p className="text-muted-foreground text-xs">Valores por defecto; cada sucursal puede sobreescribirlos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Zona horaria base">
            <Input value={empresa.zonaHoraria} onChange={(e) => set("zonaHoraria", e.target.value)} className="bg-secondary/40 h-9 text-sm" />
          </Field>
          <Field label="Moneda corporativa">
            <Select value={empresa.monedaCorporativa} onValueChange={(v) => set("monedaCorporativa", v as Empresa["monedaCorporativa"])}>
              <SelectTrigger className="bg-secondary/40 h-9 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="text-muted-foreground h-3.5 w-3.5" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {MONEDAS.map((m) => (
                  <SelectItem key={m.code} value={m.code} className="text-sm">
                    {m.code} — {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => toast.success(`Cambios de "${empresa.nombre}" guardados correctamente`)}
          className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs"
        >
          <Save className="h-3.5 w-3.5" />
          Guardar cambios
        </Button>
      </div>

      {/* Dialogo Nueva empresa */}
      <Dialog open={crearOpen} onOpenChange={setCrearOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Building2 className="text-aura h-4 w-4" />
              Nueva empresa
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Crea una empresa del grupo <Badge variant="outline" className="text-[10px]">{grupo.nombre}</Badge>. Luego podras asignarle sucursales y datos de facturacion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <Field label="Nombre de la empresa">
              <Input
                value={nueva.nombre}
                onChange={(e) => setNueva((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Andina Servicios CO"
                className="bg-secondary/40 h-9 text-sm"
              />
            </Field>
            <Field label="Industria">
              <Input
                value={nueva.industria}
                onChange={(e) => setNueva((p) => ({ ...p, industria: e.target.value }))}
                placeholder="Retail / Servicios"
                className="bg-secondary/40 h-9 text-sm"
              />
            </Field>
            <Field label="Sitio web">
              <Input
                value={nueva.sitioWeb}
                onChange={(e) => setNueva((p) => ({ ...p, sitioWeb: e.target.value }))}
                placeholder="empresa.com"
                className="bg-secondary/40 h-9 text-sm"
              />
            </Field>
            <Field label="Identidad fiscal">
              <Input
                value={nueva.identidadFiscal}
                onChange={(e) => setNueva((p) => ({ ...p, identidadFiscal: e.target.value }))}
                placeholder="NIT / RFC / CNPJ"
                className="bg-secondary/40 h-9 text-sm"
              />
            </Field>
            <Field label="Zona horaria base">
              <Input
                value={nueva.zonaHoraria}
                onChange={(e) => setNueva((p) => ({ ...p, zonaHoraria: e.target.value }))}
                className="bg-secondary/40 h-9 text-sm"
              />
            </Field>
            <Field label="Moneda corporativa">
              <Select value={nueva.monedaCorporativa} onValueChange={(v) => setNueva((p) => ({ ...p, monedaCorporativa: v as MonedaCode }))}>
                <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => (
                    <SelectItem key={m.code} value={m.code} className="text-sm">{m.code} — {m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={crearEmpresa} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Crear empresa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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
