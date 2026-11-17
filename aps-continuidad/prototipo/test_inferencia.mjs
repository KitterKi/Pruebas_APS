#!/usr/bin/env node
// Pruebas del módulo de inferencia (prototipo/inferencia.mjs): a partir de
// registros crudos ficticios (docs/esquema_datos_crudos.md), verifica que la
// secuencia de tipos de evento inferida es la esperada. No usa Playwright —
// es lógica pura, se prueba directo en Node.

import { inferirEventos, aMesesRelativos, MISS_THRESHOLD } from './inferencia.mjs';

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok  -', name); }
  else { fail++; failures.push(name); console.log(' FAIL -', name, extra !== undefined ? JSON.stringify(extra) : ''); }
}
function tipos(events) { return events.map(e => e.tipo); }

console.log('=== APS Continuidad — pruebas de inferencia (registros crudos -> eventos) ===\n');
console.log('MISS_THRESHOLD =', MISS_THRESHOLD, '(mismo umbral que el generador sintético)\n');

/* ---- F1: continuidad regular ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-10',
    controlesProgramados: [
      { fechaProgramada: '2026-01-10', fechaAtencion: '2026-01-10', compensado: false },
      { fechaProgramada: '2026-04-10', fechaAtencion: '2026-04-10', compensado: true },
      { fechaProgramada: '2026-07-10', fechaAtencion: '2026-07-12', compensado: true },
    ],
  };
  const ev = inferirEventos(p);
  check('F1 continuidad regular: secuencia de tipos', JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','control','control']), tipos(ev));
  check('F1: compensado se preserva en cada control', ev.filter(e=>e.tipo==='control').every((e,i)=>e.compensado===[false,true,true][i]));
}

/* ---- F2: una inasistencia, contacto logrado, retoma control (rescate exitoso) ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-05',
    controlesProgramados: [
      { fechaProgramada: '2026-01-05', fechaAtencion: '2026-01-05', compensado: false },
      { fechaProgramada: '2026-04-05', fechaAtencion: null },
      { fechaProgramada: '2026-07-05', fechaAtencion: '2026-07-05', compensado: true },
    ],
    contactosRescate: [
      { controlProgramadoFecha: '2026-04-05', fechaContacto: '2026-04-12', seLogroContacto: true, resultado: 'retoma_control' },
    ],
  };
  const ev = inferirEventos(p);
  check('F2 rescate exitoso tras 1 inasistencia: no llega a "perdido"',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','no_asistio','rescate_exitoso','control']), tipos(ev));
}

/* ---- F3: dos inasistencias consecutivas sin rescate -> perdido ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: false },
      { fechaProgramada: '2026-04-01', fechaAtencion: null },
      { fechaProgramada: '2026-07-01', fechaAtencion: null },
    ],
    contactosRescate: [
      { controlProgramadoFecha: '2026-04-01', fechaContacto: '2026-04-08', seLogroContacto: true, resultado: 'no_retoma' },
      { controlProgramadoFecha: '2026-07-01', fechaContacto: '2026-07-08', seLogroContacto: true, resultado: 'no_retoma' },
    ],
  };
  const ev = inferirEventos(p);
  check('F3 dos inasistencias con rescate fallido: entra en "perdido"',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','no_asistio','rescate_fallido','no_asistio','rescate_fallido','perdido']), tipos(ev));
}

/* ---- F4: contacto fallido (sin respuesta) distinto de rescate fallido ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: true },
      { fechaProgramada: '2026-04-01', fechaAtencion: null },
      { fechaProgramada: '2026-07-01', fechaAtencion: null },
    ],
    contactosRescate: [
      { controlProgramadoFecha: '2026-04-01', fechaContacto: '2026-04-08', seLogroContacto: false },
      { controlProgramadoFecha: '2026-07-01', fechaContacto: '2026-07-08', seLogroContacto: false },
    ],
  };
  const ev = inferirEventos(p);
  check('F4 contacto sin respuesta se distingue de rescate_fallido, y también lleva a "perdido"',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','no_asistio','contacto_fallido','no_asistio','contacto_fallido','perdido']), tipos(ev));
}

/* ---- F5: cancelación administrativa no cuenta como inasistencia ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: false },
      { fechaProgramada: '2026-04-01', fechaAtencion: null },
      { fechaProgramada: '2026-05-01', fechaAtencion: '2026-05-01', compensado: true },
    ],
    cancelacionesEstablecimiento: [
      { controlAfectadoFecha: '2026-04-01', fechaCancelacion: '2026-03-28' },
    ],
  };
  const ev = inferirEventos(p);
  check('F5 cancelación del establecimiento se etiqueta distinto y no cuenta para el umbral de pérdida',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','cancelado_establecimiento','control']), tipos(ev));
}

/* ---- F6: urgencia SIN pérdida previa (paciente con buena continuidad) ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: true },
      { fechaProgramada: '2026-04-01', fechaAtencion: '2026-04-01', compensado: true },
    ],
    eventosClinicos: [
      { fecha: '2026-02-15', tipo: 'urgencia' },
    ],
  };
  const ev = inferirEventos(p);
  check('F6 urgencia sin pérdida previa: NO genera reingreso_post_evento (no estaba perdido)',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','urgencia','control']), tipos(ev));
}

/* ---- F7: pérdida -> hospitalización -> reingreso_post_evento ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: false },
      { fechaProgramada: '2026-04-01', fechaAtencion: null },
      { fechaProgramada: '2026-07-01', fechaAtencion: null },
      { fechaProgramada: '2026-11-01', fechaAtencion: '2026-11-05', compensado: true },
    ],
    contactosRescate: [
      { controlProgramadoFecha: '2026-04-01', fechaContacto: '2026-04-08', seLogroContacto: true, resultado: 'no_retoma' },
      { controlProgramadoFecha: '2026-07-01', fechaContacto: '2026-07-08', seLogroContacto: true, resultado: 'no_retoma' },
    ],
    eventosClinicos: [
      { fecha: '2026-09-20', tipo: 'hospitalizacion' },
    ],
  };
  const ev = inferirEventos(p);
  check('F7 hospitalización estando perdido, con control posterior: cierra el episodio con reingreso_post_evento',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','no_asistio','rescate_fallido','no_asistio','rescate_fallido','perdido','hospitalizacion','reingreso_post_evento','control']), tipos(ev));
}

/* ---- F8: egreso por defunción ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: false },
      { fechaProgramada: '2026-04-01', fechaAtencion: '2026-04-01', compensado: true },
    ],
    eventosClinicos: [
      { fecha: '2026-05-20', tipo: 'hospitalizacion' },
      { fecha: '2026-05-25', tipo: 'egreso_defuncion' },
    ],
  };
  const ev = inferirEventos(p);
  check('F8 egreso por defunción: se registra tal cual, cierra la trayectoria',
    JSON.stringify(tipos(ev)) === JSON.stringify(['ingreso','control','control','hospitalizacion','egreso_defuncion']), tipos(ev));
}

/* ---- F9: aMesesRelativos produce el mismo tipo de estructura que usa la UI ---- */
{
  const p = {
    fechaIngresoPSCV: '2026-01-01',
    controlesProgramados: [
      { fechaProgramada: '2026-01-01', fechaAtencion: '2026-01-01', compensado: false },
      { fechaProgramada: '2026-04-01', fechaAtencion: '2026-04-02', compensado: true },
    ],
  };
  const ev = inferirEventos(p);
  const rel = aMesesRelativos(ev, p.fechaIngresoPSCV);
  check('F9 aMesesRelativos: el primer evento (ingreso) cae en el mes 0', rel[0].month === 0, rel[0]);
  const controlAbril = rel.find(e => e.fecha === '2026-04-02');
  check('F9 aMesesRelativos: el control de abril cae 3 meses después del ingreso de enero', controlAbril && controlAbril.month === 3, controlAbril);
  check('F9 aMesesRelativos: cada evento conserva su "tipo" original además del "month"', rel.every(e => typeof e.tipo === 'string'));
}

console.log('\n=== Resultado: ' + pass + ' pruebas OK, ' + fail + ' fallidas ===');
if (fail > 0) { console.log('Fallidas:', failures); process.exit(1); }
process.exit(0);
