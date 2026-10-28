<?php
/**
 * Página "Programar visita al Centro de Experiencia".
 * Variables disponibles: $nombre, $whatsapp, $productos, $address, $config.
 */
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Programar visita · Centro de Experiencia Horeca Profesional</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  :root {
    --azul: #0da6d8; --azul-osc: #006074; --noche: #002c36; --tinta: #111e2f;
    --cafe: #5b4638; --crema: #f4f1e4; --gris: #6b7280; --linea: #e5e7eb; --fondo: #f6f8fa;
  }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--tinta); background: var(--fondo); }
  .wrap { max-width: 980px; margin: 0 auto; padding: 24px max(16px, env(safe-area-inset-left)) 48px; }
  .hero { position: relative; overflow: hidden; border-radius: 24px; color: #fff; padding: 28px 28px 26px;
    background: radial-gradient(120% 140% at 100% 0%, var(--azul) 0%, var(--azul-osc) 45%, var(--noche) 100%); box-shadow: 0 20px 40px -20px rgba(0,44,54,.6); }
  .hero .eyebrow { display: inline-flex; gap: 6px; align-items: center; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
    background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25); padding: 5px 10px; border-radius: 999px; }
  .hero h1 { margin: 14px 0 6px; font-size: clamp(24px, 4vw, 34px); font-weight: 900; line-height: 1.1; letter-spacing: -.02em; text-wrap: balance; }
  .hero p { margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,.85); max-width: 60ch; }
  .hours { margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px; }
  .hours span { font-size: 12px; font-weight: 600; background: rgba(0,0,0,.2); padding: 6px 10px; border-radius: 10px; }
  .grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 20px; margin-top: 20px; }
  @media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
  .card { background: #fff; border: 1px solid var(--linea); border-radius: 20px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,.04); min-width: 0; }
  .step { font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--azul-osc); margin: 0 0 12px; }
  .cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .cal-head strong { font-size: 16px; text-transform: capitalize; }
  .navbtn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--linea); background: #fff; cursor: pointer; font-size: 18px; color: var(--tinta); }
  .navbtn:disabled { opacity: .35; cursor: default; }
  .dow, .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
  .dow div { text-align: center; font-size: 11px; font-weight: 700; color: var(--gris); padding: 4px 0; }
  .day { aspect-ratio: 1 / 1; border-radius: 12px; border: 1px solid transparent; background: #f3f6f8; font: inherit; font-size: 14px; font-weight: 600; color: var(--tinta); cursor: pointer; }
  .day:hover:not(:disabled) { border-color: var(--azul); }
  .day:disabled { background: transparent; color: #c4c9cf; cursor: not-allowed; }
  .day.full:disabled { text-decoration: line-through; }
  .day.sel { background: var(--azul-osc); color: #fff; }
  .day.empty { visibility: hidden; }
  .slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
  .slot { padding: 12px 10px; border-radius: 12px; border: 1px solid var(--linea); background: #fff; font: inherit; font-size: 13px; font-weight: 700; color: var(--tinta); cursor: pointer; }
  .slot:hover:not(:disabled) { border-color: var(--azul); }
  .slot.sel { background: var(--azul); border-color: var(--azul); color: #fff; }
  .slot:disabled { color: #b8bec5; background: #f7f8f9; cursor: not-allowed; text-decoration: line-through; }
  .hint { font-size: 13px; color: var(--gris); margin: 4px 0 0; }
  label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #374151; margin: 14px 0 6px; }
  input, select { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--linea); background: #f9fafb; font: inherit; font-size: 15px; color: var(--tinta); }
  input:focus, select:focus { outline: none; border-color: var(--azul); background: #fff; box-shadow: 0 0 0 3px rgba(13,166,216,.15); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { font-size: 12px; font-weight: 600; background: var(--crema); color: var(--cafe); padding: 6px 10px; border-radius: 999px; }
  .resumen { margin-top: 16px; padding: 12px 14px; border-radius: 12px; background: #eef9fd; color: var(--azul-osc); font-size: 14px; font-weight: 600; }
  .btn { margin-top: 16px; width: 100%; padding: 14px; border-radius: 14px; border: 0; background: var(--azul-osc); color: #fff; font: inherit; font-size: 15px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 18px -8px rgba(0,96,116,.6); }
  .btn:hover { background: var(--noche); }
  .btn:disabled { opacity: .55; cursor: not-allowed; }
  .error { margin-top: 12px; padding: 10px 12px; border-radius: 10px; background: #fef2f2; color: #b91c1c; font-size: 13px; font-weight: 600; }
  .ok { text-align: center; padding: 36px 20px; }
  .ok .check { width: 64px; height: 64px; margin: 0 auto 14px; border-radius: 50%; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 32px; }
  .ok h2 { margin: 0 0 8px; font-size: 24px; }
  .ok p { margin: 6px 0; color: #374151; line-height: 1.6; }
  .ok .when { font-size: 18px; font-weight: 800; color: var(--tinta); }
  .ok a.gcal { display: inline-block; margin-top: 16px; padding: 12px 18px; border-radius: 12px; background: var(--tinta); color: #fff; text-decoration: none; font-weight: 700; font-size: 14px; }
  .hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-weight: 900; letter-spacing: -.01em; }
  .brand small { display: block; font-size: 10px; letter-spacing: .14em; color: var(--gris); font-weight: 700; text-transform: uppercase; }
  :focus-visible { outline: 2px solid var(--azul); outline-offset: 2px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="brand"><div>HORECA PROFESIONAL<small>Centro de Experiencia</small></div></div>

  <section class="hero">
    <span class="eyebrow">📍 Centro de Experiencia</span>
    <h1>Programa tu visita y mira los equipos funcionando</h1>
    <p><?php echo $nombre !== '' ? 'Hola ' . esc_html(strtok($nombre, ' ')) . ', elige' : 'Elige'; ?> el día y la hora que mejor te queden. Un asesor te recibirá para mostrarte los equipos en vivo.</p>
    <?php if ($address !== '') : ?>
      <p style="margin-top:10px">📍 <strong><?php echo esc_html($address); ?></strong><?php if ($maps !== '') : ?> · <a href="<?php echo esc_url($maps); ?>" target="_blank" rel="noopener" style="color:#fff;font-weight:700">Ver en Google Maps</a><?php endif; ?></p>
    <?php endif; ?>
    <div class="hours">
      <span>Lunes a viernes · 9:00 a. m. – 12:00 m. y 2:00 – 5:00 p. m.</span>
      <span>Sábados · 8:30 – 11:30 a. m.</span>
      <span>Domingos y festivos · cerrado</span>
    </div>
  </section>

  <div id="app">
    <div class="grid">
      <div class="card">
        <p class="step">1 · Elige el día</p>
        <div class="cal-head">
          <button type="button" class="navbtn" id="prev" aria-label="Mes anterior">‹</button>
          <strong id="mes"></strong>
          <button type="button" class="navbtn" id="next" aria-label="Mes siguiente">›</button>
        </div>
        <div class="dow"><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sá</div><div>Do</div></div>
        <div class="days" id="dias"></div>
        <p class="step" style="margin-top:20px">2 · Elige la hora</p>
        <div id="turnos"><p class="hint">Primero elige un día en el calendario.</p></div>
      </div>

      <form class="card" id="form" novalidate>
        <p class="step">3 · Tus datos</p>
        <label for="nombre">Nombre</label>
        <input id="nombre" name="nombre" autocomplete="name" value="<?php echo esc_attr($nombre); ?>" placeholder="Tu nombre" required>
        <label for="whatsapp">WhatsApp</label>
        <input id="whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" value="<?php echo esc_attr($whatsapp); ?>" placeholder="Ej. 315 123 4567" required>
        <?php if ($productos) : ?>
          <label>Equipos que te interesan</label>
          <div class="chips"><?php foreach ($productos as $pr) : ?><span class="chip"><?php echo esc_html($pr); ?></span><?php endforeach; ?></div>
        <?php else : ?>
          <label for="producto">¿Qué producto quieres ver?</label>
          <select id="producto" name="producto" required>
            <option value="">Elige un producto</option>
            <?php foreach ($config['catalogo'] as $c) : ?>
              <option value="<?php echo esc_attr($c['id']); ?>"><?php echo esc_html($c['name']); ?></option>
            <?php endforeach; ?>
          </select>
        <?php endif; ?>
        <div class="hp" aria-hidden="true"><label for="empresa_web">No llenar</label><input id="empresa_web" tabindex="-1" autocomplete="off"></div>
        <div class="resumen" id="resumen" hidden></div>
        <div class="error" id="error" role="alert" hidden></div>
        <button type="submit" class="btn" id="enviar">Agendar visita</button>
      </form>
    </div>
  </div>
</div>

<script>
(function () {
  var C = <?php echo wp_json_encode($config); ?>;
  var MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  var ocupados = {};
  var hoy = parseYmd(C.hoy);
  var min = addDays(hoy, 1), max = addDays(hoy, C.diasMax);
  var vista = new Date(min.getFullYear(), min.getMonth(), 1);
  var fechaSel = null, horaSel = null;
  var $ = function (id) { return document.getElementById(id); };

  function parseYmd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  var festivos = {}; (C.festivos || []).forEach(function (f) { festivos[f] = true; });
  function turnosDe(d) { return festivos[ymd(d)] ? [] : (C.turnos[String(d.getDay())] || []); }
  function libres(d) { var k = ymd(d); return turnosDe(d).filter(function (t) { return !ocupados[k + ' ' + t]; }); }
  function etiquetaFecha(d) { var s = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()]; return s.charAt(0).toUpperCase() + s.slice(1); }

  function pintarMes() {
    $('mes').textContent = MESES[vista.getMonth()] + ' ' + vista.getFullYear();
    $('prev').disabled = vista <= new Date(min.getFullYear(), min.getMonth(), 1);
    $('next').disabled = vista >= new Date(max.getFullYear(), max.getMonth(), 1);
    var cont = $('dias'); cont.innerHTML = '';
    var primero = new Date(vista.getFullYear(), vista.getMonth(), 1);
    var offset = (primero.getDay() + 6) % 7; // lunes primero
    for (var i = 0; i < offset; i++) { var e = document.createElement('div'); e.className = 'day empty'; cont.appendChild(e); }
    var diasMes = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
    for (var dnum = 1; dnum <= diasMes; dnum++) {
      var d = new Date(vista.getFullYear(), vista.getMonth(), dnum);
      var b = document.createElement('button'); b.type = 'button'; b.className = 'day'; b.textContent = dnum;
      var habil = d >= min && d <= max && turnosDe(d).length > 0;
      if (festivos[ymd(d)]) b.title = 'Festivo';
      var hayLibres = habil && libres(d).length > 0;
      b.disabled = !hayLibres;
      if (habil && !hayLibres) { b.classList.add('full'); b.title = 'Sin horarios disponibles'; }
      if (fechaSel && ymd(d) === fechaSel) b.classList.add('sel');
      b.setAttribute('aria-label', etiquetaFecha(d) + (hayLibres ? '' : ' (no disponible)'));
      (function (dd) { b.addEventListener('click', function () { fechaSel = ymd(dd); horaSel = null; pintarMes(); pintarTurnos(); resumen(); }); })(d);
      cont.appendChild(b);
    }
  }

  function pintarTurnos() {
    var cont = $('turnos');
    if (!fechaSel) { cont.innerHTML = '<p class="hint">Primero elige un día en el calendario.</p>'; return; }
    var d = parseYmd(fechaSel);
    var box = document.createElement('div'); box.className = 'slots';
    turnosDe(d).forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'slot'; b.textContent = C.etiquetas[t] || t;
      b.disabled = !!ocupados[fechaSel + ' ' + t];
      if (b.disabled) b.title = 'Ocupado';
      if (horaSel === t) b.classList.add('sel');
      b.addEventListener('click', function () { horaSel = t; pintarTurnos(); resumen(); });
      box.appendChild(b);
    });
    cont.innerHTML = '<p class="hint" style="margin:0 0 10px">' + etiquetaFecha(d) + '</p>';
    cont.appendChild(box);
  }

  function resumen() {
    var r = $('resumen');
    if (fechaSel && horaSel) { r.hidden = false; r.textContent = '🗓️ ' + etiquetaFecha(parseYmd(fechaSel)) + ' · ' + (C.etiquetas[horaSel] || horaSel); }
    else { r.hidden = true; }
  }

  function error(msg) { var e = $('error'); e.textContent = msg; e.hidden = !msg; }

  $('prev').addEventListener('click', function () { vista = new Date(vista.getFullYear(), vista.getMonth() - 1, 1); pintarMes(); });
  $('next').addEventListener('click', function () { vista = new Date(vista.getFullYear(), vista.getMonth() + 1, 1); pintarMes(); });

  function cargarOcupados() {
    return fetch(C.rest + 'visitas/ocupados', { credentials: 'same-origin', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (d) { ocupados = {}; (d.ocupados || []).forEach(function (k) { ocupados[k] = true; }); })
      .catch(function () {});
  }

  $('form').addEventListener('submit', function (ev) {
    ev.preventDefault(); error('');
    var nombre = $('nombre').value.trim(), whatsapp = $('whatsapp').value.trim();
    var producto = $('producto') ? $('producto').value : '';
    if (!fechaSel || !horaSel) return error('Elige el día y la hora de tu visita.');
    if (!nombre || whatsapp.replace(/\D/g, '').length < 7) return error('Escribe tu nombre y un WhatsApp válido.');
    if ($('producto') && !producto) return error('Elige el producto que quieres ver.');
    var btn = $('enviar'); btn.disabled = true; btn.textContent = 'Agendando…';
    fetch(C.rest + 'visitas', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: C.token, fecha: fechaSel, hora: horaSel, nombre: nombre, whatsapp: whatsapp, producto: producto, empresa_web: $('empresa_web').value })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok || !res.d.ok) {
          btn.disabled = false; btn.textContent = 'Agendar visita';
          error((res.d && res.d.message) || 'No pudimos agendar tu visita. Intenta de nuevo.');
          if (res.d && res.d.code === 'horeca_ocupado') { cargarOcupados().then(function () { horaSel = null; pintarMes(); pintarTurnos(); resumen(); }); }
          return;
        }
        var ini = fechaSel.replace(/-/g, '') + 'T' + horaSel.replace(':', '') + '00';
        var finD = new Date(parseYmd(fechaSel)); var hh = +horaSel.split(':')[0] + 1;
        var fin = fechaSel.replace(/-/g, '') + 'T' + String(hh).padStart(2, '0') + horaSel.split(':')[1] + '00';
        var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Visita Centro de Experiencia Horeca Profesional') +
          '&dates=' + ini + '/' + fin + '&ctz=America/Bogota' + (res.d.direccion ? '&location=' + encodeURIComponent(res.d.direccion) : '');
        $('app').innerHTML = '<div class="card ok"><div class="check">✓</div><h2>¡Tu visita quedó agendada!</h2>' +
          '<p class="when">' + res.d.fecha + '<br>' + res.d.hora + '</p>' +
          (res.d.direccion ? '<p><strong>Dirección:</strong> ' + res.d.direccion.replace(/</g, '&lt;') + (res.d.mapa ? ' · <a href="' + res.d.mapa.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener">Ver en Google Maps</a>' : '') + '</p>' : '') +
          '<p><strong>Un asesor se comunicará contigo para confirmar la cita.</strong></p>' +
          '<a class="gcal" href="' + gcal + '" target="_blank" rel="noopener">Agregar a mi Google Calendar</a></div>';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(function () { btn.disabled = false; btn.textContent = 'Agendar visita'; error('No pudimos agendar tu visita. Revisa tu conexión e intenta de nuevo.'); });
  });

  pintarMes(); pintarTurnos();
  cargarOcupados().then(function () { pintarMes(); pintarTurnos(); });
})();
</script>
</body>
</html>
