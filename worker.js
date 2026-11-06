// Worker de Profesor (Cloudflare): recibe la pregunta en /api/chat y consulta a Gemini.
// La clave NO va aquí: se guarda en Cloudflare como secreto GEMINI_API_KEY.
// Los códigos de activación de planes pagos tampoco van aquí: se guardan como secreto CODIGOS
// con este formato (separados por coma):  CODIGO1=estudiante,CODIGO2=profesional,CODIGO3=master

const CONTENIDO = `
[Artículo: IVA: qué es y cómo se calcula] IVA: impuesto indirecto sobre el consumo que cobra el vendedor y traslada a la DIAN (art. 420 ET). Tarifa general 19% (art. 468), reducida 5% (art. 468-1), exentos 0% con derecho a devolución (art. 477) y excluidos que no causan IVA (art. 424). IVA por pagar = IVA generado en ventas menos IVA descontable en compras; si el descontable es mayor hay saldo a favor. Se declara bimestral o cuatrimestral según los ingresos del año anterior. En el PUC se registra en la cuenta 2408.
[Artículo: Retención en la fuente] Retención en la fuente: mecanismo de recaudo anticipado en el que quien paga retiene una parte del impuesto del beneficiario y la consigna a la DIAN (art. 365 y siguientes del Estatuto Tributario). El agente retenedor aplica la retención según el concepto del pago, la base mínima en UVT y la tarifa vigente, que debe confirmarse en la DIAN cada año. La retención practicada se registra en la cuenta 2365 y la que le practican a la empresa en la 1355; se declara cada mes en el formulario 350.
[Artículo: Retención en la fuente por salarios (procedimiento 1)] Retención por salarios, procedimiento 1: se parte de los ingresos laborales del mes, se restan los aportes obligatorios a salud y pensión, luego las deducciones (dependientes 10% y hasta 32 UVT, medicina prepagada hasta 16 UVT, intereses de vivienda hasta 100 UVT) y las rentas exentas (aportes voluntarios y AFC, y 25% de renta exenta del trabajo hasta 790 UVT al año), con tope global del 40% y 1.340 UVT al año. La base en UVT se busca en la tabla del artículo 383 del Estatuto Tributario: hasta 95 UVT 0%; luego 19%, 28%, 33%, 35%, 37% y 39% con valores adicionales en UVT. La UVT de 2026 es $52.374.
[Artículo: Depreciación en línea recta] Depreciación en línea recta: depreciación anual = (costo del activo menos valor residual) dividido entre los años de vida útil. Ejemplo: costo 1.200, residual 0 y 5 años dan 240 por año. Otros métodos son reducción de saldos y unidades de producción; el método, la vida útil y el valor residual se revisan al menos una vez al año (NIC 16 o Sección 17 de NIIF para pymes). Se debita el gasto (5160 administración o 5260 ventas) y se acredita la depreciación acumulada 1592. Los terrenos no se deprecian. El Estatuto Tributario fija tasas máximas fiscales en el artículo 137.
[Artículo: Punto de equilibrio] Punto de equilibrio: nivel de ventas en que los ingresos igualan los costos totales. En unidades = costos fijos dividido entre (precio de venta menos costo variable unitario); en pesos = costos fijos dividido entre (1 menos costo variable unitario sobre precio). La diferencia entre precio y costo variable unitario es el margen de contribución. Ejemplo: costos fijos 6.000.000, precio 50.000 y costo variable 30.000 dan 300 unidades o 15.000.000 en ventas. El margen de seguridad es (ventas menos ventas de equilibrio) dividido entre ventas.
[Artículo: Liquidación laboral: qué se paga al terminar un contrato] Liquidación laboral: cesantías (un mes de salario por año, base con auxilio de transporte; salario por días trabajados dividido entre 360), intereses sobre cesantías (12% anual proporcional), prima de servicios (15 días por semestre, art. 306 CST, con auxilio de transporte), vacaciones (15 días hábiles por año, art. 186 CST, sin auxilio de transporte), salarios pendientes y, en despido sin justa causa, indemnización (art. 64 CST). Contablemente se causan en 2510 cesantías, 2515 intereses, 2520 prima y 2525 vacaciones. Los valores anuales de salario mínimo y auxilio de transporte deben confirmarse en la norma vigente.
[Artículo: Estados financieros y NIIF en Colombia] Estados financieros y NIIF en Colombia: la Ley 1314 de 2009 adoptó las normas internacionales, reunidas en el Decreto 2420 de 2015. Grupo 1 aplica NIIF plenas, Grupo 2 NIIF para pymes y Grupo 3 contabilidad simplificada para microempresas. Los estados financieros son situación financiera, resultados, cambios en el patrimonio, flujos de efectivo y notas. La ecuación contable es activo igual a pasivo más patrimonio y cada hecho afecta mínimo dos cuentas (partida doble). El grupo de cada empresa debe confirmarse en el Decreto 2420 de 2015 y con el CTCP.
[Artículo: El PUC y la partida doble] PUC: catálogo de cuentas con códigos. El PUC para comerciantes se adoptó con el Decreto 2650 de 1993. Clases: 1 Activo, 2 Pasivo, 3 Patrimonio, 4 Ingresos, 5 Gastos, 6 Costos de ventas, 7 Costos de producción, 8 y 9 cuentas de orden; grupo de 2 dígitos, cuenta de 4 y subcuenta de 6. Activo, gastos y costos tienen naturaleza débito; pasivo, patrimonio e ingresos naturaleza crédito, con excepciones como la depreciación acumulada 1592 que es crédito. En la partida doble débitos y créditos siempre suman lo mismo.
[Artículo: Inventarios (NIC 2)] Inventarios (NIC 2 o Sección 13 de NIIF para pymes): se miden por el menor entre costo y valor neto realizable (precio de venta estimado menos costos para terminar y vender). Métodos de costo: promedio ponderado y PEPS o FIFO; UEPS o LIFO no está permitido por las NIIF. En el sistema permanente el inventario se actualiza con cada movimiento; en el periódico el costo de ventas es inventario inicial más compras menos inventario final. En el PUC: 1435 mercancías, 1405 materias primas y clase 6 para el costo de ventas.
[Artículo: Activos biológicos (NIC 41)] Activos biológicos (NIC 41): animales vivos y plantas que la empresa controla para producir. Se miden a valor razonable menos costos de venta al reconocerlos y al cierre, con cambios de valor en resultados; los productos agrícolas se miden igual en el punto de cosecha y luego pasan a inventarios (NIC 2). En la NIIF para pymes (Sección 34) se usa valor razonable si es determinable sin esfuerzo excesivo; si no, costo menos depreciación y deterioro. Las plantas productoras de frutos durante varios años se tratan como propiedades, planta y equipo (NIC 16). La norma aplicable depende del grupo de la empresa.
[Artículo: Contabilidad pública y control interno contable] Contabilidad pública: la Contaduría General de la Nación regula el Régimen de Contabilidad Pública. Las entidades de gobierno aplican el marco normativo incorporado con la Resolución 533 de 2015 y sus modificaciones. La Resolución 193 de 2016 establece el procedimiento de evaluación del control interno contable, que cada entidad hace una vez al año y reporta a la CGN, revisando las etapas del proceso contable. Catálogos, formatos y plazos cambian y deben consultarse en contaduria.gov.co.
[Artículo: Tasas de interés y tasa de usura] Tasas de interés: la misma tasa puede expresarse como mensual vencida, efectiva anual (EA) o nominal anual mes vencida. Conversiones: de EA a mensual (1 + EA) elevado a 1/12 menos 1; de mensual a EA (1 + MV) elevado a 12 menos 1; de nominal a mensual se divide entre 12. Ejemplo: 2% mensual equivale a 26,82% EA y a 24% nominal. La usura es el tope máximo de cobro, 1,5 veces el interés bancario corriente, certificado por la Superintendencia Financiera cada mes; el de consumo y ordinario de octubre de 2026 fue 28,59% EA y debe confirmarse en la Superfinanciera. El costo real incluye seguros y comisiones.
[Artículo: Costos ambientales] Son los recursos que una empresa destina a prevenir, reducir o reparar su impacto ambiental. Según el caso se registran como gasto del periodo o como mayor valor de un activo, conforme a la norma contable aplicable.
[Artículo: Costos de desarrollar software] Los costos de un desarrollo de software pueden reconocerse como activo intangible o como gasto, según cumplan los criterios de la norma contable aplicable a la empresa.
[Herramientas del sitio: calculadoras por plan] Están en la sección Calculadoras de Profesor y se abren en otra pestaña; los datos no salen del navegador. Son 23 y se abren según el plan, con el código de activación: Gratis abre 6 (Calculadora de crédito, PUC, IVA, Interés simple y compuesto, Conversor de tasas, Precio de venta y margen); Estudiante abre esas 6 y 6 más (Depreciación, Punto de equilibrio, Indicadores financieros, Kardex, Costeo ABC, Costo de producción), 12 en total; Profesional suma 6 más (Liquidación laboral, Nómina, Retención por salarios, Retención por conceptos, Seguridad social de independientes, Intereses de mora y sanciones), 18 en total; Master abre las 23 (suma Renta de personas naturales, VPN-TIR, Flujo de caja proyectado, Análisis vertical y horizontal, Conciliación bancaria). Detalle de las 23: Liquidación laboral (cesantías, intereses, prima, vacaciones, indemnización); Calculadora de crédito (cuota, amortización, abonos extra, costo real, tope de usura); PUC de Colombia (buscador de cuentas, naturaleza débito o crédito); Retención en la fuente por salarios (artículo 383); Retención por conceptos (servicios, honorarios, compras, arrendamientos, con base mínima en UVT, ReteIVA y ReteICA); IVA (agregar o sacar IVA, IVA por pagar o saldo a favor); Depreciación de activos (línea recta, saldo decreciente, suma de dígitos, unidades de producción); Nómina (devengado, recargos, deducciones, aportes del empleador, provisiones, costo total, asiento); Punto de equilibrio; Indicadores financieros; Conversor de tasas; Interés simple y compuesto; Precio de venta y margen; Kardex de inventarios (promedio ponderado y PEPS); Costeo ABC; Costo de producción; VPN, TIR y valor presente; Intereses de mora y sanciones (extemporaneidad y sanción mínima); Renta de personas naturales (tabla del artículo 241); Flujo de caja proyectado; Análisis vertical y horizontal; Conciliación bancaria; Seguridad social de independientes.
[Herramientas del sitio: cursos] Cursos de Excel para contabilidad en la sección Cursos. Excel Básico está disponible (8 horas, 7 módulos, el módulo 1 es gratis, quiz final y certificado de participación; el certificado no es oficial ni un título). Excel Intermedio y Excel Avanzado están próximamente. Se accede con un código de acceso que se recibe al comprar cada curso; los cursos se compran aparte y no están incluidos en los planes de la IA. Para precios, dile que los consulte en la sección Cursos.
[Herramientas del sitio: aplicaciones] Aplicaciones: Bolsillo: finanzas personales (ingresos, gastos, presupuesto mensual, meta de ahorro y división de cuentas). Palabra Contable: inglés para contadores (diccionario de términos contables con voz, tarjetas, quiz, frases para correos y reuniones y simulador de entrevista en los planes pagos). AgroCosto: costos agropecuarios; se registran gastos, ingresos y producción de una finca o proyecto (lechería, cerdos, cultivos) y calcula el costo por litro, kilo, animal y hectárea, los costos fijos y variables y el punto de equilibrio; los planes pagos permiten más proyectos, informes, repartir gastos compartidos entre proyectos y copia de seguridad. FichaContable: tarjetas de estudio para memorizar las cuentas del PUC con su naturaleza débito o crédito y las normas NIC y NIIF, con juego de débito o crédito, quizzes, simulacro de examen y una guía explicativa. Las cuatro tienen versión gratis y planes pagos que se activan con un código.
[Herramientas del sitio: planes y pagos] Planes de la IA: Gratis (5 preguntas al día), Estudiante (30, $10.000 al mes), Profesional (100, $30.000 al mes) y Master (300, $60.000 al mes, con las 23 calculadoras). Las aplicaciones y los cursos de Excel NO están incluidos en ningún plan de la IA: cada uno se compra aparte y se activa con su propio código. El pago por ahora es por transferencia (Bre-B o Nequi): se envía el comprobante al correo de Profesor y se recibe un código de activación.
[Herramientas del sitio: plantillas] Plantilla de flujo de caja mensual y plantilla de depreciación de activos, en Excel, que se compran por transferencia y se entregan manualmente.
`; // Aquí agregarás tus propios artículos.

