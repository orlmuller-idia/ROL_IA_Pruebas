"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
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
import { Users, User, Plus, Layers, Boxes, Building2, MapPin, Check, Lock, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { perfilesSeed } from "./config-types"
import type { Usuario, GrupoUsuarios } from "./config-types"
import { BulkActionsBar } from "./bulk-actions-bar"
import { useConfigStore } from "./config-store"
import { CrmSuggestions, type CrmSugerenciaUsuario, type CrmSugerenciaGrupo } from "./crm-suggestions"
import { useVersion, nextTier, VERSIONS } from "@/lib/versioning"

type Vista = "usuarios" | "grupos"

export function ConfigUsuarios({ soloVista }: { soloVista?: Vista } = {}) {
  const { empresas, sucursales, lineas, usuarios, setUsuarios, gruposUsuarios, setGruposUsuarios } = useConfigStore()
  const { version, meta: versionMeta } = useVersion()
  const maxUsers = versionMeta.capabilities.maxUsers
  const crmInheritance = versionMeta.capabilities.crmInheritance
  const atUserLimit = usuarios.length >= maxUsers
  const up = nextTier(version)
  const [vista, setVista] = useState<Vista>(soloVista ?? "usuarios")
  const [selUsuarios, setSelUsuarios] = useState<string[]>([])
  const [selGrupos, setSelGrupos] = useState<string[]>([])
  const [usuarioOpen, setUsuarioOpen] = useState(false)
  const [grupoOpen, setGrupoOpen] = useState(false)
  const [editUsuarioId, setEditUsuarioId] = useState<string | null>(null)
  const [editGrupoId, setEditGrupoId] = useState<string | null>(null)
  const [borrarUsuario, setBorrarUsuario] = useState<Usuario | null>(null)
  const [borrarGrupo, setBorrarGrupo] = useState<GrupoUsuarios | null>(null)

  const primeraEmpresa = empresas[0]?.id ?? ""
  const sucursalesDeEmpresa = (empresaId: string) => sucursales.filter((s) => s.empresaId === empresaId)

  const usuarioVacio = () => ({
    nombre: "",
    cargo: "",
    role: "member" as Usuario["role"],
    empresaFiltro: primeraEmpresa,
    sucursales: [] as string[],
    grupoId: "" as string,
    perfilNivel: "micro" as Usuario["perfilNivel"],
    lineasProducto: [] as string[],
    activo: true,
  })
  const grupoVacio = () => ({
    nombre: "",
    descripcion: "",
    empresaFiltro: primeraEmpresa,
    sucursalId: "",
    lineasProducto: [] as string[],
  })

  const [formUsuario, setFormUsuario] = useState(usuarioVacio())
  const [formGrupo, setFormGrupo] = useState(grupoVacio())

  const lineaById = (id: string) => lineas.find((l) => l.id === id)
  const sucursalById = (id: string) => sucursales.find((s) => s.id === id)
  const empresaDeSucursal = (sucursalId: string) => {
    const suc = sucursalById(sucursalId)
    return empresas.find((e) => e.id === suc?.empresaId)
  }
  const grupoById = (id: string | null) => (id ? gruposUsuarios.find((g) => g.id === id) : null)

  // REGLA: las líneas asignables a un usuario son la unión de las líneas de SUS sucursales.
  const lineasDisponibles = (sucursalIds: string[]): string[] => {
    const set = new Set<string>()
    for (const sid of sucursalIds) sucursalById(sid)?.lineasProducto.forEach((l) => set.add(l))
    return [...set]
  }

  // ───────── Usuario: abrir crear / editar ─────────
  const abrirCrearUsuario = () => {
    if (atUserLimit) {
      toast.error(`Tu plan Rol ${versionMeta.name} permite hasta ${maxUsers} usuarios`)
      return
    }
    setFormUsuario(usuarioVacio())
    setEditUsuarioId(null)
    setUsuarioOpen(true)
  }
  const abrirEditarUsuario = (u: Usuario) => {
    const accesos = u.sucursales ?? [u.sucursalId]
    setFormUsuario({
      nombre: u.nombre,
      cargo: u.cargo,
      role: u.role,
      empresaFiltro: empresaDeSucursal(accesos[0])?.id ?? primeraEmpresa,
      sucursales: accesos,
      grupoId: u.grupoId ?? "",
      perfilNivel: u.perfilNivel,
      lineasProducto: u.lineasProducto,
      activo: u.activo,
    })
    setEditUsuarioId(u.id)
    setUsuarioOpen(true)
  }

  const guardarUsuario = () => {
    if (!formUsuario.nombre.trim() || !formUsuario.cargo.trim()) {
      toast.error("Completa nombre y cargo del usuario")
      return
    }
    if (formUsuario.sucursales.length === 0) {
      toast.error("Asigna acceso al menos a una sucursal")
      return
    }
    const grupo = formUsuario.grupoId ? gruposUsuarios.find((g) => g.id === formUsuario.grupoId) : null
    const disp = lineasDisponibles(formUsuario.sucursales)
    const lineasFinal = grupo ? grupo.lineasProducto : formUsuario.lineasProducto.filter((l) => disp.includes(l))

    if (editUsuarioId) {
      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === editUsuarioId
            ? {
                ...u,
                nombre: formUsuario.nombre.trim(),
                cargo: formUsuario.cargo.trim(),
                role: formUsuario.role,
                sucursalId: formUsuario.sucursales[0],
                sucursales: formUsuario.sucursales,
                grupoId: grupo ? grupo.id : null,
                perfilNivel: formUsuario.perfilNivel,
                lineasProducto: lineasFinal,
                activo: formUsuario.activo,
              }
            : u,
        ),
      )
      toast.success(`Usuario "${formUsuario.nombre.trim()}" actualizado`)
    } else {
      if (atUserLimit) {
        toast.error(`Tu plan Rol ${versionMeta.name} permite hasta ${maxUsers} usuarios`)
        return
      }
      setUsuarios((prev) => [
        ...prev,
        {
          id: `u${Date.now()}`,
          nombre: formUsuario.nombre.trim(),
          email: `${formUsuario.nombre.trim().toLowerCase().replace(/\s+/g, ".")}@grupoandina.com`,
          cargo: formUsuario.cargo.trim(),
          role: formUsuario.role,
          sucursalId: formUsuario.sucursales[0],
          sucursales: formUsuario.sucursales,
          grupoId: grupo ? grupo.id : null,
          perfilNivel: formUsuario.perfilNivel,
          lineasProducto: lineasFinal,
          activo: true,
        },
      ])
      toast.success(`Usuario "${formUsuario.nombre.trim()}" creado`)
    }
    setUsuarioOpen(false)
  }

  const toggleActivoUsuario = (u: Usuario) => {
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: !x.activo } : x)))
    toast.success(`${u.nombre} ${u.activo ? "desactivado" : "activado"}`)
  }
  const eliminarUsuario = () => {
    if (!borrarUsuario) return
    setUsuarios((prev) => prev.filter((u) => u.id !== borrarUsuario.id))
    setSelUsuarios((prev) => prev.filter((x) => x !== borrarUsuario.id))
    toast.success(`Usuario "${borrarUsuario.nombre}" eliminado`)
    setBorrarUsuario(null)
  }

  const toggleSucursalUsuario = (id: string) =>
    setFormUsuario((p) => {
      const sucursales = p.sucursales.includes(id) ? p.sucursales.filter((x) => x !== id) : [...p.sucursales, id]
      const disp = lineasDisponibles(sucursales)
      return { ...p, sucursales, lineasProducto: p.lineasProducto.filter((l) => disp.includes(l)) }
    })

  const toggleLineaUsuario = (id: string) =>
    setFormUsuario((p) => ({
      ...p,
      lineasProducto: p.lineasProducto.includes(id)
        ? p.lineasProducto.filter((x) => x !== id)
        : [...p.lineasProducto, id],
    }))

  // ───────── Grupo: abrir crear / editar ─────────
  const abrirCrearGrupo = () => {
    setFormGrupo(grupoVacio())
    setEditGrupoId(null)
    setGrupoOpen(true)
  }
  const abrirEditarGrupo = (g: GrupoUsuarios) => {
    setFormGrupo({
      nombre: g.nombre,
      descripcion: g.descripcion,
      empresaFiltro: empresaDeSucursal(g.sucursalId)?.id ?? primeraEmpresa,
      sucursalId: g.sucursalId,
      lineasProducto: g.lineasProducto,
    })
    setEditGrupoId(g.id)
    setGrupoOpen(true)
  }

  const toggleLineaGrupo = (id: string) =>
    setFormGrupo((p) => ({
      ...p,
      lineasProducto: p.lineasProducto.includes(id)
        ? p.lineasProducto.filter((x) => x !== id)
        : [...p.lineasProducto, id],
    }))

  const guardarGrupo = () => {
    if (!formGrupo.nombre.trim()) {
      toast.error("Asigna un nombre al grupo")
      return
    }
    if (!formGrupo.sucursalId) {
      toast.error("Selecciona la sucursal del grupo")
      return
    }
    const disp = sucursalById(formGrupo.sucursalId)?.lineasProducto ?? []
    const lineasFinal = formGrupo.lineasProducto.filter((l) => disp.includes(l))
    if (editGrupoId) {
      setGruposUsuarios((prev) =>
        prev.map((g) =>
          g.id === editGrupoId
            ? {
                ...g,
                nombre: formGrupo.nombre.trim(),
                descripcion: formGrupo.descripcion.trim() || "Grupo sin descripcion",
                sucursalId: formGrupo.sucursalId,
                lineasProducto: lineasFinal,
              }
            : g,
        ),
      )
      toast.success(`Grupo "${formGrupo.nombre.trim()}" actualizado`)
    } else {
      setGruposUsuarios((prev) => [
        ...prev,
        {
          id: `g${Date.now()}`,
          nombre: formGrupo.nombre.trim(),
          descripcion: formGrupo.descripcion.trim() || "Grupo sin descripcion",
          sucursalId: formGrupo.sucursalId,
          tipo: "grupo",
          lineasProducto: lineasFinal,
          miembros: 0,
        },
      ])
      toast.success(`Grupo "${formGrupo.nombre.trim()}" creado`)
    }
    setGrupoOpen(false)
  }

  const eliminarGrupo = () => {
    if (!borrarGrupo) return
    // Los usuarios del grupo quedan sin grupo (grupoId = null).
    setUsuarios((prev) => prev.map((u) => (u.grupoId === borrarGrupo.id ? { ...u, grupoId: null } : u)))
    setGruposUsuarios((prev) => prev.filter((g) => g.id !== borrarGrupo.id))
    setSelGrupos((prev) => prev.filter((x) => x !== borrarGrupo.id))
    toast.success(`Grupo "${borrarGrupo.nombre}" eliminado`)
    setBorrarGrupo(null)
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
        cargo: u.rol,
        role: "member",
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

  const grupoEnForm = formUsuario.grupoId ? gruposUsuarios.find((g) => g.id === formUsuario.grupoId) : null
  const lineasDispUsuario = lineasDisponibles(formUsuario.sucursales)
  const lineasDispGrupo = sucursalById(formGrupo.sucursalId)?.lineasProducto ?? []

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
              onClick={abrirCrearUsuario}
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
                  className={`border-border flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between ${
                    selUsuarios.includes(u.id) ? "ring-aura/40 ring-2" : ""
                  } ${!u.activo ? "opacity-70" : ""}`}
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
                      <p className="text-muted-foreground text-xs">{u.cargo}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-1.5 lg:items-end">
                    <div className="flex flex-wrap gap-1 lg:justify-end">
                      {accesos.map((sid) => {
                        const s = sucursalById(sid)
                        return (
                          <span key={sid} className="border-border text-muted-foreground inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]">
                            <MapPin className="h-2.5 w-2.5" /> {s?.nombre ?? "—"}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 lg:justify-end">
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

                  {/* Acciones: activar/desactivar (≠ eliminar), editar, eliminar */}
                  <div className="border-border/60 flex items-center gap-2 border-t pt-2.5 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
                    <div className="flex items-center gap-1.5" title="Activar / desactivar (no elimina)">
                      <Switch checked={u.activo} onCheckedChange={() => toggleActivoUsuario(u)} className="data-[state=checked]:bg-aura" />
                      <span className="text-muted-foreground text-[10px]">{u.activo ? "Activo" : "Inactivo"}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => abrirEditarUsuario(u)} className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs">
                      <Pencil className="h-3 w-3" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setBorrarUsuario(u)} className="text-muted-foreground hover:text-destructive h-7 w-7 px-0" title="Eliminar usuario">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <BulkActionsBar
            selectedCount={selUsuarios.length}
            itemLabel="usuario"
            onClear={() => setSelUsuarios([])}
            onToggleActive={() => {
              setUsuarios((prev) => prev.map((u) => (selUsuarios.includes(u.id) ? { ...u, activo: !u.activo } : u)))
              setSelUsuarios([])
            }}
            onDelete={() => {
              setUsuarios((prev) => prev.filter((u) => !selUsuarios.includes(u.id)))
              setSelUsuarios([])
            }}
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
            <Button onClick={abrirCrearGrupo} size="sm" className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
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

                <div className="border-border/50 flex items-center justify-end gap-1 border-t pt-2.5">
                  <Button variant="ghost" size="sm" onClick={() => abrirEditarGrupo(g)} className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2 text-xs">
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setBorrarGrupo(g)} className="text-muted-foreground hover:text-destructive h-7 gap-1 px-2 text-xs">
                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <BulkActionsBar
            selectedCount={selGrupos.length}
            itemLabel="grupo"
            onClear={() => setSelGrupos([])}
            onDelete={() => {
              setUsuarios((prev) => prev.map((u) => (u.grupoId && selGrupos.includes(u.grupoId) ? { ...u, grupoId: null } : u)))
              setGruposUsuarios((prev) => prev.filter((g) => !selGrupos.includes(g.id)))
              setSelGrupos([])
            }}
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

      {/* Dialogo Crear / Editar usuario */}
      <Dialog open={usuarioOpen} onOpenChange={setUsuarioOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <User className="text-aura h-4 w-4" />
              {editUsuarioId ? "Editar usuario" : "Nuevo usuario"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Define los datos del usuario y a que sucursales tiene acceso. Las lineas disponibles dependen de sus sucursales.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto py-2 pr-1">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldU label="Nombre completo">
                <Input
                  value={formUsuario.nombre}
                  onChange={(e) => setFormUsuario((p) => ({ ...p, nombre: e.target.value }))}
                  placeholder="Maria Perez"
                  className="bg-secondary/40 h-9 text-sm"
                />
              </FieldU>
              <FieldU label="Cargo">
                <Input
                  value={formUsuario.cargo}
                  onChange={(e) => setFormUsuario((p) => ({ ...p, cargo: e.target.value }))}
                  placeholder="Asesor Comercial"
                  className="bg-secondary/40 h-9 text-sm"
                />
              </FieldU>
              <FieldU label="Rol">
                <Select value={formUsuario.role} onValueChange={(v) => setFormUsuario((p) => ({ ...p, role: v as Usuario["role"] }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="text-sm">Administrador</SelectItem>
                    <SelectItem value="member" className="text-sm">Miembro</SelectItem>
                  </SelectContent>
                </Select>
                {formUsuario.role === "admin" && (
                  <p className="text-muted-foreground/70 mt-1 text-[11px]">
                    Tendra acceso a la configuracion de las empresas asignadas.
                  </p>
                )}
              </FieldU>
              <FieldU label="Perfil">
                <Select value={formUsuario.perfilNivel} onValueChange={(v) => setFormUsuario((p) => ({ ...p, perfilNivel: v as Usuario["perfilNivel"] }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {perfilesSeed.map((pf) => (
                      <SelectItem key={pf.id} value={pf.nivel} className="text-sm">{pf.rol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldU>
              <FieldU label="Grupo (opcional)">
                <Select value={formUsuario.grupoId || "none"} onValueChange={(v) => setFormUsuario((p) => ({ ...p, grupoId: v === "none" ? "" : v }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-sm">Asignacion individual</SelectItem>
                    {gruposUsuarios.map((g) => <SelectItem key={g.id} value={g.id} className="text-sm">{g.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
              <FieldU label="Estado">
                <div className="bg-secondary/40 flex h-9 items-center gap-2 rounded-md px-3">
                  <Switch checked={formUsuario.activo} onCheckedChange={(v) => setFormUsuario((p) => ({ ...p, activo: v }))} className="data-[state=checked]:bg-aura" />
                  <span className="text-muted-foreground text-xs">{formUsuario.activo ? "Activo" : "Inactivo"}</span>
                </div>
              </FieldU>
            </div>

            {/* Acceso a sucursales con filtro de empresa */}
            <div className="border-border bg-secondary/20 flex flex-col gap-3 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-foreground flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
                  <MapPin className="text-aura h-3.5 w-3.5" /> Acceso a sucursales
                </Label>
                <Badge variant="outline" className="border-aura/30 text-aura text-[10px]">
                  {formUsuario.sucursales.length} seleccionadas
                </Badge>
              </div>
              <p className="text-muted-foreground/80 text-[10px]">Un usuario puede acceder a varias sedes; las lineas disponibles salen de estas sucursales.</p>

              <div className="flex flex-col gap-1.5">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                  <Building2 className="h-3 w-3" /> Filtra por empresa
                </span>
                <Select value={formUsuario.empresaFiltro} onValueChange={(v) => setFormUsuario((p) => ({ ...p, empresaFiltro: v }))}>
                  <SelectTrigger className="bg-card h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                {sucursalesDeEmpresa(formUsuario.empresaFiltro).length === 0 ? (
                  <p className="text-muted-foreground py-2 text-center text-[11px]">Esta empresa aun no tiene sucursales</p>
                ) : (
                  sucursalesDeEmpresa(formUsuario.empresaFiltro).map((s) => {
                    const active = formUsuario.sucursales.includes(s.id)
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
                          <span className="text-muted-foreground">· {s.ciudad} · {s.lineasProducto.length} lineas</span>
                        </span>
                        {active && <Check className="text-aura h-3.5 w-3.5" />}
                      </button>
                    )
                  })
                )}
              </div>

              {formUsuario.sucursales.length > 0 && (
                <div className="border-border/50 flex flex-wrap gap-1 border-t pt-2">
                  {formUsuario.sucursales.map((sid) => {
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

            {/* Líneas: heredadas del grupo o individuales (filtradas por sucursal) */}
            {grupoEnForm ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Layers className="h-3 w-3" /> Heredadas del grupo <span className="text-foreground font-medium">{grupoEnForm.nombre}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {grupoEnForm.lineasProducto.length === 0 ? (
                    <span className="text-muted-foreground text-[11px]">El grupo no tiene lineas asignadas.</span>
                  ) : (
                    grupoEnForm.lineasProducto.map((lid) => {
                      const l = lineaById(lid)
                      return (
                        <span key={lid} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]" style={{ borderColor: `${l?.color}55`, color: l?.color, background: `${l?.color}12` }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: l?.color }} />
                          {l?.nombre}
                        </span>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
                  Lineas de producto (individual)
                </Label>
                {formUsuario.sucursales.length === 0 ? (
                  <p className="text-muted-foreground text-[11px]">Selecciona sucursales para ver sus lineas disponibles.</p>
                ) : lineasDispUsuario.length === 0 ? (
                  <p className="text-muted-foreground text-[11px]">Las sucursales seleccionadas no tienen lineas. Asignalas en la seccion <span className="text-foreground font-medium">Lineas de producto</span> o al crear la sucursal.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {lineasDispUsuario.map((lid) => {
                      const l = lineaById(lid)
                      if (!l) return null
                      const active = formUsuario.lineasProducto.includes(l.id)
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
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setUsuarioOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={guardarUsuario} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              {editUsuarioId ? <><Pencil className="h-3.5 w-3.5" /> Guardar</> : <><Plus className="h-3.5 w-3.5" /> Crear usuario</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Crear / Editar grupo */}
      <Dialog open={grupoOpen} onOpenChange={setGrupoOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Boxes className="text-aura h-4 w-4" />
              {editGrupoId ? "Editar grupo" : "Nuevo grupo"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Define un grupo y las lineas de producto que heredaran sus miembros. Las lineas salen de la sucursal del grupo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <FieldU label="Nombre del grupo">
              <Input
                value={formGrupo.nombre}
                onChange={(e) => setFormGrupo((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Comercial Premium"
                className="bg-secondary/40 h-9 text-sm"
              />
            </FieldU>
            <FieldU label="Descripcion">
              <Input
                value={formGrupo.descripcion}
                onChange={(e) => setFormGrupo((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder="Equipo enfocado en cuentas premium"
                className="bg-secondary/40 h-9 text-sm"
              />
            </FieldU>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldU label="Empresa">
                <Select value={formGrupo.empresaFiltro} onValueChange={(v) => setFormGrupo((p) => ({ ...p, empresaFiltro: v, sucursalId: "", lineasProducto: [] }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {empresas.map((e) => <SelectItem key={e.id} value={e.id} className="text-sm">{e.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
              <FieldU label="Sucursal">
                <Select value={formGrupo.sucursalId} onValueChange={(v) => setFormGrupo((p) => ({ ...p, sucursalId: v, lineasProducto: [] }))}>
                  <SelectTrigger className="bg-secondary/40 h-9 text-sm"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    {sucursalesDeEmpresa(formGrupo.empresaFiltro).map((s) => <SelectItem key={s.id} value={s.id} className="text-sm">{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FieldU>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Lineas de producto</Label>
              {!formGrupo.sucursalId ? (
                <p className="text-muted-foreground text-[11px]">Selecciona una sucursal para ver sus lineas.</p>
              ) : lineasDispGrupo.length === 0 ? (
                <p className="text-muted-foreground text-[11px]">La sucursal no tiene lineas asignadas. Asignalas en <span className="text-foreground font-medium">Lineas de producto</span> o al crear la sucursal.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {lineasDispGrupo.map((lid) => {
                    const l = lineaById(lid)
                    if (!l) return null
                    const active = formGrupo.lineasProducto.includes(l.id)
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
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setGrupoOpen(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={guardarGrupo} className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs">
              {editGrupoId ? <><Pencil className="h-3.5 w-3.5" /> Guardar</> : <><Plus className="h-3.5 w-3.5" /> Crear grupo</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Eliminar usuario */}
      <Dialog open={!!borrarUsuario} onOpenChange={(o) => !o && setBorrarUsuario(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Trash2 className="text-destructive h-4 w-4" />
              Eliminar usuario
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Vas a eliminar a <span className="text-foreground font-medium">{borrarUsuario?.nombre}</span>. Esta accion es permanente. Si solo quieres suspender su acceso, usa <span className="text-foreground font-medium">desactivar</span> en su lugar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBorrarUsuario(null)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={eliminarUsuario} className="bg-destructive hover:bg-destructive/90 gap-1.5 text-xs text-white">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogo Eliminar grupo */}
      <Dialog open={!!borrarGrupo} onOpenChange={(o) => !o && setBorrarGrupo(null)}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Trash2 className="text-destructive h-4 w-4" />
              Eliminar grupo
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Vas a eliminar <span className="text-foreground font-medium">{borrarGrupo?.nombre}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="border-warning/30 bg-warning/5 flex items-start gap-2 rounded-lg border p-3">
            <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-muted-foreground text-xs leading-relaxed">
              Los usuarios de este grupo quedaran <span className="text-foreground font-medium">sin grupo</span> (conservan su acceso a sucursales; pierden las lineas heredadas del grupo).
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBorrarGrupo(null)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={eliminarGrupo} className="bg-destructive hover:bg-destructive/90 gap-1.5 text-xs text-white">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
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
