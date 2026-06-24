"use client"

import { useState } from "react"
import { Building2, Layers, GitCompareArrows, Filter, Briefcase, Tag, ChevronDown, Check, X, SlidersHorizontal } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { sucursalesSeed, empresasSeed, lineasProductoSeed } from "@/components/config/config-types"
import { useProfile, type ProfileLevel } from "@/contexts/profile-context"

/**
 * Logica compartida de alcance multi-sucursal para la Torre de Control.
 * El "modo" de presentacion depende del nivel de abstraccion del perfil:
 *  - macro: consolida todas sus sucursales en un solo KPI/serie.
 *  - meso: compara sus sucursales lado a lado (ranking / series por sede).
 *  - micro: segmenta -- trabaja sobre una sola sucursal.
 */

export type BranchMode = "consolidado" | "comparativo" | "segmentado"

export function branchModeForLevel(level: ProfileLevel): BranchMode {
  if (level === "macro") return "consolidado"
  if (level === "meso") return "comparativo"
  return "segmentado"
}

export function sucursalNombre(id: string): string {
  return sucursalesSeed.find((s) => s.id === id)?.nombre ?? id
}

export function empresaNombre(id: string): string {
  return empresasSeed.find((e) => e.id === id)?.nombre ?? id
}

export function lineaNombre(id: string): string {
  return lineasProductoSeed.find((l) => l.id === id)?.nombre ?? id
}

/** Empresas visibles del perfil y filtro activo de empresas. */
export function useScopedEmpresas() {
  const { currentProfile, companyFilter } = useProfile()
  const ids = currentProfile.empresas ?? []
  const empresas = empresasSeed.filter((e) => ids.includes(e.id))
  const activeIds = companyFilter.length ? companyFilter : ids
  const activeEmpresas = empresasSeed.filter((e) => activeIds.includes(e.id))
  return { ids, empresas, activeIds, activeEmpresas }
}

/** Lineas de negocio visibles del perfil y filtro activo de lineas. */
export function useScopedLineas() {
  const { currentProfile, lineFilter } = useProfile()
  const ids = currentProfile.lineas ?? []
  const lineas = lineasProductoSeed.filter((l) => ids.includes(l.id))
  const activeIds = lineFilter.length ? lineFilter : ids
  const activeLineas = lineasProductoSeed.filter((l) => activeIds.includes(l.id))
  return { ids, lineas, activeIds, activeLineas }
}

/** Devuelve las sucursales visibles del perfil (objetos completos) y el filtro activo.
 *  Las sucursales se acotan ademas por las empresas activas del filtro (cascada empresa -> sucursal). */
export function useScopedSucursales() {
  const { currentProfile, branchFilter, companyFilter } = useProfile()
  const empresasActivas = companyFilter.length ? companyFilter : currentProfile.empresas ?? []
  // Solo sucursales del perfil que ademas pertenezcan a una empresa activa
  const ids = (currentProfile.sucursales ?? []).filter((sid) => {
    const suc = sucursalesSeed.find((s) => s.id === sid)
    return suc ? empresasActivas.includes(suc.empresaId) : false
  })
  const sucursales = sucursalesSeed.filter((s) => ids.includes(s.id))
  // activeIds = subconjunto seleccionado en el filtro interactivo, acotado a las sucursales visibles
  const activeIds = (branchFilter.length ? branchFilter : ids).filter((id) => ids.includes(id))
  const activeSucursales = sucursalesSeed.filter((s) => activeIds.includes(s.id))
  return {
    ids,
    sucursales,
    activeIds,
    activeSucursales,
    mode: branchModeForLevel(currentProfile.level),
    level: currentProfile.level,
  }
}

const modeConfig: Record<
  BranchMode,
  { icon: typeof Layers; label: string; desc: string; color: string; bg: string; border: string; hex: string }
