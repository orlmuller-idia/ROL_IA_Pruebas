"use client"

import { BarChart3, LayoutGrid, Table2 } from "lucide-react"
import type { ProfileLevel } from "@/contexts/profile-context"

/**
 * Selector de vista por reporte.
 * Mapea los niveles de gobernanza a su presentacion equivalente:
 *  - macro -> Grafico
 *  - meso  -> Cards
 *  - micro -> Tabla
 * Permite al usuario alternar la presentacion del reporte sin cambiar de perfil.
 */
const VIEWS: { id: ProfileLevel; label: string; icon: typeof BarChart3 }[] = [
  { id: "macro", label: "Grafico", icon: BarChart3 },
  { id: "meso", label: "Cards", icon: LayoutGrid },
  { id: "micro", label: "Tabla", icon: Table2 },
]

export function ReportViewToggle({
  value,
  onChange,
}: {
  value: ProfileLevel
  onChange: (v: ProfileLevel) => void
}) {
  return (
    <div className="bg-muted/50 border-border flex shrink-0 items-center gap-0.5 rounded-lg border p-0.5">
      {VIEWS.map((v) => {
        const Icon = v.icon
        const active = value === v.id
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            aria-pressed={active}
            title={v.label}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
              active
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        )
      })}
    </div>
  )
}
