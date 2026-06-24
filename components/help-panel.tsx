"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { buildFullManualHTML } from "@/lib/full-manual"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVersion, nextTier, upgradeBenefits, VERSIONS } from "@/lib/versioning"
import { ArrowUpRight } from "lucide-react"
import {
  HelpCircle,
  TrendingUp,
  Users,
  Brain,
  Shield,
  ShieldCheck,
  Radio,
  Activity,
  ChevronRight,
  Eye,
  Zap,
  Lock,
  Pencil,
  Rocket,
  Search,
  CalendarCheck,
  FileDown,
  FileBarChart,
  Clock,
  UserCog,
  Sparkles,
  Building2,
  MapPin,
  IdCard,
  Bot,
} from "lucide-react"

type SectionId =
  | "cpa"
  | "semaforo"
  | "optimizer"
  | "scheduling"
  | "diagnostico"
  | "copywriter"
  | "roas-trend"
  | "golden-window"
  | "predictor"
  | "g1"
  | "g2"
  | "g3"
  | "g4"
  | "g5"
  | "g6"
  | "g7"
  | "g8"
  | "g9"
  | "config-empresa"
  | "config-sucursales"
  | "config-usuarios"
  | "config-perfiles"
  | "config-asistentes"
  | "config-guardianes"
  | "config-informes"
  | "config-boveda"

interface HelpSection {
  id: SectionId
  title: string
  icon: React.ReactNode
  category: string
  subcategory?: string
}

const sections: HelpSection[] = [
  /* Torre de Control - Descriptivos */
  { id: "cpa", title: "CPA Real-Time", icon: <Activity className="h-4 w-4" />, category: "Torre de Control", subcategory: "Descriptivos" },
  { id: "semaforo", title: "Semaforo de Abandono", icon: <Users className="h-4 w-4" />, category: "Torre de Control", subcategory: "Descriptivos" },
  { id: "optimizer", title: "Optimizador de Conversion", icon: <Rocket className="h-4 w-4" />, category: "Torre de Control", subcategory: "Descriptivos" },
  { id: "scheduling", title: "Agenda en Vivo", icon: <CalendarCheck className="h-4 w-4" />, category: "Torre de Control", subcategory: "Descriptivos" },
  /* Torre de Control - Diagnosticos */
  { id: "diagnostico", title: "Diagnostico de Fuga", icon: <Brain className="h-4 w-4" />, category: "Torre de Control", subcategory: "Diagnosticos" },
  { id: "copywriter", title: "Copywriter IA", icon: <Pencil className="h-4 w-4" />, category: "Torre de Control", subcategory: "Diagnosticos" },
  { id: "roas-trend", title: "Tendencia ROAS", icon: <Radio className="h-4 w-4" />, category: "Torre de Control", subcategory: "Diagnosticos" },
  { id: "golden-window", title: "Golden Window", icon: <Sparkles className="h-4 w-4" />, category: "Torre de Control", subcategory: "Diagnosticos" },
  /* Torre de Control - Predictivos */
  { id: "predictor", title: "Predictor de Metas", icon: <TrendingUp className="h-4 w-4" />, category: "Torre de Control", subcategory: "Predictivos" },
  /* Guardianes */
  { id: "g1", title: "G1 - El Rescatista", icon: <Shield className="h-4 w-4" />, category: "Guardianes" },
  { id: "g2", title: "G2 - Guardian de Pauta", icon: <Radio className="h-4 w-4" />, category: "Guardianes" },
  { id: "g3", title: "G3 - Copywriter Estrategico", icon: <Pencil className="h-4 w-4" />, category: "Guardianes" },
  { id: "g4", title: "G4 - Analista Predictivo", icon: <TrendingUp className="h-4 w-4" />, category: "Guardianes" },
  { id: "g5", title: "G5 - Auditor de Fugas", icon: <Search className="h-4 w-4" />, category: "Guardianes" },
  { id: "g6", title: "G6 - Optimizador de Conversion", icon: <Rocket className="h-4 w-4" />, category: "Guardianes" },
  { id: "g7", title: "G7 - El Cerrador", icon: <CalendarCheck className="h-4 w-4" />, category: "Guardianes" },
  { id: "g8", title: "G8 - Organizador de Agenda", icon: <Clock className="h-4 w-4" />, category: "Guardianes" },
  { id: "g9", title: "G9 - Perfilador de Leads", icon: <UserCog className="h-4 w-4" />, category: "Guardianes" },
  /* Config */
  { id: "config-empresa", title: "Empresa", icon: <Building2 className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-sucursales", title: "Sucursales y Boveda", icon: <MapPin className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-usuarios", title: "Usuarios y Grupos", icon: <Users className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-perfiles", title: "Perfiles de Gobernanza", icon: <IdCard className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-asistentes", title: "Asistentes (Jarvis)", icon: <Bot className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-guardianes", title: "Guardianes", icon: <ShieldCheck className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-informes", title: "Informes", icon: <FileBarChart className="h-4 w-4" />, category: "Configuracion" },
  { id: "config-boveda", title: "Boveda de Seguridad", icon: <Lock className="h-4 w-4" />, category: "Configuracion" },
]

/* ── Shared blocks ── */

function HelpBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-foreground text-xs font-semibold">{title}</h4>
      <div className="text-muted-foreground flex flex-col gap-1.5 text-xs leading-relaxed">{children}</div>
    </div>
  )
}

function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-aura/5 border-aura/15 flex items-start gap-2 rounded-lg border p-3">
      <Zap className="text-aura mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="text-muted-foreground text-xs leading-relaxed">{children}</span>
    </div>
  )
}

function LegendItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
      <div>
        <span className="text-foreground text-xs font-medium">{label}: </span>
        <span className="text-muted-foreground text-xs">{desc}</span>
      </div>
    </div>
  )
}

function StepItem({ n, label, desc }: { n: number; label: string; desc: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="bg-aura/20 text-aura inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold">{n}</span>
      <div>
        <strong className="text-foreground">{label}:</strong>{" "}
        <span className="text-muted-foreground">{desc}</span>
      </div>
    </div>
  )
}

/* ── Home ── */

const subcatConfig: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  Descriptivos: {
    icon: <Eye className="h-3.5 w-3.5" />,
    color: "text-info",
    desc: "Que esta pasando ahora: datos en tiempo real.",
  },
  Diagnosticos: {
    icon: <Search className="h-3.5 w-3.5" />,
    color: "text-warning",
    desc: "Por que esta pasando: causas raiz y analisis.",
  },
  Predictivos: {
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    color: "text-rescue",
    desc: "Que va a pasar: proyecciones de IA.",
  },
}

function HelpHome({ onNavigate }: { onNavigate: (id: SectionId) => void }) {
  const { version, meta: versionMeta, setVersion } = useVersion()
  const up = nextTier(version)
  const upBenefits = upgradeBenefits(version)

  const handleDownloadFullPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const fullContent = buildFullManualHTML()

    printWindow.document.write(fullContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <div className="bg-aura/10 border-aura/20 mx-auto flex h-12 w-12 items-center justify-center rounded-xl border">
          <Zap className="text-aura h-6 w-6" />
        </div>
        <h3 className="text-foreground text-center text-base font-semibold">Centro de Ayuda</h3>
        <p className="text-muted-foreground text-center text-xs leading-relaxed">
          Torre de Control + Guardianes Autonomos + Configuracion.
        </p>
      </div>

      {/* Download full PDF button */}
      <Button
        variant="outline"
        onClick={handleDownloadFullPDF}
        className="border-aura/30 text-aura hover:bg-aura/10 hover:border-aura/50 mx-auto flex w-fit gap-2"
      >
        <FileDown className="h-4 w-4" />
        Descargar Manual Completo (PDF)
      </Button>

      {/* Sugerencia de upgrade: que mas podrias hacer subiendo de plan */}
      {up && upBenefits.length > 0 && (
        <div className="border-aura/20 bg-aura/5 flex flex-col gap-2.5 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <div className="bg-aura/15 text-aura flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
              <Rocket className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-foreground text-xs font-semibold">
                Estas en Rol {versionMeta.name}
              </span>
              <span className="text-muted-foreground text-[11px]">
                Con Rol {VERSIONS[up].name} desbloqueas mas
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-1.5">
            {upBenefits.map((b) => (
              <li key={b} className="flex items-start gap-2">
                <ArrowUpRight className="text-aura mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-foreground/80 text-[12px] leading-snug">{b}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setVersion(up)}
            className="bg-aura mt-0.5 inline-flex w-fit items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Probar Rol {VERSIONS[up].name}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Quick reference */}
      <div className="bg-secondary/40 border-border/40 rounded-lg border p-4">
        <h4 className="text-foreground mb-3 text-xs font-semibold uppercase tracking-wider">Como leer los reportes</h4>
        <div className="flex flex-col gap-3 text-xs leading-relaxed">
          {Object.entries(subcatConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-start gap-2">
              <span className={cfg.color}>{cfg.icon}</span>
              <span className="text-muted-foreground"><strong className={cfg.color}>{key}:</strong> {cfg.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Torre de Control by subcategory */}
      <div className="flex flex-col gap-4">
        <h4 className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Torre de Control</h4>
        {["Descriptivos", "Diagnosticos", "Predictivos"].map((sub) => {
          const cfg = subcatConfig[sub]
          const items = sections.filter((s) => s.subcategory === sub)
          return (
            <div key={sub} className="flex flex-col gap-1.5">
              <div className={`flex items-center gap-1.5 text-[11px] font-medium ${cfg.color}`}>
                {cfg.icon}
                {sub}
              </div>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onNavigate(s.id)}
                  className="border-border/30 hover:bg-secondary/60 hover:border-aura/20 ml-5 flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                >
                  <div className="text-aura">{s.icon}</div>
                  <span className="text-foreground flex-1 text-xs font-medium">{s.title}</span>
                  <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {/* Guardianes */}
      <div className="flex flex-col gap-2">
        <h4 className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Guardianes Autonomos</h4>
        <div className="flex flex-col gap-1">
          {sections
            .filter((s) => s.category === "Guardianes")
            .map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className="border-border/30 hover:bg-secondary/60 hover:border-aura/20 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
              >
                <div className="text-[#22c55e]">{s.icon}</div>
                <span className="text-foreground flex-1 text-xs font-medium">{s.title}</span>
                <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
              </button>
            ))}
        </div>
      </div>

      {/* Configuracion */}
      <div className="flex flex-col gap-2">
        <h4 className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Configuracion</h4>
        <div className="flex flex-col gap-1">
          {sections
            .filter((s) => s.category === "Configuracion")
            .map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate(s.id)}
                className="border-border/30 hover:bg-secondary/60 hover:border-aura/20 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
              >
                <div className="text-aura">{s.icon}</div>
                <span className="text-foreground flex-1 text-xs font-medium">{s.title}</span>
                <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

/* ── Detail router ── */

function HelpDetail({ sectionId, onBack }: { sectionId: SectionId; onBack: () => void }) {
  const section = sections.find((s) => s.id === sectionId)!
  const tagLabel = section.subcategory ?? section.category
  const tagColor = section.subcategory
    ? subcatConfig[section.subcategory]?.color ?? "text-aura"
    : section.category === "Auditorias Forenses"
    ? "text-[#ef4444]"
    : section.category === "Guardianes"
    ? "text-[#22c55e]"
    : "text-aura"

  const contentMap: Record<SectionId, React.ReactNode> = {
    cpa: <CPAHelp />,
    semaforo: <SemaforoHelp />,
    optimizer: <OptimizerHelp />,
    scheduling: <SchedulingHelp />,
    diagnostico: <DiagnosticoHelp />,
    copywriter: <CopywriterHelp />,
    "roas-trend": <ROASTrendHelp />,
    "golden-window": <GoldenWindowHelp />,
    predictor: <PredictorHelp />,
    g1: <G1Help />,
    g2: <G2Help />,
    g3: <G3Help />,
    g4: <G4Help />,
    g5: <G5Help />,
    g6: <G6Help />,
    g7: <G7Help />,
    g8: <G8Help />,
    g9: <G9Help />,
    "config-empresa": <ConfigEmpresaHelp />,
    "config-sucursales": <ConfigSucursalesHelp />,
    "config-usuarios": <ConfigUsuariosHelp />,
    "config-perfiles": <ConfigPerfilesHelp />,
    "config-asistentes": <ConfigAsistentesHelp />,
    "config-guardianes": <ConfigGuardianesHelp />,
    "config-informes": <ConfigInformesHelp />,
    "config-boveda": <ConfigBovedaHelp />,
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-aura flex w-fit items-center gap-1 text-xs transition-colors">
          <ChevronRight className="h-3 w-3 rotate-180" />
          Volver al indice
        </button>
        <div className="flex items-center gap-2.5">
          <div className="bg-aura/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <span className="text-aura">{section.icon}</span>
          </div>
          <div>
            <h3 className="text-foreground text-sm font-semibold">{section.title}</h3>
            <span className={`text-[11px] ${tagColor}`}>{tagLabel}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">{contentMap[sectionId]}</div>
    </div>
  )
}

/* ═══════════════════════════════════════
   DESCRIPTIVOS
   ═══════════════════════��═══════════════ */

function CPAHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Gasto vs. conversiones de Meta y Google <strong className="text-foreground">minuto a minuto</strong>. Es la foto instantanea de si el dinero invertido esta generando resultados ahora.</p>
      </HelpBlock>
      <HelpBlock title="Como leerlo">
        <LegendItem color="bg-info" label="Azul solida" desc="Gasto en Meta cada 10 minutos." />
        <LegendItem color="bg-warning" label="Amarilla solida" desc="Gasto en Google cada 10 minutos." />
        <LegendItem color="bg-aura" label="Violeta punteada" desc="Conversiones de Meta." />
        <LegendItem color="bg-rescue" label="Verde punteada" desc="Conversiones de Google." />
      </HelpBlock>
      <HelpBlock title="Badge CPA">
        <p>Gasto Total / Conversiones Totales. Mas bajo = mejor. Se actualiza cada 4 seg.</p>
      </HelpBlock>
      <HelpTip>Si las lineas solidas suben pero las punteadas bajan, el CPA se dispara. Activa G2 para pausar campanas ineficientes automaticamente.</HelpTip>
    </>
  )
}

function SemaforoHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Cada lead pendiente de contacto con un <strong className="text-foreground">cronometro vivo</strong> que mide cuanto tiempo lleva sin recibir respuesta.</p>
      </HelpBlock>
      <HelpBlock title="Semaforo de colores">
        <LegendItem color="bg-alert" label="Rojo" desc="Mas de 10 min sin respuesta. Critico: la probabilidad de cierre cae drasticamente." />
        <LegendItem color="bg-warning" label="Naranja" desc="Entre 5 y 10 min. Urgente: hay que actuar ya." />
        <LegendItem color="bg-rescue" label="Verde" desc="Menos de 5 min. OK: aun a tiempo." />
      </HelpBlock>
      <HelpBlock title="Tiempo de Agonia">
        <p>Cronometro que avanza segundo a segundo. Cada segundo extra reduce la probabilidad de cierre.</p>
      </HelpBlock>
      <HelpTip>Este panel alimenta a G1 (Guardian de Leads). Cuando un lead pasa a rojo, G1 interviene automaticamente.</HelpTip>
    </>
  )
}

function OptimizerHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>El <strong className="text-foreground">Costo Por Lead (CPL)</strong> de cada anuncio activo. Identifica ganadores y perdedores en tiempo real.</p>
      </HelpBlock>
      <HelpBlock title="Grafico de barras">
        <LegendItem color="bg-rescue" label="Verde" desc="Anuncio ganador: CPL bajo y estable." />
        <LegendItem color="bg-alert" label="Rojo" desc="Anuncio perdedor: CPL alto o subiendo." />
        <LegendItem color="bg-muted-foreground" label="Gris" desc="Anuncio pausado por G2." />
      </HelpBlock>
      <HelpBlock title="Tabla de redistribucion">
        <p><strong className="text-foreground">Trend:</strong> Flecha verde = CPL baja (bueno). Roja = sube (malo). Amarilla = estable.</p>
        <p><strong className="text-foreground">Sugerido:</strong> Presupuesto que G6 recomienda. Verde = aumentar, rojo = reducir.</p>
      </HelpBlock>
      <HelpTip>El badge muestra el dinero reasignable: capital que puede moverse de perdedores a ganadores sin tocar el presupuesto total.</HelpTip>
    </>
  )
}

function SchedulingHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Las <strong className="text-foreground">citas del dia</strong> agendadas automaticamente por G7. Muestra estado de confirmacion en tiempo real.</p>
      </HelpBlock>
      <HelpBlock title="Estados">
        <LegendItem color="bg-rescue" label="Confirmada" desc="El lead confirmo por WhatsApp o correo." />
        <LegendItem color="bg-warning" label="En curso" desc="La cita esta sucediendo ahora mismo." />
        <LegendItem color="bg-muted-foreground" label="Pendiente" desc="Agendada pero sin confirmacion aun." />
      </HelpBlock>
      <HelpBlock title="Canal">
        <p>Icono de telefono = cita cerrada por voz IA. Icono de video = cerrada por WhatsApp.</p>
      </HelpBlock>
      <HelpTip>G7 envia recordatorio automatico 30 min antes. Las pendientes se van confirmando solas conforme los leads responden.</HelpTip>
    </>
  )
}

/* ═══════════════════════════════════════
   DIAGNOSTICOS
   ═══════════════════════════════════════ */

function DiagnosticoHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Clasifica los <strong className="text-foreground">motivos de no contacto</strong> para entender por que los leads no se convierten.</p>
      </HelpBlock>
      <HelpBlock title="Grafico de burbujas">
        <p><strong className="text-foreground">Eje X:</strong> Frecuencia (%). Mas a la derecha = ocurre mas seguido.</p>
        <p><strong className="text-foreground">Eje Y:</strong> Impacto (0-100). Mas arriba = mas danino para el negocio.</p>
        <p><strong className="text-foreground">Tamano:</strong> Volumen de leads afectados por ese motivo.</p>
      </HelpBlock>
      <HelpBlock title="Zona critica">
        <p>Esquina superior derecha = problemas frecuentes Y de alto impacto. Resolver estos primero da el mayor retorno.</p>
      </HelpBlock>
      <HelpTip>G5 (Auditor de Fugas) alimenta este panel automaticamente leyendo notas del CRM.</HelpTip>
    </>
  )
}

function CopywriterHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Analiza <strong className="text-foreground">que angulo de venta fallo</strong> en los anuncios pausados y propone variaciones creativas.</p>
      </HelpBlock>
      <HelpBlock title="Hooks generados">
        <p>Cada hook tiene un <strong className="text-foreground">score</strong> (0-100%) que estima la probabilidad de conectar con la audiencia, y un <strong className="text-foreground">angulo</strong> (Dolor, Urgencia, Frustracion, etc.).</p>
      </HelpBlock>
      <HelpBlock title="Brief de Diseno">
        <p>Tono visual, paleta, formato (video/carrusel) y CTA sugerido para que el disenador sepa exactamente que crear.</p>
      </HelpBlock>
      <HelpTip>Cuando G3 esta activo, genera copys automaticamente cada vez que G2 pausa una campana.</HelpTip>
    </>
  )
}

function ROASTrendHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>La <strong className="text-foreground">tendencia semanal del ROAS</strong> (Return on Ad Spend) de Meta y Google. Muestra si la inversion publicitaria esta rindiendo o deteriorandose.</p>
      </HelpBlock>
      <HelpBlock title="Como leerlo">
        <LegendItem color="bg-info" label="Azul" desc="ROAS de Meta durante la semana." />
        <LegendItem color="bg-warning" label="Amarilla" desc="ROAS de Google durante la semana." />
        <p><strong className="text-foreground">Linea roja punteada:</strong> Umbral de 1.5x. Por debajo, la campana pierde dinero.</p>
      </HelpBlock>
      <HelpBlock title="Metricas actuales">
        <p>Los valores grandes al fondo muestran el ROAS de hoy: verde si esta sobre 1.5x, rojo si esta debajo.</p>
      </HelpBlock>
      <HelpTip>Este panel es el dato que G2 usa para decidir si pausar una campana. Si ambas lineas cruzan el umbral, G2 actua.</HelpTip>
    </>
  )
}

function GoldenWindowHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Identifica las <strong className="text-foreground">franjas horarias optimas</strong> para cerrar ventas, basado en patrones historicos de conversion y friccion.</p>
      </HelpBlock>
      <HelpBlock title="KPIs Principales">
        <p><strong className="text-foreground">Mejor momento para cerrar ventas:</strong> Hora del dia con mayor tasa de cierre historica.</p>
        <p><strong className="text-foreground">Ventas mas caras:</strong> Franja donde se cierran tickets de mayor valor.</p>
        <p><strong className="text-foreground">Momento con mas problemas:</strong> Hora critica con mayor friccion o abandonos.</p>
      </HelpBlock>
      <HelpBlock title="Curvas por franja horaria">
        <LegendItem color="bg-[#8b5cf6]" label="Barras moradas" desc="Leads recibidos por hora." />
        <LegendItem color="bg-[#3b82f6]" label="Barras azules" desc="Leads contactados por hora." />
        <LegendItem color="bg-[#22c55e]" label="Barras verdes" desc="Ventas logradas por hora." />
        <p><strong className="text-[#eab308]">Tasa de cierre (%):</strong> Porcentaje de conversion por franja.</p>
        <p><strong className="text-[#ef4444]">Friccion:</strong> Nivel de dificultad para cerrar en cada hora.</p>
      </HelpBlock>
      <HelpBlock title="Advertencia de Volumen">
        <p>Alerta cuando una franja tiene <strong className="text-foreground">bajo volumen de datos</strong>. Indica validar recurrencia antes de escalar decisiones.</p>
      </HelpBlock>
      <HelpBlock title="Momentos clave del dia">
        <p>Insights automaticos que resumen oportunidades doradas y alertas de riesgo para activar la fuerza comercial en el momento correcto.</p>
      </HelpBlock>
      <HelpTip>Usa Golden Window para programar la disponibilidad de G8 y maximizar la efectividad de las agendas de los vendedores.</HelpTip>
    </>
  )
}

