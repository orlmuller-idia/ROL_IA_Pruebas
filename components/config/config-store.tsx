"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  empresasSeed,
  sucursalesSeed,
  grupoEmpresarialSeed,
  usuariosSeed,
  gruposSeed,
  lineasProductoSeed,
} from "./config-types"
import type {
  Empresa,
  Sucursal,
  GrupoEmpresarial,
  Usuario,
  GrupoUsuarios,
  LineaProducto,
} from "./config-types"

/**
 * Store compartido del Centro de Configuracion (solo diseno / mock en memoria).
 * Permite que crear una empresa se refleje al instante en el esquema de grupo,
 * en el selector de empresa de cada sucursal y en la asignacion de accesos.
 */
interface ConfigStore {
  empresas: Empresa[]
  setEmpresas: React.Dispatch<React.SetStateAction<Empresa[]>>
  addEmpresa: (e: Empresa) => void
  removeEmpresa: (id: string) => void

  grupo: GrupoEmpresarial
  setGrupo: React.Dispatch<React.SetStateAction<GrupoEmpresarial>>
  /* Empresas que integran el grupo. Las demas existen pero quedan fuera del grupo. */
  empresasDelGrupo: string[]
  toggleEmpresaEnGrupo: (id: string) => void
  setEmpresasDelGrupo: (ids: string[]) => void

  sucursales: Sucursal[]
  setSucursales: React.Dispatch<React.SetStateAction<Sucursal[]>>
  addSucursal: (s: Sucursal) => void
  updateSucursal: (id: string, patch: Partial<Sucursal>) => void
  removeSucursal: (id: string) => void

  /* Líneas de producto (a nivel de empresa). */
  lineas: LineaProducto[]
  setLineas: React.Dispatch<React.SetStateAction<LineaProducto[]>>
  addLinea: (l: LineaProducto) => void
  updateLinea: (id: string, patch: Partial<LineaProducto>) => void
  removeLinea: (id: string) => void

  usuarios: Usuario[]
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>

  gruposUsuarios: GrupoUsuarios[]
  setGruposUsuarios: React.Dispatch<React.SetStateAction<GrupoUsuarios[]>>
}

const ConfigStoreContext = createContext<ConfigStore | undefined>(undefined)

export function ConfigStoreProvider({ children }: { children: ReactNode }) {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasSeed)
  const [grupo, setGrupo] = useState<GrupoEmpresarial>(grupoEmpresarialSeed)
  const [empresasDelGrupo, setEmpresasDelGrupo] = useState<string[]>(empresasSeed.map((e) => e.id))
  const [sucursales, setSucursales] = useState<Sucursal[]>(sucursalesSeed)
  const [lineas, setLineas] = useState<LineaProducto[]>(lineasProductoSeed)
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosSeed)
  const [gruposUsuarios, setGruposUsuarios] = useState<GrupoUsuarios[]>(gruposSeed)

  const addEmpresa = useCallback((e: Empresa) => {
    setEmpresas((prev) => [...prev, e])
    // Por defecto la nueva empresa entra al grupo
    setEmpresasDelGrupo((prev) => [...prev, e.id])
  }, [])

  // Eliminar empresa = limpieza en cascada del mock (sucursales, líneas y pertenencia al grupo).
  const removeEmpresa = useCallback((id: string) => {
    setEmpresas((prev) => prev.filter((e) => e.id !== id))
    setSucursales((prev) => prev.filter((s) => s.empresaId !== id))
    setLineas((prev) => prev.filter((l) => l.empresaId !== id))
    setEmpresasDelGrupo((prev) => prev.filter((eid) => eid !== id))
  }, [])

  const addSucursal = useCallback((s: Sucursal) => {
    setSucursales((prev) => [...prev, s])
  }, [])

  const updateSucursal = useCallback((id: string, patch: Partial<Sucursal>) => {
    setSucursales((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }, [])

  // Eliminar sucursal: la quita y limpia grupos en esa sede y el acceso de los usuarios.
  const removeSucursal = useCallback((id: string) => {
    setSucursales((prev) => prev.filter((s) => s.id !== id))
    setGruposUsuarios((prev) => prev.filter((g) => g.sucursalId !== id))
    setUsuarios((prev) =>
      prev.map((u) => ({ ...u, sucursales: u.sucursales.filter((sid) => sid !== id) })),
    )
  }, [])

  const addLinea = useCallback((l: LineaProducto) => {
    setLineas((prev) => [...prev, l])
  }, [])

  const updateLinea = useCallback((id: string, patch: Partial<LineaProducto>) => {
    setLineas((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }, [])

  // Eliminar línea: la quita y la remueve de sucursales, grupos y usuarios que la tuvieran.
  const removeLinea = useCallback((id: string) => {
    setLineas((prev) => prev.filter((l) => l.id !== id))
    setSucursales((prev) =>
      prev.map((s) => ({ ...s, lineasProducto: s.lineasProducto.filter((lid) => lid !== id) })),
    )
    setGruposUsuarios((prev) =>
      prev.map((g) => ({ ...g, lineasProducto: g.lineasProducto.filter((lid) => lid !== id) })),
    )
    setUsuarios((prev) =>
      prev.map((u) => ({ ...u, lineasProducto: u.lineasProducto.filter((lid) => lid !== id) })),
    )
  }, [])

  return (
    <ConfigStoreContext.Provider
      value={{
        empresas,
        setEmpresas,
        addEmpresa,
        removeEmpresa,
        grupo,
        setGrupo,
        empresasDelGrupo,
        toggleEmpresaEnGrupo: useCallback((id: string) => {
          setEmpresasDelGrupo((prev) =>
            prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
          )
        }, []),
        setEmpresasDelGrupo,
        sucursales,
        setSucursales,
        addSucursal,
        updateSucursal,
        removeSucursal,
        lineas,
        setLineas,
        addLinea,
        updateLinea,
        removeLinea,
        usuarios,
        setUsuarios,
        gruposUsuarios,
        setGruposUsuarios,
      }}
    >
      {children}
    </ConfigStoreContext.Provider>
  )
}

export function useConfigStore() {
  const ctx = useContext(ConfigStoreContext)
  if (!ctx) throw new Error("useConfigStore must be used within a ConfigStoreProvider")
  return ctx
}
