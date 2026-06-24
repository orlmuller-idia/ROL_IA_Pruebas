"use client"

import {
  Building2,
  Monitor,
  Smartphone,
  ChevronDown,
  Check,
  User,
  Users,
  Crown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useProfile, defaultProfiles, type ProfileLevel } from "@/contexts/profile-context"

const levelConfig: Record<ProfileLevel, { icon: typeof Building2; color: string; bgColor: string; label: string; desc: string }> = {
  macro: {
    icon: Building2,
    color: "text-[#8b5cf6]",
    bgColor: "bg-[#8b5cf6]/10",
    label: "GLOBAL",
    desc: "Vision consolidada"
  },
  meso: {
    icon: Monitor,
    color: "text-[#3b82f6]",
    bgColor: "bg-[#3b82f6]/10",
    label: "EQUIPO",
    desc: "Vision gerencial"
  },
  micro: {
    icon: Smartphone,
    color: "text-[#22c55e]",
    bgColor: "bg-[#22c55e]/10",
    label: "PERSONAL",
    desc: "Vision operativa"
  },
}

export function ProfileSelector() {
  const { currentProfile, setCurrentProfile } = useProfile()
  const config = levelConfig[currentProfile.level]
  const LevelIcon = config.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="border-border/40 hover:border-border/60 hover:bg-secondary/40 flex items-center gap-3 rounded-lg border bg-white/60 px-3 py-2 transition-all">
          {/* Avatar */}
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor}`}>
            {currentProfile.level === "macro" ? (
              <Crown className={`h-4 w-4 ${config.color}`} />
            ) : currentProfile.level === "meso" ? (
              <Users className={`h-4 w-4 ${config.color}`} />
            ) : (
              <User className={`h-4 w-4 ${config.color}`} />
            )}
          </div>

          {/* Info */}
          <div className="hidden flex-col items-start sm:flex">
            <span className="text-foreground text-xs font-medium">{currentProfile.name}</span>
            <span className="text-muted-foreground text-[10px]">{currentProfile.role}</span>
          </div>

          {/* Level Badge */}
          <Badge variant="outline" className={`hidden gap-1 border-current text-[10px] sm:flex ${config.color}`}>
            <LevelIcon className="h-3 w-3" />
            {config.label}
          </Badge>

          <ChevronDown className="text-muted-foreground h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="border-border/40 w-[min(288px,calc(100vw-1.5rem))] max-h-[80vh] overflow-y-auto bg-white p-2">
        <div className="mb-2 px-2 py-1.5">
          <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            Cambiar Perfil de Vista
          </p>
        </div>

        {defaultProfiles.map((profile) => {
          const pConfig = levelConfig[profile.level]
          const PIcon = pConfig.icon
          const isActive = currentProfile.id === profile.id

          return (
            <DropdownMenuItem
              key={profile.id}
              onClick={() => setCurrentProfile(profile)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg p-3 ${
                isActive ? "bg-secondary/60" : "hover:bg-secondary/40"
              }`}
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${pConfig.bgColor}`}>
                {profile.level === "macro" ? (
                  <Crown className={`h-5 w-5 ${pConfig.color}`} />
                ) : profile.level === "meso" ? (
                  <Users className={`h-5 w-5 ${pConfig.color}`} />
                ) : (
                  <User className={`h-5 w-5 ${pConfig.color}`} />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">{profile.name}</span>
                  {isActive && <Check className="text-aura h-4 w-4" />}
                </div>
                <span className="text-muted-foreground text-xs">{profile.role}</span>
              </div>

              <Badge
                variant="outline"
                className={`gap-1 border-current text-[10px] ${pConfig.color}`}
              >
                <PIcon className="h-3 w-3" />
                {pConfig.label}
              </Badge>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="bg-border/30 my-2" />

        <div className="bg-secondary/40 rounded-lg p-3">
          <div className="mb-2 flex items-center gap-2">
            <LevelIcon className={`h-4 w-4 ${config.color}`} />
            <span className={`text-xs font-semibold ${config.color}`}>
              Vista {config.label} Activa
            </span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            {currentProfile.level === "macro" && (
              <>Graficos consolidados en dinero real, ROAS general de todas las lineas, alertas institucionales.</>
            )}
            {currentProfile.level === "meso" && (
              <>Analisis comparativos, metricas de fuga por celulas, drill-down disponible. Audita asesores.</>
            )}
            {currentProfile.level === "micro" && (
              <>Plan de trabajo diario G8, semaforo personal, leads asignados. Sin costos globales.</>
            )}
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
