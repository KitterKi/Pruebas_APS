// Capa de inferencia: transforma registros crudos (docs/esquema_datos_crudos.md)
// en la misma lista de eventos {fecha, tipo, compensado?} que ya consumen
// prototipo/index.html (vista Trayectorias) y prototipo/test_trayectorias.mjs.
//
// No depende de nada del navegador (sin `document`/`window`) ni del bloque
// MODEL del generador sintético — es un módulo independiente, pensado para
// correr tanto en Node (pruebas, carga de archivos) como en el navegador
// más adelante, cuando se conecte a la interfaz.
//
// Diseño: UNA sola pasada cronológica sobre todos los registros crudos
// mezclados (controles, contactos, cancelaciones, eventos clínicos),
// manteniendo el estado (perdido/no perdido, inasistencias consecutivas) a
// medida que se avanza en el tiempo. La primera versión de este módulo
// procesaba los controles y los eventos clínicos en dos pasadas separadas
// (primero todos los controles, después todos los eventos clínicos) y eso
// producía duplicados: un control posterior a una hospitalización-estando-
// perdido generaba tanto un "reingreso" (desde la pasada de controles, que
// no sabía del evento clínico) como un "reingreso_post_evento" (desde la
// pasada de eventos clínicos) — el mismo tipo de error de dos fases que ya
// había aparecido una vez en el generador sintético (ver
// docs/auditoria_metodologica.md, hallazgo H5). Las pruebas de
// test_inferencia.mjs (F7) lo detectaron aquí también antes de que este
// módulo se conectara a nada.
//
// Reglas de inferencia, todas documentadas como supuestos en
// docs/esquema_datos_crudos.md — NINGUNA está validada con datos reales:
//
//  1. El primer evento es siempre `ingreso`, en `fechaIngresoPSCV`.
//  2. Un control con `fechaAtencion` -> evento `control` (con `compensado`).
//  3. Un control sin `fechaAtencion` y SIN cancelación asociada -> `no_asistio`,
//     e incrementa el contador de inasistencias consecutivas.
//  4. Un control sin `fechaAtencion` y CON cancelación asociada -> evento
//     `cancelado_establecimiento` en vez de `no_asistio` — no cuenta para el
//     umbral de pérdida (es una interrupción administrativa, no del paciente).
//  5. Cada contacto de rescate asociado a una inasistencia produce
//     `contacto_fallido` (si `seLogroContacto` es false) o `rescate_exitoso`/
//     `rescate_fallido` (si fue true, según `resultado`).
//  6. El paciente entra en estado "perdido" (evento `perdido`) cuando acumula
//     MISS_THRESHOLD inasistencias consecutivas sin un rescate exitoso — mismo
//     umbral que usa el generador sintético (prototipo/index.html,
//     MISS_THRESHOLD), para que ambas fuentes de datos compartan la misma
//     definición operacional. Si una inasistencia no tiene ningún contacto de
//     rescate asociado, la decisión se toma en el momento de la inasistencia
//     misma; si tiene uno o más, se toma al procesar el último de ellos.
//  7. Estando "perdido": un control asistido cierra el episodio con
//     `reingreso` (o `reingreso_post_evento` si hubo una urgencia/
//     hospitalización todavía sin resolver desde que se perdió); un rescate
//     exitoso también cierra el episodio con `reingreso`.
//  8. `derivacion_especialidad`, `derivacion_establecimiento`,
//     `egreso_defuncion` y `egreso_traslado` se insertan tal cual vienen en
//     `eventosClinicos`; los dos egresos detienen el procesamiento de
//     registros posteriores (cierran la trayectoria).

export const MISS_THRESHOLD = 2;

/** Meses completos transcurridos entre dos fechas ISO (calendario, no de 30 días fijos). */
function monthsBetween(fromISO, toISO) {
  const from = new Date(fromISO), to = new Date(toISO);
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
}

/**
 * Convierte una lista de eventos con fechas ISO en la forma {month, ...} que
 * usa la interfaz actual (mes relativo al ingreso, 0-indexado).
 */
export function aMesesRelativos(events, fechaIngresoPSCV) {
  return events
    .map(e => ({ ...e, month: Math.max(0, monthsBetween(fechaIngresoPSCV, e.fecha)) }))
    .sort((a, b) => a.month - b.month || a.fecha.localeCompare(b.fecha));
}

/**
 * Reconstruye la cronología de eventos de UN paciente a partir de sus
 * registros crudos (ver docs/esquema_datos_crudos.md). Devuelve eventos con
 * fechas ISO reales, sin convertir a mes relativo — usa aMesesRelativos()
 * para eso.
 */
