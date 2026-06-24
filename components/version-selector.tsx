"use client"

import { ChevronDown, Check, Sparkles, Lock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useVersion, VERSION_LIST, accentForTier } from "@/lib/versioning"

export function VersionSelector() {
  const { version, setVersion, meta } = useVersion()
  const ActiveIcon = meta.icon
  const activeAc = accentForTier(meta.accent)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="border-border/40 hover:border-border/60 hover:bg-secondary/40 flex items-center gap-2.5 rounded-lg border bg-white/60 px-3 py-2 transition-all">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${activeAc.bg}`}>
            <ActiveIcon className={`h-4 w-4 ${activeAc.text}`} />
          </div>
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-muted-foreground text-[9px] font-medium uppercase tracking-wider leading-none">
              Version
            </span>
            <span className="text-foreground text-xs font-semibold leading-tight">Rol {meta.name}</span>
          </div>
          <Badge variant="outline" className={`hidden gap-1 border-current text-[10px] md:flex ${activeAc.text}`}>
            <Sparkles className="h-3 w-3" />
            {meta.chatLabel}
          </Badge>
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="border-border/40 w-[min(340px,calc(100vw-1.5rem))] max-h-[80vh] overflow-y-auto bg-white p-2">
        <div className="mb-1 px-2 py-1.5">
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            Elegir version del producto
          </p>
          <p className="text-muted-foreground/70 text-[10px]">
            Cada plan desbloquea mas inteligencia y un chat mas potente
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          {VERSION_LIST.map((v) => {
            const VIcon = v.icon
            const ac = accentForTier(v.accent)
            const isActive = version === v.id
            return (
              <button
                key={v.id}
                onClick={() => setVersion(v.id)}
                className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-all ${
                  isActive ? `${ac.border} ${ac.bg}` : "border-border/40 hover:border-border/70 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ac.bg}`}>
                    <VIcon className={`h-4.5 w-4.5 ${ac.text}`} />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground text-sm font-semibold">Rol {v.name}</span>
                      {isActive && <Check className={`h-3.5 w-3.5 ${ac.text}`} />}
                    </div>
                    <span className="text-muted-foreground text-[11px] leading-tight">{v.tagline} · {v.audience}</span>
                  </div>
                </div>

                <div className={`flex items-start gap-1.5 rounded-lg px-2 py-1.5 ${ac.bg}`}>
                  <Sparkles className={`mt-0.5 h-3 w-3 shrink-0 ${ac.text}`} />
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-semibold ${ac.text}`}>{v.chatLabel}</span>
                    <span className="text-muted-foreground text-[10px] leading-snug">{v.chatDescription}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-0.5">
                  {v.highlights.map((h) => (
                    <li key={h} className="text-muted-foreground flex items-start gap-1.5 text-[11px] leading-snug">
                      <Check className={`mt-0.5 h-3 w-3 shrink-0 ${ac.text}`} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        <div className="text-muted-foreground/70 mt-1.5 flex items-center gap-1.5 px-2 py-1 text-[10px]">
          <Lock className="h-3 w-3" />
          Los reportes bloqueados muestran a que version pertenecen
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