// Cómo responde la IA según el plan (más memoria y respuestas más completas en los planes altos).
const PLANES = {
  gratis:       { palabras: 120, memoria: 2,  tokens: 500 },
  estudiante:   { palabras: 200, memoria: 6,  tokens: 800 },
  profesional:  { palabras: 300, memoria: 10, tokens: 1200 },
  master:       { palabras: 450, memoria: 16, tokens: 1800 }
};

const INSTRUCCIONES = `Eres el asistente de Profesor, una plataforma de Contaduría Pública en Colombia.
Respondes preguntas sobre contabilidad financiera, contabilidad pública (sector gobierno), impuestos, finanzas, auditoría, control interno, nómina y liquidaciones laborales, y normatividad contable, tributaria y laboral colombiana.
También ayudas a estudiantes y profesionales de otras carreras (ingeniería de sistemas, ingeniería ambiental, ingeniería agronómica y administración de empresas), pero siempre desde la mirada contable, financiera y tributaria: costos de proyectos, presupuestos, punto de equilibrio, activos y su depreciación, inversiones, impuestos, estados financieros y normas contables aplicadas a su campo (por ejemplo costos de desarrollo de software, costos y pasivos ambientales, activos biológicos y costos de producción agrícola, o presupuesto y análisis financiero de una empresa).
Escribe en español, con lenguaje sencillo, en máximo __PALABRAS__ palabras y en texto plano, sin asteriscos ni símbolos de formato.

Cómo responder:
1. Si el contenido de Profesor (abajo) cubre la pregunta, úsalo primero, menciona de qué artículo sale y, si puedes, dile que lo encuentra completo, con sus fuentes, en la sección Artículos del sitio. Si la pregunta se puede resolver con una calculadora, un curso o una aplicación del sitio (están en [Herramientas del sitio]), recomiéndala por su nombre y di en qué sección está, sin inventar funciones ni precios que no estén ahí.
2. Si no, responde con fuentes confiables y nómbralas dentro de la respuesta. Prefiere en este orden: normas y entidades oficiales (DIAN, Contaduría General de la Nación, Consejo Técnico de la Contaduría Pública, Estatuto Tributario, Código Sustantivo del Trabajo y Ministerio del Trabajo, Decreto 2420 de 2015, Ley 1314 de 2009, y para contabilidad pública el Régimen de Contabilidad Pública y su marco normativo para entidades de gobierno), luego portales contables reconocidos (por ejemplo Siigo o Actualícese) y libros o artículos académicos.
3. Nunca inventes fuentes, autores, libros, enlaces, números de artículos, resoluciones, cifras, tarifas ni fechas. Cita una fuente solo si estás seguro de que existe. Si no estás seguro, di que es información general y recomienda verificar en dian.gov.co o contaduria.gov.co.
4. Para valores que cambian cada año (UVT, tarifas, plazos, topes) explica el concepto y pide confirmar el dato vigente en la fuente oficial.
5. Si la pregunta es de otra carrera, responde solo la parte contable, financiera, tributaria o de costos, y ponla en un ejemplo de ese campo. No resuelvas tareas técnicas de esa carrera (programar, diseñar sistemas, cálculos de ingeniería o de agronomía, trabajos de gestión ambiental) y, si te las piden, explica amablemente que tu enfoque es el contable y ofrece ayudar con esa parte. Si la pregunta no tiene relación con contabilidad, impuestos, finanzas, auditoría ni con el lado económico de esas carreras, indica amablemente que solo ayudas con esos temas.
6. Termina recordando, en una frase corta, que no reemplazas la asesoría de un contador público.

CONTENIDO DE PROFESOR:
${CONTENIDO}`;

