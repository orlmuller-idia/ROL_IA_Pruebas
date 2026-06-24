/**
 * Generador del Documento Maestro de Rol
 * ---------------------------------------------------
 * Produce un documento HTML extenso, tipo "tesis del producto", listo para
 * imprimir/guardar como PDF desde el navegador. Cubre TODO el producto:
 * filosofia, niveles de visualizacion, agentes, interfaz, los reportes de
 * inteligencia, los guardianes autonomos, las auditorias forenses y la
 * configuracion. Es intencionalmente exhaustivo y conceptual.
 */

const STYLES = `
  @page { margin: 2cm 1.6cm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    color: #1f2430; line-height: 1.6; font-size: 12px; margin: 0;
  }
  .sans { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }

  /* Portada */
  .cover { height: 96vh; display: flex; flex-direction: column; justify-content: center;
    page-break-after: always; padding: 0 8px; }
  .cover .badge { font-family: system-ui, sans-serif; font-size: 11px; letter-spacing: 3px;
    text-transform: uppercase; color: #0ea5a4; font-weight: 700; }
  .cover h1 { font-size: 52px; margin: 12px 0 4px; color: #0f172a; line-height: 1.05; letter-spacing: -1px; }
  .cover .sub { font-size: 18px; color: #475569; font-style: italic; margin-bottom: 28px; }
  .cover .rule { height: 3px; width: 80px; background: #0ea5a4; margin: 8px 0 28px; }
  .cover .meta { font-family: system-ui, sans-serif; font-size: 12px; color: #64748b; }
  .cover .lema { margin-top: 40px; font-size: 15px; color: #0f172a; font-style: italic;
    border-left: 3px solid #0ea5a4; padding-left: 14px; }

  /* Indice */
  .toc { page-break-after: always; }
  .toc h2 { border: none; }
  .toc ol { font-family: system-ui, sans-serif; font-size: 13px; color: #334155; padding-left: 22px; }
  .toc ol li { margin: 7px 0; }
  .toc ol ol { font-size: 12px; color: #64748b; margin-top: 4px; }

  h1.part { font-size: 13px; letter-spacing: 3px; text-transform: uppercase;
    font-family: system-ui, sans-serif; color: #0ea5a4; margin: 0 0 4px; font-weight: 700; }
  h2 { font-family: system-ui, sans-serif; font-size: 23px; color: #0f172a; margin: 6px 0 14px;
    padding-bottom: 8px; border-bottom: 2px solid #0ea5a4; page-break-after: avoid; }
  h3 { font-family: system-ui, sans-serif; font-size: 16px; color: #0f172a; margin: 22px 0 8px; page-break-after: avoid; }
  h4 { font-family: system-ui, sans-serif; font-size: 12.5px; color: #0ea5a4; margin: 14px 0 4px;
    text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; page-break-after: avoid; }
  p { margin: 6px 0; }
  strong { color: #0f172a; }
  .lead { font-size: 13.5px; color: #334155; }

  .section { page-break-inside: avoid; }
  .part-divider { page-break-before: always; }

  .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 14px 16px; margin: 12px 0; page-break-inside: avoid; }
  .card.teal { background: #f0fdfa; border-color: #99f6e4; }
  .card.amber { background: #fffbeb; border-color: #fde68a; }
  .card.rose { background: #fff1f2; border-color: #fecdd3; }

  .tag { display: inline-block; font-family: system-ui, sans-serif; font-size: 9.5px;
    font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 2px 8px;
    border-radius: 999px; margin-bottom: 6px; }
  .tag-vivo { background: #dbeafe; color: #1d4ed8; }
  .tag-analisis { background: #fef3c7; color: #b45309; }
  .tag-forecast { background: #dcfce7; color: #15803d; }
  .tag-forense { background: #e0e7ff; color: #4338ca; }
  .tag-config { background: #f1f5f9; color: #475569; }

  .legend { display: flex; align-items: center; gap: 7px; margin: 3px 0; font-family: system-ui, sans-serif; font-size: 11px; }
  .dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-green { background: #22c55e; } .dot-yellow { background: #eab308; }
  .dot-red { background: #ef4444; } .dot-blue { background: #3b82f6; }
  .dot-teal { background: #0ea5a4; }

  .tip { background: #f0fdfa; border-left: 3px solid #0ea5a4; padding: 9px 12px; margin: 10px 0;
    font-family: system-ui, sans-serif; font-size: 11px; color: #134e4a; }
  .formula { font-family: "SF Mono", ui-monospace, monospace; background: #0f172a; color: #5eead4;
    padding: 9px 12px; border-radius: 7px; font-size: 11.5px; margin: 8px 0; }

  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-family: system-ui, sans-serif; font-size: 10.5px; }
  th { background: #0f172a; color: #fff; text-align: left; padding: 7px 9px; font-weight: 600; }
  td { border-bottom: 1px solid #e2e8f0; padding: 6px 9px; color: #334155; vertical-align: top; }
  tr:nth-child(even) td { background: #f8fafc; }

  .step { display: flex; align-items: flex-start; gap: 9px; margin: 6px 0; font-family: system-ui, sans-serif; font-size: 11px; }
  .step-num { background: #0f172a; color: #5eead4; width: 22px; height: 22px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .level-pill { font-family: system-ui, sans-serif; font-size: 10px; font-weight: 700; padding: 2px 7px;
    border-radius: 5px; margin-right: 6px; }
  .lv-macro { background: #e0e7ff; color: #4338ca; }
  .lv-meso { background: #dbeafe; color: #1d4ed8; }
  .lv-micro { background: #dcfce7; color: #15803d; }

  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif; font-size: 10px; color: #94a3b8; text-align: center; }
  .pgbreak { page-break-before: always; }
`

