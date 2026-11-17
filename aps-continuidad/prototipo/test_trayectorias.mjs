#!/usr/bin/env node
// Functional tests for the "Trayectorias" view: injects hand-authored
// patient scenarios (docs/modelo_trayectoria_aps.md) through the real
// window.__APS_TEST__ hook and a real Chromium render (Playwright), then
// checks that each one renders without errors and shows what it should.
// This exercises the actual rendering pipeline, not a reimplementation.
//
// Run with: node test_trayectorias.mjs   (needs the preinstalled Playwright)

import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = 'file://' + path.join(__dirname, 'index.html');

/* ---------------- scenarios ----------------
   Each `events` list uses the same event vocabulary as EVENT_META in
   index.html (cat: clinico/administrativo/contacto). Scenarios 7, 9, 10,
   11 and 12 use the six event types added in the November audit
   specifically so these cases could be represented
   (cancelado_establecimiento, contacto_fallido, derivacion_especialidad,
   derivacion_establecimiento, egreso_defuncion, egreso_traslado) — the
   random generator does not produce these, by design (see
   docs/modelo_trayectoria_aps.md, "qué no modela el generador aleatorio"). */
const SCENARIOS = [
  {
    id: 'S-01', name: 'Continuidad regular, sin incidentes',
    expectStatus: 'activo',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:false},
      {month:3, type:'control', compensado:true},
      {month:6, type:'control', compensado:true},
      {month:9, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-02', name: 'Una inasistencia aislada, rescate exitoso, nunca se pierde',
    expectStatus: 'rescatado',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:false},
      {month:3, type:'no_asistio'},
      {month:4, type:'rescate_exitoso'},
      {month:6, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-03', name: 'Dos episodios de pérdida separados por un reingreso espontáneo',
    expectStatus: 'rescatado', // ver nota en docs/modelo_trayectoria_aps.md: este escenario destapó un bug real en patientStatus()

    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'no_asistio'}, {month:4, type:'rescate_fallido'},
      {month:6, type:'no_asistio'}, {month:7, type:'rescate_fallido'},
      {month:7, type:'perdido'},
      {month:9, type:'reingreso'},
      {month:12, type:'no_asistio'}, {month:13, type:'rescate_fallido'},
      {month:15, type:'no_asistio'}, {month:16, type:'rescate_fallido'},
      {month:16, type:'perdido'},
      {month:18, type:'reingreso'},
    ],
  },
  {
    id: 'S-04', name: 'Pérdida prolongada con hospitalización y reingreso post-evento',
    expectStatus: 'evento',
    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'no_asistio'}, {month:4, type:'rescate_fallido'},
      {month:6, type:'no_asistio'}, {month:7, type:'rescate_fallido'},
      {month:7, type:'perdido'},
      {month:14, type:'hospitalizacion'},
      {month:15, type:'reingreso_post_evento'},
    ],
  },
  {
    id: 'S-05', name: 'Urgencia SIN abandono previo (paciente con buena continuidad)',
    expectStatus: 'evento',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:true},
      {month:3, type:'control', compensado:true},
      {month:5, type:'urgencia'},
      {month:6, type:'control', compensado:true},
      {month:9, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-06', name: 'Control atrasado por falta de disponibilidad (causa administrativa, no abandono)',
    expectStatus: 'activo',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:false},
      {month:3, type:'cancelado_establecimiento'},
      {month:5, type:'control', compensado:false},
      {month:8, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-07', name: 'Cambio de establecimiento (traslado administrativo), continuidad no interrumpida',
    expectStatus: 'activo',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:false},
      {month:3, type:'control', compensado:true},
      {month:5, type:'derivacion_establecimiento'},
      {month:6, type:'control', compensado:true},
      {month:9, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-08', name: 'Derivación a especialidad por complicación, luego retorna a APS',
    expectStatus: 'evento',
    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'control', compensado:false},
      {month:5, type:'urgencia'},
      {month:5, type:'derivacion_especialidad'},
      {month:7, type:'control', compensado:true},
      {month:10, type:'control', compensado:true},
    ],
  },
  {
    id: 'S-09', name: 'Intento de rescate sin respuesta (contacto fallido, no un rechazo del paciente)',
    expectStatus: 'perdido',
    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'no_asistio'},
      {month:4, type:'contacto_fallido'},
      {month:6, type:'no_asistio'},
      {month:7, type:'contacto_fallido'},
      {month:7, type:'perdido'},
    ],
  },
  {
    id: 'S-10', name: 'Egreso por defunción (no es pérdida de seguimiento)',
    expectStatus: 'egreso',
    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'control', compensado:false},
      {month:6, type:'control', compensado:true},
      {month:10, type:'hospitalizacion'},
      {month:11, type:'egreso_defuncion'},
    ],
  },
  {
    id: 'S-11', name: 'Egreso por traslado a otro centro tras una pérdida previa (cierre administrativo, no abandono activo)',
    expectStatus: 'egreso',
    events: [
      {month:0, type:'ingreso'},
      {month:3, type:'no_asistio'}, {month:4, type:'rescate_fallido'},
      {month:6, type:'no_asistio'}, {month:7, type:'rescate_fallido'},
      {month:7, type:'perdido'},
      {month:12, type:'egreso_traslado'},
    ],
  },
  {
    id: 'S-12', name: 'Compensación persistentemente mala, sin ningún episodio de pérdida (la compensación y la continuidad son ejes distintos)',
    expectStatus: 'activo',
    events: [
      {month:0, type:'ingreso'},
      {month:0, type:'control', compensado:false},
      {month:3, type:'control', compensado:false},
      {month:6, type:'control', compensado:false},
      {month:9, type:'control', compensado:false},
    ],
  },
];

