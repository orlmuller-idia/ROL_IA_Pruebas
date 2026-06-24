"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { MapPin, Plus, ChevronLeft, Globe, Coins, Languages, Lock, ShieldCheck, Building, Users } from "lucide-react"
import { toast } from "sonner"
import { IDIOMAS, MONEDAS } from "./config-types"
import type { IdiomaCode, MonedaCode } from "./config-types"
import { BulkActionsBar } from "./bulk-actions-bar"
import { SecurityVault } from "@/components/security-vault"
import { useConfigStore } from "./config-store"

const nuevaSucursalVacia = (empresaId: string) => ({
  nombre: "",
  empresaId,
  pais: "",
  ciudad: "",
  idioma: "es" as IdiomaCode,
  moneda: "COP" as MonedaCode,
})

export function ConfigSucursales() {
  const { empresas, sucursales, setSucursales, addSucursal } = useConfigStore()
  const [selected, setSelected] = useState<string[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<"datos" | "boveda">("datos")
  const [crearOpen, setCrearOpen] = useState(false)
  const [nueva, setNueva] = useState(nuevaSucursalVacia(empresas[0]?.id ?? ""))

  const idiomaLabel = (c: string) => IDIOMAS.find((i) => i.code === c)?.label ?? c
  const monedaLabel = (c: string) => MONEDAS.find((m) => m.code === c)?.code ?? c

  const toggleSel = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const toggleActive = () =>
    setSucursales((prev) => prev.map((s) => (selected.includes(s.id) ? { ...s, activa: !s.activa } : s)))

  const crearSucursal = () => {
    if (!nueva.nombre.trim() || !nueva.pais.trim() || !nueva.ciudad.trim()) {
      toast.error("Completa nombre, pais y ciudad para crear la sucursal")
      return
    }
    const id = `s${Date.now()}`
    addSucursal({
      id,
      empresaId: nueva.empresaId || empresas[0]?.id || "",
      nombre: nueva.nombre.trim(),
      pais: nueva.pais.trim(),
      ciudad: nueva.ciudad.trim(),
      idioma: nueva.idioma,
      moneda: nueva.moneda,
      activa: true,
      usuarios: 0,
      bovedaConfigurada: false,
    })
    toast.success(`Sucursal "${nueva.nombre.trim()}" creada`)
    setNueva(nuevaSucursalVacia(empresas[0]?.id ?? ""))
    setCrearOpen(false)
  }

  const guardarDatos = () => {
    toast.success("Datos de la sucursal guardados")
    setOpenId(null)
  }

  const openSucursal = sucursales.find((s) => s.id === openId)

  /* ── Detalle de sucursal ── */
  if (openSucursal) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setOpenId(null)}
          className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver a sucursales
        </button>

        <div className="border-border rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-aura/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Building className="text-aura h-5 w-5" />
            </div>
            <div>
              <h4 className="text-foreground text-base font-semibold">{openSucursal.nombre}</h4>
              <p className="text-muted-foreground text-xs">
                {empresas.find((e) => e.id === openSucursal.empresaId)?.nombre ?? "Sin empresa"} · {openSucursal.ciudad}, {openSucursal.pais}
              </p>
            </div>
          </div>

          {/* sub-tabs */}
          <div className="border-border mt-4 flex gap-1 border-b">
            <TabBtn active={detailTab === "datos"} onClick={() => setDetailTab("datos")}>
              Datos de la sucursal
            </TabBtn>
            <TabBtn active={detailTab === "boveda"} onClick={() => setDetailTab("boveda")}>
              <Lock className="h-3.5 w-3.5" />
              Boveda de seguridad
            </TabBtn>
          </div>

          <div className="pt-4">
            {detailTab === "datos" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label="Empresa del grupo" icon={<Building className="h-3.5 w-3.5" />}>
                  <Select defaultValue={openSucursal.empresaId}>
                    <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {empresas.map((e) => (
                        <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DetailField>
                <DetailField label="Pais" icon={<Globe className="h-3.5 w-3.5" />}>
                  <Input defaultValue={openSucursal.pais} className="bg-secondary/40 h-9 text-sm" />
                </DetailField>
                <DetailField label="Ciudad" icon={<MapPin className="h-3.5 w-3.5" />}>
                  <Input defaultValue={openSucursal.ciudad} className="bg-secondary/40 h-9 text-sm" />
                </DetailField>
                <DetailField label="Idioma" icon={<Languages className="h-3.5 w-3.5" />}>
                  <Select defaultValue={openSucursal.idioma}>
                    <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {IDIOMAS.map((i) => <SelectItem key={i.code} value={i.code} className="text-sm">{i.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DetailField>
                <DetailField label="Moneda" icon={<Coins className="h-3.5 w-3.5" />}>
                  <Select defaultValue={openSucursal.moneda}>
                    <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONEDAS.map((m) => <SelectItem key={m.code} value={m.code} className="text-sm">{m.code} — {m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </DetailField>
              </div>
            ) : (
              <SecurityVault scopeLabel={openSucursal.nombre} />
            )}
          </div>

          {detailTab === "datos" && (
            <div className="border-border mt-5 flex justify-end border-t pt-4">
              <Button onClick={guardarDatos} size="sm" className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
                Guardar cambios
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── Lista de sucursales ── */
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {sucursales.length} sucursales · cada una con su pais, idioma, moneda y boveda propia
        </p>
        <Button onClick={() => setCrearOpen(true)} size="sm" className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Nueva sucursal
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {sucursales.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`group border-border relative flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
              selected.includes(s.id) ? "ring-aura/40 ring-2" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggleSel(s.id)} className="mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm font-semibold">{s.nombre}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${s.activa ? "border-rescue/30 text-rescue" : "border-border text-muted-foreground"}`}
                    >
                      {s.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{s.ciudad}, {s.pais}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Pill icon={<Languages className="h-3 w-3" />}>{idiomaLabel(s.idioma)}</Pill>
              <Pill icon={<Coins className="h-3 w-3" />}>{monedaLabel(s.moneda)}</Pill>
              <Pill icon={<Users className="h-3 w-3" />}>{s.usuarios} usuarios</Pill>
              <Pill
                icon={s.bovedaConfigurada ? <ShieldCheck className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                tone={s.bovedaConfigurada ? "ok" : "warn"}
              >
                {s.bovedaConfigurada ? "Boveda lista" : "Boveda pendiente"}
              </Pill>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => { setOpenId(s.id); setDetailTab("datos") }}
              className="text-xs"
            >
              Configurar sucursal
            </Button>
          </motion.div>
        ))}
      </div>

      <BulkActionsBar
        selectedCount={selected.length}
        itemLabel="sucursal"
        onClear={() => setSelected([])}
        onToggleActive={toggleActive}
        onDuplicate={() => setSelected([])}
        onDelete={() => { setSucursales((prev) => prev.filter((s) => !selected.includes(s.id))); setSelected([]) }}
        replicableBlocks={[
          { id: "boveda", label: "Boveda y credenciales" },
          { id: "idioma", label: "Idioma y moneda" },
          { id: "umbrales", label: "Umbrales de semaforo" },
          { id: "canales", label: "Canales de pauta" },
        ]}
        replicaTargets={sucursales.filter((s) => !selected.includes(s.id)).map((s) => ({ id: s.id, label: s.nombre }))}
        onReplicate={() => {}}
      />

      {/* Dialogo Nueva sucursal */}
      <Dialog open={crearOpen} onOpenChange={setCrearOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Building className="text-aura h-4 w-4" />
              Nueva sucursal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Crea una sede con su pais, idioma y moneda. La boveda de seguridad se configura despues.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
            <DetailField label="Empresa del grupo" icon={<Building className="h-3.5 w-3.5" />}>
              <Select value={nueva.empresaId} onValueChange={(v) => setNueva((p) => ({ ...p, empresaId: v }))}>
                <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {empresas.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DetailField>
            <DetailField label="Nombre" icon={<Building className="h-3.5 w-3.5" />}>
              <Input
                value={nueva.nombre}
                onChange={(e) => setNueva((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Sede Cali"
                className="bg-secondary/40 h-9 text-sm"
              />
            </DetailField>
            <DetailField label="Pais" icon={<Globe className="h-3.5 w-3.5" />}>
              <Input
                value={nueva.pais}
                onChange={(e) => setNueva((p) => ({ ...p, pais: e.target.value }))}
                placeholder="Colombia"
                className="bg-secondary/40 h-9 text-sm"
              />
            </DetailField>
            <DetailField label="Ciudad" icon={<MapPin className="h-3.5 w-3.5" />}>
              <Input
                value={nueva.ciudad}
                onChange={(e) => setNueva((p) => ({ ...p, ciudad: e.target.value }))}
                placeholder="Cali"
                className="bg-secondary/40 h-9 text-sm"
              />
            </DetailField>
            <DetailField label="Idioma" icon={<Languages className="h-3.5 w-3.5" />}>
              <Select value={nueva.idioma} onValueChange={(v) => setNueva((p) => ({ ...p, idioma: v as IdiomaCode }))}>
                <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IDIOMAS.map((i) => <SelectItem key={i.code} value={i.code} className="text-sm">{i.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </DetailField>
            <DetailField label="Moneda" icon={<Coins className="h-3.5 w-3.5" />}>
              <Select value={nueva.moneda} onValueChange={(v) => setNueva((p) => ({ ...p, moneda: v as MonedaCode }))}>
                <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONEDAS.map((m) => <SelectItem key={m.code} value={m.code} className="text-sm">{m.code} — {m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </DetailField>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearOpen(false)} className="text-xs">
              Cancelar
            </Button>
            <Button size="sm" onClick={crearSucursal} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Crear sucursal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors ${
        active ? "border-aura text-aura" : "text-muted-foreground hover:text-foreground border-transparent"
      }`}
    >
      {children}
    </button>
  )
}

function DetailField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  )
}

function Pill({ icon, children, tone = "default" }: { icon: React.ReactNode; children: React.ReactNode; tone?: "default" | "ok" | "warn" }) {
  const cls =
    tone === "ok"
      ? "border-rescue/30 text-rescue bg-rescue/5"
      : tone === "warn"
        ? "border-warning/30 text-warning bg-warning/5"
        : "border-border text-muted-foreground bg-secondary/40"
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] ${cls}`}>
      {icon}
      {children}
    </span>
  )
}
