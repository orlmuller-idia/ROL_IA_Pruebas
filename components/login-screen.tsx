"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, AlertCircle, User, Lock, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RolLogo } from "@/components/rol-logo"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface LoginScreenProps {
  onAuthenticated: () => void
}

const VALID_CREDENTIALS = {
  usuario: "tato",
  clave: "tato123",
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const [usuario, setUsuario] = useState("")
  const [clave, setClave] = useState("")
  const [showClave, setShowClave] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate a brief network delay for realism
    await new Promise((r) => setTimeout(r, 800))

    if (
      usuario.toLowerCase().trim() === VALID_CREDENTIALS.usuario &&
      clave === VALID_CREDENTIALS.clave
    ) {
      setLoading(false)
      onAuthenticated()
    } else {
      setLoading(false)
      setError("Credenciales invalidas. Verifique usuario y clave.")
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      {/* Background subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shake ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
        }}
        transition={{
          opacity: { duration: 0.6 },
          y: { duration: 0.6 },
          scale: { duration: 0.6 },
          x: { duration: 0.5 },
        }}
        className="border-border/50 bg-card relative w-full max-w-sm overflow-hidden rounded-2xl border shadow-2xl"
      >
        {/* Top accent line */}
        <div className="bg-aura h-1 w-full" />

        <div className="flex flex-col gap-8 p-8">
          {/* Logo and title */}
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className="bg-aura/5 border-aura/10 flex items-center justify-center rounded-2xl border px-8 py-5"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(168,85,247,0)",
                  "0 0 40px 8px rgba(168,85,247,0.12)",
                  "0 0 0 0 rgba(168,85,247,0)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <RolLogo size="lg" showTagline showIcon={true} animate={false} />
            </motion.div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-foreground text-sm font-medium">
                Centro de Comando
              </p>
              <p className="text-muted-foreground text-xs">
                Ingrese sus credenciales para continuar
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="usuario"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wider"
              >
                Usuario
              </Label>
              <div className="relative">
                <User className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="usuario"
                  type="text"
                  placeholder="Nombre de usuario"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  autoComplete="username"
                  className="border-border/60 bg-secondary/50 focus:border-aura/50 focus:ring-aura/20 h-11 pl-10 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="clave"
                className="text-muted-foreground text-xs font-medium uppercase tracking-wider"
              >
                Clave
              </Label>
              <div className="relative">
                <Lock className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="clave"
                  type={showClave ? "text" : "password"}
                  placeholder="Ingrese su clave"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="border-border/60 bg-secondary/50 focus:border-aura/50 focus:ring-aura/20 h-11 pl-10 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowClave((v) => !v)}
                  aria-label={showClave ? "Ocultar clave" : "Mostrar clave"}
                  aria-pressed={showClave}
                  className="text-muted-foreground hover:text-foreground focus-visible:ring-aura/40 absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 transition-colors focus:outline-none focus-visible:ring-2"
                >
                  {showClave ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-alert/10 border-alert/20 flex items-center gap-2 rounded-lg border px-3 py-2.5"
                >
                  <AlertCircle className="text-alert h-4 w-4 shrink-0" />
                  <span className="text-alert text-xs">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={loading}
              className="bg-aura hover:bg-aura/90 text-white h-11 w-full text-sm font-medium disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-muted-foreground/50 text-center text-[11px]">
            Acceso restringido. Solo personal autorizado.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
