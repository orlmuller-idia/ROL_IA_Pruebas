/**
 * Marca de navegación interna (en memoria de módulo).
 *
 * Vive en el runtime JS de la pestaña: persiste durante una navegación interna de
 * Next (router.push, sin recargar el documento) pero se reinicia a `false` en
 * cualquier recarga real o acceso directo (el módulo se reevalúa al cargar la página).
 *
 * Lo usa /centro para decidir: si se llegó por el CTA del landing → mostrar login;
 * si fue un reload / acceso directo → devolver al inicio (la sesión vive en memoria
 * y se pierde de todas formas).
 */
let internalNav = false

export function markInternalNav() {
  internalNav = true
}

export function didInternalNav() {
  return internalNav
}