/* ═══════════════════════════════════════
   PREDICTIVOS
   ═══════════════════════════════════════ */

function PredictorHelp() {
  return (
    <>
      <HelpBlock title="Que muestra">
        <p>Usa <strong className="text-foreground">regresion lineal</strong> sobre datos reales para proyectar si se alcanzara la meta mensual de ventas.</p>
      </HelpBlock>
      <HelpBlock title="Como leerlo">
        <LegendItem color="bg-aura" label="Violeta solida" desc="Ventas reales acumuladas hasta hoy." />
        <LegendItem color="bg-rescue" label="Verde punteada" desc="Proyeccion IA (forecasting) hacia fin de mes." />
        <LegendItem color="bg-alert/50" label="Roja horizontal" desc="Meta del mes. Si la proyeccion queda debajo, hay riesgo." />
      </HelpBlock>
      <HelpBlock title="Badge de cobertura">
        <p>Porcentaje proyectado de la meta: verde = se alcanza, rojo = faltan ventas. Es la metrica mas importante del panel.</p>
      </HelpBlock>
      <HelpTip>G4 (Analista Predictivo) usa estos datos para emitir alertas tempranas cuando la proyeccion cae debajo del 100%.</HelpTip>
    </>
  )
}

/* ═══════════════════════════════════════
   AUDITORIAS FORENSES
   ═══════════════════════════════════════ */

/* ═══════════════════════════════════════
   GUARDIANES
   ═══════════════════════════════════════ */

function G1Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G1 - El Rescatista.</strong> Guardian operativo que rescata leads abandonados mediante una secuencia omnicanal automatica cuando el vendedor no responde dentro del SLA.</p>
      </HelpBlock>
      <HelpBlock title="Flujo Dual: Vendedor vs Cliente">
        <p><strong className="text-[#22c55e]">Alerta Semaforo Verde:</strong> Notificacion al vendedor: &quot;Nuevo lead asignado, tienes 2 min para contacto prime&quot;.</p>
        <p><strong className="text-[#eab308]">Alerta Semaforo Amarillo:</strong> Presion al vendedor: &quot;El lead lleva 5 min sin atencion. El interes esta bajando&quot;.</p>
        <p><strong className="text-[#ef4444]">Alerta Semaforo Rojo:</strong> Notificacion final: &quot;Tiempo limite excedido. ROL.IA toma el control del lead&quot;.</p>
        <p><strong className="text-aura">Disparo de Rescate G1:</strong> Envio del mensaje de WhatsApp al cliente tras inaccion humana.</p>
      </HelpBlock>
      <HelpBlock title="Eventos de Respuesta del Cliente">
        <p><strong className="text-foreground">Preferencia: Llamada IA</strong> - El cliente eligio ser llamado ahora mismo (activa G7).</p>
        <p><strong className="text-foreground">Preferencia: Agendamiento</strong> - El cliente eligio ver calendario (activa G8).</p>
        <p><strong className="text-foreground">Preferencia: Continuar Chat</strong> - El cliente prefirio seguir por texto.</p>
        <p><strong className="text-foreground">Preferencia: Opt-Out</strong> - El cliente solicito no ser contactado (limpieza de base).</p>
      </HelpBlock>
      <HelpTip>G1 es el guardian mas critico: cada segundo de demora reduce la probabilidad de cierre. Trabaja en cadena con G7 (llamadas) y G8 (agendamiento).</HelpTip>
    </>
  )
}

function G2Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G2 - Guardian de Pauta.</strong> Pausa campanas ineficientes automaticamente cuando el ROAS cae debajo del umbral para evitar quemar presupuesto.</p>
      </HelpBlock>
      <HelpBlock title="Como actua">
        <StepItem n={1} label="Monitoreo" desc="Revisa ROAS cada hora en Meta y Google." />
        <StepItem n={2} label="Deteccion" desc="Si ROAS menor a 1.5x por 2 periodos consecutivos, marca como critico." />
        <StepItem n={3} label="Pausa" desc="Detiene la campana via API y notifica al equipo." />
      </HelpBlock>
      <HelpBlock title="Cadena de reaccion">
        <p>Cuando G2 pausa: G3 genera copys alternativos y G6 redistribuye el presupuesto liberado.</p>
      </HelpBlock>
      <HelpTip>En Modo Observador detecta ROAS bajo pero no pausa. Util para entender patrones antes de activar la automatizacion.</HelpTip>
    </>
  )
}

function G3Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G3 - Copywriter Estrategico.</strong> No solo detecta el problema, propone la solucion creativa. Genera copys alternativos y briefs de diseno para reactivar anuncios pausados.</p>
      </HelpBlock>
      <HelpBlock title="Secuencia">
        <StepItem n={1} label="Analisis de Angulo" desc="Toma el reporte de G2 y analiza que angulo de venta fallo." />
        <StepItem n={2} label="Creacion de Hooks" desc="Genera 3 ganchos basados en psicologia de ventas y datos del CRM." />
        <StepItem n={3} label="Briefing de Diseno" desc="Crea brief para el disenador con imagen, tono y formato sugerido." />
      </HelpBlock>
      <HelpTip>Trabaja en cadena con G2: pausa - analisis - nueva propuesta creativa. El ciclo completo toma segundos.</HelpTip>
    </>
  )
}

