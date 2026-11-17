# Sistema de diseño — APS Continuidad (rediseño noviembre 2026)

Continúa de `docs/rediseno_ux.md` (diagnóstico, dos direcciones, decisión). Este documento cubre la fase 5 (implementación) y la fase 6 (evaluación visual real con Playwright) del rediseño pedido.

**Herramientas realmente usadas:** skill `frontend-design` (Anthropic), Chromium + Playwright preinstalados (vía Node, sin skill dedicada). **La skill "Impeccable" no está instalada en esta cuenta y no se usó.**

---

## Tokens

```
--bg:#eef0ec        fondo general (papel frío, no el crema+terracota genérico)
--panel:#ffffff     superficie de panel
--panel-2:#f4f5f1   superficie secundaria (filas de tabla, celda hero)
--line:#d7d9d0      bordes y reglas
--ink:#14181a       texto principal
--ink-soft:#565b52  texto secundario / metadatos
--accent:#2c5c5e    acento primario (verde-azulado desaturado, no el azul SaaS genérico)
--accent2:#8a5a24   acento secundario (ámbar tierra, para rescate/contacto)
--good / --warn / --bad   semántico, independiente del acento
--syn:#5b4a7a       morado — exclusivo para la advertencia de datos sintéticos
```

Cada color tiene su versión dark-mode (bloque `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]`), verificada con una captura real en modo oscuro (`dark_transiciones.png`) — no solo declarada.

**Tipografía:** `Source Serif 4` (titulares, voz editorial — hereda la dirección "Observatorio") + `IBM Plex Sans` (cuerpo e interfaz) + `IBM Plex Mono` (todo dato: cifras, IDs de paciente, meses de un eje, tablas numéricas). Esta combinación reemplaza la pareja genérica Space Grotesk + Inter de la versión anterior y no es la que la skill de diseño marca como clúster de IA genérica (crema+serif+terracota, SaaS card kit, etc.).

**Layout:** riel de navegación fijo a la izquierda (238px, colapsa a fila horizontal bajo 860px) organizado por pregunta en 3 grupos (Explorar / Comparar / Interpretar) en vez de pestañas por tipo de contenido. Patrón editorial repetido en cada sección: pregunta (`.q`, pequeña, color de acento) → titular (`h2`, serif) → párrafo de hallazgo (`.lede`) → visualización → cautela metodológica integrada (`.caveat`, con borde izquierdo, nunca una caja separada que compita visualmente).

**Qué se evitó explícitamente** (lista de la skill de diseño, verificada contra el resultado): sin tarjetas KPI idénticas repetidas (reemplazadas por `.mstrip`, una franja con un solo borde compartido); sin degradados ni sombras; sin radios de borde grandes (radio 0 en todo el sistema); sin iconos decorativos de color; sin eyebrows en mayúsculas sostenidas con tracking (el rótulo de pregunta usa oración normal); un solo acento de color con intención, no uno por tarjeta.

---

## Fase 5 — Qué se conservó explícitamente

Por instrucción directa, el rediseño **no tocó**:
- El bloque `MODEL START…MODEL END` del generador (semilla, probabilidades, máquina de estados) — bit a bit idéntico al auditado en `docs/auditoria_metodologica.md`.
- `prototipo/test_generador.mjs` y sus 33 pruebas — se ejecutan contra el archivo real sin modificación de su mecanismo de extracción, y siguen en 33/33 tras el rediseño (ver sección de pruebas abajo).
- La trazabilidad de fuentes (pestaña "Supuestos y fuentes") y la separación datos reales/sintéticos (franja superior, ahora más discreta pero igual de explícita en todas las vistas por ser parte del `shell`, no de una vista individual que se pueda dejar de ver).
- Las definiciones metodológicas (numerador/denominador/población elegible de cada indicador) — se reescribieron visualmente pero no numéricamente ni conceptualmente.

Lo que sí cambió, dentro de "implementar el rediseño" (fase 5), dividido en dos tipos:

