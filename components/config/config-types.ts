/* Tipos y datos mock compartidos del Centro de Configuracion (solo diseno) */

export type IdiomaCode = "es" | "en" | "pt" | "fr"
export type MonedaCode = "COP" | "USD" | "MXN" | "EUR" | "BRL" | "PEN"

export interface Idioma {
  code: IdiomaCode
  label: string
}

export interface Moneda {
  code: MonedaCode
  label: string
  symbol: string
}

export const IDIOMAS: Idioma[] = [
  { code: "es", label: "Espanol" },
  { code: "en", label: "Ingles" },
  { code: "pt", label: "Portugues" },
  { code: "fr", label: "Frances" },
]

export const MONEDAS: Moneda[] = [
  { code: "COP", label: "Peso colombiano", symbol: "$" },
  { code: "USD", label: "Dolar estadounidense", symbol: "US$" },
  { code: "MXN", label: "Peso mexicano", symbol: "MX$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "BRL", label: "Real brasileno", symbol: "R$" },
  { code: "PEN", label: "Sol peruano", symbol: "S/" },
]

/* Esquema de facturacion de un grupo empresarial:
   - "consolidada": todo se factura a una empresa matriz del grupo
   - "individual": cada empresa del grupo se factura por separado */
export type EsquemaFacturacion = "consolidada" | "individual"

export interface DatosFacturacion {
  razonSocial: string
  identidadFiscal: string
  direccionFiscal: string
  correoFacturacion: string
}

export interface GrupoEmpresarial {
  id: string
  nombre: string
  esquemaFacturacion: EsquemaFacturacion
  /* Empresa matriz a la que se consolida la factura cuando el esquema es "consolidada" */
  empresaMatrizId: string
}

export interface Empresa {
  id: string
  grupoId: string
  nombre: string
  industria: string
  zonaHoraria: string
  monedaCorporativa: MonedaCode
  sitioWeb: string
  identidadFiscal: string
  datosFacturacion: DatosFacturacion
}

export interface Sucursal {
  id: string
  empresaId: string
  nombre: string
  pais: string
  ciudad: string
  idioma: IdiomaCode
  moneda: MonedaCode
  activa: boolean
  usuarios: number
  bovedaConfigurada: boolean
}

export interface LineaProducto {
  id: string
  nombre: string
  color: string
}

export type AsignacionTipo = "grupo" | "individual"

export interface GrupoUsuarios {
  id: string
  nombre: string
  descripcion: string
  sucursalId: string
  tipo: AsignacionTipo
  lineasProducto: string[]
  miembros: number
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  sucursalId: string
  /* Sucursales a las que el usuario tiene acceso (multi-sede). Incluye su sucursal base. */
  sucursales: string[]
  grupoId: string | null
  perfilNivel: "macro" | "meso" | "micro"
  lineasProducto: string[]
  activo: boolean
}

/* ── Perfiles de gobernanza (el "rol" es lo que se muestra al asignar) ── */

export interface PerfilGobernanza {
  id: string
  rol: string
  nivel: "macro" | "meso" | "micro"
  /* Alcance de acceso del perfil. Vacio = acceso a todo (sin restriccion). */
  empresas: string[]
  sucursales: string[]
  lineasProducto: string[]
}

export const perfilesSeed: PerfilGobernanza[] = [
  { id: "macro", rol: "CEO / Junta Directiva", nivel: "macro", empresas: [], sucursales: [], lineasProducto: [] },
  { id: "meso", rol: "Gerencia Comercial", nivel: "meso", empresas: ["e1"], sucursales: ["s1", "s2"], lineasProducto: ["lp1", "lp2"] },
  { id: "micro", rol: "Asesor Comercial", nivel: "micro", empresas: ["e1"], sucursales: ["s1"], lineasProducto: ["lp3", "lp5"] },
]

/* ── Asistentes (Jarvis por perfil) ── */

export type CapacidadId =
  | "resolver"
  | "alertas"
  | "tareas"
  | "escalar"

export interface CapacidadConfig {
  enabled: boolean
  reglas: Record<string, string>
}

export interface AsistentePerfil {
  perfilId: string
  perfilNombre: string
  perfilNivel: "macro" | "meso" | "micro"
  nombreAsistente: string
  avatar: string
  tono: "formal" | "cercano" | "directo" | "motivador"
  perfilesAsignados: string[]
  capacidades: Record<CapacidadId, CapacidadConfig>
}

/* ── Seed data mock ── */

export const grupoEmpresarialSeed: GrupoEmpresarial = {
  id: "grp1",
  nombre: "Holding Andina",
  esquemaFacturacion: "consolidada",
  empresaMatrizId: "e1",
}

export const empresasSeed: Empresa[] = [
  {
    id: "e1",
    grupoId: "grp1",
    nombre: "Grupo Comercial Andina",
    industria: "Retail / Servicios",
    zonaHoraria: "America/Bogota (GMT-5)",
    monedaCorporativa: "COP",
    sitioWeb: "grupoandina.com",
    identidadFiscal: "NIT 900.123.456-7",
    datosFacturacion: {
      razonSocial: "Grupo Comercial Andina S.A.S.",
      identidadFiscal: "NIT 900.123.456-7",
      direccionFiscal: "Calle 100 #15-20, Bogota, Colombia",
      correoFacturacion: "facturacion@grupoandina.com",
    },
  },
  {
    id: "e2",
    grupoId: "grp1",
    nombre: "Andina Servicios MX",
    industria: "Servicios",
    zonaHoraria: "America/Mexico_City (GMT-6)",
    monedaCorporativa: "MXN",
    sitioWeb: "andinamx.com",
    identidadFiscal: "RFC ASM120345AB1",
    datosFacturacion: {
      razonSocial: "Andina Servicios Mexico S.A. de C.V.",
      identidadFiscal: "RFC ASM120345AB1",
      direccionFiscal: "Av. Reforma 250, CDMX, Mexico",
      correoFacturacion: "facturacion@andinamx.com",
    },
  },
  {
    id: "e3",
    grupoId: "grp1",
    nombre: "Andina Brasil Ltda",
    industria: "Retail",
    zonaHoraria: "America/Sao_Paulo (GMT-3)",
    monedaCorporativa: "BRL",
    sitioWeb: "andinabrasil.com.br",
    identidadFiscal: "CNPJ 12.345.678/0001-90",
    datosFacturacion: {
      razonSocial: "Andina Brasil Comercio Ltda",
      identidadFiscal: "CNPJ 12.345.678/0001-90",
      direccionFiscal: "Av. Paulista 1000, Sao Paulo, Brasil",
      correoFacturacion: "faturamento@andinabrasil.com.br",
    },
  },
]

/* Alias de compatibilidad: la empresa principal del grupo (matriz). */
export const empresaSeed: Empresa = empresasSeed[0]

export const lineasProductoSeed: LineaProducto[] = [
  { id: "lp1", nombre: "Linea Premium", color: "#a855f7" },
  { id: "lp2", nombre: "Linea Corporativa", color: "#3b82f6" },
  { id: "lp3", nombre: "Linea Retail", color: "#22c55e" },
  { id: "lp4", nombre: "Linea Servicios", color: "#f59e0b" },
  { id: "lp5", nombre: "Linea Express", color: "#ef4444" },
]

export const sucursalesSeed: Sucursal[] = [
  { id: "s1", empresaId: "e1", nombre: "Sede Bogota", pais: "Colombia", ciudad: "Bogota", idioma: "es", moneda: "COP", activa: true, usuarios: 24, bovedaConfigurada: true },
  { id: "s2", empresaId: "e1", nombre: "Sede Medellin", pais: "Colombia", ciudad: "Medellin", idioma: "es", moneda: "COP", activa: true, usuarios: 16, bovedaConfigurada: true },
  { id: "s3", empresaId: "e2", nombre: "Sede CDMX", pais: "Mexico", ciudad: "Ciudad de Mexico", idioma: "es", moneda: "MXN", activa: true, usuarios: 19, bovedaConfigurada: false },
  { id: "s4", empresaId: "e2", nombre: "Miami Hub", pais: "Estados Unidos", ciudad: "Miami", idioma: "en", moneda: "USD", activa: false, usuarios: 8, bovedaConfigurada: false },
  { id: "s5", empresaId: "e3", nombre: "Sede Sao Paulo", pais: "Brasil", ciudad: "Sao Paulo", idioma: "pt", moneda: "BRL", activa: true, usuarios: 12, bovedaConfigurada: false },
]

export const gruposSeed: GrupoUsuarios[] = [
  { id: "g1", nombre: "Comercial Premium", descripcion: "Equipo enfocado en cuentas premium", sucursalId: "s1", tipo: "grupo", lineasProducto: ["lp1", "lp2"], miembros: 6 },
  { id: "g2", nombre: "Retail Bogota", descripcion: "Asesores de retail y express", sucursalId: "s1", tipo: "grupo", lineasProducto: ["lp3", "lp5"], miembros: 9 },
  { id: "g3", nombre: "Corporativo Medellin", descripcion: "Cuentas corporativas regionales", sucursalId: "s2", tipo: "grupo", lineasProducto: ["lp2"], miembros: 5 },
  { id: "g4", nombre: "Servicios CDMX", descripcion: "Linea de servicios Mexico", sucursalId: "s3", tipo: "grupo", lineasProducto: ["lp4"], miembros: 7 },
]

export const usuariosSeed: Usuario[] = [
  { id: "u1", nombre: "Roberto Mendez", email: "roberto@grupoandina.com", rol: "CEO / Junta Directiva", sucursalId: "s1", sucursales: ["s1", "s2", "s3", "s4", "s5"], grupoId: null, perfilNivel: "macro", lineasProducto: ["lp1", "lp2", "lp3", "lp4", "lp5"], activo: true },
  { id: "u2", nombre: "Laura Garcia", email: "laura@grupoandina.com", rol: "Gerencia Comercial", sucursalId: "s1", sucursales: ["s1", "s2"], grupoId: "g1", perfilNivel: "meso", lineasProducto: ["lp1", "lp2"], activo: true },
  { id: "u3", nombre: "Carlos Martinez", email: "carlos@grupoandina.com", rol: "Asesor Comercial", sucursalId: "s1", sucursales: ["s1"], grupoId: "g2", perfilNivel: "micro", lineasProducto: ["lp3", "lp5"], activo: true },
  { id: "u4", nombre: "Ana Lopez", email: "ana@grupoandina.com", rol: "Asesora Senior", sucursalId: "s2", sucursales: ["s2"], grupoId: "g3", perfilNivel: "micro", lineasProducto: ["lp2"], activo: true },
  { id: "u5", nombre: "Diego Ramirez", email: "diego@grupoandina.com", rol: "Gerente Regional", sucursalId: "s3", sucursales: ["s3", "s4"], grupoId: "g4", perfilNivel: "meso", lineasProducto: ["lp4"], activo: true },
  { id: "u6", nombre: "Sofia Torres", email: "sofia@grupoandina.com", rol: "Asesora", sucursalId: "s3", sucursales: ["s3"], grupoId: "g4", perfilNivel: "micro", lineasProducto: ["lp4"], activo: false },
]

const capacidadDefault = (enabled: boolean, reglas: Record<string, string>): CapacidadConfig => ({ enabled, reglas })

export const asistentesSeed: AsistentePerfil[] = [
  {
    perfilId: "macro",
    perfilNombre: "CEO / Junta Directiva",
    perfilNivel: "macro",
    nombreAsistente: "ARIA Ejecutiva",
    avatar: "AE",
    tono: "formal",
    perfilesAsignados: ["macro"],
    capacidades: {
      resolver: capacidadDefault(true, { alcance: "Todo el ecosistema" }),
      alertas: capacidadDefault(true, { canales: "In-app, Correo", severidad: "Alta" }),
      tareas: capacidadDefault(true, { hora: "07:00", incluye: "Resumen ejecutivo consolidado" }),
      escalar: capacidadDefault(false, { destino: "—", condicion: "—" }),
    },
  },
  {
    perfilId: "meso",
    perfilNombre: "Gerencia Comercial",
    perfilNivel: "meso",
    nombreAsistente: "ARIA Gerencial",
    avatar: "AG",
    tono: "directo",
    perfilesAsignados: ["meso"],
    capacidades: {
      resolver: capacidadDefault(true, { alcance: "Su sucursal y equipo" }),
      alertas: capacidadDefault(true, { canales: "In-app, WhatsApp", severidad: "Media" }),
      tareas: capacidadDefault(true, { hora: "08:00", incluye: "Pendientes del equipo + leads criticos" }),
      escalar: capacidadDefault(true, { destino: "CEO / Junta Directiva", condicion: "Semaforo rojo > 24h" }),
    },
  },
  {
    perfilId: "micro",
    perfilNombre: "Asesor Comercial",
    perfilNivel: "micro",
    nombreAsistente: "ARIA Personal",
    avatar: "AP",
    tono: "motivador",
    perfilesAsignados: ["micro"],
    capacidades: {
      resolver: capacidadDefault(true, { alcance: "Solo sus leads" }),
      alertas: capacidadDefault(true, { canales: "In-app, WhatsApp", severidad: "Baja" }),
      tareas: capacidadDefault(true, { hora: "08:30", incluye: "Mis tareas y leads del dia" }),
      escalar: capacidadDefault(true, { destino: "Gerencia Comercial", condicion: "Lead premium en riesgo" }),
    },
  },
]
