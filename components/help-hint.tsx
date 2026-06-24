"use client"

import { HelpCircle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/**
 * HelpHint
 * Pequeno icono de ayuda (?) que abre una explicacion contextual al hacer click o tap.
 * El texto puede cambiar segun el nivel de visualizacion (macro / meso / micro)
 * para exponer mejor cada reporte a cada tipo de usuario.
 * Usa Popover (no Tooltip) para que funcione tambien en movil y sea accesible por teclado.
 */
export function HelpHint({
  text,
  title,
  label = "Que significa este reporte",
  className,
}: {
  text: React.ReactNode
  title?: string
  label?: string
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className={`text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${className ?? ""}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <p className="text-foreground mb-1 text-xs font-semibold">{title}</p>}
        <p className="text-muted-foreground text-[11px] leading-relaxed">{text}</p>
      </PopoverContent>
    </Popover>
  )
}
