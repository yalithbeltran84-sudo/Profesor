// Profesor: planes, límite diario de preguntas, historial de chats y llamadas a la IA (Cloudflare).
// Lo usan el inicio y la calculadora. El plan pago solo se activa con un código verificado por el servidor.
(function () {
  var PLANS = {
    gratis:      { nombre: "Gratis",      limite: 5 },
    estudiante:  { nombre: "Estudiante",  limite: 30 },
    profesional: { nombre: "Profesional", limite: 100 },
    master:      { nombre: "Master",      limite: 300 }
  };
  var K = { plan: "profesor_plan", uso: "profesor_uso", chats: "profesor_chats", cod: "profesor_codigo" };

  function get(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function quitar(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function hoy() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  var mem = {}; // respaldo si el navegador bloquea localStorage

  function codigo() { var c = get(K.cod, null) || mem.cod; return typeof c === "string" ? c : ""; }
  function plan() {
    var p = get(K.plan, null) || mem.plan;
    if (!PLANS[p]) return "gratis";
    if (p !== "gratis" && !codigo()) return "gratis"; // un plan pago exige código
    return p;
  }
  function guardarPlan(p, c) {
    mem.plan = p; set(K.plan, p);
    if (p === "gratis") { mem.cod = ""; quitar(K.cod); }
    else if (c) { mem.cod = c; set(K.cod, c); }
  }
  // Desde la página solo se puede volver a Gratis; los planes pagos se activan con activarCodigo.
  function setPlan(p) { if (p === "gratis") guardarPlan("gratis"); }

  function usadas() { var u = get(K.uso, null) || mem.uso; return u && u.dia === hoy() ? u.n : 0; }
  function restantes() { return Math.max(0, PLANS[plan()].limite - usadas()); }
  function contar() { var u = { dia: hoy(), n: usadas() + 1 }; mem.uso = u; set(K.uso, u); }

  // Historial de chats
  function chats() { var c = get(K.chats, null) || mem.chats || []; return Array.isArray(c) ? c : []; }
  function guardarChats(c) { c = c.slice(0, 50); mem.chats = c; set(K.chats, c); }
  function nuevoChat() { return { id: "c" + Date.now() + Math.floor(Math.random() * 1000), titulo: "Nueva conversación", t: Date.now(), msgs: [] }; }
  function guardarChat(chat) {
    var c = chats().filter(function (x) { return x.id !== chat.id; });
    chat.t = Date.now();
    c.unshift(chat);
    guardarChats(c);
  }
  function borrarChat(id) { guardarChats(chats().filter(function (x) { return x.id !== id; })); }

  // Verifica un código con el servidor y, si es válido, activa el plan.
  function activarCodigo(c) {
    c = String(c || "").trim();
    return fetch("/api/codigo", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: c })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok && PLANS[d.plan]) guardarPlan(d.plan, c);
      return d || { ok: false };
    }).catch(function () { return { ok: false, error: true }; });
  }

  // Envía una pregunta. Respeta el límite del plan y solo descuenta si la IA respondió bien.
  // historial: [{role:"user"|"model", text}]
  function preguntar(q, historial) {
    if (restantes() <= 0) {
      return Promise.resolve({ ok: false, limite: true, answer: "Llegaste al límite de " + PLANS[plan()].limite + " preguntas de hoy en el plan " + PLANS[plan()].nombre + ". Vuelve mañana o cambia de plan." });
    }
    return fetch("/api/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, codigo: codigo(), history: historial || [] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      // Si el servidor ya no reconoce el código (venció), se vuelve a Gratis.
      if (d && d.plan === "gratis" && plan() !== "gratis") guardarPlan("gratis");
      if (d && d.ok) contar();
      return d;
    }).catch(function () { return { ok: false, answer: "No pude conectarme. Intenta de nuevo." }; });
  }

  window.Profesor = { PLANS: PLANS, plan: plan, setPlan: setPlan, activarCodigo: activarCodigo, usadas: usadas, restantes: restantes,
    chats: chats, nuevoChat: nuevoChat, guardarChat: guardarChat, borrarChat: borrarChat, preguntar: preguntar };
})();
