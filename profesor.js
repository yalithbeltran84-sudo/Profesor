// Profesor: planes, límite diario de preguntas, historial de chats y llamada a la IA.
// Lo usan el inicio y la calculadora. Todo se guarda en el navegador (localStorage).
(function () {
  var PLANS = {
    gratis:      { nombre: "Gratis",      limite: 5 },
    estudiante:  { nombre: "Estudiante",  limite: 30 },
    profesional: { nombre: "Profesional", limite: 100 },
    master:      { nombre: "Master",      limite: 300 }
  };
  var K = { plan: "profesor_plan", uso: "profesor_uso", chats: "profesor_chats" };

  function get(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function hoy() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  var mem = {}; // respaldo si el navegador bloquea localStorage
  function plan() { var p = get(K.plan, null) || mem.plan; return PLANS[p] ? p : "gratis"; }
  function setPlan(p) { if (PLANS[p]) { mem.plan = p; set(K.plan, p); } }
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

  // Envía una pregunta. Respeta el límite del plan y solo descuenta si la IA respondió bien.
  // historial: [{role:"user"|"model", text}]
  function preguntar(q, historial) {
    if (restantes() <= 0) {
      return Promise.resolve({ ok: false, limite: true, answer: "Llegaste al límite de " + PLANS[plan()].limite + " preguntas de hoy en el plan " + PLANS[plan()].nombre + ". Vuelve mañana o cambia de plan." });
    }
    return fetch("/.netlify/functions/chat", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, plan: plan(), history: historial || [] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.ok) contar();
      return d;
    }).catch(function () { return { ok: false, answer: "No pude conectarme. Intenta de nuevo." }; });
  }

  window.Profesor = { PLANS: PLANS, plan: plan, setPlan: setPlan, usadas: usadas, restantes: restantes,
    chats: chats, nuevoChat: nuevoChat, guardarChat: guardarChat, borrarChat: borrarChat, preguntar: preguntar };
})();
