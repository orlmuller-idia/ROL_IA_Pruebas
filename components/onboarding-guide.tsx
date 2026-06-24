"use client"

import { GraduationCap, ChevronRight, Play } from "lucide-react"
import { useProfile } from "@/contexts/profile-context"
import { useOnboarding } from "@/contexts/onboarding-context"

export function OnboardingGuide() {
  const { currentProfile } = useProfile()
  const { enabledByLevel, startTour, tourActive } = useOnboarding()

  // Si el onboarding esta apagado para este perfil, no se muestra el launcher
  if (!enabledByLevel[currentProfile.level]) return null

  return (
    <button
      onClick={startTour}
      className="border-aura/25 bg-aura/5 hover:bg-aura/10 group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors"
    >
      <div className="bg-aura/15 text-aura flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <GraduationCap className="h-4 w-4" />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-foreground text-xs font-semibold">Como usar Rol</span>
        <span className="text-muted-foreground text-[11px] leading-tight">
          {tourActive ? "Tour en curso..." : "Paseo guiado por el sistema"}
        </span>
      </div>
      {tourActive ? (
        <ChevronRight className="text-aura h-4 w-4" />
      ) : (
        <Play className="text-aura h-3.5 w-3.5 fill-aura" />
      )}
    </button>
  )
}