/* Bloque reutilizable: como cambia un panel segun nivel de visualizacion */
function nivelesBlock(macro: string, meso: string, micro: string): string {
  return `
    <h4>Como cambia segun el nivel de visualizacion</h4>
    <p><span class="level-pill lv-macro">MACRO · CEO</span> ${macro}</p>
    <p><span class="level-pill lv-meso">MESO · Gerencia</span> ${meso}</p>
    <p><span class="level-pill lv-micro">MICRO · Asesor</span> ${micro}</p>
  `
}

export function buildFullManualHTML(): string {
  const fecha = new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })

  return `
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>Rol — Documento Maestro del Producto</title>
      <style>${STYLES}</style>
    </head>
    <body>

      <!-- ════════════ PORTADA ════════════ -->
      <div class="cover">
        <div class="badge">Documento Maestro · powered by IDIA</div>
        <h1>Rol</h1>
        <div class="rule"></div>
        <div class="sub">La capa de inteligencia y rendicion de cuentas sobre tu operacion comercial</div>
        <p class="lead">Una tesis completa del producto: filosofia, arquitectura de niveles, agentes,
        interfaz conversacional, reportes de inteligencia, guardianes autonomos, auditorias forenses
        y centro de configuracion. Todo lo que Rol es, hoy, en un solo lugar.</p>
        <div class="lema">"La IA no piensa por uno, piensa con uno."</div>
        <div class="meta" style="margin-top:36px;">
          <p><strong>Producto:</strong> Rol &nbsp;·&nbsp; <strong>Generado:</strong> ${fecha}</p>
          <p><strong>Alcance:</strong> Estado actual del producto en todos sus aspectos de diseno y funcionamiento.</p>
        </div>
      </div>

      <!-- ════════════ INDICE ════════════ -->
      <div class="toc">
        <h2>Contenido</h2>
        <ol>
          <li><strong>Que es Rol y por que existe</strong>
            <ol><li>El problema: la operacion miente sin querer</li>
            <li>La tesis del producto</li><li>Principios de diseno</li></ol></li>
          <li><strong>Los tres niveles de visualizacion</strong>
            <ol><li>Macro, Meso y Micro</li><li>Herencia y navegacion drill-down</li></ol></li>
          <li><strong>Rol como agente: la interfaz conversacional</strong>
            <ol><li>Chat-first y los tres agentes</li><li>Barra lateral y navegacion</li><li>Onboarding didactico</li></ol></li>
          <li><strong>Reportes de Inteligencia</strong>
            <ol><li>Auditoria y Control del Dinero</li><li>Fugas Silenciosas y Calidad Humana</li>
            <li>Proyecciones de Cierre</li><li>Auditorias Forenses</li></ol></li>
          <li><strong>Los Guardianes Autonomos (G1–G9)</strong></li>
          <li><strong>Centro de Configuracion y Gobernanza</strong></li>
          <li><strong>Glosario y formulas clave</strong></li>
        </ol>
      </div>

      <!-- ════════════ PARTE 1 ════════════ -->
      <div class="section">
        <h1 class="part">Parte 1</h1>
        <h2>Que es Rol y por que existe</h2>
        <p class="lead">Rol es una capa de inteligencia que se coloca <strong>encima</strong> de las
        herramientas que ya usas (CRM, plataformas de pauta, telefonia, mensajeria) y responde una
        sola pregunta incomoda: <em>"¿lo que me reportan es verdad, y que estoy perdiendo sin darme cuenta?"</em></p>

        <h3>1.1 El problema: la operacion miente sin querer</h3>
        <p>En la mayoria de empresas comerciales conviven tres versiones de la realidad que no coinciden:</p>
        <table>
          <tr><th>Version</th><th>Quien la cuenta</th><th>Por que enganha</th></tr>
          <tr><td>Lo que dice marketing</td><td>Plataformas de pauta (Meta, Google)</td><td>Atribuye ventas que el CRM no confirma; mide clicks, no dinero cobrado.</td></tr>
          <tr><td>Lo que dice el vendedor</td><td>Notas en el CRM</td><td>"No contesta", "no interesado" — etiquetas que ocultan negligencia o demora.</td></tr>
          <tr><td>Lo que de verdad paso</td><td>Llamadas, WhatsApp, cierres reales</td><td>Es la unica verdad, pero esta dispersa y nadie la cruza.</td></tr>
        </table>
        <p>El resultado: se celebra un ROAS inflado, se castiga al canal equivocado, y el dinero se fuga
        en silencio por demoras de contacto, mala atencion y leads que mueren en una bandeja.</p>

        <h3>1.2 La tesis del producto</h3>
        <p>Rol no es otro dashboard de metricas tipicas. Su valor esta en <strong>contrastar fuentes</strong>
        y en <strong>actuar</strong>. Tres movimientos definen el producto:</p>
        <div class="card teal">
          <p><strong>1. Confronta la realidad.</strong> Cruza lo reportado contra lo efectivamente vendido
          en el CRM y lo realmente ocurrido en las conversaciones. La diferencia es el "dinero fantasma".</p>
          <p><strong>2. Hace visible lo invisible.</strong> La fuga por demora, la mala atencion que igual
          cerro, el fraude de notas: todo se mide en dinero real, no en porcentajes abstractos.</p>
          <p><strong>3. Actua de forma autonoma.</strong> Los Guardianes (G1–G9) no solo alertan: rescatan
          leads, pausan pauta ineficiente, agendan y dejan evidencia forense de cada intervencion.</p>
        </div>

        <h3>1.3 Principios de diseno</h3>
        <h4>Lenguaje humano, numeros en dinero</h4>
        <p>Cada panel habla en pesos y en frases claras ("Marketing reporta $137.5M, el CRM confirma $98.9M"),
        no en jerga de marketing. La metrica existe para provocar una decision, no para decorar.</p>
        <h4>De lo general a lo particular</h4>
        <p>Todo se puede leer en tres alturas: el CEO ve el consolidado, la gerencia ve la celula, el
        asesor ve su caso. El mismo dato, tres lecturas.</p>
        <h4>Conversacion antes que tablero</h4>
        <p>El punto de entrada es un chat con un agente que entiende tu rol y te lleva al reporte correcto.
        El tablero esta a un clic, pero no es la primera barrera.</p>
        <h4>Evidencia, no opinion</h4>
        <p>Cada afirmacion de Rol es rastreable hasta su fuente (timestamp, grabacion, nota del CRM).
        Por eso las auditorias son "forenses": sirven para rendir cuentas.</p>
      </div>

      <!-- ════════════ PARTE 2 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 2</h1>
        <h2>Los tres niveles de visualizacion</h2>
        <p class="lead">Rol organiza absolutamente todo en tres alturas de lectura. No son pantallas
        distintas: son <strong>la misma informacion contada para tres responsables distintos</strong>.</p>

        <div class="grid2">
          <div class="card">
            <span class="level-pill lv-macro">MACRO</span><strong>Direccion General (CEO)</strong>
            <p>Vision consolidada de todo el grupo: empresas, sucursales y lineas juntas. Responde
            "¿el negocio esta sano y me estan diciendo la verdad?". Prioriza brechas, dinero en riesgo
            y desviaciones entre lo reportado y lo real.</p>
          </div>
          <div class="card">
            <span class="level-pill lv-meso">MESO</span><strong>Gerencia Comercial</strong>
            <p>Desglose por sucursal, equipo o campana. Responde "¿que celula falla y por que?".
            Permite comparar sedes, ver rankings y detectar al responsable de una desviacion.</p>
          </div>
        </div>
        <div class="card">
          <span class="level-pill lv-micro">MICRO</span><strong>Asesor / Operativo</strong>
          <p>El caso individual: este lead, esta llamada, esta hora. Responde "¿que hago yo ahora para
          cerrar mas?". Es accionable y personal, sin ruido de otros equipos.</p>
        </div>

        <h3>2.1 Herencia y navegacion drill-down</h3>
        <p>Los niveles estan encadenados: desde Macro se hace clic en una sucursal para bajar a Meso, y
        desde alli a una campana o asesor para llegar a Micro. Un <strong>breadcrumb</strong>
        (p. ej. "Grupo › Sede CDMX › Meta") permite devolverse a cualquier altura. La configuracion
        sigue la misma logica de herencia: <em>Empresa → Sucursal → Usuario/Grupo → Perfil → Asistente</em>,
        donde cada nivel hereda del anterior y puede sobreescribir lo que necesite.</p>
        <div class="tip">El nivel de visualizacion lo define el perfil con el que inicias sesion, pero el
        drill-down por clic permite a un CEO descender hasta el detalle de un solo lead sin cambiar de perfil.</div>
      </div>

      <!-- ════════════ PARTE 3 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 3</h1>
        <h2>Rol como agente: la interfaz conversacional</h2>
        <p class="lead">La experiencia arranca en un <strong>chat</strong>, no en un tablero. Rol se
        presenta segun tu perfil y abre con una pregunta clara para orientar la sesion.</p>

        <h3>3.1 Chat-first y los tres agentes</h3>
        <p>Rol adopta una personalidad y un foco distinto en cada nivel. Es el mismo cerebro, con tres
        formas de acompanar:</p>
        <table>
          <tr><th>Agente</th><th>Para quien</th><th>Pregunta de inicio</th></tr>
          <tr><td><strong>Rol Estratega</strong></td><td>Direccion General (Macro)</td><td>"¿Por donde quieres empezar a auditar el negocio hoy?"</td></tr>
          <tr><td><strong>Rol Tactica</strong></td><td>Gerencia Comercial (Meso)</td><td>"¿Que celula o indicador quieres revisar con tu equipo?"</td></tr>
          <tr><td><strong>Rol Copiloto</strong></td><td>Asesor / Operativo (Micro)</td><td>"¿Quieres que te arme el plan para cerrar mas hoy?"</td></tr>
        </table>
        <p>Debajo del chat aparecen <strong>sugerencias en lenguaje natural</strong> (p. ej. "¿Marketing me
        esta inflando el ROAS?") y <strong>informes destacados</strong>. Al elegir una sugerencia o escribir
        una pregunta, Rol interpreta la intencion y enruta directo al reporte que la responde.</p>

        <h3>3.2 Barra lateral y navegacion</h3>
        <p>El lateral izquierdo agrupa toda la inteligencia en <strong>menus desplegables</strong>,
        organizados por proposito y no por tipo de grafico:</p>
        <div class="step"><span class="step-num">1</span><span><strong>Auditoria y Control del Dinero</strong> — donde esta y como se mueve el dinero (en vivo).</span></div>
        <div class="step"><span class="step-num">2</span><span><strong>Fugas Silenciosas y Calidad Humana</strong> — por que se escapan las ventas.</span></div>
        <div class="step"><span class="step-num">3</span><span><strong>Proyecciones de Cierre</strong> — que va a pasar, forecast con IA.</span></div>
        <div class="step"><span class="step-num">4</span><span><strong>Auditorias Forenses</strong> — evidencia y rendicion de cuentas.</span></div>
        <div class="step"><span class="step-num">5</span><span><strong>Configuracion</strong> — gobernanza, guardianes y boveda de seguridad.</span></div>
        <p>La barra es colapsable, muestra el agente activo y resalta el reporte en el que estas. Un filtro
        global de empresa / sucursal / linea recalcula todos los paneles en simultaneo.</p>

        <h3>3.3 Onboarding didactico</h3>
        <p>En el lateral vive una guia "Como usar Rol" de cuatro pasos que ensena el modelo mental del
        producto sin manuales externos:</p>
        <div class="step"><span class="step-num">1</span><span>Empieza por el chat: preguntale a Rol en lenguaje natural.</span></div>
        <div class="step"><span class="step-num">2</span><span>Navega por la barra: los reportes estan agrupados por proposito.</span></div>
        <div class="step"><span class="step-num">3</span><span>Cambia de altura: usa Macro/Meso/Micro y baja con clic al detalle.</span></div>
        <div class="step"><span class="step-num">4</span><span>Deja que los Guardianes actuen: ellos rescatan, pausan y agendan por ti.</span></div>
      </div>

      <!-- ════════════ PARTE 4 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 4</h1>
        <h2>Reportes de Inteligencia</h2>
        <p class="lead">Los reportes son el corazon analitico de Rol. Estan agrupados en cuatro familias.
        Cada uno indica que muestra, como leerlo, y como cambia entre los tres niveles de visualizacion.</p>

        <!-- 4.1 DINERO -->
        <h3>4.1 Auditoria y Control del Dinero <span class="tag tag-vivo">En Vivo</span></h3>
        <p>Donde esta y como se mueve el dinero, minuto a minuto.</p>

        <div class="card">
          <h4>CPA en Tiempo Real</h4>
          <p>Gasto vs. conversiones de Meta y Google minuto a minuto: la foto instantanea de si el dinero
          invertido esta generando resultados ahora.</p>
          <p class="legend"><span class="dot dot-blue"></span> Gasto Meta &nbsp; <span class="dot dot-yellow"></span> Gasto Google &nbsp; <span class="dot dot-teal"></span> Conversiones</p>
          <div class="tip">Si las lineas de gasto suben pero las de conversion bajan, el CPA se dispara: es la senal para que G2 pause campanas ineficientes.</div>
        </div>

        <div class="card">
          <h4>Semaforo de Abandono</h4>
          <p>Cada lead pendiente con un cronometro vivo que mide cuanto lleva sin recibir respuesta.
          Es el panel que alimenta al Guardian de Leads (G1).</p>
          <p class="legend"><span class="dot dot-red"></span> +10 min, critico &nbsp; <span class="dot dot-yellow"></span> 5–10 min, urgente &nbsp; <span class="dot dot-green"></span> &lt;5 min, OK</p>
          ${nivelesBlock(
            "Volumen total de leads en rojo y dinero en riesgo agregado de todo el grupo.",
            "Leads en rojo por sucursal y por asesor, para intervenir donde mas se acumulan.",
            "Mis leads pendientes con su cronometro: a quien llamar ya para que no caiga en rojo.",
          )}
        </div>

        <div class="card">
          <h4>Agenda Inteligente</h4>
          <p>Como esta distribuida la carga de citas del dia, estructurada en bloques con priorizacion
          basada en el perfil de cada lead (G9) y organizada por G8.</p>
          ${nivelesBlock(
            "Ocupacion y capacidad por sede: que sucursal esta saturada o subutilizada.",
            "Carga del equipo: balance de citas por asesor y huecos aprovechables.",
            "Mi agenda del dia, bloque por bloque, con script y objeciones probables.",
          )}
        </div>

        <div class="card">
          <h4>Agenda de Rescate</h4>
          <p>A quien hay que rescatar hoy para no perder la venta: leads en riesgo priorizados por valor
          y probabilidad de recuperacion.</p>
          ${nivelesBlock(
            "Dinero total recuperable hoy y tasa de rescate del grupo.",
            "Cola de rescate por equipo y responsables asignados.",
            "Mi lista concreta de rescates ordenada por urgencia y ticket.",
          )}
        </div>

        <div class="card teal">
          <h4>Realidad vs Marketing <span style="font-weight:400;font-style:italic;">(panel insignia)</span></h4>
          <p>El panel que no le cree a marketing. Toma lo realmente vendido en el CRM y lo divide por el
          costo de campana; la brecha contra el ROAS reportado es el "dinero fantasma". Suma ademas la fuga
          de leads en rojo y los cierres con mala atencion, todo en dinero real. Una IA detecta y narra la
          diferencia en lenguaje natural y senala la sucursal que mas infla.</p>
          <div class="formula">ROAS Real = Ventas confirmadas en CRM ÷ Costo de campana</div>
          <div class="formula">Fuga Real = Valor de leads en rojo perdidos ÷ Costo de campana</div>
          <div class="formula">Mala atencion = Ventas fuera de SLA o sin calidad ÷ Costo de campana</div>
          ${nivelesBlock(
            "Consolidado del grupo con la brecha global de inflado y el dinero fantasma total.",
            "Desglose por sucursal ordenado por % de inflado, con barras reportado vs real y ranking.",
            "La realidad del asesor: cuanto de lo atribuido a su pauta de verdad cerro en el CRM.",
          )}
          <div class="tip">Navegacion drill-down: clic en una sucursal abre su detalle; clic en una campana llega al caso. El breadcrumb permite volver a cualquier nivel.</div>
        </div>

        <div class="card">
          <h4>Tendencia Presupuesto vs Leads</h4>
          <p>Si la inversion esta generando los leads esperados, en el tiempo. Diferencia las campanas
          digitales (con pixel) de las <strong>offline</strong> (ferias, radio, volanteo) que se importan
          por Excel. El flujo de carga muestra el archivo, una IA que lo analiza y un preview para confirmar
          antes de integrarlo al ROAS consolidado.</p>
          ${nivelesBlock(
            "Tendencia agregada de inversion vs generacion de leads del grupo completo.",
            "Comparacion por plataforma y sucursal, incluyendo campanas offline cargadas.",
            "El detalle de las campanas que trabaja el asesor y su rendimiento.",
          )}
        </div>

        <div class="card">
          <h4>Tendencia de ROAS</h4>
          <p>Como evoluciona el retorno de inversion a lo largo del tiempo, para distinguir un mal dia de
          una tendencia preocupante.</p>
          ${nivelesBlock(
            "Curva de ROAS consolidada con bandas de objetivo del grupo.",
            "ROAS por canal y sucursal sobre la misma linea de tiempo.",
            "El retorno atribuible al trabajo del propio asesor.",
          )}
        </div>

        <!-- 4.2 FUGAS -->
        <h3 class="pgbreak">4.2 Fugas Silenciosas y Calidad Humana <span class="tag tag-analisis">Analisis</span></h3>
        <p>Por que se escapan las ventas, mas alla del numero.</p>

        <div class="card amber">
          <h4>Diagnostico de Fuga</h4>
          <p>Mapa de calor con los motivos reales de perdida, clasificados por G5 desde las notas del CRM.
          El tamano de cada burbuja es el volumen de leads perdidos; el color, la gravedad.</p>
          ${nivelesBlock(
            "Los grandes motivos de fuga del grupo y su costo total.",
            "Motivos de fuga por sucursal y por asesor para asignar responsables.",
            "Por que se cayeron los leads propios y como evitarlo.",
          )}
        </div>

        <div class="card amber">
          <h4>Deteccion de Fraude: CRM vs Realidad</h4>
          <p>La IA cruza cada nota del CRM contra la data real de llamadas y WhatsApp y detecta cuando lo
          escrito no coincide con lo ocurrido (un "no contesta" sobre una llamada que nunca se hizo).</p>
          ${nivelesBlock(
            "Indice global de fraude y dinero comprometido en notas falsas.",
            "Casos agrupados por asesor con la evidencia textual de la conversacion.",
            "Los casos propios marcados por la IA para corregir registro.",
          )}
        </div>

        <div class="card amber">
          <h4>Copywriter IA</h4>
          <p>Genera mensajes y copys alternativos que convierten mejor segun el perfil del lead y el canal.
          Es el motor creativo de G3 para reactivar anuncios y mensajes de rescate.</p>
          ${nivelesBlock(
            "Lineas creativas que mejor rinden a nivel de marca.",
            "Variantes por campana y segmento para pruebas A/B.",
            "Un copy listo para este lead concreto, con su tono y objecion.",
          )}
        </div>

        <div class="card amber">
          <h4>Ventana Dorada</h4>
          <p>La franja horaria optima para cerrar, calculada con Machine Learning cruzando probabilidad de
          cierre, ticket promedio e indice de friccion por hora.</p>
          <p><strong>Mejor momento para cerrar</strong> · <strong>Ventas mas caras</strong> · <strong>Momento con mas friccion</strong></p>
          ${nivelesBlock(
            "Las franjas clave del dia a nivel grupo con recomendacion estrategica.",
            "Analisis horario por equipo para asignar mejor a la gente.",
            "Tu plan por horas: cuando reservar tus mejores leads y que franja evitar.",
          )}
        </div>

        <div class="card amber">
          <h4>Speech Analytics</h4>
          <p>Mide la calidad humana de las conversaciones: cumplimiento del guion, palabras prohibidas y las
          resistencias del cliente mas frecuentes que frenan el cierre.</p>
          ${nivelesBlock(
            "Indice de calidad comparado entre sucursales.",
            "Incidencias y palabras prohibidas mas detectadas, con severidad.",
            "Las alertas de calidad propias y como ajustar el guion personal.",
          )}
        </div>

        <!-- 4.3 PROYECCIONES -->
        <h3 class="pgbreak">4.3 Proyecciones de Cierre <span class="tag tag-forecast">Forecasting</span></h3>
        <div class="card rose">
          <h4>Predictor de Metas</h4>
          <p>Proyeccion de G4: si se cubriran los gastos fijos y la meta al ritmo actual de ventas. Barras =
          ingresos reales; linea punteada = forecast de IA; area roja = deficit proyectado.</p>
          ${nivelesBlock(
            "Forecast consolidado del grupo contra la meta y los gastos fijos.",
            "Proyeccion por sucursal y aporte de cada una a la meta.",
            "Cuanto le falta al asesor para su cuota y el ritmo necesario.",
          )}
        </div>

        <!-- 4.4 FORENSE -->
        <h3 class="pgbreak">4.4 Auditorias Forenses <span class="tag tag-forense">Forense</span></h3>
        <p>Evidencia rastreable para rendicion de cuentas.</p>

        <div class="card">
          <h4>Bitacora de Intervencion Critica</h4>
          <p>Registro forense de cada intervencion de Rol cuando el vendedor falla. Es la evidencia de
          quien atendio, quien no, y cuanto dinero rescato la IA.</p>
          <table>
            <tr><th>Columna</th><th>Que registra</th></tr>
            <tr><td>Timestamp</td><td>Momento exacto de la intervencion.</td></tr>
            <tr><td>Lead / Cliente</td><td>Nombre, ID y telefono del lead.</td></tr>
            <tr><td>Semaforo</td><td>Estado de urgencia al intervenir (verde/amarillo/rojo).</td></tr>
            <tr><td>Delta Friccion</td><td>Cuanto tardo el vendedor (o si no respondio).</td></tr>
            <tr><td>Delta Rescate</td><td>Tiempo de reaccion de Rol.</td></tr>
            <tr><td>Valor $</td><td>Ticket potencial del lead.</td></tr>
            <tr><td>Perfil G9</td><td>Nivel de urgencia y tipo de autoridad del lead.</td></tr>
            <tr><td>Resultado</td><td>Rescatado, Perdido o En Proceso.</td></tr>
          </table>
          <h4>Filtros de exposicion</h4>
          <p><strong>Vendedores Fantasma:</strong> +30% de sus leads fueron rescatados por IA.
          &nbsp;<strong>Reincidentes:</strong> patron de abandono repetitivo.
          &nbsp;<strong>Zonas de Silencio:</strong> franjas horarias con alta negligencia.</p>
        </div>

        <div class="card">
          <h4>Auditoria de Fuga y Friccion</h4>
          <p>Rendicion de cuentas por vendedor: identifica responsables de fugas y calcula la oportunidad de
          recuperacion sin inversion adicional.</p>
          <table>
            <tr><th>Columna</th><th>Que mide</th></tr>
            <tr><td>Asesor Comercial</td><td>Vendedor responsable.</td></tr>
            <tr><td>Leads Auditados</td><td>Total de leads asignados.</td></tr>
            <tr><td>% Fuga Total</td><td>Porcentaje de leads perdidos (critico/aceptable).</td></tr>
            <tr><td>Leads x Demora</td><td>Perdidos por tardar en responder.</td></tr>
            <tr><td>Leads x Seguimiento</td><td>Perdidos por no dar seguimiento.</td></tr>
            <tr><td>Dinero en Riesgo</td><td>Ticket promedio × leads perdidos.</td></tr>
          </table>
          <div class="tip">El Veredicto G5 cruza el dinero en riesgo con cada motivo: si el 20% de la fuga es por demora, mejorar contactabilidad recupera ese 20% del dinero sin gastar mas en pauta.</div>
        </div>
      </div>

      <!-- ════════════ PARTE 5 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 5</h1>
        <h2>Los Guardianes Autonomos (G1–G9)</h2>
        <p class="lead">Los Guardianes son agentes que <strong>actuan</strong>, no solo informan. Cada uno
        cubre un momento del ciclo comercial y deja rastro en las auditorias forenses. Se configuran y
        encienden desde el Centro de Configuracion.</p>

        <div class="card"><h4>G1 · El Rescatista</h4>
          <p>Rescata leads abandonados con una secuencia omnicanal cuando el vendedor no responde dentro del SLA.</p>
          <p class="legend"><span class="dot dot-green"></span> Verde: avisa al vendedor ("nuevo lead, 2 min para contacto").</p>
          <p class="legend"><span class="dot dot-yellow"></span> Amarillo: presiona ("5 min sin atencion, interes bajando").</p>
          <p class="legend"><span class="dot dot-red"></span> Rojo: toma el control ("tiempo excedido, Rol interviene").</p>
          <p>El cliente puede elegir: llamada IA, agendamiento (G8), continuar chat u opt-out.</p>
        </div>

        <div class="card"><h4>G2 · Guardian de Pauta</h4>
          <p>Pausa campanas ineficientes cuando el ROAS cae bajo 1.5x por dos periodos seguidos, para no quemar presupuesto.</p>
          <div class="step"><span class="step-num">1</span><span>Monitorea ROAS cada hora en Meta y Google.</span></div>
          <div class="step"><span class="step-num">2</span><span>Si ROAS &lt; 1.5x por 2 periodos, marca critico.</span></div>
          <div class="step"><span class="step-num">3</span><span>Pausa la campana via API y notifica al equipo.</span></div>
        </div>

        <div class="card"><h4>G3 · Copywriter Estrategico</h4>
          <p>Genera copys alternativos y briefs de diseno para reactivar anuncios pausados. Es el motor detras del reporte Copywriter IA.</p></div>

        <div class="card"><h4>G4 · Analista Predictivo</h4>
          <p>Proyecta si se cubriran los gastos fijos al ritmo actual y emite alertas tempranas de deficit. Alimenta el Predictor de Metas.</p></div>

        <div class="card"><h4>G5 · Auditor de Fugas</h4>
          <p>Analisis forense de por que no se compra: lee las notas del CRM, clasifica los motivos de perdida y emite el Veredicto G5 con recomendaciones por vendedor.</p></div>

        <div class="card"><h4>G6 · Optimizador de Conversion</h4>
          <p>Redistribuye presupuesto automaticamente, moviendo dinero de anuncios perdedores a ganadores en tiempo real.</p></div>

        <div class="card"><h4>G7 · El Cerrador</h4>
          <p>Ejecuta llamadas de rescate y persiste hasta lograr contacto (hasta 3 remarcados). Si contesta, procede a cerrar la cita; si no, activa nutricion posterior.</p></div>

        <div class="card"><h4>G8 · Organizador de Agenda</h4>
          <p>Estructura el dia del vendedor en bloques de 10 minutos con priorizacion segun el perfil G9. Cada bloque trae lead, perfil, script sugerido y objeciones probables.</p></div>

        <div class="card"><h4>G9 · Perfilador de Leads</h4>
          <p>Usa Machine Learning para perfilar cada lead: nivel de urgencia (alta/media/baja), tipo de autoridad
          (decision, influencia, tecnico), probabilidad de cierre y canal preferido (voz, WhatsApp, email).</p></div>
      </div>

      <!-- ════════════ PARTE 6 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 6</h1>
        <h2>Centro de Configuracion y Gobernanza <span class="tag tag-config">Config</span></h2>
        <p class="lead">La configuracion va de lo general a lo particular y cada nivel hereda del anterior:
        <strong>Empresa → Sucursal → Usuario/Grupo → Perfil → Asistente</strong>.</p>

        <div class="card"><h4>Empresa</h4>
          <p>Raiz de la jerarquia: nombre, industria, identidad fiscal, zona horaria base y moneda corporativa. Son los valores por defecto que heredan las sucursales.</p></div>
        <div class="card"><h4>Sucursales</h4>
          <p>Cada sede con su pais, ciudad, idioma y moneda. La boveda de seguridad se gestiona a este nivel e incluye origenes internos sin CRM como Excel/CSV y Google Sheets.</p></div>
        <div class="card"><h4>Usuarios y Grupos</h4>
          <p>Personas individuales o en grupos. Las lineas de producto se asignan por grupo (las heredan todos) o uno-a-uno.</p></div>
        <div class="card"><h4>Perfiles de Gobernanza</h4>
          <p>Definen el nivel de abstraccion (Global/Equipo/Personal — es decir Macro/Meso/Micro), la jerarquia de escalamiento, las fuentes de leads, las lineas de producto y los umbrales del semaforo.</p></div>
        <div class="card"><h4>Asistentes (Jarvis / Rol)</h4>
          <p>Un asistente IA por perfil, con nombre y tono propios. Sus capacidades se activan con interruptores y reglas:
          resolver dudas, pedir cuentas, dar alertas, armar las tareas del dia, escalar a otro usuario o perfil y verificar semaforizaciones.</p></div>
        <div class="card"><h4>Pauta Digital</h4>
          <p>Canales activos y distribucion de presupuesto: Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads y OpenAI Ads.</p></div>
        <div class="card"><h4>Ajustes de Estrategia</h4>
          <p>SLA en minutos, tiempo de doble toque, umbrales de ROAS y configuracion por canal. Es lo que define cuando un Guardian debe intervenir.</p></div>
        <div class="card"><h4>Boveda de Seguridad</h4>
          <p>Credenciales encriptadas del ecosistema (mensajeria, voz, telefonia, CRM) y origenes internos de datos (Excel/CSV, Google Sheets), gestionadas por sucursal.</p></div>
      </div>

      <!-- ════════════ PARTE 7 ════════════ -->
      <div class="section part-divider">
        <h1 class="part">Parte 7</h1>
        <h2>Glosario y formulas clave</h2>
        <table>
          <tr><th>Termino</th><th>Definicion</th></tr>
          <tr><td>ROAS Real</td><td>Ventas confirmadas en el CRM ÷ costo de campana. La verdad, sin importar lo que atribuya marketing.</td></tr>
          <tr><td>Dinero fantasma</td><td>Diferencia entre el ingreso reportado por marketing y el confirmado en CRM.</td></tr>
          <tr><td>Fuga Real</td><td>Valor de los leads en semaforo rojo que se perdieron, sobre el costo de campana.</td></tr>
          <tr><td>Mala atencion</td><td>Ventas cerradas fuera de SLA o sin cumplir calidad, sobre el costo de campana.</td></tr>
          <tr><td>SLA</td><td>Tiempo maximo permitido para contactar un lead antes de que Rol intervenga.</td></tr>
          <tr><td>Delta Friccion / Rescate</td><td>Cuanto tardo el humano vs. cuanto tardo Rol en reaccionar.</td></tr>
          <tr><td>Perfil G9</td><td>Perfil predictivo del lead: urgencia, autoridad, probabilidad de cierre y canal.</td></tr>
          <tr><td>Macro / Meso / Micro</td><td>Los tres niveles de visualizacion: grupo, celula e individuo.</td></tr>
        </table>

        <div class="footer">
          <p>Documento Maestro de Rol — generado el ${fecha}</p>
          <p>"La IA no piensa por uno, piensa con uno." · powered by IDIA</p>
        </div>
      </div>

    </body>
  </html>
  `
}
