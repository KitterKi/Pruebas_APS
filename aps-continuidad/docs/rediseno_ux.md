# Rediseño de APS Continuidad — diagnóstico, direcciones y decisión

Este documento cubre las fases 1 a 4 del rediseño pedido en noviembre de 2026: diagnóstico UX de la versión anterior, dos propuestas de dirección visual, y la dirección elegida con su justificación. La fase 5 (implementación) y 6 (evaluación visual real) se documentan en `docs/sistema_diseno.md`.

**Herramientas usadas:** skill `frontend-design` (Anthropic) para la dirección visual y de tipografía; Chromium + Playwright (preinstalados en el entorno) vía scripts Node para abrir la aplicación real y capturar pantallas — no se afirma ninguna observación visual sin una captura real que la respalde. **La skill "Impeccable" solicitada no está instalada en esta cuenta**; no se usó.

---

## Fase 1 — Diagnóstico UX de la versión anterior

Capturas reales tomadas con Playwright (`/tmp/.../scratchpad/redesign/before_*.png`, desktop 1440px y tablet 834px, las 5 pestañas) antes de escribir este diagnóstico.

### Lo que confirman las capturas

1. **Jerarquía plana.** Las 9 tarjetas KPI de "Resumen" tienen idéntico tamaño, radio, sombra y peso — no hay forma de saber, de un vistazo, cuál de los 9 números es el que importa hoy. El mismo problema se repite en "Fuentes" (16 filas de texto con el mismo peso) y en el simulador (tres secciones numeradas sin distinción visual entre el control que se puede tocar y el texto que solo explica).
2. **Densidad de texto compitiendo con los datos.** Cada tarjeta mezcla número, definición metodológica y advertencia en el mismo bloque de texto gris pequeño — la cautela metodológica (correcta y necesaria) termina compitiendo visualmente con el hallazgo mismo, en vez de estar subordinada a él.
3. **Un bug real de corte de contenido.** En "Continuidad & comparación", las etiquetas del gráfico de estados ("Ingresados al PSCV", "Rama B · tuvieron ≥1 episodio…") se dibujan con `text-anchor:end` ancladas a x=120 dentro de un `viewBox` que no les da espacio: el texto se corta contra el borde izquierdo del SVG ("…sistencia rescatada", "…lida de seguimiento" en las capturas). Nadie lo vio porque la auditoría metodológica anterior no incluyó una inspección visual real — esta vez sí la tuvo.
4. **Navegación por tipo de contenido, no por pregunta.** Las pestañas se llaman "Resumen / Trayectorias / Continuidad & comparación / Simulador / Fuentes" — nombres que describen qué widget hay adentro, no qué pregunta permiten responder. Un investigador que llega preguntándose "¿dónde se concentra la pérdida?" no tiene pista de en cuál pestaña está esa respuesta.
5. **Sin ruta de profundización.** No existe un camino de "veo algo raro en el resumen → quiero ver los casos que lo explican". Las vistas son silos: seleccionar un establecimiento en "Comparación" no filtra nada en "Trayectorias".
6. **Estética de dashboard genérico.** Tarjetas redondeadas idénticas, una sola tipografía de títulos (Space Grotesk) aplicada indiscriminadamente, acento violeta del banner "DATOS SINTÉTICOS" compitiendo con el acento azul-verde del resto — exactamente el patrón "SaaS card kit" que la guía de diseño pide evitar.

### Preguntas que la interfaz anterior no permite responder, por perfil

| Perfil | Pregunta que necesita responder | ¿La interfaz anterior lo permite? |
|---|---|---|
| Investigador en salud pública | ¿En qué mes del seguimiento se concentran las inasistencias, no solo cuántas hay en total? | No. Solo hay un embudo acumulado al cierre de la ventana, sin eje temporal de cuándo ocurre cada transición. |
| Investigador | A partir de un hallazgo agregado, ¿qué trayectorias individuales lo explican? | No. No hay enlace entre "Comparación" y "Trayectorias"; hay que buscar pacientes manualmente sin ningún criterio sugerido. |
| Profesional de CESFAM | De las inasistencias, ¿cuáles son administrativas (sin cupos, error de agenda) y cuáles no se sabe? | Parcialmente — la categoría existe en el código (`EVENT_META.cat`) desde la fase anterior, pero la versión visual publicada no la muestra en ningún lugar visible de forma prominente. |
| Profesional de CESFAM | ¿Qué pasa con un paciente después de un evento adverso — vuelve o no? | Sí, pero enterrado en la cronología de texto de un paciente a la vez; no hay vista agregada de "qué fracción de los rescates post-evento funciona". |
| Gestor sanitario | ¿La diferencia entre establecimientos es evidencia de algo real o un artefacto del generador? | Se dice en texto ("son ficticios y arbitrarios"), pero la tabla se presenta con el mismo formato serio de una tabla de resultados reales — el diseño no refuerza la advertencia. |
| Gestor sanitario | ¿Qué le puedo mostrar a alguien en 2 minutos sin que confunda correlación con causalidad? | No hay una vista "de una sola pantalla, para comunicar" — todo exige leer varias tarjetas de texto para llegar a la cautela. |

---

## Fase 3/4 — Dos direcciones visuales

Prototipos de la vista principal de cada dirección, construidos con los números reales de la cohorte (no inventados), capturados con Playwright a 1440px:

- **Dirección A — Observatorio epidemiológico:** `concept_A_observatorio.png`
- **Dirección B — Laboratorio de trayectorias:** `concept_B_laboratorio.png`

### A — Observatorio epidemiológico

