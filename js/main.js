/* Else Solution — interações do site (v2) */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('no-anim');

  // Número oficial do WhatsApp (somente dígitos, com DDI 55)
  var WHATSAPP = '5527998798501';
  // Opcional: endereço de um serviço de formulário (Formspree, RD Station, webhook do CRM).
  // Vazio = o formulário abre o WhatsApp com os dados preenchidos.
  var FORM_ENDPOINT = '';

  function wa(text) { return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text); }
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- links de WhatsApp ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = wa(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  /* ---------- menu no celular ---------- */
  var header = document.querySelector('.header');
  var menuBtn = document.querySelector('.menu-btn');
  if (header && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = header.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    header.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- chat flutuante ---------- */
  var chatBtn = document.querySelector('.chat-btn');
  var panel = document.getElementById('chat-panel');
  function setChat(open) {
    panel.hidden = !open;
    chatBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var f = panel.querySelector('.reply'); if (f) f.focus(); }
  }
  if (chatBtn && panel) {
    chatBtn.addEventListener('click', function () { setChat(panel.hidden); });
    var x = panel.querySelector('.chat-x');
    if (x) x.addEventListener('click', function () { setChat(false); chatBtn.focus(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setChat(false); chatBtn.focus(); }
    });
  }

  /* ---------- formulário ---------- */
  var form = document.getElementById('form-contato');
  var ok = document.getElementById('form-ok');
  if (form && ok) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var msg = 'Olá! Vim pelo site da Else.\n\n' +
        'Nome: ' + d.get('nome') + '\n' +
        'Empresa: ' + d.get('empresa') + '\n' +
        (d.get('cargo') ? 'Cargo: ' + d.get('cargo') + '\n' : '') +
        'E-mail: ' + d.get('email') + '\n' +
        'WhatsApp: ' + d.get('whatsapp') + '\n' +
        'ERP atual: ' + d.get('erp') + '\n' +
        'Interesse: ' + d.get('interesse') +
        (d.get('mensagem') ? '\n\nO que mais incomoda no ERP: ' + d.get('mensagem') : '');
      function done() { form.hidden = true; ok.classList.add('show'); ok.querySelector('h3').focus(); }
      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, { method: 'POST', body: d, headers: { Accept: 'application/json' } })
          .then(done).catch(function () { window.open(wa(msg), '_blank', 'noopener'); done(); });
      } else { window.open(wa(msg), '_blank', 'noopener'); done(); }
    });
    var again = document.getElementById('form-again');
    if (again) again.addEventListener('click', function () { form.reset(); form.hidden = false; ok.classList.remove('show'); });
  }

  /* ---------- ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- entrada das seções ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (!hasIO || reduce) { reveals.forEach(function (el) { el.classList.add('in'); }); }
  else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  }

  /* ---------- brilho dos cards seguindo o ponteiro ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.card');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- demonstrações dos produtos (só tocam quando visíveis) ---------- */
  var demos = document.querySelectorAll('.demo');
  if (hasIO && !reduce) {
    var dob = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('play', e.isIntersecting); });
    }, { threshold: 0.25 });
    demos.forEach(function (d) { dob.observe(d); });
  }

  /* ---------- método: progresso conforme a rolagem ---------- */
  var cyc = document.querySelector('.cycle5');
  if (cyc) {
    var items = Array.prototype.slice.call(cyc.querySelectorAll('li'));
    var prog = document.querySelector('.prog-track');
    var mqV = window.matchMedia('(max-width: 900px)');
    var reached = -1;
    function paint() {
      items.forEach(function (li, i) { li.classList.toggle('on', i <= reached); });
      var dots = items.map(function (li) { return li.querySelector('.dot').getBoundingClientRect(); });
      var v = mqV.matches, first = dots[0], last = dots[dots.length - 1];
      var total = v ? (last.top - first.top) : (last.left - first.left);
      cyc.style.setProperty('--track', total + 'px');
      if (!prog) return;
      var cur = reached < 0 ? first : dots[reached];
      var len = v ? (cur.top - first.top) : (cur.left - first.left);
      if (v) { prog.style.width = ''; prog.style.height = len + 'px'; }
      else { prog.style.height = ''; prog.style.width = len + 'px'; }
    }
    window.addEventListener('resize', function () { paint(); });
    if (!hasIO || reduce) { reached = items.length - 1; paint(); }
    else {
      var mo = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { var i = items.indexOf(e.target); if (i > reached) { reached = i; paint(); } }
        });
      }, { rootMargin: '0px 0px -30% 0px', threshold: 0.6 });
      items.forEach(function (li) { mo.observe(li); });
    }
    if (mqV.addEventListener) mqV.addEventListener('change', paint);
  }

  /* ---------- contadores ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
    if (reduce) { el.textContent = end + suf; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (hasIO) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- abertura: partículas que se organizam em um sistema ---------- */
  var viz = document.querySelector('.viz');
  var canvas = viz && viz.querySelector('canvas');
  if (!viz || !canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  // centros do sistema (coordenadas relativas 0–1), na mesma ordem dos rótulos .node-chip
  var HUBS = [
    { x: 0.24, y: 0.28 }, // Consultoria
    { x: 0.78, y: 0.30 }, // Conhecimento
    { x: 0.66, y: 0.80 }, // Produto
    { x: 0.50, y: 0.53 }  // IA (núcleo)
  ];
  var EDGES = [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]];
  viz.querySelectorAll('.node-chip').forEach(function (chip, i) {
    if (!HUBS[i]) return;
    chip.style.left = (HUBS[i].x * 100) + '%';
    chip.style.top = (HUBS[i].y * 100) + '%';
  });

  var W = 0, H = 0, S = 0, DPR = 1, parts = [], pulses = [], t0 = 0, running = false, raf = 0, formed = false;
  var mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, px: -9999, py: -9999 };
  var lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || window.innerWidth < 640;
  var N = lowPower ? 95 : 170;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function build() {
    parts = [];
    for (var i = 0; i < N; i++) {
      var tx, ty, hub = -1;
      if (i < N * 0.62) { // em torno dos centros
        hub = i % 4;
        var R = (hub === 3 ? 0.12 : 0.15), a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * R;
        tx = HUBS[hub].x + Math.cos(a) * r; ty = HUBS[hub].y + Math.sin(a) * r;
      } else { // ao longo das conexões
        var e = EDGES[i % EDGES.length], k = rnd(0.15, 0.85), A = HUBS[e[0]], B = HUBS[e[1]];
        var nx = -(B.y - A.y), ny = B.x - A.x, nl = Math.hypot(nx, ny) || 1, j = rnd(-0.025, 0.025);
        tx = A.x + (B.x - A.x) * k + nx / nl * j; ty = A.y + (B.y - A.y) * k + ny / nl * j;
      }
      parts.push({
        sx: rnd(-0.15, 1.15), sy: rnd(-0.15, 1.15), tx: tx, ty: ty, hub: hub,
        z: rnd(0.55, 1.4), ph: rnd(0, 6.28), sp: rnd(0.35, 0.9), dl: rnd(0, 1.4), x: 0, y: 0, e: 0
      });
    }
    pulses = [];
    for (var p = 0; p < (lowPower ? 4 : 7); p++) pulses.push({ edge: p % EDGES.length, k: Math.random(), v: rnd(0.08, 0.16) });
  }
  function size() {
    var r = viz.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; S = Math.min(W, H);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function ease(p) { return 1 - Math.pow(1 - p, 3); }

  function frame(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    draw(t);
    if (running) raf = requestAnimationFrame(frame);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var allE = 0, ox = (mouse.x - 0.5) * 18, oy = (mouse.y - 0.5) * 18;
    for (var i = 0; i < parts.length; i++) {
      var q = parts[i];
      var p = reduce ? 1 : Math.max(0, Math.min(1, (t - q.dl) / 3.6));
      q.e = ease(p); allE += q.e;
      var wob = reduce ? 0 : (0.004 + 0.006 * (1 - q.e));
      var bx = q.sx + (q.tx - q.sx) * q.e + Math.sin(t * q.sp + q.ph) * wob;
      var by = q.sy + (q.ty - q.sy) * q.e + Math.cos(t * q.sp * 0.9 + q.ph) * wob;
      var X = bx * W + ox * q.z, Y = by * H + oy * q.z;
      // leve repulsão perto do ponteiro
      var dx = X - mouse.px, dy = Y - mouse.py, d2 = dx * dx + dy * dy;
      if (d2 < 6400) { var f = (1 - Math.sqrt(d2) / 80) * 10; var dl = Math.sqrt(d2) || 1; X += dx / dl * f; Y += dy / dl * f; }
      q.x = X; q.y = Y;
    }
    var formation = allE / parts.length;

    // brilho dos centros
    for (var h = 0; h < HUBS.length; h++) {
      var hx = HUBS[h].x * W + ox, hy = HUBS[h].y * H + oy, rr = S * (h === 3 ? 0.2 : 0.16);
      var g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
      g.addColorStop(0, 'rgba(138,92,255,' + (0.28 * formation) + ')');
      g.addColorStop(1, 'rgba(138,92,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hx, hy, rr, 0, 6.283); ctx.fill();
    }

    // órbitas discretas em volta dos centros
    ctx.lineWidth = 1;
    for (var o = 0; o < HUBS.length; o++) {
      var cx = HUBS[o].x * W + ox, cy = HUBS[o].y * H + oy, rr2 = S * (o === 3 ? 0.13 : 0.165);
      ctx.strokeStyle = 'rgba(181,140,255,' + (0.16 * formation) + ')';
      ctx.setLineDash([2, 6]); ctx.lineDashOffset = -t * 6;
      ctx.beginPath(); ctx.arc(cx, cy, rr2, 0, 6.283); ctx.stroke();
    }
    ctx.setLineDash([]);

    // conexões entre partículas próximas
    var maxD = S * 0.115, maxD2 = maxD * maxD;
    ctx.lineWidth = 1;
    for (var a = 0; a < parts.length; a++) {
      var A = parts[a];
      for (var b = a + 1; b < parts.length; b++) {
        var B = parts[b], ddx = A.x - B.x, ddy = A.y - B.y, dd = ddx * ddx + ddy * ddy;
        if (dd < maxD2) {
          var al = (1 - Math.sqrt(dd) / maxD) * 0.38 * Math.min(A.e, B.e);
          if (al > 0.01) {
            ctx.strokeStyle = 'rgba(181,140,255,' + al + ')';
            ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
          }
        }
      }
    }

    // linhas mestras entre os centros
    ctx.lineWidth = 1.2;
    for (var e = 0; e < EDGES.length; e++) {
      var H1 = HUBS[EDGES[e][0]], H2 = HUBS[EDGES[e][1]];
      ctx.strokeStyle = 'rgba(138,92,255,' + (0.35 * formation) + ')';
      ctx.beginPath(); ctx.moveTo(H1.x * W + ox, H1.y * H + oy); ctx.lineTo(H2.x * W + ox, H2.y * H + oy); ctx.stroke();
    }

    // partículas
    for (var k = 0; k < parts.length; k++) {
      var P = parts[k], rad = 1.3 + P.z * 1.5;
      ctx.fillStyle = P.hub === 3 ? 'rgba(255,255,255,' + (0.55 + 0.4 * P.e) + ')' : 'rgba(201,174,255,' + (0.45 + 0.5 * P.e) + ')';
      ctx.beginPath(); ctx.arc(P.x, P.y, rad, 0, 6.283); ctx.fill();
    }

    // pulsos de informação percorrendo as conexões
    if (formation > 0.9) {
      for (var u = 0; u < pulses.length; u++) {
        var pu = pulses[u];
        if (!reduce) { pu.k += pu.v * 0.016; if (pu.k > 1) { pu.k = 0; pu.edge = (pu.edge + 1 + Math.floor(Math.random() * 3)) % EDGES.length; } }
        var E1 = HUBS[EDGES[pu.edge][0]], E2 = HUBS[EDGES[pu.edge][1]];
        var px = (E1.x + (E2.x - E1.x) * pu.k) * W + ox, py = (E1.y + (E2.y - E1.y) * pu.k) * H + oy;
        var pg = ctx.createRadialGradient(px, py, 0, px, py, 10);
        pg.addColorStop(0, 'rgba(255,255,255,.95)'); pg.addColorStop(1, 'rgba(181,121,255,0)');
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, 10, 0, 6.283); ctx.fill();
      }
    }

    if (!formed && formation > 0.92) { formed = true; viz.classList.add('formed'); }
  }

  function start() { if (running || reduce) return; running = true; raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  size(); build();
  if (reduce) { draw(10); viz.classList.add('formed'); }
  else {
    var vio = hasIO ? new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }, { threshold: 0.05 }) : null;
    if (vio) vio.observe(viz); else start();
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (!vio) start(); else { var r = viz.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) start(); } });
    viz.addEventListener('pointermove', function (e) {
      var r = viz.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = (e.clientY - r.top) / r.height;
      mouse.px = e.clientX - r.left; mouse.py = e.clientY - r.top;
    }, { passive: true });
    viz.addEventListener('pointerleave', function () { mouse.tx = 0.5; mouse.ty = 0.5; mouse.px = -9999; mouse.py = -9999; });
  }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (reduce || !running) draw(10); }, 150); });
})();