**A. Solo reorganización/reestilo** (misma lógica, mismos IDs de render donde fue posible): franja de métricas, trayectorias, simulador, tabla de establecimientos, tabla de supuestos.

**B. Contenido nuevo, generado por análisis sobre los datos ya existentes** (no por cambios al generador):
1. **Vista "Transiciones"** — mapa de calor de % perdido por mes y por establecimiento (`computeMonthlyLossShareByEst()`), responde la pregunta "¿cuándo, no solo cuánto" que el embudo anterior no podía responder, y de paso elimina el bug de texto cortado que tenía ese embudo (ver hallazgo 3 de evaluación visual, abajo).
2. **Vista "Cohortes" ampliada** — además de la distribución de episodios ya existente, se agregó desglose por sexo y por tercil de edad (`renderCohortTables()`), reutilizando `computeAggregates()` sobre subconjuntos — sin esto, "Cohortes" quedaba como una sola tabla pequeña y no respondía de verdad "¿quién difiere, y cómo?".
3. **Navegación cruzada** — clic en una fila de la tabla de establecimientos, o en el nombre de un establecimiento en el mapa de calor, salta a "Trayectorias" con ese establecimiento ya filtrado (`goToTrayectoriasForEst()`). Resuelve el hallazgo 5 del diagnóstico UX (de un hallazgo agregado no había forma de llegar a los casos que lo explican).

Ningún número del generador cambió para lograr un gráfico más atractivo — toda la nueva visualización lee los mismos eventos ya generados y auditados.

---

## Fase 6 — Evaluación visual real (dos ciclos de crítica)

Capturas tomadas con Chromium vía Playwright, nunca inspeccionadas "de memoria": `before_*.png` (versión anterior, 5 pestañas × 2 viewports), `v1_*.png` (rediseño, 7 vistas × 2 viewports, repetido tras cada corrección), `dark_*.png` (verificación de tema oscuro).

### Ciclo 1 — tras la primera implementación

| # | Hallazgo | Cómo se detectó | Corrección |
|---|---|---|---|
| 1 | El mapa de calor de Transiciones se renderizaba completamente en blanco. | Captura real (`v1_desktop_transiciones.png`, primera versión) sin ninguna celda de color. | La función de mezcla de color hacía `match(/\d+/g)` sobre valores hexadecimales (`#95342a`) esperando `rgb(r,g,b)` — los dígitos quedaban cortados de forma incorrecta y el resultado era `rgb(NaN,NaN,NaN)`, inválido. Reemplazado por `color-mix(in srgb, …)` nativo del navegador. |
| 2 | Insignias de categoría (Clínico/Administrativo/Contacto) en la cronología de Trayectorias se veían sin fondo ni color — y en general, cualquier `cssVar('--border')`, `cssVar('--fg')`, `cssVar('--muted')`, `var(--surface-2)` del script quedaba resuelto a vacío. | Captura real mostrando las insignias sin estilo visible. | El rediseño renombró los tokens (`--border`→`--line`, `--fg`→`--ink`, `--muted`→`--ink-soft`, `--surface`/`--surface-2`→`--panel`/`--panel-2`) pero el script de renderizado seguía usando los nombres antiguos en varios puntos. Se agregaron alias en `:root` (`--border:var(--line)`, etc.) en vez de reescribir cada punto de uso, para minimizar el riesgo de introducir un nuevo error. |
| 3 | (Heredado de la versión anterior, confirmado de nuevo en el diagnóstico) El embudo de "Continuidad & comparación" cortaba su propio texto contra el borde del SVG. | Captura real de la versión anterior (`before_desktop_comparacion.png`). | Resuelto por reemplazo: el embudo se eliminó por completo y su información (episodios por paciente) se conserva en la nueva vista "Cohortes"; el mapa de calor de "Transiciones" cubre la pregunta que el embudo pretendía responder, sin texto SVG libre que pueda recortarse. |

### Ciclo 2 — tras las correcciones del ciclo 1

