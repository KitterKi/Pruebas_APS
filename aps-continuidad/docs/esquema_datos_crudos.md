# Esquema de datos crudos asumido (supuesto, a validar con datos reales)

**Por qué existe este documento:** hasta ahora, "trayectoria de un paciente" en este proyecto significaba una lista de eventos ya etiquetados (`control`, `no_asistio`, `perdido`, `rescate_exitoso`...) — producidos por el generador sintético o escritos a mano en los escenarios de prueba. Un CESFAM real no entrega datos así: entrega registros crudos de citas, contactos y eventos clínicos, fecha por fecha. Este documento define la estructura cruda que `prototipo/inferencia.mjs` espera recibir, **inventada por el equipo a falta de un ejemplo real** (ver conversación de esta fase: aún no hay acceso a un export de Rayen ni a una planilla REM-P llenada). Cuando aparezca un ejemplo real, este esquema se ajusta — no al revés.

## Por paciente

```
{
  pacienteId: string,
  fechaIngresoPSCV: "YYYY-MM-DD",   // fecha de diagnóstico/ingreso al programa

  controlesProgramados: [
    { fechaProgramada: "YYYY-MM-DD",
      fechaAtencion: "YYYY-MM-DD" | null,   // null = no asistió
      compensado: true | false | null },    // null si no asistió o no se evaluó
    ...
  ],

  contactosRescate: [
    { controlProgramadoFecha: "YYYY-MM-DD", // a qué control se refiere el contacto
      fechaContacto: "YYYY-MM-DD",
      seLogroContacto: true | false,
      resultado: "retoma_control" | "no_retoma" | null }, // null si seLogroContacto=false
    ...
  ],

  cancelacionesEstablecimiento: [
    { controlAfectadoFecha: "YYYY-MM-DD", fechaCancelacion: "YYYY-MM-DD" },
    ...
  ],

  eventosClinicos: [
    { fecha: "YYYY-MM-DD",
      tipo: "urgencia" | "hospitalizacion" | "derivacion_especialidad"
          | "derivacion_establecimiento" | "egreso_defuncion" | "egreso_traslado" },
    ...
  ],

  sector: string | null,  // sector/equipo interno del CESFAM, si existe en el dato real
}
```

## Supuestos explícitos de este esquema (todos a validar)

1. **Una fila por control programado**, con su fecha de atención real si hubo. Un CESFAM real podría registrar esto distinto (por ejemplo, solo las atenciones realizadas, sin dejar constancia de las citadas-y-no-asistidas como filas propias) — si es así, `controlesProgramados` tendría que reconstruirse a partir de la agenda, no de la ficha clínica.
2. **Se distingue `seLogroContacto` de `resultado`**, para separar "no contestó" (evento de contacto, no decisión del paciente) de "contestó pero no retomó" — esta distinción es un supuesto de diseño de este proyecto (ver `docs/modelo_trayectoria_aps.md`, pregunta 5 para CESFAM), no una confirmación de que el sistema real registre esto así.
3. **Las cancelaciones administrativas son un registro aparte**, no una inasistencia con un motivo. Si en la práctica se registran igual (como inasistencia, sin distinguir causa), la inferencia no podrá separarlas y ese es un límite real de los datos, no de este código.
4. **`eventosClinicos` es una lista plana** sin indicar si el evento clínico ocurrió estando el paciente "perdido" o no — eso lo decide la inferencia, no el dato crudo, replicando la misma idea de "no asumir causalidad por diseño" de la auditoría anterior.
5. **No se modela compensación fuera de un control asistido** (por ejemplo, un valor de presión arterial tomado en box de enfermería sin control médico) — si eso existe como fuente de datos separada, este esquema no la cubre todavía.

## Qué transforma `inferencia.mjs` a partir de esto

Ver `prototipo/inferencia.mjs` y sus pruebas en `prototipo/test_inferencia.mjs` (12/12 pasando). La función principal, `inferirEventos(paciente)`, produce la misma lista de eventos (`{fecha, tipo, compensado?}`) que ya consumen `prototipo/index.html` y `prototipo/test_trayectorias.mjs`, más una función `aMesesRelativos()` que convierte fechas reales en el índice de "mes desde el ingreso" que usa la interfaz actual. **Esta capa todavía no está conectada a la interfaz** — es el siguiente incremento, una vez que esta lógica esté validada por sí sola (o, idealmente, contra un ejemplo real).

### Bug real encontrado por las propias pruebas, antes de conectar nada

La primera versión procesaba los controles programados y los eventos clínicos en **dos pasadas separadas** (todos los controles, después todos los eventos clínicos). El escenario de prueba F7 (pérdida de seguimiento → hospitalización → control posterior) detectó que esto generaba un evento de cierre **duplicado**: un `reingreso` normal (decidido por la pasada de controles, que no sabía que había ocurrido una hospitalización en el camino) y además un `reingreso_post_evento` (decidido por la pasada de eventos clínicos). Es el mismo tipo de error — mantener el estado del paciente en dos pasadas que no se comunican entre sí — que ya había aparecido una vez en el generador sintético (`docs/auditoria_metodologica.md`, hallazgo H5). Se corrigió reescribiendo `inferirEventos` como una única pasada cronológica sobre todos los registros crudos mezclados, igual que se hizo entonces con el generador.
