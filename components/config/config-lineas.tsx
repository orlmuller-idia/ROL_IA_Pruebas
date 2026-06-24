"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
import { Tag, Plus, Pencil, Trash2, AlertTriangle, Building2 } from "lucide-react"
import { toast } from "sonner"
import type { LineaProducto } from "./config-types"
import { useConfigStore } from "./config-store"

// Paleta de acentos para las líneas (consistente con la estética del proyecto).
const PALETA = ["#a855f7", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6"]

export function ConfigLineas() {
  const { empresas, lineas, addLinea, updateLinea, removeLinea, sucursales, gruposUsuarios, usuarios } =
    useConfigStore()
  const [empresaId, setEmpresaId] = useState<string>(empresas[0]?.id ?? "")
  const [crearOpen, setCrearOpen] = useState(false)
  const [editar, setEditar] = useState<LineaProducto | null>(null)
  const [borrar, setBorrar] = useState<LineaProducto | null>(null)
  const [form, setForm] = useState({ nombre: "", color: PALETA[0] })

  const lineasEmpresa = lineas.filter((l) => l.empresaId === empresaId)
  const empresa = empresas.find((e) => e.id === empresaId)

  // Dependencias de una línea (mismo criterio que el backend para bloquear el borrado).
  const depsDe = (lineaId: string) => ({
    sucursales: sucursales.filter((s) => s.lineasProducto.includes(lineaId)).length,
    grupos: gruposUsuarios.filter((g) => g.lineasProducto.includes(lineaId)).length,
    usuarios: usuarios.filter((u) => u.lineasProducto.includes(lineaId)).length,
  })

  const abrirCrear = () => {
    setForm({ nombre: "", color: PALETA[0] })
    setEditar(null)
    setCrearOpen(true)
  }
  const abrirEditar = (l: LineaProducto) => {
    setForm({ nombre: l.nombre, color: l.color })
    setEditar(l)
    setCrearOpen(true)
  }

  const guardar = () => {
    if (!form.nombre.trim()) {
      toast.error("Asigna un nombre a la línea")
      return
    }
    if (editar) {
      updateLinea(editar.id, { nombre: form.nombre.trim(), color: form.color })
      toast.success(`Línea "${form.nombre.trim()}" actualizada`)
    } else {
      addLinea({ id: `lp${Date.now()}`, empresaId, nombre: form.nombre.trim(), color: form.color })
      toast.success(`Línea "${form.nombre.trim()}" creada`)
    }
    setCrearOpen(false)
  }

  const deps = borrar ? depsDe(borrar.id) : { sucursales: 0, grupos: 0, usuarios: 0 }
  const tieneDeps = deps.sucursales > 0 || deps.grupos > 0 || deps.usuarios > 0
  const eliminar = () => {
    if (!borrar) return
    removeLinea(borrar.id)
    toast.success(`Línea "${borrar.nombre}" eliminada`)
    setBorrar(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          Las líneas de producto se crean por empresa y se asignan a las sucursales al crearlas. Los usuarios y grupos solo pueden tomar líneas presentes en sus sucursales.
        </p>
        <div className="flex items-center gap-2">
          <Select value={empresaId} onValueChange={setEmpresaId}>
            <SelectTrigger className="bg-secondary/40 h-9 w-full text-sm sm:w-52">
              <div className="flex items-center gap-2">
                <Building2 className="text-muted-foreground h-3.5 w-3.5" />
                <SelectValue placeholder="Empresa" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {empresas.map((e) => (
                <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={abrirCrear} size="sm" className="bg-aura hover:bg-aura/90 text-foreground shrink-0 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> Nueva línea
          </Button>
        </div>
      </div>

      {lineasEmpresa.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-xl border border-dashed bg-white/50 p-8 text-center text-xs">
          <Tag className="h-5 w-5 opacity-50" />
          {empresa?.nombre ?? "Esta empresa"} aún no tiene líneas de producto. Crea la primera con “Nueva línea”.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {lineasEmpresa.map((l) => {
            const d = depsDe(l.id)
            const usos = d.sucursales + d.grupos + d.usuarios
            return (
              <div key={l.id} className="border-border flex items-center gap-3 rounded-xl border bg-white p-3.5 shadow-sm">
                <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `${l.color}1a`, border: `1.5px solid ${l.color}` }}>
                  <span className="m-[9px] block h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{l.nombre}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {usos === 0 ? "Sin asignar" : `${d.sucursales} sucursal(es) · ${d.grupos} grupo(s) · ${d.usuarios} usuario(s)`}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => abrirEditar(l)} className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs">
                  <Pencil className="h-3 w-3" /> Editar
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setBorrar(l)} className="text-muted-foreground hover:text-destructive h-7 w-7 px-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogo crear/editar línea */}
      <Dialog open={crearOpen} onOpenChange={setCrearOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Tag className="text-aura h-4 w-4" />
              {editar ? "Editar línea" : "Nueva línea"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              {editar ? "Actualiza el nombre o el color." : <>Línea de producto para <span className="text-foreground font-medium">{empresa?.nombre}</span>.</>}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Nombre de la línea</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Línea Premium"
                className="bg-secondary/40 h-9 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Color</Label>
              <div className="flex flex-wrap gap-2">
                {PALETA.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, color: c }))}
                    className={`h-7 w-7 rounded-lg transition-transform ${form.color === c ? "scale-110 ring-2 ring-offset-2" : ""}`}
                    style={{ background: c, ...(form.color === c ? { boxShadow: `0 0 0 2px ${c}` } : {}) }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={guardar} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              {editar ? <><Pencil className="h-3.5 w-3.5" /> Guardar</> : <><Plus className="h-3.5 w-3.5" /> Crear línea</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo eliminar línea */}
      <Dialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Trash2 className="text-destructive h-4 w-4" />
              Eliminar línea
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Vas a eliminar <span className="text-foreground font-medium">{borrar?.nombre}</span>.
            </DialogDescription>
          </DialogHeader>
          {tieneDeps ? (
            <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2 rounded-lg border p-3">
              <AlertTriangle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-muted-foreground text-xs leading-relaxed">
                <p className="text-foreground mb-1 font-medium">No se puede eliminar: está en uso.</p>
                Quítala primero de: {deps.sucursales > 0 && <b>{deps.sucursales} sucursal(es)</b>}
                {deps.grupos > 0 && <> · <b>{deps.grupos} grupo(s)</b></>}
                {deps.usuarios > 0 && <> · <b>{deps.usuarios} usuario(s)</b></>}.
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">La línea no está asignada a sucursales, grupos ni usuarios.</p>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBorrar(null)} className="text-xs">Cancelar</Button>
            <Button size="sm" disabled={tieneDeps} onClick={eliminar} className="bg-destructive hover:bg-destructive/90 gap-1.5 text-xs text-white disabled:opacity-50">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
