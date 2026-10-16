// Worker de Profesor (Cloudflare): recibe la pregunta en /api/chat y consulta a Gemini.
// La clave NO va aquí: se guarda en Cloudflare como secreto GEMINI_API_KEY.
// Los códigos de activación de planes pagos tampoco van aquí: se guardan como secreto CODIGOS
// con este formato (separados por coma):  CODIGO1=estudiante,CODIGO2=profesional,CODIGO3=master

const CONTENIDO = `
[Artículo: IVA] El IVA es un impuesto indirecto sobre el consumo. El vendedor lo cobra en cada venta y lo traslada al Estado. En Colombia la tarifa general es del 19%, con bienes excluidos y exentos.
[Artículo: Retención en la fuente] Es un mecanismo de recaudo anticipado: quien paga retiene una parte del impuesto del beneficiario y la consigna a la DIAN. El valor depende del concepto del pago y de la base.
[Artículo: Depreciación en línea recta] Se divide el costo del activo, menos su valor residual, entre los años de vida útil. Ejemplo: costo 1.200, residual 0 y 5 años dan 240 por año.
[Artículo: Punto de equilibrio] Es el nivel de ventas en el que los ingresos igualan los costos totales. En unidades se calcula así: costos fijos divididos entre (precio de venta menos costo variable unitario).
[Artículo: Costos ambientales] Son los recursos que una empresa destina a prevenir, reducir o reparar su impacto ambiental. Según el caso se registran como gasto del periodo o como mayor valor de un activo, conforme a la norma contable aplicable.
[Artículo: Activos biológicos] Son plantas y animales vivos que una empresa agrícola o pecuaria mantiene para producir. Su medición y registro dependen de la norma contable que aplique la empresa según su grupo.
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
1. Si el contenido de Profesor (abajo) cubre la pregunta, úsalo primero y menciona de qué artículo sale.
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