const JSON_HEADERS = { "Content-Type": "application/json" };
const responder = (status, obj) => new Response(JSON.stringify(obj), { status, headers: JSON_HEADERS });

// Devuelve el plan que corresponde a un código de activación, o "" si no es válido.
// El plan lo decide siempre el servidor; lo que diga el navegador no cuenta.
// Vencimiento opcional: "CODIGO=estudiante@2026-12-05" deja de valer después de esa fecha (hora de Colombia).
const hoyCO = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
const vencido = (hasta) => !!hasta && /^\d{4}-\d{2}-\d{2}$/.test(hasta.trim()) && hoyCO() > hasta.trim();

function planDeCodigo(codigo, env) {
  const c = String(codigo || "").trim().toUpperCase();
  if (c.length < 6) return "";
  const lista = String(env.CODIGOS || "").split(",");
  for (const par of lista) {
    const i = par.indexOf("=");
    if (i < 1) continue;
    const cod = par.slice(0, i).trim().toUpperCase();
    const [plan, hasta] = par.slice(i + 1).trim().toLowerCase().split("@");
    if (cod === c && PLANES[plan] && plan !== "gratis" && !vencido(hasta)) return plan;
  }
  return "";
}

// Verifica un código y dice a qué plan da acceso.
const COOKIE = "pcod";
const cookieDe = (request) => {
  const m = String(request.headers.get("Cookie") || "").match(new RegExp("(?:^|;\\s*)" + COOKIE + "=([^;]*)"));
  if (!m) return "";
  try { return decodeURIComponent(m[1]); } catch (e) { return ""; }
};
const setCookie = (valor, borrar) => COOKIE + "=" + (borrar ? "" : encodeURIComponent(valor)) + "; Path=/; Max-Age=" + (borrar ? 0 : 2592000) + "; HttpOnly; Secure; SameSite=Lax";

