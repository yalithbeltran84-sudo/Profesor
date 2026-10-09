// Función de Profesor: recibe la pregunta y consulta a Gemini.
// La clave NO va aquí: se guarda en Netlify como variable GEMINI_API_KEY.

const CONTENIDO = `
[Artículo: IVA] El IVA es un impuesto indirecto sobre el consumo. El vendedor lo cobra en cada venta y lo traslada al Estado. En Colombia la tarifa general es del 19%, con bienes excluidos y exentos.
[Artículo: Retención en la fuente] Es un mecanismo de recaudo anticipado: quien paga retiene una parte del impuesto del beneficiario y la consigna a la DIAN. El valor depende del concepto del pago y de la base.
[Artículo: Depreciación en línea recta] Se divide el costo del activo, menos su valor residual, entre los años de vida útil. Ejemplo: costo 1.200, residual 0 y 5 años dan 240 por año.
[Herramientas] Plantilla de flujo de caja mensual y plantilla de depreciación de activos.
`; // Aquí agregarás tus propios artículos.

const INSTRUCCIONES = `Eres el asistente de Profesor, una plataforma de Contaduría Pública en Colombia.
Respondes preguntas sobre contabilidad, impuestos, finanzas, auditoría y normatividad contable y tributaria.
Escribe en español, con lenguaje sencillo, en máximo 180 palabras y en texto plano, sin asteriscos ni símbolos de formato.

Cómo responder:
1. Si el contenido de Profesor (abajo) cubre la pregunta, úsalo primero y menciona el artículo o la herramienta de donde sale.
2. Si no está en el contenido de Profesor, responde con tu conocimiento general de contabilidad y deja claro que es información general, no del material de Profesor.
3. No inventes cifras, tarifas, porcentajes, plazos ni números de artículos. Si dependen del año o pueden haber cambiado (UVT, tarifas, fechas, topes), explica el concepto y recomienda confirmar el valor vigente en la DIAN o en la norma.
4. Si la pregunta no es sobre contabilidad, impuestos, finanzas o temas afines, indica amablemente que solo ayudas con esos temas.
5. Recuerda que no reemplazas la asesoría de un contador público.

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
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: { maxOutputTokens: 700, temperature: 0.3 }
      })
    });
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
    const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "No encontré una respuesta.";
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ answer: "Error de conexión. Intenta de nuevo." }) };
  }
};
