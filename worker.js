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
[Herramientas] Plantilla de flujo de caja mensual y plantilla de depreciación de activos.
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
1. Si el contenido de Profesor (abajo) cubre la pregunta, úsalo primero, menciona de qué artículo sale y, si puedes, dile que lo encuentra completo, con sus fuentes, en la sección Artículos del sitio.
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
function planDeCodigo(codigo, env) {
  const c = String(codigo || "").trim().toUpperCase();
  if (c.length < 6) return "";
  const lista = String(env.CODIGOS || "").split(",");
  for (const par of lista) {
    const i = par.indexOf("=");
    if (i < 1) continue;
    const cod = par.slice(0, i).trim().toUpperCase();
    const plan = par.slice(i + 1).trim().toLowerCase();
    if (cod === c && PLANES[plan] && plan !== "gratis") return plan;
  }
  return "";
}

// Verifica un código y dice a qué plan da acceso.
async function codigo(request, env) {
  if (request.method !== "POST") {
    return responder(405, { ok: false });
  }
  let c = "";
  try { c = String((await request.json()).codigo || ""); } catch (e) {}
  const plan = planDeCodigo(c, env);
  if (!plan) return responder(200, { ok: false });
  return responder(200, { ok: true, plan });
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") return chat(request, env);
    if (url.pathname === "/api/codigo") return codigo(request, env);
    return env.ASSETS.fetch(request); // el resto del sitio (index.html, calculadora.html, profesor.js)
  }
};
