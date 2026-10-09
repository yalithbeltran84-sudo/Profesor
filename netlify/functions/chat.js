// Función de Profesor: recibe la pregunta y consulta a Gemini.
// La clave NO va aquí: se guarda en Netlify como variable GEMINI_API_KEY.

const CONTENIDO = `
[Artículo: IVA] El IVA es un impuesto indirecto sobre el consumo. El vendedor lo cobra en cada venta y lo traslada al Estado. En Colombia la tarifa general es del 19%, con bienes excluidos y exentos.
[Artículo: Retención en la fuente] Es un mecanismo de recaudo anticipado: quien paga retiene una parte del impuesto del beneficiario y la consigna a la DIAN. El valor depende del concepto del pago y de la base.
[Artículo: Depreciación en línea recta] Se divide el costo del activo, menos su valor residual, entre los años de vida útil. Ejemplo: costo 1.200, residual 0 y 5 años dan 240 por año.
[Herramientas] Plantilla de flujo de caja mensual y plantilla de depreciación de activos.
`; // Aquí agregarás tus propios artículos.

const INSTRUCCIONES = `Eres el asistente de Profesor, una plataforma de Contaduría Pública en Colombia.
Respondes preguntas sobre contabilidad financiera, contabilidad pública (sector gobierno), impuestos, finanzas, auditoría, control interno y normatividad contable y tributaria colombiana.
Escribe en español, con lenguaje sencillo, en máximo 220 palabras y en texto plano, sin asteriscos ni símbolos de formato.

Cómo responder:
1. Si el contenido de Profesor (abajo) cubre la pregunta, úsalo primero y menciona de qué artículo sale.
2. Si no, responde con fuentes confiables y nómbralas dentro de la respuesta. Prefiere en este orden: normas y entidades oficiales (DIAN, Contaduría General de la Nación, Consejo Técnico de la Contaduría Pública, Estatuto Tributario, Decreto 2420 de 2015, Ley 1314 de 2009, y para contabilidad pública el Régimen de Contabilidad Pública y su marco normativo para entidades de gobierno), luego portales contables reconocidos (por ejemplo Siigo o Actualícese) y libros o artículos académicos.
3. Nunca inventes fuentes, autores, libros, enlaces, números de artículos, resoluciones, cifras, tarifas ni fechas. Cita una fuente solo si estás seguro de que existe. Si no estás seguro, di que es información general y recomienda verificar en dian.gov.co o contaduria.gov.co.
4. Para valores que cambian cada año (UVT, tarifas, plazos, topes) explica el concepto y pide confirmar el dato vigente en la fuente oficial.
5. Si la pregunta no es de contabilidad, impuestos, finanzas, auditoría o temas afines, indica amablemente que solo ayudas con esos temas.
6. Termina recordando, en una frase corta, que no reemplazas la asesoría de un contador público.

CONTENIDO DE PROFESOR:
${CONTENIDO}`;

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método no permitido." }) };
  }
  let question = "";
  try { question = String(JSON.parse(event.body).question || "").trim().slice(0, 500); } catch (e) {}
  if (!question) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Escribe una pregunta." }) };
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Falta configurar la clave de la IA." }) };
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
  const useSearch = process.env.GEMINI_SEARCH === "on"; // activa búsqueda con fuentes reales
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const call = (withSearch) => {
    const body = {
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig: { maxOutputTokens: 900, temperature: 0.2 }
    };
    if (withSearch) body.tools = [{ google_search: {} }];
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
  };
  try {
    let res = await call(useSearch);
    if (useSearch && !res.ok) res = await call(false); // si la búsqueda no está disponible, responde sin ella
    if (res.status === 429) {
      return { statusCode: 200, headers, body: JSON.stringify({ answer: "Hay muchas consultas en este momento. Intenta de nuevo en un minuto." }) };
    }
    if (!res.ok) {
      let detalle = "";
      try { detalle = (await res.json()).error?.message || ""; } catch (e) {}
      console.error("Error de Gemini", res.status, detalle);
      return { statusCode: 200, headers, body: JSON.stringify({ answer: "No pude responder ahora. Intenta de nuevo en un momento." }) };
    }
    const data = await res.json();
    const cand = data.candidates?.[0];
    const answer = cand?.content?.parts?.map(p => p.text).join("") || "No encontré una respuesta.";
    const vistos = new Set();
    const sources = (cand?.groundingMetadata?.groundingChunks || [])
      .map(c => c.web).filter(w => w && w.uri && !vistos.has(w.uri) && vistos.add(w.uri))
      .slice(0, 5).map(w => ({ title: w.title || "Fuente", uri: w.uri }));
    return { statusCode: 200, headers, body: JSON.stringify({ answer, sources }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ answer: "Error de conexión. Intenta de nuevo." }) };
  }
};
