// Función de Profesor: recibe la pregunta y consulta a Gemini.
// La clave NO va aquí: se guarda en Netlify como variable GEMINI_API_KEY.

const CONTENIDO = `
[Artículo: IVA] El IVA es un impuesto indirecto sobre el consumo. El vendedor lo cobra en cada venta y lo traslada al Estado. En Colombia la tarifa general es del 19%, con bienes excluidos y exentos.
[Artículo: Retención en la fuente] Es un mecanismo de recaudo anticipado: quien paga retiene una parte del impuesto del beneficiario y la consigna a la DIAN. El valor depende del concepto del pago y de la base.
[Artículo: Depreciación en línea recta] Se divide el costo del activo, menos su valor residual, entre los años de vida útil. Ejemplo: costo 1.200, residual 0 y 5 años dan 240 por año.
[Herramientas] Plantilla de flujo de caja mensual y plantilla de depreciación de activos.
`; // Aquí agregarás tus propios artículos.

const INSTRUCCIONES = `Eres el asistente de Profesor, una plataforma de Contaduría Pública.
Responde en español, con lenguaje sencillo y en máximo 120 palabras.
Usa SOLO el contenido de Profesor que aparece abajo. Si la respuesta no está ahí, dilo con claridad y sugiere consultar fuentes oficiales como la DIAN; no inventes datos ni cifras.
Termina indicando el artículo o la herramienta de donde sale la respuesta.
Recuerda que no reemplazas la asesoría de un contador público.

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
        generationConfig: { maxOutputTokens: 400, temperature: 0.3 }
      })
    });
    if (res.status === 429) {
      return { statusCode: 200, headers, body: JSON.stringify({ answer: "Hay muchas consultas en este momento. Intenta de nuevo en un minuto." }) };
    }
    if (!res.ok) {
      // Diagnóstico temporal: muestra el código y el motivo que devuelve Google.
      let detalle = "";
      try { detalle = (await res.json()).error?.message || ""; } catch (e) {}
      return { statusCode: 200, headers, body: JSON.stringify({ answer: `Error ${res.status} de Google: ${detalle.slice(0, 200)}` }) };
    }
    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "No encontré una respuesta.";
    return { statusCode: 200, headers, body: JSON.stringify({ answer }) };
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ answer: "Error de conexión. Intenta de nuevo." }) };
  }
};