function G4Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G4 - Analista Predictivo.</strong> Evita sorpresas de fin de mes. Proyecta si se cubriran los gastos fijos al ritmo actual de ventas y alerta tempranamente.</p>
      </HelpBlock>
      <HelpBlock title="Secuencia">
        <StepItem n={1} label="Entrenamiento" desc="Usa datos de 30 dias para entrenar modelo de regresion." />
        <StepItem n={2} label="Proyeccion" desc="Calcula si se cubriran los gastos fijos mensuales." />
        <StepItem n={3} label="Alerta Temprana" desc="Si proyeccion menor al 100%, emite alerta de Ajuste Requerido." />
      </HelpBlock>
      <HelpTip>La alerta temprana permite reaccionar a medio mes en vez de descubrir el deficit al cierre.</HelpTip>
    </>
  )
}

function G5Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G5 - Auditor de Fugas.</strong> Analisis forense de por que no se compra. Lee notas del CRM, clasifica motivos y genera el mapa de calor de perdidas.</p>
      </HelpBlock>
      <HelpBlock title="Secuencia">
        <StepItem n={1} label="Lectura de Notas" desc="Lee las notas que dejan vendedores en el CRM." />
        <StepItem n={2} label="Clasificacion" desc="Determina si fue basura (mala pauta) o error de cierre (falla del vendedor)." />
        <StepItem n={3} label="Mapa de Calor" desc="Genera el grafico de burbujas con motivos reales de perdida." />
      </HelpBlock>
      <HelpBlock title="Veredicto G5">
        <p>Diagnostico de IA que aparece en la Auditoria de Fuga con recomendaciones especificas por vendedor.</p>
      </HelpBlock>
      <HelpTip>Sin G5, los motivos de perdida son anecdotas. Con G5 activo, se convierten en datos accionables.</HelpTip>
    </>
  )
}

function G6Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G6 - Optimizador de Conversion.</strong> Decide donde meter mas dinero. Identifica anuncios ganadores y redistribuye presupuesto automaticamente via API.</p>
      </HelpBlock>
      <HelpBlock title="Secuencia">
        <StepItem n={1} label="Deteccion" desc="Identifica anuncios con CPL bajo y estable." />
        <StepItem n={2} label="Sugerencia" desc="Recomienda mover presupuesto de pausados a ganadores." />
        <StepItem n={3} label="Escalado" desc="Si activo, ejecuta redistribucion via API de Meta/Google." />
      </HelpBlock>
      <HelpBlock title="Nutricion posterior">
        <p>Cuando G7 no logra contactar un lead (buzon/no contesta), G6 lo mueve a flujo de nutricion con contenido automatizado.</p>
      </HelpBlock>
      <HelpTip>G2 pausa, G6 redistribuye: el presupuesto liberado fluye automaticamente a los anuncios que si funcionan.</HelpTip>
    </>
  )
}

function G7Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G7 - El Cerrador.</strong> Pone la cara (la voz) por la agencia. Ejecuta llamadas de rescate y persiste hasta lograr contacto.</p>
      </HelpBlock>
      <HelpBlock title="Acciones">
        <p><strong className="text-foreground">Ejecucion de Llamada de Rescate:</strong> Primera interaccion por voz tras solicitud en G1.</p>
        <p><strong className="text-foreground">Intento de Remarcado #1, #2, #3:</strong> Registro de persistencia cuando el cliente no contesta.</p>
        <p><strong className="text-foreground">Estado: Llamada Contestada:</strong> Exito en la conexion telefonica.</p>
        <p><strong className="text-foreground">Estado: Buzon / No Contesta:</strong> Lead sigue inalcanzable (activa G6 de nutricion posterior).</p>
      </HelpBlock>
      <HelpBlock title="Cierre de Cita">
        <p>Confirma disponibilidad en Google Calendar durante la llamada, reserva el slot, genera enlace de Meet, y envia confirmacion por correo + WhatsApp.</p>
      </HelpBlock>
      <HelpTip>Con G7 activo, el lead recibe confirmacion instantanea y recordatorio 30 min antes. Reduce no-shows significativamente.</HelpTip>
    </>
  )
}