export function inferirEventos(paciente) {
  const {
    fechaIngresoPSCV,
    controlesProgramados = [],
    contactosRescate = [],
    cancelacionesEstablecimiento = [],
    eventosClinicos = [],
  } = paciente;

  if (!fechaIngresoPSCV) throw new Error('inferirEventos: falta fechaIngresoPSCV');

  const canceladasPorFecha = new Set(cancelacionesEstablecimiento.map(c => c.controlAfectadoFecha));
  const contactosPorControl = new Map();
  contactosRescate.forEach(c => {
    if (!contactosPorControl.has(c.controlProgramadoFecha)) contactosPorControl.set(c.controlProgramadoFecha, []);
    contactosPorControl.get(c.controlProgramadoFecha).push(c);
  });

  // Une todos los registros crudos en una sola línea de tiempo, cada uno
  // etiquetado con su "kind" (distinto de `tipo`, que es el nombre del
  // evento ya inferido que se decide al procesarlo).
  const items = [];
  controlesProgramados.forEach(c => {
    if (c.fechaAtencion) items.push({ fecha: c.fechaAtencion, kind: 'control', compensado: c.compensado ?? null });
    else if (canceladasPorFecha.has(c.fechaProgramada)) items.push({ fecha: c.fechaProgramada, kind: 'cancelado' });
    else items.push({ fecha: c.fechaProgramada, kind: 'no_asistio', controlFecha: c.fechaProgramada, tieneContacto: contactosPorControl.has(c.fechaProgramada) });
  });
  contactosRescate.forEach(ct => items.push({ fecha: ct.fechaContacto, kind: 'contacto', seLogroContacto: ct.seLogroContacto, resultado: ct.resultado }));
  eventosClinicos.forEach(ec => items.push({ fecha: ec.fecha, kind: 'clinico', tipo: ec.tipo }));
  items.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const events = [{ fecha: fechaIngresoPSCV, tipo: 'ingreso' }];
  let consecutiveMiss = 0;
  let lost = false;
  let pendingAdverseWhileLost = false; // true si hubo urgencia/hospitalización sin resolver desde que se perdió

  for (const item of items) {
    switch (item.kind) {
      case 'control': {
        if (lost) {
          events.push({ fecha: item.fecha, tipo: pendingAdverseWhileLost ? 'reingreso_post_evento' : 'reingreso' });
          lost = false; pendingAdverseWhileLost = false;
        }
        events.push({ fecha: item.fecha, tipo: 'control', compensado: item.compensado });
        consecutiveMiss = 0;
        break;
      }
      case 'cancelado': {
        events.push({ fecha: item.fecha, tipo: 'cancelado_establecimiento' });
        break; // no cuenta como inasistencia del paciente (regla 4)
      }
      case 'no_asistio': {
        events.push({ fecha: item.fecha, tipo: 'no_asistio' });
        consecutiveMiss++;
        // Si esta inasistencia no tiene ningún contacto de rescate asociado,
        // la decisión de "perdido" se toma aquí mismo (regla 6); si tiene
        // uno o más, se decide al procesar el contacto correspondiente.
        if (!item.tieneContacto && consecutiveMiss >= MISS_THRESHOLD && !lost) {
          events.push({ fecha: item.fecha, tipo: 'perdido' });
          lost = true;
        }
        break;
      }
      case 'contacto': {
        if (!item.seLogroContacto) {
          events.push({ fecha: item.fecha, tipo: 'contacto_fallido' });
          if (consecutiveMiss >= MISS_THRESHOLD && !lost) {
            events.push({ fecha: item.fecha, tipo: 'perdido' });
            lost = true;
          }
        } else if (item.resultado === 'retoma_control') {
          events.push({ fecha: item.fecha, tipo: 'rescate_exitoso' });
          consecutiveMiss = 0;
          if (lost) {
            events.push({ fecha: item.fecha, tipo: pendingAdverseWhileLost ? 'reingreso_post_evento' : 'reingreso' });
            lost = false; pendingAdverseWhileLost = false;
          }
        } else {
          events.push({ fecha: item.fecha, tipo: 'rescate_fallido' });
          if (consecutiveMiss >= MISS_THRESHOLD && !lost) {
            events.push({ fecha: item.fecha, tipo: 'perdido' });
            lost = true;
          }
        }
        break;
      }
      case 'clinico': {
        events.push({ fecha: item.fecha, tipo: item.tipo });
        if (lost && (item.tipo === 'urgencia' || item.tipo === 'hospitalizacion')) {
          pendingAdverseWhileLost = true;
        }
        if (item.tipo === 'egreso_defuncion' || item.tipo === 'egreso_traslado') {
          return events; // cierra la trayectoria: no se procesan registros posteriores
        }
        break;
      }
    }
  }

  return events;
}
