"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Pencil,
  FileCheck2,
} from "lucide-react"

type Fase = "vacio" | "leyendo" | "preview" | "integrado"

type FilaPauta = {
  id: string
  campana: string
  canal: string
  medio: string
  inversion: number
  alcance: number
  periodo: string
  // nivel de confianza de la lectura IA (0-100)
  confianza: number
}

// Lectura simulada que haria la IA sobre el Excel cargado
const LECTURA_IA: FilaPauta[] = [
  { id: "f1", campana: "Lanzamiento Q3", canal: "Radio", medio: "Caracol Radio", inversion: 12500000, alcance: 480000, periodo: "Jul 2025", confianza: 98 },
  { id: "f2", campana: "Lanzamiento Q3", canal: "TV", medio: "RCN Television", inversion: 28000000, alcance: 920000, periodo: "Jul 2025", confianza: 95 },
  { id: "f3", campana: "Awareness Marca", canal: "Vallas", medio: "Eucol - Av. 68", inversion: 9800000, alcance: 350000, periodo: "Jul-Ago 2025", confianza: 88 },
  { id: "f4", campana: "Awareness Marca", canal: "Prensa", medio: "El Tiempo", inversion: 6200000, alcance: 210000, periodo: "Ago 2025", confianza: 72 },
]

const fmtCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

const fmtNum = (n: number) => new Intl.NumberFormat("es-CO").format(n)