| # | Hallazgo | Corrección |
|---|---|---|
| 4 | En la tabla de Establecimientos (y en la de episodios), los encabezados de columnas numéricas quedaban alineados a la izquierda mientras los valores se alineaban a la derecha — desalineación vertical visible entre encabezado y dato. | Se agregó `class="num"` a los `<th>` correspondientes y una regla `table.cmp th.num{text-align:right}`, en vez de una regla genérica que habría desalineado la tabla de Supuestos (cuya segunda columna es texto, no numérica). |
| 5 | La vista "Cohortes" quedaba visualmente desproporcionada: una sola tabla pequeña en una pantalla completa, sin responder de verdad "quién difiere". | Se agregó el desglose por sexo y por edad descrito arriba (fase 5-B). |

Tras el ciclo 2 no se encontraron más defectos de corte de contenido, superposición o desalineación en las capturas revisadas (escritorio 1440px y tablet 834px, los 7 destinos de navegación, más una verificación en modo oscuro). Esto es una revisión visual real de dos pasadas, no una garantía exhaustiva de accesibilidad o de todos los anchos posibles.

### Qué se verificó explícitamente en cada captura

- **Legibilidad:** contraste de texto sobre fondo en ambos temas (claro revisado en todas las vistas; oscuro revisado en Transiciones y Simulador).
- **Densidad informativa:** ninguna vista repite más de dos paneles idénticos seguidos; la franja de métricas reemplazó 9 tarjetas idénticas por una franja con una sola línea divisoria.
- **Alineación:** corregida (hallazgo 4).
- **Jerarquía:** un titular serif por sección, un párrafo de hallazgo, una cautela subordinada visualmente (borde izquierdo fino, no una caja con el mismo peso que el hallazgo).
- **Filtros y navegación:** se probó el clic en una fila de Establecimientos y en un nombre de establecimiento del mapa de calor — ambos saltan a Trayectorias con el filtro ya aplicado (confirmado leyendo el DOM resultante en el script de captura, no solo visualmente).
- **Estados interactivos:** el enlace activo del riel usa `aria-current="true"` con un color y un borde distintos, visibles en las capturas.
- **Ausencia de contenido cortado o superpuesto:** confirmada visualmente tras el ciclo 2 en los anchos probados.
- **Accesibilidad:** se mantuvieron `aria-current`, `:focus-visible` con outline visible, y `prefers-color-scheme`; no se realizó una auditoría de accesibilidad formal (lector de pantalla, navegación por teclado completa) — queda pendiente si se requiere para una entrega posterior.

---

## Resultados de pruebas técnicas

```
$ node prototipo/test_generador.mjs
=== Resultado: 33 pruebas OK, 0 fallidas ===
```

Ejecutado después de cada edición de esta fase (verificación de sintaxis `node --check` sobre el script extraído + batería completa) — el generador auditado en noviembre no cambió.

**No se ejecutó** la suite funcional de Trayectorias (`test_trayectorias.mjs`) prevista en la fase de modelo de trayectoria asistencial: ese trabajo quedó pausado a mitad de camino cuando llegó la solicitud de rediseño (ver `docs/modelo_trayectoria_aps.md`, pendiente de completar). El gancho de pruebas `window.__APS_TEST__` sigue presente y sin usar en este archivo.

---

## Pendientes explícitos de esta fase

1. Completar `docs/modelo_trayectoria_aps.md` (investigación de orientaciones técnicas PSCV/HEARTS, mapa formal de trayectoria, 10–15 escenarios sintéticos, pruebas funcionales de Trayectorias, preguntas para profesionales CESFAM) — pausado por esta solicitud de rediseño, no abandonado.
2. Auditoría de accesibilidad formal (lector de pantalla, navegación completa por teclado) no realizada.
3. El mapa de calor de "Transiciones" usa una escala de color relativa al rango observado en esta cohorte sintética — con datos reales habría que decidir si esa escala debe ser relativa o fija a un umbral clínico.
