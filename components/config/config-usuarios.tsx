"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
import { Users, User, Plus, Layers, Boxes, Building2, MapPin, Check, Lock } from "lucide-react"
import { toast } from "sonner"
import { lineasProductoSeed, perfilesSeed } from "./config-types"
import type { Usuario, GrupoUsuarios } from "./config-types"
import { BulkActionsBar } from "./bulk-actions-bar"
import { useConfigStore } from "./config-store"
import { CrmSuggestions, type CrmSugerenciaUsuario, type CrmSugerenciaGrupo } from "./crm-suggestions"
import { useVersion, nextTier, VERSIONS } from "@/lib/versioning"

type Vista = "usuarios" | "grupos"

export function ConfigUsuarios({ soloVista }: { soloVista?: Vista } = {}) {
  const { empresas, sucursales, usuarios, setUsuarios, gruposUsuarios, setGruposUsuarios } = useConfigStore()
  const { version, meta: versionMeta } = useVersion()
  const maxUsers = versionMeta.capabilities.maxUsers
  const crmInheritance = versionMeta.capabilities.crmInheritance
  const atUserLimit = usuarios.length >= maxUsers
  const up = nextTier(version)
  const [vista, setVista] = useState<Vista>(soloVista ?? "usuarios")
  const [selUsuarios, setSelUsuarios] = useState<string[]>([])
  const [selGrupos, setSelGrupos] = useState<string[]>([])
  const [crearUsuarioOpen, setCrearUsuarioOpen] = useState(false)
  const [crearGrupoOpen, setCrearGrupoOpen] = useState(false)

  const primeraEmpresa = empresas[0]?.id ?? ""
  const sucursalesDeEmpresa = (empresaId: string) => sucursales.filter((s) => s.empresaId === empresaId)

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    rol: "",
    empresaFiltro: primeraEmpresa,
    sucursales: [] as string[],
    grupoId: "" as string,
    perfilNivel: "micro" as Usuario["perfilNivel"],
    lineasProducto: [] as string[],
  })
  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: "",
    descripcion: "",
    empresaFiltro: primeraEmpresa,
    sucursalId: "",
    lineasProducto: [] as string[],
  })

  const lineaById = (id: string) => lineasProductoSeed.find((l) => l.id === id)
  const sucursalById = (id: string) => sucursales.find((s) => s.id === id)
  const empresaDeSucursal = (sucursalId: string) => {
    const suc = sucursalById(sucursalId)
    return empresas.find((e) => e.id === suc?.empresaId)
  }
  const grupoById = (id: string | null) => (id ? gruposUsuarios.find((g) => g.id === id) : null)

  const crearUsuario = () => {
    if (atUserLimit) {
      toast.error(`Tu plan Rol ${versionMeta.name} permite hasta ${maxUsers} usuarios`)
      return
    }
    if (!nuevoUsuario.nombre.trim() || !nuevoUsuario.rol.trim()) {
      toast.error("Completa nombre y rol del usuario")
      return
    }
    if (nuevoUsuario.sucursales.length === 0) {
      toast.error("Asigna acceso al menos a una sucursal")
      return
    }
    const grupo = nuevoUsuario.grupoId ? gruposUsuarios.find((g) => g.id === nuevoUsuario.grupoId) : null
    setUsuarios((prev) => [
      ...prev,
      {
        id: `u${Date.now()}`,
        nombre: nuevoUsuario.nombre.trim(),
        email: `${nuevoUsuario.nombre.trim().toLowerCase().replace(/\s+/g, ".")}@grupoandina.com`,
        rol: nuevoUsuario.rol.trim(),
        sucursalId: nuevoUsuario.sucursales[0],
        sucursales: nuevoUsuario.sucursales,
        grupoId: grupo ? grupo.id : null,
        perfilNivel: nuevoUsuario.perfilNivel,
        lineasProducto: grupo ? grupo.lineasProducto : nuevoUsuario.lineasProducto,
        activo: true,
      },
    ])
    toast.success(`Usuario "${nuevoUsuario.nombre.trim()}" creado`)
    setNuevoUsuario({ nombre: "", rol: "", empresaFiltro: primeraEmpresa, sucursales: [], grupoId: "", perfilNivel: "micro", lineasProducto: [] })
    setCrearUsuarioOpen(false)
  }

  const toggleSucursalUsuario = (id: string) =>
    setNuevoUsuario((p) => ({
      ...p,
      sucursales: p.sucursales.includes(id) ? p.sucursales.filter((x) => x !== id) : [...p.sucursales, id],
    }))

  const toggleLineaUsuario = (id: string) =>
    setNuevoUsuario((p) => ({
      ...p,
      lineasProducto: p.lineasProducto.includes(id)
        ? p.lineasProducto.filter((x) => x !== id)
        : [...p.lineasProducto, id],
    }))

  const toggleLineaGrupo = (id: string) =>
    setNuevoGrupo((p) => ({
      ...p,
      lineasProducto: p.lineasProducto.includes(id)
        ? p.lineasProducto.filter((x) => x !== id)
        : [...p.lineasProducto, id],
    }))

  const crearGrupo = () => {
    if (!nuevoGrupo.nombre.trim()) {
      toast.error("Asigna un nombre al grupo")
      return
    }
    if (!nuevoGrupo.sucursalId) {
      toast.error("Selecciona la sucursal del grupo")
      return
    }
    setGruposUsuarios((prev) => [
      ...prev,
      {
        id: `g${Date.now()}`,
        nombre: nuevoGrupo.nombre.trim(),
        descripcion: nuevoGrupo.descripcion.trim() || "Grupo sin descripcion",
        sucursalId: nuevoGrupo.sucursalId,
        tipo: "grupo",
        lineasProducto: nuevoGrupo.lineasProducto,
        miembros: 0,
      },
    ])
    toast.success(`Grupo "${nuevoGrupo.nombre.trim()}" creado`)
    setNuevoGrupo({ nombre: "", descripcion: "", empresaFiltro: primeraEmpresa, sucursalId: "", lineasProducto: [] })
    setCrearGrupoOpen(false)
  }

  // Convierte un vendedor sugerido por el CRM en usuario real (mapeo opcional)
  const convertirUsuarioCrm = (u: CrmSugerenciaUsuario) => {
    if (atUserLimit) {
      toast.error(`Tu plan Rol ${versionMeta.name} permite hasta ${maxUsers} usuarios`)
      return
    }
    const sucursalDefault = sucursales[0]?.id
    if (!sucursalDefault) {
      toast.error("Crea primero una sucursal para asignar el usuario")
      return
    }
    setUsuarios((prev) => [
      ...prev,
      {
        id: `u${Date.now()}`,
        nombre: u.nombre,
        email: u.email,
        rol: u.rol,
        sucursalId: sucursalDefault,
        sucursales: [sucursalDefault],
        grupoId: null,
        perfilNivel: "micro",
        lineasProducto: [],
        activo: true,
      },
    ])
    toast.success(`"${u.nombre}" importado desde el CRM`)
  }

  // Replica un equipo del CRM como grupo (mapeo opcional)
  const convertirGrupoCrm = (g: CrmSugerenciaGrupo) => {
    const sucursalDefault = sucursales[0]?.id ?? ""
    setGruposUsuarios((prev) => [
      ...prev,
      {
        id: `g${Date.now()}`,
        nombre: g.nombre,
        descripcion: g.descripcion,
        sucursalId: sucursalDefault,
        tipo: "grupo",
        lineasProducto: [],
        miembros: 0,
      },
    ])
    toast.success(`Grupo "${g.nombre}" creado desde el CRM`)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Switch de vista (solo cuando la seccion muestra ambas) */}
      {!soloVista && (
        <div className="bg-muted/50 border-border flex w-fit gap-1 rounded-lg border p-1">
          <SwitchBtn active={vista === "usuarios"} onClick={() => setVista("usuarios")} icon={<User className="h-3.5 w-3.5" />}>
            Usuarios
          </SwitchBtn>
          <SwitchBtn active={vista === "grupos"} onClick={() => setVista("grupos")} icon={<Users className="h-3.5 w-3.5" />}>
            Grupos
          </SwitchBtn>
        </div>
      )}

      {vista === "usuarios" ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-muted-foreground text-xs">
                Define a que empresas, sucursales y lineas de producto accede cada usuario
              </p>
              <span className="flex items-center gap-1.5 text-[11px]">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${atUserLimit ? "border-warning/40 text-warning" : "border-aura/30 text-aura"}`}
                >
                  {usuarios.length} / {maxUsers} usuarios
                </Badge>
                <span className="text-muted-foreground">Plan Rol {versionMeta.name}</span>
              </span>
            </div>
            <Button
              onClick={() => setCrearUsuarioOpen(true)}
              disabled={atUserLimit}
              size="sm"
              className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo usuario
            </Button>
          </div>

          {atUserLimit && up && (
            <div className="border-warning/30 bg-warning/5 flex items-start gap-2.5 rounded-xl border px-4 py-3">
              <Lock className="text-warning mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground text-[12px] leading-relaxed">
                Alcanzaste el limite de {maxUsers} usuarios de Rol {versionMeta.name}. Sube a{" "}
                <span className="text-foreground font-semibold">Rol {VERSIONS[up].name}</span> para llegar hasta{" "}
                {VERSIONS[up].capabilities.maxUsers} usuarios.
              </span>
            </div>
          )}

          {crmInheritance ? (
            <CrmSuggestions vista="usuarios" onConvertirUsuario={convertirUsuarioCrm} />
          ) : (
            <div className="border-border/60 bg-muted/30 flex items-start gap-2.5 rounded-xl border border-dashed px-4 py-3">
              <Lock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground text-[12px] leading-relaxed">
                La herencia de usuarios y grupos desde el CRM esta disponible en{" "}
                <span className="text-foreground font-semibold">Rol Enterprise</span>. Importa tus equipos del CRM con un clic al subir de plan.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {usuarios.map((u, i) => {
              const grupo = grupoById(u.grupoId)
              const accesos = u.sucursales ?? [u.sucursalId]
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`border-border flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between ${
                    selUsuarios.includes(u.id) ? "ring-aura/40 ring-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selUsuarios.includes(u.id)}
                      onCheckedChange={() =>
                        setSelUsuarios((p) => (p.includes(u.id) ? p.filter((x) => x !== u.id) : [...p, u.id]))
                      }
                    />
                    <div className="bg-aura/10 text-aura flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
                      {u.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-sm font-semibold">{u.nombre}</span>
                        <Badge variant="outline" className="border-aura/30 text-aura text-[10px] capitalize">{u.perfilNivel}</Badge>
                        {!u.activo && <Badge variant="outline" className="border-border text-muted-foreground text-[10px]">Inactivo</Badge>}
                      </div>
                      <p className="text-muted-foreground text-xs">{u.rol}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-1.5 sm:items-end">
                    <div className="flex flex-wrap gap-1 sm:justify-end">
                      {accesos.map((sid) => {
                        const s = sucursalById(sid)
                        return (
                          <span key={sid} className="border-border text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]">
                            <MapPin className="h-2.5 w-2.5" /> {s?.nombre ?? "—"}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                      <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                        {grupo ? <><Users className="h-3 w-3" /> {grupo.nombre}</> : <><User className="h-3 w-3" /> Individual</>}
                      </span>
                      {u.lineasProducto.map((lid) => {
                        const l = lineaById(lid)
                        return (
                          <span
                            key={lid}
                            className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]"
                            style={{ borderColor: `${l?.color}55`, color: l?.color }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: l?.color }} />
                            {l?.nombre}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <BulkActionsBar
            selectedCount={selUsuarios.length}
            itemLabel="usuario"
            onClear={() => setSelUsuarios([])}
            onToggleActive={() => setSelUsuarios([])}
            replicableBlocks={[
              { id: "sucursales", label: "Acceso a sucursales" },
              { id: "lineas", label: "Lineas de producto" },
              { id: "perfil", label: "Perfil / nivel" },
              { id: "asistente", label: "Asistente Jarvis" },
            ]}
            replicaTargets={usuarios.filter((u) => !selUsuarios.includes(u.id)).map((u) => ({ id: u.id, label: u.nombre }))}
            onReplicate={() => {}}
          />
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs">
              Los grupos asignan lineas de producto a varios usuarios a la vez
            </p>
            <Button onClick={() => setCrearGrupoOpen(true)} size="sm" className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Nuevo grupo
            </Button>
          </div>

          {crmInheritance ? (
            <CrmSuggestions vista="grupos" onConvertirGrupo={convertirGrupoCrm} />
          ) : (
            <div className="border-border/60 bg-muted/30 flex items-start gap-2.5 rounded-xl border border-dashed px-4 py-3">
              <Lock className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-muted-foreground text-[12px] leading-relaxed">
                La herencia de grupos del CRM esta disponible en{" "}
                <span className="text-foreground font-semibold">Rol Enterprise</span>.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {gruposUsuarios.map((g, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`border-border flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm ${
                  selGrupos.includes(g.id) ? "ring-aura/40 ring-2" : ""
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    checked={selGrupos.includes(g.id)}
                    onCheckedChange={() =>
                      setSelGrupos((p) => (p.includes(g.id) ? p.filter((x) => x !== g.id) : [...p, g.id]))
                    }
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Boxes className="text-aura h-4 w-4" />
                      <span className="text-foreground text-sm font-semibold">{g.nombre}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">{g.descripcion}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                    <Users className="h-3 w-3" /> {g.miembros} miembros · {sucursalById(g.sucursalId)?.nombre}
                  </span>
                </div>

                <div className="border-border/50 flex flex-col gap-1.5 border-t pt-2.5">
                  <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide">
                    <Layers className="h-3 w-3" /> Lineas de producto
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {g.lineasProducto.map((lid) => {
                      const l = lineaById(lid)
                      return (
                        <span
                          key={lid}
                          className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]"
                          style={{ borderColor: `${l?.color}55`, color: l?.color }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: l?.color }} />
                          {l?.nombre}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <BulkActionsBar
            selectedCount={selGrupos.length}
            itemLabel="grupo"
            onClear={() => setSelGrupos([])}
            onToggleActive={() => setSelGrupos([])}
            onDuplicate={() => setSelGrupos([])}
            replicableBlocks={[
              { id: "lineas", label: "Lineas de producto" },
              { id: "asistente", label: "Asistente Jarvis" },
              { id: "umbrales", label: "Umbrales de semaforo" },
            ]}
            replicaTargets={gruposUsuarios.filter((g) => !selGrupos.includes(g.id)).map((g) => ({ id: g.id, label: g.nombre }))}
            onReplicate={() => {}}
          />
        </>
      )}

      {/* Dialogo Nuevo usuario */}
      <Dialog open={crearUsuarioOpen} onOpenChange={setCrearUsuarioOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <User className="text-aura h-4 w-4" />
              Nuevo usuario
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Define los datos del usuario y a que sucursales tiene acceso. Filtra por empresa para encontrar sus sucursales.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldU label="Nombre completo">
                <Input
                  value={nuevoUsuario.nombre}
                  onChange={(e) => setNuevoUsuario((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Maria Perez"
                  className="bg-secondary/40 h-9 text-sm"
                />
              </FieldU>
              <FieldU label="Rol / cargo">
                <Input
                  value={nuevoUsuario.rol}
                  onChange={(e) => setNuevoUsuario((p) => ({ ...p, rol: e.target.value }))}
                  placeholder="Asesor Comercial"
                  className="bg-secondary/40 h-9 text-sm"
                />
              </FieldU>
              <FieldU label="Perfil">
                <Select value={nuevoUsuario.perfilNivel} onValueChange={(v) => setNuevoUsuario((p) => ({ ...p, perfilNivel: v as Usuario["perfilNivel"] }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {perfilesSeed.map((pf) => (
                      <SelectItem key={pf.id} value={pf.nivel} className="text-sm">{pf.rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldU>
              <FieldU label="Grupo (opcional)">
                <Select value={nuevoUsuario.grupoId || "none"} onValueChange={(v) => setNuevoUsuario((p) => ({ ...p, grupoId: v === "none" ? "" : v }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">Asignacion individual</SelectItem>
                    {gruposUsuarios.map((g) => <SelectItem key={g.id} value={g.id} className="text-sm">{g.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
            </div>

            {/* Acceso a sucursales con filtro de empresa */}
            <div className="border-border bg-secondary/20 flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                  <MapPin className="text-aura h-3.5 w-3.5" /> Acceso a sucursales
                </Label>
                <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
                  {nuevoUsuario.sucursales.length} seleccionadas
                </Badge>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                  <Building2 className="h-3 w-3" /> Filtra por empresa
                </span>
                <Select value={nuevoUsuario.empresaFiltro} onValueChange={(v) => setNuevoUsuario((p) => ({ ...p, empresaFiltro: v }))}>
                  <SelectTrigger className="bg-card h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                {sucursalesDeEmpresa(nuevoUsuario.empresaFiltro).length === 0 ? (
                  <p className="text-muted-foreground py-2 text-center text-[11px]">Esta empresa aun no tiene sucursales</p>
                ) : (
                  sucursalesDeEmpresa(nuevoUsuario.empresaFiltro).map((s) => {
                    const active = nuevoUsuario.sucursales.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSucursalUsuario(s.id)}
                        className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                          active ? "border-aura/50 bg-aura/10" : "border-border bg-card hover:border-aura/30"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <MapPin className="text-muted-foreground h-3 w-3" />
                          {s.nombre}
                          <span className="text-muted-foreground">· {s.ciudad}</span>
                        </span>
                        {active && <Check className="text-aura h-3.5 w-3.5" />}
                      </button>
                    )
                  })
                )}
              </div>

              {nuevoUsuario.sucursales.length > 0 && (
                <div className="border-border/50 flex flex-wrap gap-1 border-t pt-2">
                  {nuevoUsuario.sucursales.map((sid) => {
                    const s = sucursalById(sid)
                    const emp = empresaDeSucursal(sid)
                    return (
                      <span key={sid} className="bg-aura/10 text-aura inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]">
                        {s?.nombre} <span className="opacity-60">({emp?.nombre})</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {nuevoUsuario.grupoId ? (
              <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                <Layers className="h-3 w-3" /> Heredara las lineas de producto del grupo seleccionado
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                  Lineas de producto (asignacion individual)
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {lineasProductoSeed.map((l) => {
                    const active = nuevoUsuario.lineasProducto.includes(l.id)
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => toggleLineaUsuario(l.id)}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${active ? "" : "opacity-50"}`}
                        style={{ borderColor: `${l.color}55`, color: l.color, background: active ? `${l.color}12` : "transparent" }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
                        {l.nombre}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearUsuarioOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={crearUsuario} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Nuevo grupo */}
      <Dialog open={crearGrupoOpen} onOpenChange={setCrearGrupoOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Boxes className="text-aura h-4 w-4" />
              Nuevo grupo
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Define un grupo y las lineas de producto que heredaran sus miembros.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <FieldU label="Nombre del grupo">
              <Input
                value={nuevoGrupo.nombre}
                onChange={(e) => setNuevoGrupo((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Comercial Premium"
                className="bg-secondary/40 h-9 text-sm"
              />
            </FieldU>
            <FieldU label="Descripcion">
              <Input
                value={nuevoGrupo.descripcion}
                onChange={(e) => setNuevoGrupo((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Equipo enfocado en cuentas premium"
                className="bg-secondary/40 h-9 text-sm"
              />
            </FieldU>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldU label="Empresa">
                <Select value={nuevoGrupo.empresaFiltro} onValueChange={(v) => setNuevoGrupo((p) => ({ ...p, empresaFiltro: v, sucursalId: "" }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
              <FieldU label="Sucursal">
                <Select value={nuevoGrupo.sucursalId} onValueChange={(v) => setNuevoGrupo((p) => ({ ...p, sucursalId: v }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    {sucursalesDeEmpresa(nuevoGrupo.empresaFiltro).map((s) => <SelectItem key={s.id} value={s.id} className="text-sm">{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Lineas de producto</Label>
              <div className="flex flex-wrap gap-1.5">
                {lineasProductoSeed.map((l) => {
                  const active = nuevoGrupo.lineasProducto.includes(l.id)
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => toggleLineaGrupo(l.id)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${active ? "" : "opacity-50"}`}
                      style={{ borderColor: `${l.color}55`, color: l.color, background: active ? `${l.color}12` : "transparent" }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: l.color }} />
                      {l.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCrearGrupoOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={crearGrupo} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" /> Crear grupo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FieldU({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  )
}

function SwitchBtn({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
        active ? "text-aura bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