Editorial, tipografía serif de despliegue (titulares) + sans de apoyo, paleta papel/tinta (sin el cliché crema+terracota), una columna de lectura con hallazgos numerados en prosa ("Primer hallazgo", "Segundo hallazgo"...), cada uno con su cifra, su explicación y su advertencia metodológica integrada en el mismo párrafo en vez de en una caja aparte. Pensado para comunicar un resultado ya encontrado.

**Fortalezas:** jerarquía clara por construcción (un hallazgo a la vez), la cautela metodológica queda dentro de la misma oración que el hallazgo (no se puede leer uno sin el otro), se lee en 90 segundos.
**Debilidades:** no tiene dónde meter exploración interactiva (filtros, selección de pacientes, simulador) sin romper el tono de "artículo ya escrito"; sirve mejor para el gestor que para el investigador que quiere tocar los datos.

### B — Laboratorio de trayectorias

Consola analítica: riel izquierdo de navegación organizado por pregunta ("¿cuánta pérdida hay? / ¿dónde ocurre? / ¿cómo es un caso? / ¿quién difiere? / ¿el sistema o el centro? / ¿y si cambiamos X? / ¿qué es real?"), franja compacta de métricas (no tarjetas gigantes), panel principal con visualizaciones especializadas (matriz de estado mes a mes en vez de un embudo estático) y un panel de "caso seleccionado" siempre visible para cruzar lo agregado con lo individual. Tipografía sans para texto + monoespaciada para datos/IDs — funcional, no decorativa.

**Fortalezas:** la navegación por pregunta resuelve directamente el hallazgo 4 del diagnóstico; el panel de caso siempre visible resuelve el hallazgo 5 (de agregado a individual sin cambiar de pantalla); la matriz mes-a-mes responde la pregunta del investigador que el embudo no podía.
**Debilidades:** más denso visualmente; sin disciplina tipográfica se puede volver frío; necesita el mismo cuidado de "un hallazgo, una cautela" de la dirección A o pierde la ventaja sobre el dashboard genérico.

### Comparación

| Criterio | A — Observatorio | B — Laboratorio |
|---|---|---|
| Claridad de un hallazgo puntual | Alta | Media |
| Utilidad investigativa (explorar, comparar, profundizar) | Baja — es de lectura, no de exploración | Alta |
| Densidad informativa manejable | Alta (una idea a la vez) | Requiere disciplina para no saturar |
| Navegación por pregunta | Implícita en el orden de lectura | Explícita en el riel |
| Facilidad para pasar de agregado a individual | No tiene mecanismo | Tiene el panel de caso integrado |
| Ajuste a "sesión de 30 min, salir con mejor pregunta" | Parcial (da respuestas, no genera preguntas nuevas) | Alto |

### Decisión

**Dirección principal: B — Laboratorio de trayectorias**, porque el objetivo explícito del encargo ("un investigador que use la herramienta 30 minutos y salga con una pregunta mejor formulada") es un objetivo de exploración, no de lectura de un informe ya cerrado — y es además la dirección que mejor aprovecha lo que esta aplicación ya hace bien (trayectorias individuales, filtros, simulador) en vez de descartarlo.

**Elementos integrados desde A** (la consigna permite mezclar):
- El patrón "un hallazgo, una frase, una cautela en la misma oración" de A reemplaza las cajas de advertencia separadas de la versión anterior, dentro de cada panel de B.
- El criterio tipográfico editorial de A (un titular con peso real, no una etiqueta en mayúsculas) se usa para el encabezado de cada sección de B, evitando que la consola se sienta puramente técnica/fría.
- La restricción de paleta de A (pocos colores, con intención, sin gradientes) se aplica a B en vez de la paleta más ilustrativa de los bocetos.

---

## Nueva arquitectura de información (fase 2)

Organizada por pregunta, no por tipo de gráfico, con exploración progresiva de izquierda a derecha / de arriba hacia abajo dentro de cada pantalla:

```
EXPLORAR
 ├─ Visión general      "¿cuánta pérdida hay, y está creciendo?"        [entrada]
 ├─ Transiciones        "¿en qué momento del seguimiento ocurre?"       [profundizar]
 └─ Trayectorias        "¿cómo es, caso por caso?"                     [profundizar individual]
COMPARAR
 ├─ Cohortes            "¿qué grupo de pacientes difiere, y en qué?"
 └─ Establecimientos    "¿es el sistema o es el centro (ficticio)?"
INTERPRETAR
 ├─ Simulador           "¿y si cambiara X? (supuesto explícito, no evidencia)"
 └─ Supuestos y fuentes "¿qué de esto es real y qué es un parámetro inventado?"
```

Esto reemplaza las 5 pestañas anteriores (Resumen / Trayectorias / Continuidad & comparación / Simulador / Fuentes) por 7 destinos agrupados en 3 bloques de intención (Explorar → Comparar → Interpretar), con "Trayectorias" promovida a poder recibir un paciente preseleccionado desde cualquier otra vista (ver `docs/sistema_diseno.md`, sección de navegación cruzada) — resolviendo el hallazgo 5 del diagnóstico.

No se creó una pantalla independiente para cada una de las 8 capacidades pedidas por el encargo: "diferenciar factores del sistema vs. del paciente" vive dentro de Transiciones y Trayectorias (etiqueta clínico/administrativo/contacto en cada evento); "formular hipótesis sobre intervenciones" vive en Simulador; "examinar evidencia y supuestos" vive en Supuestos y fuentes — tal como pide el encargo, "no todas estas capacidades necesitan una pantalla independiente".