> = {
  consolidado: {
    icon: Layers,
    label: "Consolidado",
    desc: "Suma todas las sucursales en un unico indicador.",
    color: "text-[#8b5cf6]",
    bg: "bg-[#8b5cf6]/10",
    border: "border-[#8b5cf6]/20",
    hex: "#8b5cf6",
  },
  comparativo: {
    icon: GitCompareArrows,
    label: "Comparativo",
    desc: "Compara las sucursales lado a lado para rankearlas.",
    color: "text-[#3b82f6]",
    bg: "bg-[#3b82f6]/10",
    border: "border-[#3b82f6]/20",
    hex: "#3b82f6",
  },
  segmentado: {
    icon: Filter,
    label: "Segmentado",
    desc: "Detalle operativo enfocado en una sola sucursal.",
    color: "text-[#22c55e]",
    bg: "bg-[#22c55e]/10",
    border: "border-[#22c55e]/20",
    hex: "#22c55e",
  },
}

/**
 * Toolbar-filtro compacto de la Torre de Control. Tres "pildoras" desplegables
 * (Empresas, Sucursales, Lineas) con multi-seleccion. Ocupa una sola fila y se
 * puede contraer por completo para liberar espacio visual. Los reportes leen
 * los filtros activos via useScopedSucursales / useScopedEmpresas / useScopedLineas.
 */
export function BranchScopeBanner() {
  const [collapsed, setCollapsed] = useState(false)
  const { sucursales, mode, ids } = useScopedSucursales()
  const { branchFilter, toggleBranch, setBranchFilter } = useProfile()
  const { empresas, activeIds: empresaActiveIds } = useScopedEmpresas()
  const { companyFilter, toggleCompany, setCompanyFilter } = useProfile()
  const { lineas, activeIds: lineaActiveIds } = useScopedLineas()
  const { lineFilter, toggleLine, setLineFilter } = useProfile()
  const cfg = modeConfig[mode]
  const ModeIcon = cfg.icon

  const branchActiveCount = branchFilter.filter((id) => ids.includes(id)).length || sucursales.length
  const empresaAllActive = empresaActiveIds.length === empresas.length
  const branchAllActive = branchActiveCount === sucursales.length
  const lineaAllActive = lineaActiveIds.length === lineas.length

  // Numero de grupos de filtro con seleccion parcial (para el badge del boton contraer)
  const partialCount =
    (empresas.length > 1 && !empresaAllActive ? 1 : 0) +
    (sucursales.length > 1 && !branchAllActive ? 1 : 0) +
    (lineas.length > 1 && !lineaAllActive ? 1 : 0)

  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {/* Etiqueta + modo */}
        <div className="mr-1 flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg}`}>
            <ModeIcon className={`h-4 w-4 ${cfg.color}`} />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-foreground text-xs font-semibold">Filtros</span>
            <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        {!collapsed && (
          <>
            {/* Empresas */}
            {empresas.length > 0 && (
              <FilterPill
                icon={<Briefcase className="h-3.5 w-3.5" />}
                label="Empresas"
                accent="#0ea5e9"
                allActive={empresaAllActive}
                activeCount={empresaActiveIds.length}
                total={empresas.length}
                onSelectAll={() => setCompanyFilter(empresas.map((e) => e.id))}
                onClear={() => setCompanyFilter([empresas[0].id])}
                options={empresas.map((e) => ({
                  id: e.id,
                  label: e.nombre,
                  active: companyFilter.includes(e.id),
                  onToggle: () => toggleCompany(e.id),
                }))}
              />
            )}

            {/* Sucursales */}
            <FilterPill
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Sucursales"
              accent={cfg.hex}
              allActive={branchAllActive}
              activeCount={branchActiveCount}
              total={sucursales.length}
              emptyHint={ids.length === 0 ? "Sin sucursales en las empresas activas" : undefined}
              onSelectAll={() => setBranchFilter(ids)}
              onClear={() => setBranchFilter(ids.slice(0, 1))}
              options={sucursales.map((s) => ({
                id: s.id,
                label: s.nombre,
                sublabel: empresaNombre(s.empresaId),
                active: branchFilter.includes(s.id),
                onToggle: () => toggleBranch(s.id),
              }))}
            />

            {/* Lineas de negocio */}
            {lineas.length > 0 && (
              <FilterPill
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Lineas"
                accent="#f59e0b"
                allActive={lineaAllActive}
                activeCount={lineaActiveIds.length}
                total={lineas.length}
                onSelectAll={() => setLineFilter(lineas.map((l) => l.id))}
                onClear={() => setLineFilter([lineas[0].id])}
                options={lineas.map((l) => ({
                  id: l.id,
                  label: l.nombre,
                  dot: l.color,
                  active: lineFilter.includes(l.id),
                  onToggle: () => toggleLine(l.id),
                }))}
              />
            )}
          </>
        )}

        {/* Boton contraer / expandir */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="border-border/60 text-muted-foreground hover:text-foreground hover:border-border ml-auto inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors"
          aria-expanded={!collapsed}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {collapsed ? (
            <>
              Mostrar filtros
              {partialCount > 0 && (
                <span className="bg-aura text-foreground ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                  {partialCount}
                </span>
              )}
            </>
          ) : (
            "Contraer"
          )}
        </button>
      </div>

      {/* Resumen compacto cuando esta contraido y hay filtros parciales */}
      {collapsed && partialCount > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {!empresaAllActive && empresas.length > 1 && (
            <SummaryChip color="#0ea5e9" text={`${empresaActiveIds.length}/${empresas.length} empresas`} />
          )}
          {!branchAllActive && (
            <SummaryChip color={cfg.hex} text={`${branchActiveCount}/${sucursales.length} sucursales`} />
          )}
          {!lineaAllActive && lineas.length > 1 && (
            <SummaryChip color="#f59e0b" text={`${lineaActiveIds.length}/${lineas.length} lineas`} />
          )}
        </div>
      )}
    </div>
  )
}