function G8Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G8 - El Organizador de Agenda.</strong> Guardian autonomo que estructura el dia del vendedor en bloques de 10 minutos para maximizar productividad y flujo de trabajo.</p>
      </HelpBlock>
      <HelpBlock title="Como funciona">
        <StepItem n={1} label="Analisis de Carga" desc="Revisa leads asignados, citas agendadas y tareas pendientes del vendedor." />
        <StepItem n={2} label="Creacion de Bloques" desc="Divide el dia en bloques de 10 minutos con actividades especificas." />
        <StepItem n={3} label="Priorizacion Inteligente" desc="Ordena leads por urgencia (semaforo) y valor (Perfil G9)." />
        <StepItem n={4} label="Sincronizacion" desc="Actualiza Google Calendar y envia recordatorios por WhatsApp." />
      </HelpBlock>
      <HelpBlock title="Estructura de un bloque">
        <p><strong className="text-foreground">10:00 - 10:10:</strong> Llamar a Juan P. (#7742) - Semaforo Amarillo - Perfil: Alta Decision</p>
        <p><strong className="text-foreground">10:10 - 10:20:</strong> Follow-up Maria L. (#7743) - WhatsApp pendiente - Perfil: Media Influencia</p>
        <p><strong className="text-foreground">10:20 - 10:30:</strong> Preparar propuesta Carlos R. (#7744) - Cita 11:00 - Alta Decision</p>
      </HelpBlock>
      <HelpBlock title="Integracion con Golden Window">
        <p>G8 usa los datos de Golden Window para <strong className="text-foreground">programar llamadas de cierre</strong> en las franjas de mayor efectividad y dejar tareas administrativas en horas de baja conversion.</p>
      </HelpBlock>
      <HelpTip>Con G8 activo, el vendedor solo tiene que seguir su agenda. No pierde tiempo decidiendo a quien llamar: la IA ya lo optimizo.</HelpTip>
    </>
  )
}

function G9Help() {
  return (
    <>
      <HelpBlock title="Que es">
        <p><strong className="text-foreground">G9 - El Perfilador de Leads.</strong> Guardian de Machine Learning que analiza cada prospecto y genera un perfil predictivo para que el vendedor sepa exactamente como abordarlo.</p>
      </HelpBlock>
      <HelpBlock title="Dimensiones del Perfil">
        <p><strong className="text-foreground">Nivel de Urgencia:</strong> Alta / Media / Baja - basado en comportamiento de navegacion, tiempo en formulario, y canal de entrada.</p>
        <p><strong className="text-foreground">Tipo de Autoridad:</strong> Decision (compra directo) / Influencia (recomienda) / Consulta (investiga).</p>
      </HelpBlock>
      <HelpBlock title="Datos que analiza">
        <StepItem n={1} label="Fuente del Lead" desc="Meta vs Google vs Organico - cada canal tiene perfiles diferentes." />
        <StepItem n={2} label="Comportamiento Web" desc="Paginas visitadas, tiempo en sitio, descargas de contenido." />
        <StepItem n={3} label="Datos del Formulario" desc="Cargo, empresa, presupuesto indicado, urgencia declarada." />
        <StepItem n={4} label="Historico CRM" desc="Interacciones previas, compras anteriores, patrones de respuesta." />
      </HelpBlock>
      <HelpBlock title="Recomendacion de Abordaje">
        <p>G9 genera una <strong className="text-foreground">guia de conversacion</strong> especifica:</p>
        <p><strong className="text-[#22c55e]">Alta Decision:</strong> &quot;Ir directo a propuesta y precio. Evitar rodeos. Ofrecer cierre inmediato.&quot;</p>
        <p><strong className="text-[#3b82f6]">Media Influencia:</strong> &quot;Proveer material para que comparta con decisor. Enfocarse en beneficios, no precio.&quot;</p>
        <p><strong className="text-[#eab308]">Baja Consulta:</strong> &quot;Nutrir con contenido. No presionar. Programar follow-up a 7 dias.&quot;</p>
      </HelpBlock>
      <HelpBlock title="Donde se ve el perfil">
        <p>El Perfil G9 aparece en la <strong className="text-foreground">Bitacora de Intervencion</strong> como columna, y en la <strong className="text-foreground">Agenda de G8</strong> junto a cada bloque de actividad.</p>
      </HelpBlock>
      <HelpTip>G9 aprende de cada interaccion. Mientras mas datos del CRM, mejores predicciones. Los perfiles se recalculan cada 24 horas.</HelpTip>
    </>
  )
}

/* ═══════════════════════════════════════
   CONFIGURACION
   ═══════════════════════════════════════ */

function ConfigEmpresaHelp() {
  return (
    <>
      <HelpBlock title="Jerarquia de configuracion">
        <p>El sistema se organiza de lo general a lo particular: <strong className="text-foreground">Empresa → Sucursal → Usuario / Grupo → Perfil → Asistente</strong>. Cada nivel hereda del anterior y puede sobreescribir lo que necesite.</p>
      </HelpBlock>
      <HelpBlock title="Que configura Empresa">
        <p>Es la raiz. Define nombre, industria, identidad fiscal, zona horaria base y moneda corporativa.</p>
        <p>Estos valores son los predeterminados que heredan todas las sucursales.</p>
      </HelpBlock>
      <HelpTip>Manten el Centro de Configuracion ordenado: empieza por Empresa, luego crea sucursales y, al final, asigna personas y asistentes.</HelpTip>
    </>
  )
}

function ConfigSucursalesHelp() {
  return (
    <>
      <HelpBlock title="Que es una sucursal">
        <p>Cada sede del negocio con su propio <strong className="text-foreground">pais, ciudad, idioma y moneda</strong>. Puede activarse o desactivarse.</p>
      </HelpBlock>
      <HelpBlock title="Boveda a nivel sucursal">
        <p>Cada sucursal tiene su propia boveda de credenciales (mensajeria, voz, telefonia, CRM y origenes internos como Excel o Google Sheets), protegida por clave.</p>
        <p>Abre una sucursal y entra a la pestana &quot;Boveda de seguridad&quot;.</p>
      </HelpBlock>
      <HelpTip>Usa &quot;Replicar configuracion&quot; para copiar idioma, moneda o la boveda de una sucursal a otras y ahorrar tiempo.</HelpTip>
    </>
  )
}

function ConfigUsuariosHelp() {
  return (
    <>
      <HelpBlock title="Usuarios y Grupos">
        <p>Administra personas individualmente o en grupos. Un grupo aplica la misma configuracion a varios usuarios a la vez.</p>
      </HelpBlock>
      <HelpBlock title="Lineas de producto">
        <p>Las lineas de producto se asignan <strong className="text-foreground">por grupo</strong> (todos heredan) o <strong className="text-foreground">uno-a-uno</strong> (individual).</p>
      </HelpBlock>
      <HelpTip>Selecciona varios usuarios o grupos para aplicar acciones masivas: activar/desactivar, duplicar o replicar lineas y asistente.</HelpTip>
    </>
  )
}

function ConfigPerfilesHelp() {
  return (
    <>
      <HelpBlock title="Perfiles de gobernanza">
        <p>Definen el nivel de abstraccion visual: <strong className="text-foreground">Global</strong> (vision consolidada), <strong className="text-foreground">Equipo</strong> (gerencial) y <strong className="text-foreground">Personal</strong> (operativo).</p>
      </HelpBlock>
      <HelpBlock title="Que incluye cada perfil">
        <p>Jerarquia de escalamiento, fuentes de leads, lineas de producto y umbrales de semaforo.</p>
        <p>Usa el wizard &quot;Crear Perfil de Gobernanza&quot; para crearlos o editarlos.</p>
      </HelpBlock>
      <HelpTip>Cada perfil tiene un asistente Jarvis asociado que configuras en la seccion Asistentes.</HelpTip>
    </>
  )
}

function ConfigAsistentesHelp() {
  return (
    <>
      <HelpBlock title="Un asistente por perfil">
        <p>Cada perfil tiene su propio Jarvis personalizado, con nombre y tono. Configuras sus capacidades con interruptores y reglas finas.</p>
      </HelpBlock>
      <HelpBlock title="Capacidades configurables">
        <p><strong className="text-foreground">Resolver dudas:</strong> responde dentro de su alcance.</p>
        <p><strong className="text-foreground">Pedir cuentas:</strong> frecuencia, a quien y umbral que dispara.</p>
        <p><strong className="text-foreground">Dar alertas:</strong> canales y severidad minima.</p>
        <p><strong className="text-foreground">Tareas del dia:</strong> hora del resumen y contenido.</p>
        <p><strong className="text-foreground">Escalar:</strong> a que usuario o perfil y con que condicion.</p>
        <p><strong className="text-foreground">Verificar semaforos:</strong> que vigila y que accion toma ante un rojo.</p>
      </HelpBlock>
      <HelpTip>Al activar una capacidad se despliegan sus reglas. Solo veras lo que necesitas, sin saturar la pantalla.</HelpTip>
    </>
  )
}

function ConfigGuardianesHelp() {
  return (
    <>
      <HelpBlock title="Centro de Guardianes">
        <p>Activa, desactiva y configura los <strong className="text-foreground">11 guardianes autonomos</strong> que vigilan y actuan sobre tu operacion comercial las 24 horas.</p>
      </HelpBlock>
      <HelpBlock title="Que puedes configurar">
        <p>Por cada guardian defines si esta activo, su nivel de autonomia y los umbrales que disparan su intervencion (SLA, ROAS, semaforos).</p>
        <p>Los guardianes trabajan encadenados: por ejemplo, G1 rescata leads y deriva a G7 para cerrar la cita.</p>
      </HelpBlock>
      <HelpTip>Empieza activando G1, G2 y G7, que cubren rescate de leads, control de pauta y cierre de citas. Luego suma el resto segun tu madurez.</HelpTip>
    </>
  )
}

function ConfigInformesHelp() {
  return (
    <>
      <HelpBlock title="Informes por perfil">
        <p>Elige que informes ve cada perfil y con que <strong className="text-foreground">nivel de detalle</strong>: Global (consolidado), Equipo (gerencial) o Personal (operativo, lead a lead).</p>
      </HelpBlock>
      <HelpBlock title="Niveles de detalle">
        <p><strong className="text-foreground">Global:</strong> KPIs y tendencias en cards y graficos, ideal para direccion.</p>
        <p><strong className="text-foreground">Equipo:</strong> tableros, rankings y comparativos por celula comercial.</p>
        <p><strong className="text-foreground">Personal:</strong> tablas con el detalle completo de cada lead.</p>
      </HelpBlock>
      <HelpTip>Asigna el nivel adecuado a cada perfil: la junta directiva no necesita el detalle lead a lead, pero el asesor si.</HelpTip>
    </>
  )
}

function ConfigBovedaHelp() {
  return (
    <>
      <HelpBlock title="Que es">
        <p>Almacen protegido por contrasena con <strong className="text-foreground">credenciales de todo el ecosistema</strong>.</p>
      </HelpBlock>
      <HelpBlock title="Modulos">
        <p><strong className="text-foreground">Mensajeria:</strong> Credenciales de WhatsApp (ID, dispositivo, numero, token).</p>
        <p><strong className="text-foreground">Voz:</strong> Asistente de voz IA (ID asistente, linea, token).</p>
        <p><strong className="text-foreground">Telefonia:</strong> Servicio de llamadas (SID, numero, token).</p>
        <p><strong className="text-foreground">CRM:</strong> Token de integracion con Clientify.</p>
      </HelpBlock>
      <HelpTip>Solo usuarios con la clave de acceso pueden ver/editar credenciales. Los nombres reales se mantienen cifrados.</HelpTip>
    </>
  )
}

/* ═══════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════ */

export function HelpPanel({ trigger }: { trigger?: React.ReactNode }) {
  const [currentSection, setCurrentSection] = useState<SectionId | null>(null)

  return (
    <Sheet onOpenChange={(open) => { if (!open) setCurrentSection(null) }}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 text-muted-foreground hover:text-aura hover:border-aura/30 gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ayuda</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="border-border/40 bg-card w-full sm:max-w-md" side="right">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground flex items-center gap-2 text-sm">
            <HelpCircle className="text-aura h-4 w-4" />
            Guia de Uso - Rol.IA
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <AnimatePresence mode="wait">
            {currentSection === null ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <HelpHome onNavigate={setCurrentSection} />
              </motion.div>
            ) : (
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
              >
                <HelpDetail sectionId={currentSection} onBack={() => setCurrentSection(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
