"use client"

import { GraduationCap } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useProfile } from "@/contexts/profile-context"
import { useOnboarding } from "@/contexts/onboarding-context"

export function OnboardingToggle() {
  const { currentProfile } = useProfile()
  const { enabledByLevel, toggleLevel } = useOnboarding()
  const enabled = enabledByLevel[currentProfile.level]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => toggleLevel(currentProfile.level)}
            className="hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
            aria-pressed={enabled}
            aria-label="Activar o desactivar el onboarding para este perfil"
          >
            <GraduationCap className={`h-4 w-4 ${enabled ? "text-aura" : "text-muted-foreground"}`} />
            <span className="text-muted-foreground hidden text-[11px] font-medium sm:inline">Onboarding</span>
            <Switch
              checked={enabled}
              onCheckedChange={() => toggleLevel(currentProfile.level)}
              className="data-[state=checked]:bg-aura scale-90"
              onClick={(e) => e.stopPropagation()}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[220px] text-xs">
          {enabled ? "Onboarding activo" : "Onboarding oculto"} para el perfil {currentProfile.role}. Cada perfil se controla por separado.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