/* ---------------- runner ---------------- */
let pass = 0, fail = 0;
const failures = [];
function check(scenario, name, cond, extra) {
  if (cond) { pass++; console.log(`  ok  - [${scenario}] ${name}`); }
  else { fail++; failures.push(`[${scenario}] ${name}`); console.log(` FAIL - [${scenario}] ${name}`, extra !== undefined ? JSON.stringify(extra) : ''); }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await page.goto(file);
await page.waitForFunction(() => !!window.__APS_TEST__);

console.log('=== APS Continuidad — pruebas funcionales de Trayectorias ===');
console.log(SCENARIOS.length + ' escenarios, inyectados vía window.__APS_TEST__ en un Chromium real.\n');

for (const sc of SCENARIOS) {
  const result = await page.evaluate(({ sc }) => {
    const id = window.__APS_TEST__.addPatient({ id: sc.id, events: sc.events, age: 65, sex: 'F' });
    window.__APS_TEST__.selectPatient(id);
    const p = window.__APS_TEST__.getPatient(id);
    const status = window.__APS_TEST__.patientStatus(p);
    const chronoItems = Array.from(document.querySelectorAll('#trajChrono li')).map(li => li.textContent);
    const trajDetailHidden = document.getElementById('trajDetail').hidden;
    const circleCount = document.querySelectorAll('#trajSvg circle').length;
    const hasUndefinedLabel = chronoItems.some(t => t.includes('undefined'));
    const legendText = document.getElementById('trajLegend').textContent;
    return { statusKey: status.k, statusLabel: status.label, chronoCount: chronoItems.length, trajDetailHidden, circleCount, hasUndefinedLabel, legendText, chronoItems };
  }, { sc });

  check(sc.id, `${sc.name} — se agrega y se selecciona sin lanzar excepción`, true);
  check(sc.id, 'el panel de detalle queda visible (no oculto)', result.trajDetailHidden === false);
  check(sc.id, 'el estado clasificado coincide con lo esperado por el escenario',
    result.statusKey === sc.expectStatus, { got: result.statusKey, label: result.statusLabel, expected: sc.expectStatus });
  check(sc.id, 'la cronología muestra exactamente un ítem por evento del escenario',
    result.chronoCount === sc.events.length, { chronoCount: result.chronoCount, eventsInScenario: sc.events.length });
  check(sc.id, 'ningún evento se etiqueta como "undefined" (EVENT_META cubre todos los tipos usados)',
    !result.hasUndefinedLabel, result.chronoItems);
  check(sc.id, 'el timeline SVG dibuja un círculo por cada evento',
    result.circleCount === sc.events.length, { circleCount: result.circleCount });
}

check('GLOBAL', 'ningún escenario generó un error de consola o de página durante toda la corrida',
  consoleErrors.length === 0, consoleErrors);

await browser.close();

console.log(`\n=== Resultado: ${pass} pruebas OK, ${fail} fallidas ===`);
if (fail > 0) { console.log('Fallidas:', failures); process.exit(1); }
process.exit(0);
