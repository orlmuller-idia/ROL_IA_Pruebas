"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import {
  empresasSeed,
  sucursalesSeed,
  grupoEmpresarialSeed,
  usuariosSeed,
  gruposSeed,
} from "./config-types"
import type { Empresa, Sucursal, GrupoEmpresarial, Usuario, GrupoUsuarios } from "./config-types"

/**
 * Store compartido del Centro de Configuracion (solo diseno / mock en memoria).
 * Permite que crear una empresa se refleje al instante en el esquema de grupo,
 * en el selector de empresa de cada sucursal y en la asignacion de accesos.
 */
interface ConfigStore {
  empresas: Empresa[]
  setEmpresas: React.Dispatch<React.SetStateAction<Empresa[]>>
  addEmpresa: (e: Empresa) => void

  grupo: GrupoEmpresarial
  setGrupo: React.Dispatch<React.SetStateAction<GrupoEmpresarial>>
  /* Empresas que integran el grupo. Las demas existen pero quedan fuera del grupo. */
  empresasDelGrupo: string[]
  toggleEmpresaEnGrupo: (id: string) => void
  setEmpresasDelGrupo: (ids: string[]) => void

  sucursales: Sucursal[]
  setSucursales: React.Dispatch<React.SetStateAction<Sucursal[]>>
  addSucursal: (s: Sucursal) => void

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
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosSeed)
  const [gruposUsuarios, setGruposUsuarios] = useState<GrupoUsuarios[]>(gruposSeed)

  const addEmpresa = useCallback((e: Empresa) => {
    setEmpresas((prev) => [...prev, e])
    // Por defecto la nueva empresa entra al grupo
    setEmpresasDelGrupo((prev) => [...prev, e.id])
  }, [])

  const addSucursal = useCallback((s: Sucursal) => {
    setSucursales((prev) => [...prev, s])
  }, [])

  const toggleEmpresaEnGrupo = useCallback((id: string) => {
    setEmpresasDelGrupo((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    )
  }, [])

  return (
    <ConfigStoreContext.Provider
      value={{
        empresas,
        setEmpresas,
        addEmpresa,
        grupo,
        setGrupo,
        empresasDelGrupo,
        toggleEmpresaEnGrupo,
        setEmpresasDelGrupo,
        sucursales,
        setSucursales,
        addSucursal,
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