async function codigo(request, env) {
  if (request.method !== "POST") {
    return responder(405, { ok: false });
  }
  let b = {};
  try { b = await request.json(); } catch (e) {}
  const r = (cuerpo, cookie) => { const x = responder(200, cuerpo); x.headers.append("Set-Cookie", cookie); return x; };
  if (b.salir) return r({ ok: true }, setCookie("", true));
  const c = String(b.codigo || "");
  const plan = planDeCodigo(c, env);
  if (!plan) return r({ ok: false }, setCookie("", true));
  return r({ ok: true, plan }, setCookie(c.trim(), false));
}

async function chat(request, env) {
  if (request.method !== "POST") {
    return responder(405, { ok: false, answer: "Método no permitido." });
  }
  let question = "", cod = "", history = [];
  try {
    const b = await request.json();
    question = String(b.question || "").trim().slice(0, 500);
    cod = String(b.codigo || "");
    if (Array.isArray(b.history)) history = b.history;
  } catch (e) {}
  const plan = planDeCodigo(cod, env) || "gratis";
  const cfg = PLANES[plan];
  // Memoria de la conversación: solo los últimos mensajes que permite el plan.
  const previos = history
    .filter(m => m && (m.role === "user" || m.role === "model") && typeof m.text === "string" && m.text.trim())
    .slice(-cfg.memoria)
    .map(m => ({ role: m.role, parts: [{ text: m.text.slice(0, 700) }] }));
  while (previos.length && previos[0].role !== "user") previos.shift();
  if (!question) {
    return responder(400, { ok: false, answer: "Escribe una pregunta." });
  }
  const key = env.GEMINI_API_KEY;
  if (!key) {
    return responder(500, { ok: false, answer: "Falta configurar la clave de la IA." });
  }
  const model = env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const useSearch = env.GEMINI_SEARCH === "on"; // activa búsqueda con fuentes reales
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const call = (withSearch) => {
    const body = {
      systemInstruction: { parts: [{ text: INSTRUCCIONES.replace("__PALABRAS__", cfg.palabras) }] },
      contents: [...previos, { role: "user", parts: [{ text: question }] }],
      generationConfig: { maxOutputTokens: cfg.tokens, temperature: 0.2 }
    };
    if (withSearch) body.tools = [{ google_search: {} }];
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
  };
  try {
    let res = await call(useSearch);
    if (useSearch && !res.ok) res = await call(false); // si la búsqueda no está disponible, responde sin ella
    if (res.status === 429) {
      return responder(200, { ok: false, plan, answer: "Hay muchas consultas en este momento. Intenta de nuevo en un minuto." });
    }
    if (!res.ok) {
      let detalle = "";
      try { detalle = (await res.json()).error?.message || ""; } catch (e) {}
      console.error("Error de Gemini", res.status, detalle);
      return responder(200, { ok: false, plan, answer: "No pude responder ahora. Intenta de nuevo en un momento." });
    }
    const data = await res.json();
    const cand = data.candidates?.[0];
    const answer = cand?.content?.parts?.map(p => p.text).join("") || "No encontré una respuesta.";
    const vistos = new Set();
    const sources = (cand?.groundingMetadata?.groundingChunks || [])
      .map(c => c.web).filter(w => w && w.uri && !vistos.has(w.uri) && vistos.add(w.uri))
      .slice(0, 5).map(w => ({ title: w.title || "Fuente", uri: w.uri }));
    return responder(200, { ok: true, plan, answer, sources });
  } catch (e) {
    return responder(200, { ok: false, plan, answer: "Error de conexión. Intenta de nuevo." });
  }
}

