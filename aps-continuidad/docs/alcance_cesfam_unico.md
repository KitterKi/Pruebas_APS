# Decisión de alcance: un único CESFAM ficticio con sectores internos

**Fecha:** 17 de noviembre de 2026. Cambia el marco narrativo del prototipo, no su lógica.

## Qué se decidió

A partir de ahora, la cohorte sintética representa **un solo CESFAM ficticio**, organizado en **6 sectores/equipos internos** (A–F), en vez de 6 establecimientos distintos. El motivo: de cara a la validación con profesionales de APS (ver `docs/modelo_trayectoria_aps.md`, sección 8), es más fácil para un equipo real reconocerse en "los sectores de nuestro propio CESFAM" que en una comparación entre 6 centros ficticios cuyas diferencias son, por diseño, arbitrarias.

## Qué cambió y qué no

**Cambió (solo texto e identidad, en `prototipo/index.html`):**
- Los nombres de `ESTAB` pasaron de "Establecimiento ficticio A–F" a "Sector A–F".
- La pestaña antes llamada "Establecimientos" ahora se llama "Sectores", con su pregunta rectora actualizada ("¿es el sistema o es el sector/equipo?").
- Todos los textos de apoyo (Visión general, Transiciones, Sectores, Fuentes, franja de datos sintéticos) se reescribieron para dejar explícito que se trata de un único CESFAM, no de varios centros.
- El riel de navegación ahora identifica el proyecto como "CESFAM ficticio único · PSCV · hipertensión".

**No cambió:**
- Ningún número, probabilidad ni fórmula del generador (`MODEL START…MODEL END`). Los 6 grupos internos siguen existiendo con los mismos parámetros arbitrarios de antes — el cambio es de marco narrativo, no de modelo.
- Las 33 pruebas de `test_generador.mjs` y las 73 de `test_trayectorias.mjs` — todas revisadas y en verde tras el cambio.
- La capacidad de comparación entre grupos (vista "Sectores", mapa de calor de "Transiciones"): se conserva, solo que ahora compara sectores de un mismo centro en vez de centros distintos, que era la alternativa que se descartó explícitamente (ver conversación de esta fase) para no perder esa capacidad investigativa.

## Alternativa descartada

Eliminar la subdivisión por completo y simular un único CESFAM sin desglose interno. Se descartó porque habría quitado la posibilidad de comparar grupos dentro de la herramienta, que es una de las preguntas de investigación que el rediseño de noviembre (`docs/rediseno_ux.md`) buscó habilitar explícitamente.
