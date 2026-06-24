"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Copy, CopyCheck, Power, Trash2, X, Layers } from "lucide-react"

interface ReplicableBlock {
  id: string
  label: string
}

interface BulkActionsBarProps {
  selectedCount: number
  itemLabel: string
  /* opciones para el dialogo de replicar */
  replicableBlocks?: ReplicableBlock[]
  replicaTargets?: { id: string; label: string }[]
  onClear: () => void
  onToggleActive?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  onReplicate?: (blocks: string[], targets: string[]) => void
}

export function BulkActionsBar({
  selectedCount,
  itemLabel,
  replicableBlocks = [],
  replicaTargets = [],
  onClear,
  onToggleActive,
  onDuplicate,
  onDelete,
  onReplicate,
}: BulkActionsBarProps) {
  const [replicaOpen, setReplicaOpen] = useState(false)
  const [blocks, setBlocks] = useState<string[]>(replicableBlocks.map((b) => b.id))
  const [targets, setTargets] = useState<string[]>([])

  const toggleBlock = (id: string) =>
    setBlocks((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  const toggleTarget = (id: string) =>
    setTargets((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  return (
    <>
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-aura/30 bg-aura/10 sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-md"
          >
            <span className="text-aura flex items-center gap-1.5 px-1 text-xs font-semibold">
              <CopyCheck className="h-3.5 w-3.5" />
              {selectedCount} {itemLabel}
              {selectedCount === 1 ? " seleccionado" : " seleccionados"}
            </span>
            <div className="bg-aura/20 h-5 w-px" />
            {onToggleActive && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleActive}
                className="text-foreground hover:bg-aura/15 h-7 gap-1.5 px-2 text-xs"
              >
                <Power className="h-3.5 w-3.5" />
                Activar/Desactivar
              </Button>
            )}
            {replicableBlocks.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplicaOpen(true)}
                className="text-foreground hover:bg-aura/15 h-7 gap-1.5 px-2 text-xs"
              >
                <Layers className="h-3.5 w-3.5" />
                Replicar configuracion
              </Button>
            )}
            {onDuplicate && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDuplicate}
                className="text-foreground hover:bg-aura/15 h-7 gap-1.5 px-2 text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicar
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
                className="text-alert hover:bg-alert/10 h-7 gap-1.5 px-2 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            )}
            <button
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground ml-1 transition-colors"
              aria-label="Limpiar seleccion"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogo Replicar configuracion */}
      <Dialog open={replicaOpen} onOpenChange={setReplicaOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2 text-base">
              <Layers className="text-aura h-4 w-4" />
              Replicar configuracion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Copia bloques de configuracion desde los {selectedCount} elementos seleccionados hacia
              otros destinos. Ahorra tiempo aplicando ajustes en masa.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground text-xs font-semibold">Que bloques replicar</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {replicableBlocks.map((b) => (
                  <label
                    key={b.id}
                    className="border-border/50 bg-secondary/30 flex cursor-pointer items-center gap-2 rounded-lg border p-2.5"
                  >
                    <Checkbox checked={blocks.includes(b.id)} onCheckedChange={() => toggleBlock(b.id)} />
                    <span className="text-foreground text-xs">{b.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {replicaTargets.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label className="text-foreground text-xs font-semibold">Aplicar a</Label>
                <div className="border-border/50 bg-secondary/20 flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border p-2">
                  {replicaTargets.map((t) => (
                    <label key={t.id} className="hover:bg-secondary/40 flex cursor-pointer items-center gap-2 rounded-md p-1.5">
                      <Checkbox checked={targets.includes(t.id)} onCheckedChange={() => toggleTarget(t.id)} />
                      <span className="text-foreground text-xs">{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setReplicaOpen(false)} className="text-xs">
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onReplicate?.(blocks, targets)
                setReplicaOpen(false)
                onClear()
              }}
              className="bg-aura hover:bg-aura/90 text-foreground gap-1.5 text-xs"
            >
              <CopyCheck className="h-3.5 w-3.5" />
              Replicar a {targets.length || "todos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