// ---------------------------------------------------------------------------
// CURSOS: acceso por código, quiz corregido en el servidor y certificado firmado.
// Secretos en Cloudflare: CODIGOS_CURSO ("CODIGO=excel-basico|excel-intermedio,OTRO=todos")
// y CERT_SECRET (una frase larga y secreta que firma los certificados).
// Los cursos NO se incluyen en el plan Master (ver MASTER_INCLUYE): se venden aparte.
// ---------------------------------------------------------------------------
// Qué abre el código del plan Master además de la IA. Cámbialo aquí cuando quieras:
//   cursos: false -> los cursos de Excel se venden aparte (solo abren con un código de CODIGOS_CURSO)
//   apps:   false -> las aplicaciones se venden aparte (solo abren con un código de CODIGOS_APPS); true -> el Master abre el nivel más alto de todas
const MASTER_INCLUYE = { cursos: false, apps: false };

const CURSOS = {
  "excel-basico": {
    titulo: "Excel Básico para contabilidad",
    horas: 8,
    minimo: 0.7,
    // Índice de la respuesta correcta de cada pregunta (la página no la conoce)
    clave: [1, 0, 2, 2, 2, 2, 1, 1, 3, 1]
  }
};

// Contenido PAGADO del curso: vive aquí, en el servidor, y solo se entrega con un código válido.
// video: pega el ID de YouTube (video "no listado"). archivo: nombre de un .xlsx guardado en la carpeta _cursos/excel-basico/ (ver instrucciones).
const MODULOS = {
  "excel-basico": [
 {
  "n": 2,
  "titulo": "Formato y orden",
  "horas": "1 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "2.1 Formato de celdas",
    "Con Ctrl + 1 abres Formato de celdas. Usa Moneda o Contabilidad para los pesos, Porcentaje para tasas y Fecha para fechas. Cambia solo cómo se ve el dato, no su valor."
   ],
   [
    "2.2 Alineación, bordes y relleno",
    "Alinea los textos a la izquierda y los números a la derecha. Usa bordes finos y un solo color de relleno para los títulos. Evita combinar celdas: complica ordenar y filtrar."
   ],
   [
    "2.3 Anchos, ajuste de texto e inmovilizar paneles",
    "Haz doble clic en el borde de la columna para ajustar su ancho. «Ajustar texto» parte frases largas en varias líneas. En Vista > Inmovilizar paneles dejas fija la fila de títulos al bajar."
   ],
   [
    "2.4 Formato como tabla",
    "Con Ctrl + T conviertes un rango en tabla: trae filtros, colores por filas y crece sola cuando agregas datos. Nómbrala en Diseño de tabla para encontrarla fácil."
   ]
  ]
 },
 {
  "n": 3,
  "titulo": "Fórmulas básicas",
  "horas": "1,5 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "3.1 Operadores y orden de operaciones",
    "Toda fórmula empieza con =. Excel usa + - * / y ^. Primero resuelve paréntesis, luego potencias, luego multiplicación y división, y al final suma y resta. Ante la duda, usa paréntesis."
   ],
   [
    "3.2 Referencias relativas, absolutas y mixtas",
    "Al copiar una fórmula, A1 se desplaza (relativa). $A$1 se queda fija (absoluta). Con la tecla F4 alternas entre A1, $A$1, A$1 y $A1."
   ],
   [
    "3.3 Porcentajes, IVA y descuentos",
    "Para calcular el IVA de un valor en B2 usa =B2*19%. Para el total con IVA usa =B2*1,19 (en Excel en español la coma es el separador decimal). Para un descuento del 10 %: =B2*(1-10%)."
   ],
   [
    "3.4 Errores comunes",
    "#¡DIV/0! es dividir entre cero o entre una celda vacía. #¿NOMBRE? es una función mal escrita. #¡REF! es una referencia que ya no existe. #¡VALOR! es operar texto como número. Lee el error y revisa la celda que menciona."
   ]
  ]
 },
 {
  "n": 4,
  "titulo": "Funciones esenciales",
  "horas": "1,5 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "4.1 SUMA, PROMEDIO, MAX y MIN",
    "=SUMA(B2:B20) suma un rango, =PROMEDIO(B2:B20) calcula el promedio, =MAX(B2:B20) y =MIN(B2:B20) devuelven el mayor y el menor. Con Alt + = insertas una suma automática."
   ],
   [
    "4.2 CONTAR, CONTARA y CONTAR.SI",
    "CONTAR cuenta celdas con números, CONTARA cuenta celdas con cualquier dato y CONTAR.SI cuenta las que cumplen una condición, por ejemplo =CONTAR.SI(C2:C50;\"Pagada\")."
   ],
   [
    "4.3 La función SI",
    "=SI(prueba;si_verdadero;si_falso). Ejemplo: =SI(B2>=60;\"Aprobó\";\"Reprobó\"). Sirve para clasificar facturas, marcar vencimientos o validar que un cuadre dé cero."
   ],
   [
    "4.4 SUMAR.SI y REDONDEAR",
    "=SUMAR.SI(rango;criterio;rango_suma) suma solo lo que cumple la condición, por ejemplo los gastos de una cuenta. =REDONDEAR(B2;0) redondea al entero y evita diferencias de centavos en los reportes."
   ]
  ]
 },
 {
  "n": 5,
  "titulo": "Datos: ordenar, filtrar y formato condicional",
  "horas": "1 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "5.1 Ordenar datos",
    "En Datos > Ordenar puedes ordenar por uno o varios criterios, por ejemplo por cuenta y luego por fecha. Selecciona toda la tabla antes de ordenar para que las filas no se desarmen."
   ],
   [
    "5.2 Filtros",
    "Con Ctrl + Mayús + L activas los filtros. Filtra por texto, número o fecha y mira solo lo que necesitas sin borrar nada. Para volver a ver todo, borra el filtro."
   ],
   [
    "5.3 Quitar duplicados",
    "En Datos > Quitar duplicados eliminas filas repetidas según las columnas que elijas. Haz antes una copia de la hoja: esta acción no se puede revisar fila por fila."
   ],
   [
    "5.4 Formato condicional",
    "En Inicio > Formato condicional resaltas celdas según una regla: facturas vencidas en rojo, saldos negativos, los 10 mayores valores o barras de datos. Cambia solo cuando cambian los datos."
   ]
  ]
 },
 {
  "n": 6,
  "titulo": "Gráficos y reportes",
  "horas": "1 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "6.1 Elegir el gráfico correcto",
    "Columnas para comparar categorías, líneas para ver cambios en el tiempo y circular solo para partes de un todo con pocas categorías. Si dudas, usa columnas."
   ],
   [
    "6.2 Crear y mejorar un gráfico",
    "Selecciona los datos, ve a Insertar y elige el gráfico. Ponle título claro, agrega etiquetas de datos si ayudan y quita lo que sobre: líneas de cuadrícula, leyendas repetidas y colores sin sentido."
   ],
   [
    "6.3 Preparar la impresión",
    "En Disposición de página define el área de impresión, la orientación y «Ajustar a una página de ancho». Repite la fila de títulos en cada hoja con Imprimir títulos."
   ],
   [
    "6.4 Exportar a PDF y proteger la hoja",
    "En Archivo > Exportar creas un PDF para enviar. Con Revisar > Proteger hoja evitas que alguien cambie tus fórmulas por accidente."
   ]
  ]
 },
 {
  "n": 7,
  "titulo": "Práctica contable",
  "horas": "1 h",
  "video": "",
  "archivo": "",
  "lecciones": [
   [
    "7.1 Libro de ingresos y gastos",
    "Arma una tabla con fecha, tercero, concepto, ingreso y gasto. Agrega una columna de saldo acumulado con una fórmula que sume el ingreso y reste el gasto de cada fila."
   ],
   [
    "7.2 Balance de prueba",
    "Lista las cuentas con su saldo débito y su saldo crédito. Suma cada columna y comprueba con =SI(suma_débito=suma_crédito;\"Cuadra\";\"No cuadra\") que la partida doble esté completa."
   ],
   [
    "7.3 Estado de resultados sencillo",
    "Con SUMAR.SI trae los ingresos, costos y gastos de tu libro. Calcula la utilidad y los porcentajes sobre ventas para ver cuánto de cada peso queda como ganancia."
   ],
   [
    "7.4 Repaso y quiz final",
    "Revisa tus formatos, fórmulas y gráficos con un archivo propio. Cuando te sientas listo, responde el quiz final más abajo para obtener tu certificado."
   ]
  ]
 }
]
};
const PREGUNTAS = {
  "excel-basico": [{"p": "En Excel, ¿cómo se llama el cruce de una fila con una columna?", "o": ["Rango", "Celda", "Hoja", "Libro"]}, {"p": "¿Con qué símbolo debe comenzar toda fórmula?", "o": ["=", "$", "#", "&"]}, {"p": "¿Qué hace la fórmula =SUMA(B2:B6)?", "o": ["Multiplica B2 por B6", "Cuenta cuántas celdas hay", "Suma los valores de B2 hasta B6", "Calcula el promedio de B2 y B6"]}, {"p": "¿Cuál referencia mantiene fija la celda al copiar la fórmula hacia abajo?", "o": ["A1", "A1:A5", "$A$1", "=A1"]}, {"p": "Si A1 contiene 200 y B1 contiene 15 %, ¿qué resultado da =A1*B1?", "o": ["15", "215", "30", "3.000"]}, {"p": "¿Qué función cuenta cuántas celdas contienen números?", "o": ["SUMA", "PROMEDIO", "CONTAR", "MAX"]}, {"p": "Si A1 vale 45, ¿qué muestra =SI(A1>=60;\"Aprobó\";\"Reprobó\")?", "o": ["Aprobó", "Reprobó", "45", "Error"]}, {"p": "¿Qué formato conviene para mostrar valores en pesos?", "o": ["Fecha", "Moneda o Contabilidad", "Texto", "Porcentaje"]}, {"p": "¿Qué tipo de gráfico es mejor para mostrar cómo cambian las ventas mes a mes?", "o": ["Circular", "Embudo", "Mapa", "Líneas"]}, {"p": "¿Para qué sirve «Quitar duplicados»?", "o": ["Ordenar de menor a mayor", "Eliminar filas repetidas", "Sumar valores iguales", "Proteger la hoja"]}]
};

