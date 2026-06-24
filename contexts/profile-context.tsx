"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { sucursalesSeed } from "@/components/config/config-types"

type ProfileLevel = "macro" | "meso" | "micro"

interface Profile {
  id: string
  name: string
  role: string
  level: ProfileLevel
  /* Empresas del grupo que el perfil puede visualizar. Vacio = todas. */
  empresas: string[]
  /* Sucursales que el perfil puede visualizar en la Torre de Control */
  sucursales: string[]
  /* Lineas de negocio (lineas de producto) a las que el perfil tiene acceso. Vacio = todas. */
  lineas: string[]
}

interface ProfileContextType {
  currentProfile: Profile
  setCurrentProfile: (profile: Profile) => void
  /* Filtro interactivo de empresas aplicado a toda la Torre de Control */
  companyFilter: string[]
  toggleCompany: (id: string) => void
  setCompanyFilter: (ids: string[]) => void
  /* Filtro interactivo de sucursales aplicado a toda la Torre de Control */
  branchFilter: string[]
  toggleBranch: (id: string) => void
  setBranchFilter: (ids: string[]) => void
  /* Filtro interactivo de lineas de negocio aplicado a toda la Torre de Control */
  lineFilter: string[]
  toggleLine: (id: string) => void
  setLineFilter: (ids: string[]) => void
}

const defaultProfiles: Profile[] = [
  { id: "ceo", name: "Roberto Mendez", role: "CEO / Junta Directiva", level: "macro", empresas: ["e1", "e2", "e3"], sucursales: ["s1", "s2", "s3", "s4", "s5"], lineas: ["lp1", "lp2", "lp3", "lp4", "lp5"] },
  { id: "gerente", name: "Laura Garcia", role: "Gerencia Comercial", level: "meso", empresas: ["e1"], sucursales: ["s1", "s2"], lineas: ["lp1", "lp2", "lp3"] },
  { id: "asesor", name: "Carlos Martinez", role: "Asesor Comercial", level: "micro", empresas: ["e1"], sucursales: ["s1"], lineas: ["lp3", "lp5"] },
]

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [currentProfile, setCurrentProfileState] = useState<Profile>(defaultProfiles[0])
  const [companyFilter, setCompanyFilter] = useState<string[]>(defaultProfiles[0].empresas)
  const [branchFilter, setBranchFilter] = useState<string[]>(defaultProfiles[0].sucursales)
  const [lineFilter, setLineFilter] = useState<string[]>(defaultProfiles[0].lineas)

  // Al cambiar de perfil, los filtros se reinician al alcance visible del perfil
  const setCurrentProfile = useCallback((profile: Profile) => {
    setCurrentProfileState(profile)
    setCompanyFilter(profile.empresas)
    setBranchFilter(profile.sucursales)
    setLineFilter(profile.lineas)
  }, [])

  // Alterna una empresa en el filtro; nunca permite dejar el filtro vacio.
  // En cascada, desactivar una empresa oculta sus sucursales del filtro de sucursales.
  const toggleCompany = useCallback(
    (id: string) => {
      setCompanyFilter((prev) => {
        let next: string[]
        if (prev.includes(id)) {
          next = prev.filter((e) => e !== id)
          if (next.length === 0) return prev
        } else {
          next = currentProfile.empresas.filter((e) => prev.includes(e) || e === id)
        }
        // Cascada: las sucursales visibles dependen de las empresas activas
        setBranchFilter((prevBranches) => {
          const allowed = sucursalesSeed.filter((s) => next.includes(s.empresaId)).map((s) => s.id)
          const filtered = prevBranches.filter((s) => allowed.includes(s))
          return filtered.length === 0 ? allowed : filtered
        })
        return next
      })
    },
    [currentProfile],
  )

  // Alterna una sucursal en el filtro; nunca permite dejar el filtro vacio
  const toggleBranch = useCallback(
    (id: string) => {
      setBranchFilter((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((s) => s !== id)
          return next.length === 0 ? prev : next
        }
        // Mantiene el orden segun las sucursales visibles del perfil
        return currentProfile.sucursales.filter((s) => prev.includes(s) || s === id)
      })
    },
    [currentProfile],
  )

  // Alterna una linea de negocio en el filtro; nunca permite dejar el filtro vacio
  const toggleLine = useCallback(
    (id: string) => {
      setLineFilter((prev) => {
        if (prev.includes(id)) {
          const next = prev.filter((l) => l !== id)
          return next.length === 0 ? prev : next
        }
        return currentProfile.lineas.filter((l) => prev.includes(l) || l === id)
      })
    },
    [currentProfile],
  )

  return (
    <ProfileContext.Provider
      value={{
        currentProfile,
        setCurrentProfile,
        companyFilter,
        toggleCompany,
        setCompanyFilter,
        branchFilter,
        toggleBranch,
        setBranchFilter,
        lineFilter,
        toggleLine,
        setLineFilter,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

export { defaultProfiles }
export type { Profile, ProfileLevel }