export function PautaOfflineUpload() {
  const [fase, setFase] = useState<Fase>("vacio")
  const [fileName, setFileName] = useState("")
  const [filas, setFilas] = useState<FilaPauta[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (name: string) => {
    setFileName(name)
    setFase("leyendo")
    // Simula la lectura por IA del Excel
    setTimeout(() => {
      setFilas(LECTURA_IA)
      setFase("preview")
    }, 2200)
  }

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f.name)
  }

  const eliminarFila = (id: string) => setFilas((prev) => prev.filter((f) => f.id !== id))

  const reset = () => {
    setFase("vacio")
    setFileName("")
    setFilas([])
    if (inputRef.current) inputRef.current.value = ""
  }

  const totalInversion = filas.reduce((s, f) => s + f.inversion, 0)
  const totalAlcance = filas.reduce((s, f) => s + f.alcance, 0)
  const dudosas = filas.filter((f) => f.confianza < 80).length

  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Encabezado de la tarjeta */}
      <div className="border-border from-aura/5 flex items-center gap-3 border-b bg-gradient-to-r to-transparent px-4 py-3">
        <div className="bg-aura/10 text-aura flex h-9 w-9 items-center justify-center rounded-lg">
          <FileSpreadsheet className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-foreground text-sm font-semibold">Pauta offline (Excel)</h4>
            <Badge variant="outline" className="border-aura/30 text-aura text-[9px]">
              <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Lectura IA
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Sube vallas, radio, TV o prensa. La IA lee el archivo y arma el preview antes de integrarlo a los informes.
          </p>
        </div>
        {fase === "integrado" && (
          <Badge className="bg-rescue/15 text-rescue border-rescue/30 shrink-0 gap-1 border text-[10px]">
            <FileCheck2 className="h-3 w-3" /> En informes
          </Badge>
        )}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Estado vacio: dropzone */}
          {fase === "vacio" && (
            <motion.button
              key="vacio"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              className="border-border hover:border-aura/50 hover:bg-aura/5 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors"
            >
              <div className="bg-muted text-muted-foreground flex h-11 w-11 items-center justify-center rounded-full">
                <UploadCloud className="h-5 w-5" />
              </div>
              <span className="text-foreground text-sm font-medium">Arrastra o selecciona tu Excel</span>
              <span className="text-muted-foreground text-xs">Formatos .xlsx, .xls o .csv</span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={onSelect}
              />
            </motion.button>
          )}

          {/* Estado leyendo: IA procesando */}
          {fase === "leyendo" && (
            <motion.div
              key="leyendo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-8"
            >
              <div className="relative flex h-12 w-12 items-center justify-center">
                <span className="bg-aura/15 absolute inset-0 animate-ping rounded-full" />
                <div className="bg-aura/10 text-aura relative flex h-12 w-12 items-center justify-center rounded-full">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Loader2 className="text-aura h-4 w-4 animate-spin" />
                La IA esta leyendo <span className="text-muted-foreground font-normal">{fileName}</span>
              </div>
              <p className="text-muted-foreground max-w-xs text-center text-xs">
                Detectando campanas, canales, inversion y alcance. Esto toma unos segundos.
              </p>
            </motion.div>
          )}

          {/* Estado preview: revisar lectura antes de integrar */}
          {fase === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <FileSpreadsheet className="text-aura h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">{fileName}</span>
                  <span className="text-muted-foreground">· {filas.length} filas detectadas</span>
                </div>
                {dudosas > 0 && (
                  <Badge variant="outline" className="border-amber-400/40 text-amber-600 text-[10px]">
                    <AlertTriangle className="mr-1 h-3 w-3" /> {dudosas} por revisar
                  </Badge>
                )}
              </div>

              {/* Tabla de preview */}
              <div className="border-border overflow-hidden rounded-lg border">
                <div className="bg-muted/50 text-muted-foreground grid grid-cols-[1.4fr_0.9fr_1fr_0.9fr_0.7fr_auto] gap-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">
                  <span>Campana</span>
                  <span>Canal</span>
                  <span>Inversion</span>
                  <span>Alcance</span>
                  <span>IA</span>
                  <span className="sr-only">Accion</span>
                </div>
                <AnimatePresence>
                  {filas.map((f) => (
                    <motion.div
                      key={f.id}
                      layout
                      exit={{ opacity: 0, height: 0 }}
                      className="border-border/60 grid grid-cols-[1.4fr_0.9fr_1fr_0.9fr_0.7fr_auto] items-center gap-2 border-t px-3 py-2.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">{f.campana}</p>
                        <p className="text-muted-foreground truncate text-[10px]">{f.medio} · {f.periodo}</p>
                      </div>
                      <span className="text-muted-foreground">{f.canal}</span>
                      <span className="text-foreground font-medium">{fmtCOP(f.inversion)}</span>
                      <span className="text-muted-foreground">{fmtNum(f.alcance)}</span>
                      <span
                        className={`inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          f.confianza >= 80
                            ? "bg-rescue/15 text-rescue"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {f.confianza}%
                      </span>
                      <button
                        onClick={() => eliminarFila(f.id)}
                        className="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
                        aria-label={`Descartar ${f.campana}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Resumen */}
              <div className="bg-muted/40 flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2.5">
                <div className="flex gap-4">
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Inversion total</p>
                    <p className="text-foreground text-sm font-semibold">{fmtCOP(totalInversion)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Alcance total</p>
                    <p className="text-foreground text-sm font-semibold">{fmtNum(totalAlcance)}</p>
                  </div>
                </div>
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Pencil className="h-3 w-3" /> Descarta filas erroneas antes de integrar
                </p>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFase("integrado")}
                  disabled={filas.length === 0}
                  className="bg-aura hover:bg-aura/90 gap-1 text-xs text-white"
                >
                  <Check className="h-3.5 w-3.5" /> Integrar a informes
                </Button>
              </div>
            </motion.div>
          )}

          {/* Estado integrado: confirmacion */}
          {fase === "integrado" && (
            <motion.div
              key="integrado"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-6 text-center"
            >
              <div className="bg-rescue/15 text-rescue flex h-12 w-12 items-center justify-center rounded-full">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">Pauta offline integrada</p>
                <p className="text-muted-foreground mt-0.5 max-w-xs text-xs">
                  {filas.length} registros de <span className="font-medium">{fileName}</span> ya aparecen en los informes de
                  pauta y en el calculo de ROAS consolidado.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="gap-1 text-xs">
                <UploadCloud className="h-3.5 w-3.5" /> Subir otro archivo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