// Freno básico contra quien prueba códigos al azar (por IP, en memoria del servidor).
const fallos = new Map();
const ipDe = (request) => request.headers.get("CF-Connecting-IP") || "x";
function bloqueado(ip) { const f = fallos.get(ip); return !!f && f.n >= 20 && Date.now() - f.t < 600000; }
function falla(ip) {
  if (fallos.size > 5000) fallos.clear();
  const f = fallos.get(ip);
  if (!f || Date.now() - f.t >= 600000) fallos.set(ip, { n: 1, t: Date.now() }); else f.n++;
}

function accesoCurso(codigo, curso, env) {
  const c = String(codigo || "").trim().toUpperCase();
  if (c.length < 6 || !CURSOS[curso]) return false;
  if (MASTER_INCLUYE.cursos && planDeCodigo(c, env) === "master") return true;
  for (const par of String(env.CODIGOS_CURSO || "").split(",")) {
    const i = par.indexOf("=");
    if (i < 1) continue;
    if (par.slice(0, i).trim().toUpperCase() !== c) continue;
    const [valor, hasta] = par.slice(i + 1).trim().toLowerCase().split("@");
    if (vencido(hasta)) continue;
    const lista = valor.split("|").map((x) => x.trim());
    if (lista.includes("todos") || lista.includes(curso)) return true;
  }
  return false;
}

