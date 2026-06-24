"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X,
  FileCheck2,
  Loader2,
} from "lucide-react"

/**
 * Flujo de carga de Excel para campanas offline (ferias, radio, volanteo).
 * Estados:
 *  1. idle      -> dropzone para seleccionar/soltar archivo
 *  2. analyzing -> la IA "lee" el archivo (animacion + pasos)
 *  3. preview   -> muestra metadata + preview de filas detectadas para confirmar
 *  4. done      -> confirmacion de integracion al ROAS consolidado
 */

type Stage = "idle" | "analyzing" | "preview" | "done"

interface ParsedRow {
  campana: string
  canal: string
  gasto: number
  leads: number
}

interface ParsedFile {
  name: string
  sizeKb: number
  rows: ParsedRow[]
  totalGasto: number
  totalLeads: number
}

const ANALYSIS_STEPS = [
  "Leyendo estructura del archivo",
  "Detectando columnas (campana, gasto, leads)",
  "Normalizando montos y fechas",
  "Cruzando con el ROAS consolidado",
]

// Filas demo que la "IA" extrae del archivo cargado.
const DEMO_ROWS: ParsedRow[] = [
  { campana: "Feria Expo Inmobiliaria", canal: "Evento", gasto: 4200000, leads: 38 },
  { campana: "Cunas Radiales AM/FM", canal: "Radio", gasto: 2800000, leads: 21 },
  { campana: "Volanteo Zona Norte", canal: "Volanteo", gasto: 950000, leads: 12 },
]

function fmtMoney(n: number) {
  return `$${n.toLocaleString("es-CO")}`
}

export function OfflineExcelUpload({ onConfirmed }: { onConfirmed?: () => void }) {
  const [stage, setStage] = useState<Stage>("idle")
  const [dragging, setDragging] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    if (!file) return
    // Inicia la "lectura por IA"
    setStage("analyzing")
    setStepIndex(0)

    let i = 0
    const interval = setInterval(() => {
      i += 1
      if (i < ANALYSIS_STEPS.length) {
        setStepIndex(i)
      } else {
        clearInterval(interval)
        const totalGasto = DEMO_ROWS.reduce((a, r) => a + r.gasto, 0)
        const totalLeads = DEMO_ROWS.reduce((a, r) => a + r.leads, 0)
        setParsed({
          name: file.name,
          sizeKb: Math.max(1, Math.round(file.size / 1024)),
          rows: DEMO_ROWS,
          totalGasto,
          totalLeads,
        })
        setStage("preview")
      }
    }, 650)
  }

  function reset() {
    setStage("idle")
    setParsed(null)
    setStepIndex(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  function confirm() {
    setStage("done")
    onConfirmed?.()
  }

  return (
    <div className="border-border overflow-hidden rounded-xl border bg-white">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <AnimatePresence mode="wait">
        {/* ---------------- IDLE ---------------- */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                handleFile(e.dataTransfer.files?.[0])
              }}
              className={`flex w-full flex-col items-center justify-center gap-2 px-4 py-7 text-center transition-colors ${
                dragging ? "bg-emerald-50" : "hover:bg-muted/40"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  dragging ? "bg-emerald-100" : "bg-emerald-50"
                }`}
              >
                <UploadCloud className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">
                  Arrastra tu Excel o haz clic para subirlo
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Ferias, radio, volanteo y otras campanas sin pixel · .xlsx .xls .csv
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {/* ---------------- ANALYZING ---------------- */}
        {stage === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 p-5"
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-5 w-5 text-white" />
                <motion.span
                  className="absolute inset-0 rounded-xl border-2 border-violet-400"
                  animate={{ scale: [1, 1.25], opacity: [0.6, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>
              <div>
                <p className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                  La IA esta analizando tu archivo
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
                </p>
                <p className="text-muted-foreground text-xs">
                  Extrayendo campanas, gasto y leads del Excel
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {ANALYSIS_STEPS.map((step, i) => {
                const active = i === stepIndex
                const done = i < stepIndex
                return (
                  <div key={step} className="flex items-center gap-2.5 text-xs">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600" />
                    ) : (
                      <span className="border-border h-4 w-4 shrink-0 rounded-full border" />
                    )}
                    <span
                      className={
                        done
                          ? "text-muted-foreground line-through"
                          : active
                          ? "text-foreground font-medium"
                          : "text-muted-foreground/60"
                      }
                    >
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ---------------- PREVIEW ---------------- */}
        {stage === "preview" && parsed && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Cabecera del archivo */}
            <div className="border-border flex items-center justify-between gap-3 border-b bg-muted/30 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-medium">{parsed.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {parsed.sizeKb} KB · {parsed.rows.length} campanas detectadas
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700">
                <Sparkles className="h-3 w-3" />
                Leido por IA
              </span>
            </div>

            {/* Preview de filas */}
            <div className="px-4 py-3">
              <p className="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wider">
                Vista previa de lo detectado
              </p>
              <div className="border-border overflow-hidden rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Campana</th>
                      <th className="px-3 py-2 text-left font-medium">Canal</th>
                      <th className="px-3 py-2 text-right font-medium">Gasto</th>
                      <th className="px-3 py-2 text-right font-medium">Leads</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.map((r, i) => (
                      <tr key={r.campana} className={i % 2 ? "bg-muted/20" : ""}>
                        <td className="text-foreground px-3 py-2 font-medium">{r.campana}</td>
                        <td className="text-muted-foreground px-3 py-2">{r.canal}</td>
                        <td className="text-foreground px-3 py-2 text-right tabular-nums">
                          {fmtMoney(r.gasto)}
                        </td>
                        <td className="text-foreground px-3 py-2 text-right tabular-nums">{r.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-border border-t bg-emerald-50/60">
                    <tr className="text-emerald-800">
                      <td className="px-3 py-2 font-semibold" colSpan={2}>
                        Total a integrar
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {fmtMoney(parsed.totalGasto)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {parsed.totalLeads}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Acciones */}
            <div className="border-border flex items-center justify-end gap-2 border-t px-4 py-3">
              <button
                type="button"
                onClick={reset}
                className="border-border text-muted-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirm}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                Confirmar e integrar
              </button>
            </div>
          </motion.div>
        )}

        {/* ---------------- DONE ---------------- */}
        {stage === "done" && parsed && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-foreground text-sm font-semibold">
                  Excel integrado al ROAS consolidado
                </p>
                <p className="text-muted-foreground text-xs">
                  {parsed.rows.length} campanas offline · {fmtMoney(parsed.totalGasto)} de gasto ·{" "}
                  {parsed.totalLeads} leads sumados
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="border-border text-muted-foreground hover:bg-muted inline-flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Subir otro
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