interface FilterOption {
  id: string
  label: string
  sublabel?: string
  dot?: string
  active: boolean
  onToggle: () => void
}

function FilterPill({
  icon,
  label,
  accent,
  allActive,
  activeCount,
  total,
  emptyHint,
  options,
  onSelectAll,
  onClear,
}: {
  icon: React.ReactNode
  label: string
  accent: string
  allActive: boolean
  activeCount: number
  total: number
  emptyHint?: string
  options: FilterOption[]
  onSelectAll: () => void
  onClear: () => void
}) {
  const summary = allActive ? "Todas" : `${activeCount} de ${total}`
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="border-border/60 bg-secondary/30 hover:border-border inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors"
          style={!allActive ? { borderColor: `${accent}55`, color: accent, background: `${accent}0f` } : undefined}
        >
          <span style={{ color: accent }}>{icon}</span>
          <span className="text-foreground">{label}</span>
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ background: `${accent}1a`, color: accent }}
          >
            {summary}
          </span>
          <ChevronDown className="text-muted-foreground h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0">
        <div className="border-border/60 flex items-center justify-between border-b px-3 py-2">
          <span className="text-foreground text-xs font-semibold">{label}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onSelectAll}
              disabled={allActive}
              className="text-muted-foreground hover:text-foreground rounded px-1.5 py-0.5 text-[10px] font-medium disabled:opacity-40"
            >
              Todas
            </button>
            {total > 1 && (
              <button
                onClick={onClear}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium"
              >
                <X className="h-2.5 w-2.5" /> Limpiar
              </button>
            )}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {options.length === 0 ? (
            <p className="text-muted-foreground px-2 py-3 text-center text-[11px]">
              {emptyHint ?? "Sin opciones disponibles"}
            </p>
          ) : (
            options.map((o) => (
              <button
                key={o.id}
                onClick={o.onToggle}
                aria-pressed={o.active}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  o.active ? "bg-secondary/60" : "hover:bg-secondary/40"
                }`}
              >
                <span className="flex items-center gap-2">
                  {o.dot && <span className="h-2 w-2 rounded-full" style={{ background: o.dot }} />}
                  <span className="flex flex-col leading-tight">
                    <span className="text-foreground">{o.label}</span>
                    {o.sublabel && <span className="text-muted-foreground text-[10px]">{o.sublabel}</span>}
                  </span>
                </span>
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    o.active ? "border-transparent" : "border-border"
                  }`}
                  style={o.active ? { background: accent } : undefined}
                >
                  {o.active && <Check className="h-3 w-3 text-white" />}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function SummaryChip({ color, text }: { color: string; text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
      style={{ background: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {text}
    </span>
  )
}