const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const deB64u = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return atob(s); };
async function firmar(texto, env) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.CERT_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(texto)));
}
const utf8aB64u = (obj) => b64u(new TextEncoder().encode(JSON.stringify(obj)));
const b64uaObj = (s) => JSON.parse(new TextDecoder().decode(Uint8Array.from(deB64u(s), (ch) => ch.charCodeAt(0))));

async function curso(request, env) {
  if (request.method !== "POST") return responder(405, { ok: false });
  let b = {};
  try { b = await request.json(); } catch (e) { return responder(400, { ok: false }); }
  const id = String(b.curso || "");
  const def = CURSOS[id];
  if (!def) return responder(200, { ok: false, error: "curso" });
  const ip = ipDe(request);
  if (bloqueado(ip)) return responder(429, { ok: false, error: "intentos" });
  if (!accesoCurso(b.codigo, id, env)) { falla(ip); return responder(200, { ok: false, error: "codigo" }); }
  if (b.accion === "validar") return responder(200, { ok: true });
  if (b.accion === "contenido") {
    return responder(200, { ok: true, modulos: MODULOS[id].map((m) => ({ n: m.n, titulo: m.titulo, horas: m.horas, video: m.video, archivo: !!m.archivo, lecciones: m.lecciones })), preguntas: PREGUNTAS[id] });
  }
  if (b.accion === "archivo") {
    const m = MODULOS[id].find((x) => x.n === Number(b.modulo));
    if (!m || !m.archivo || !/^[\w.-]+$/.test(m.archivo)) return responder(404, { ok: false });
    const r = await env.ASSETS.fetch(new Request(new URL("/_cursos/" + id + "/" + m.archivo, request.url)));
    if (!r.ok) return responder(404, { ok: false });
    return new Response(r.body, { headers: { "Content-Type": r.headers.get("Content-Type") || "application/octet-stream", "Content-Disposition": 'attachment; filename="' + m.archivo + '"', "Cache-Control": "no-store" } });
  }
  if (b.accion !== "quiz") return responder(400, { ok: false });

  const nombre = String(b.nombre || "").trim().replace(/\s+/g, " ");
  if (nombre.length < 3 || nombre.length > 60 || !/^[\p{L}][\p{L}\s.'-]*$/u.test(nombre)) return responder(200, { ok: false, error: "nombre" });
  const r = b.respuestas;
  if (!Array.isArray(r) || r.length !== def.clave.length) return responder(200, { ok: false, error: "respuestas" });
  let puntaje = 0;
  def.clave.forEach((c, i) => { if (Number(r[i]) === c) puntaje++; });
  const total = def.clave.length;
  const porcentaje = Math.round((puntaje * 100) / total);
  if (puntaje / total < def.minimo) return responder(200, { ok: true, aprobado: false, puntaje, total, porcentaje });
  if (!env.CERT_SECRET) return responder(200, { ok: false, error: "config" });

  const fecha = new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10); // hora de Colombia
  const datos = { n: nombre, c: id, f: fecha, r: Math.random().toString(36).slice(2, 8) };
  const cuerpo = utf8aB64u(datos);
  const firma = await firmar(cuerpo, env);
  const certId = "PRO-" + firma.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
  return responder(200, { ok: true, aprobado: true, puntaje, total, porcentaje, id: certId, token: cuerpo + "." + firma });
}

async function verificar(request, env) {
  if (request.method !== "POST") return responder(405, { ok: false });
  let t = "";
  try { t = String((await request.json()).token || ""); } catch (e) {}
  const partes = t.split(".");
  if (partes.length !== 2 || !env.CERT_SECRET) return responder(200, { ok: false });
  try {
    if ((await firmar(partes[0], env)) !== partes[1]) return responder(200, { ok: false });
    const d = b64uaObj(partes[0]);
    const def = CURSOS[d.c];
    if (!def) return responder(200, { ok: false });
    const certId = "PRO-" + partes[1].replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase();
    return responder(200, { ok: true, nombre: d.n, curso: def.titulo, horas: def.horas, fecha: d.f, id: certId });
  } catch (e) {
    return responder(200, { ok: false });
  }
}

// ---------------------------------------------------------------------------
// APLICACIONES (Bolsillo y Palabra Contable): acceso por código, validado en el servidor.
// Secreto en Cloudflare: CODIGOS_APPS ("CODIGO=bolsillo-pro|palabra-plus|agro-productor,OTRO=palabra-premium|agro-finca,OTRO2=todos").
// Si MASTER_INCLUYE.apps es true, los códigos del plan Master (secreto CODIGOS) abren el nivel más alto de todas las apps.
// ---------------------------------------------------------------------------
const APPS = { bolsillo: ["pro"], palabra: ["plus", "premium"], agro: ["productor", "finca"], fichas: ["plus", "premium"] }; // de menor a mayor nivel

function nivelApp(codigo, app, env) {
  const c = String(codigo || "").trim().toUpperCase();
  const niveles = APPS[app];
  if (c.length < 6 || !niveles) return "";
  const alto = niveles[niveles.length - 1];
  if (MASTER_INCLUYE.apps && planDeCodigo(c, env) === "master") return alto;
  let mejor = "";
  for (const par of String(env.CODIGOS_APPS || "").split(",")) {
    const i = par.indexOf("=");
    if (i < 1) continue;
    if (par.slice(0, i).trim().toUpperCase() !== c) continue;
    const [valor, hasta] = par.slice(i + 1).trim().toLowerCase().split("@");
    if (vencido(hasta)) continue;
    const lista = valor.split("|").map((x) => x.trim());
    if (lista.includes("todos")) mejor = alto;
    for (const n of niveles) if (lista.includes(app + "-" + n)) mejor = n; // el último que coincide es el más alto
  }
  return mejor;
}

async function appAcceso(request, env) {
  if (request.method !== "POST") return responder(405, { ok: false });
  let b = {};
  try { b = await request.json(); } catch (e) { return responder(400, { ok: false }); }
  const ip = ipDe(request);
  if (bloqueado(ip)) return responder(429, { ok: false, error: "intentos" });
  const nivel = nivelApp(b.codigo, String(b.app || ""), env);
  if (!nivel) { falla(ip); return responder(200, { ok: false }); }
  return responder(200, { ok: true, nivel });
}

// Rutas que NUNCA deben poder descargarse como archivo público: este mismo código (contiene los módulos
// pagados y las respuestas del quiz), la configuración y los archivos pagados. Se revisa en minúsculas y decodificado.
function privada(ruta) {
  let p = ruta;
  try { p = decodeURIComponent(ruta); } catch (e) { return true; }
  p = p.toLowerCase().replace(/\/+/g, "/");
  return /(^|\/)(_cursos|netlify|functions|node_modules|\.git[^/]*|\.assetsignore|\.dev\.vars[^/]*)(\/|$)/.test(p) ||
    /(^|\/)(worker[^/]*\.(js|mjs|ts)|wrangler[^/]*|package(-lock)?\.json|agregar-al-index\.txt|secretos[^/]*|control-de-codigos[^/]*)$/.test(p);
}

// Calculadoras por plan (acumulativo): Gratis 6, Estudiante 12, Profesional 18, Master 23.
// 0 = gratis, 1 = estudiante, 2 = profesional, 3 = master. Se hace cumplir aquí, en el servidor:
// sin el plan, la página de la calculadora ni siquiera se entrega. Para mover una calculadora de plan, cambia su número.
const CALCS = {
  "credito": 0, "puc": 0, "iva": 0, "interes": 0, "tasas": 0, "precio": 0,
  "depreciacion": 1, "puntoequilibrio": 1, "indicadores": 1, "kardex": 1, "costeo-abc": 1, "costo-produccion": 1,
  "calculadora": 2, "nomina": 2, "retencion": 2, "retencion-conceptos": 2, "independientes": 2, "mora-sanciones": 2,
  "renta": 3, "vpn-tir": 3, "flujo-caja": 3, "analisis-financiero": 3, "conciliacion": 3
};
const RANGO = { gratis: 0, estudiante: 1, profesional: 2, master: 3 };
const NOMBRE_PLAN = ["Gratis", "Estudiante", "Profesional", "Master"];

function slugDe(ruta) {
  let p = ruta;
  try { p = decodeURIComponent(ruta); } catch (e) { return ""; }
  return p.toLowerCase().replace(/\/+/g, "/").replace(/^\/|\/$/g, "").replace(/\.html?$/, "").replace(/\/$/, "");
}

function paginaBloqueada(nivel) {
  const plan = NOMBRE_PLAN[nivel];
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Calculadora del plan ${plan} · Profesor</title>
<style>body{margin:0;font:18px/1.5 system-ui,sans-serif;background:#faf8f3;color:#1c1c1c;display:grid;place-items:center;min-height:100vh;padding:16px}main{max-width:460px;background:#fff;border:2px solid #d9d4c7;border-radius:8px;padding:28px}h1{font-size:24px;margin:0 0 8px}a{display:inline-block;margin-top:14px;background:#1f6b45;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:700}p{margin:8px 0}</style></head>
<body><main><h1>Esta calculadora es del plan ${plan}</h1><p>Se abre con el código de activación del plan ${plan}${nivel < 3 ? " o de un plan superior" : ""}.</p><p>Si ya lo tienes, escríbelo en la sección Planes del inicio y vuelve a abrir la calculadora.</p><a href="/index.html#planes">Ver planes y activar mi código</a></main></body></html>`;
  return new Response(html, { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") return chat(request, env);
    if (url.pathname === "/api/codigo") return codigo(request, env);
    if (url.pathname === "/api/curso") return curso(request, env);
    if (url.pathname === "/api/app") return appAcceso(request, env);
    if (url.pathname === "/api/verificar") return verificar(request, env);
    if (privada(url.pathname)) return new Response("No encontrado", { status: 404 }); // código del servidor y archivos pagados: nunca se entregan como archivo público
    const necesario = CALCS[slugDe(url.pathname)];
    if (necesario > 0) {
      const plan = planDeCodigo(cookieDe(request), env) || "gratis";
      if (RANGO[plan] < necesario) return paginaBloqueada(necesario);
      const r = await env.ASSETS.fetch(request);
      const h = new Headers(r.headers); h.set("Cache-Control", "private, no-store");
      return new Response(r.body, { status: r.status, headers: h });
    }
    return env.ASSETS.fetch(request); // el resto del sitio (index.html, calculadora.html, profesor.js)
  }
};
