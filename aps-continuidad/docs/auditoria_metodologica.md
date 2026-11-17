# Auditoría metodológica y funcional — prototipo APS Continuidad

**Alcance:** generador sintético, fórmulas de indicadores, modelo de estados longitudinal y simulador de intervenciones del prototipo publicado en `aps-continuidad/prototipo/index.html`. No se auditó el diseño visual ni se agregaron vistas nuevas, por instrucción explícita.

**Método:** lectura íntegra del código, extracción de la lógica del generador a un script Node (`/tmp/.../audit/probe_original.js`, no versionado) para calcular cifras exactas de la versión original, formulación de hallazgos con evidencia numérica, corrección del código fuente, y verificación con una batería de pruebas automatizadas (`prototipo/test_generador.mjs`) que se ejecuta contra el código real (no una copia) extrayéndolo de `index.html`.

**Fecha:** 17 de noviembre de 2026. **Versión auditada:** la publicada antes de esta revisión (commit `e08f114`).

---

## Resumen ejecutivo

La revisión encontró **un hallazgo crítico** (una correlación presentada como si fuera un resultado, cuando en realidad era una certeza programada), **cuatro hallazgos altos** (sesgo de tiempo de seguimiento no corregido, conflación de supuestos distintos en el simulador, cita de HEARTS aplicada a un parámetro que no mide lo que HEARTS reportó, y un modelo de episodios que no evaluaba riesgo en episodios de pérdida anteriores al último) y varios hallazgos medios/bajos de definición de indicadores y nomenclatura. Todos los hallazgos críticos y altos fueron corregidos en el código; las correcciones se verificaron con 33 pruebas automatizadas que pasan sobre el código real extraído de `index.html` (0 fallos; ver sección 9).

El prototipo **sigue usando exclusivamente datos sintéticos**. Ningún número de este documento ni del prototipo describe pacientes o establecimientos reales.

---

## Clasificación de hallazgos

### 🔴 CRÍTICO

**H1 — El panel "¿Dónde aparece el riesgo?" presentaba una certeza programada como si fuera una asociación observada.**

En la versión original, los eventos de urgencia/hospitalización solo podían generarse dentro del bloque `if(lostSince !== null)` del generador — es decir, **únicamente** para pacientes que habían tenido un episodio de pérdida de seguimiento. Verificación numérica sobre la cohorte original:

```
adverseAmongNotLostPct = 0   (exactamente cero, en cualquier semilla)
```

Esto significa que el panel, que comparaba "% con evento adverso" entre quienes nunca perdieron continuidad y quienes sí, mostraba **0% por construcción matemática** para el primer grupo — no porque el generador hubiera simulado ausencia de riesgo, sino porque no existía ninguna ruta de código capaz de asignarles un evento. El panel presentaba esto junto a un texto de "correlación, no causalidad", lo cual es insuficiente: no se trataba de una correlación en absoluto, sino de una imposibilidad estructural disfrazada de hallazgo.

*Corrección aplicada:* se introdujo un riesgo mensual basal explícito y no-cero (`riskBaselinePerMonth = 0.25%/mes`) para pacientes en seguimiento regular, y un riesgo intermedio (`riskPendingPerMonth = 1%/mes`) para quienes tienen una inasistencia pendiente de rescate, manteniendo el riesgo creciente mientras el paciente está perdido (hasta 35%/mes). Verificado: `adverseAmongNotLostPct` ya es `>0` y distinto de cero en la semilla de producción y en 4 semillas adicionales de prueba (sección 9, prueba 4). Además, se agregó una nota visible en la propia tarjeta («Esto no es un hallazgo») que declara explícitamente los valores de riesgo inyectados y remite a la tabla de supuestos.

---

### 🟠 ALTO

**H2 — Sesgo de tiempo de seguimiento desigual ("immortal time") no corregido en el indicador de pérdida de continuidad.**

El ingreso de cada paciente se sorteaba uniformemente entre los meses 0 y 18 de una ventana de 24 meses. Un paciente que ingresa en el mes 17 solo tiene 3 controles trimestrales posibles antes del cierre; uno que ingresa en el mes 0 tiene 8. Como "perder seguimiento" requiere al menos 2 controles consecutivos no asistidos sin rescate, los pacientes de ingreso tardío tienen una probabilidad mecánicamente menor de ser clasificados como "perdidos", sin que eso refleje mejor desempeño clínico. Verificación numérica (versión original):

```
ingreso mes 0   | 8 controles posibles | 18.5%–37.5% de pérdida (variable por cohorte aleatoria)
ingreso mes 17  | 3 controles posibles | 4.8% de pérdida
```

El indicador `% pérdida de continuidad` se calculaba como `everLost / 420`, sin restringir la población elegible por tiempo de seguimiento disponible — exactamente lo que el punto 1 de esta auditoría pide evitar.

*Corrección aplicada:* se agregó un segundo indicador, `lostPctAdjusted`, cuyo denominador se restringe a pacientes con al menos 12 meses de seguimiento posible (`eligibleForAdjustedLostRate`), mostrado junto al indicador crudo con su `n` elegible explícito. El indicador crudo se mantiene, pero ahora rotulado como "(cruda)" con una nota que indica que no está ajustada. Verificado: el indicador ajustado difiere del crudo en la cohorte de producción y en las 4 semillas de prueba (sección 9, prueba 5).

**H3 — El simulador aplicaba el mismo factor de escala a "pérdida de continuidad" y a "eventos adversos", conflando dos supuestos distintos.**

La fórmula original era:

```js
let ratio = (1-newRescue)/(1-baseRescue);
if(toggle.checked) ratio *= 0.85;
const newLostPct   = baseLostPct   * ratio;   // mismo ratio
const newAdverse   = baseAdverse   * ratio;   // mismo ratio
```

Esto implica que "qué tan bien funciona el rescate" y "qué tanto reduce un evento adverso" son matemáticamente la misma cosa, lo cual el punto 4 de esta auditoría pide evitar explícitamente. No había forma de explorar, por ejemplo, "¿y si el rescate mejora pero eso no reduce nada los eventos adversos?".

*Corrección aplicada:* se separó el cálculo en dos pasos con un control independiente para cada uno. El paso 1 (rescate → pérdida proyectada) sigue siendo una consecuencia mecánica del propio modelo de rescate. El paso 2 (pérdida proyectada → eventos adversos proyectados) ahora depende de un segundo control explícito, "fuerza del vínculo" (`linkStrength`, slider 0×–2×, por defecto 1,0×), rotulado en la interfaz como el supuesto más especulativo del simulador y sin respaldo de ningún estudio citado. Verificado: con `linkStrength=0`, los eventos proyectados no cambian aunque el rescate mejore drásticamente (sección 9, prueba 6).

**H4 — La cita de HEARTS/Barake et al. (16%→33% de control poblacional) se usaba para justificar el valor por defecto de "efectividad de rescate", una variable que HEARTS no mide.**

El texto original decía: *"El punto de partida (38% de rescate exitoso) se inspira en el rango de mejora reportado para la estrategia HEARTS... la tasa de control poblacional de hipertensión subió de 16% a 33%."* Esto mezcla dos variables no comparables: HEARTS reportó una mejora en **compensación clínica de HTA** (un resultado de tratamiento), no en **tasa de rescate de inasistentes** (un proceso administrativo/conductual). Usar el número de HEARTS para justificar el parámetro de rescate es exactamente el tipo de extrapolación indebida que el punto 4 de esta auditoría pide evitar.

*Corrección aplicada:* se retiró la cita de HEARTS del contexto de "efectividad de rescate" y se reemplazó por Werner et al. (2023) —que sí es una revisión sistemática sobre recordatorios/rescate de inasistencia, citada con su intervalo de confianza real y amplio (OR≈1,21; IC95% 0,41–2,00), sin inflar la certeza del efecto—. La cita de HEARTS se conservó, pero movida a una sección aparte del simulador ("Compensación de hipertensión, no modificada por este simulador") con una nota explícita: *"ese resultado es sobre compensación clínica, no sobre inasistencia ni sobre urgencias/hospitalizaciones, por lo que deliberadamente no se usa como parámetro de los controles 1 y 2."*

**H5 — El modelo de episodios de pérdida no evaluaba riesgo de evento adverso en episodios anteriores al último.**

El diseño original calculaba el riesgo mensual de evento adverso en un bucle separado, ejecutado *después* de que el bucle principal (de controles trimestrales) ya hubiera terminado, usando únicamente `lostSince` (el inicio del *último* episodio de pérdida registrado). Para un paciente con dos episodios de pérdida — uno recuperado espontáneamente y otro vigente al cierre — el primer episodio nunca tenía oportunidad de generar un evento adverso, aunque el paciente efectivamente estuvo "perdido" durante esos meses. En la cohorte original esto afectaba a 2 de 420 pacientes (ejemplo verificado: `P-029`, perdido en los meses 5 y 11, con riesgo evaluado solo a partir del mes 12). El punto 2 de esta auditoría pide explícitamente un modelo capaz de representar ciclos completos, no solo el último.

*Corrección aplicada:* se reescribió el generador como un único bucle mensual (mes 0 a 23) por paciente, en el que el riesgo de evento adverso se evalúa **todos los meses, en cada episodio**, reiniciando el contador de "meses en el episodio" cada vez que se abre uno nuevo. Esto además simplificó el código (un solo mecanismo de estados en vez de dos fases desacopladas). Verificado con pruebas automatizadas que reproducen cada episodio de cada paciente con >1 episodio y confirman que cada uno se cierra correctamente antes de abrir el siguiente (sección 9, prueba 3).

---

### 🟡 MEDIO

**H6 — El embudo de continuidad usaba una metáfora visual de proceso lineal e irreversible para datos que no lo son.**

La vista "Embudo de continuidad" mostraba barras en orden decreciente sugiriendo una única secuencia de etapas ("ingresados → con control → continuidad regular → rescatados → perdidos → con evento"), cuando en realidad un paciente puede alternar entre "rescatado" y "perdido" varias veces (ver H5). Adicionalmente, existía un riesgo estructural de que la barra "continuidad regular (sin pérdida)" excediera a la barra "con al menos 1 control asistido" — ya que un paciente puede clasificarse como "nunca perdido" sin haber asistido jamás a un control (p. ej., si ingresó tarde y su único control programado fue rescatado sin visita presencial). En la cohorte original esto no llegó a invertirse (394 vs. 347), pero 7 pacientes "regulares" no tenían ningún control asistido, lo que deja la propiedad de monotonicidad dependiente del azar, no garantizada por el diseño.

*Corrección aplicada:* se reemplazó el embudo de una sola vía por dos ramas explícitas (Rama A: nunca perdieron / Rama B: perdieron alguna vez), cada una anidada correctamente respecto de su propio origen, y se agregó una tabla de "episodios de pérdida por paciente" (0, 1, 2+) que hace visibles los ciclos en lugar de ocultarlos detrás de una única cifra binaria. El texto introductorio ahora declara explícitamente que no es un proceso lineal.

**H7 — Los indicadores de "compensación" y "eventos adversos" no distinguían población de visita, ni persona de evento.**

`% controles compensados` se calculaba como `controlesCompensados / controlesAsistidos` — es decir, a nivel de **visita**, no de **persona**. Esto no equivale al indicador oficial REM-P de "población compensada", que es un corte transversal por persona. De manera similar, "Eventos adversos registrados" mostraba una cifra que en realidad era "número de pacientes con evento" (ya que el diseño original solo permitía un evento por paciente), etiquetada de forma ambigua como si fuera un conteo de eventos.

*Corrección aplicada:* se agregó un indicador a nivel de persona, `% compensados (última visita)`, calculado sobre el estado de compensación en el último control asistido de cada paciente — más comparable al indicador REM-P real — manteniendo el indicador por visita por separado y ambos rotulados explícitamente con su unidad de análisis. Los eventos adversos ahora se cuentan dos veces de forma explícita: "pacientes con ≥1 evento" y "eventos en total", ya que el generador corregido permite múltiples eventos por paciente.

**H8 — Nombres de establecimientos ficticios con connotación geográfica/tipológica (Norte, Sur, Costa, Rural).**

Los nombres "CESFAM Modelo Norte/Centro/Oriente/Sur/Costa/Rural" se asignaron a un gradiente de desempeño decreciente (el mejor desempeño a "Norte", el peor a "Rural"). Aunque los datos son sintéticos, nombrar así a un establecimiento con peor desempeño simulado puede sugerir, sin ninguna evidencia real que lo respalde, que los establecimientos rurales tienen peor continuidad — exactamente lo que el punto 5 de esta auditoría pide evitar.

*Corrección aplicada:* se renombraron los 6 establecimientos a "Establecimiento ficticio A"–"F", sin ninguna connotación geográfica o tipológica. Se agregó una nota explícita en la tarjeta de comparación: "no representan diferencias documentadas entre centros reales de ningún tipo (urbano/rural u otro)". Verificado con una prueba automatizada que falla si cualquier nombre de establecimiento contiene palabras geográficas/tipológicas de una lista predefinida (sección 9, prueba 7).

**H9 — Etiquetas de mes "mes 24" no correspondían al índice interno (0–23).**

La ventana se modela internamente con meses `0..23` (24 valores), pero algunas etiquetas decían "mes 24" refiriéndose al índice 23, y otras partes de la interfaz no aplicaban ningún desplazamiento, generando una numeración de meses inconsistente entre paneles.

*Corrección aplicada:* se introdujo un único punto de conversión (`dm(m) = m+1`) aplicado consistentemente en todos los lugares donde se muestra un número de mes al usuario (ejes de gráficos, cronología de trayectoria, encabezado de paciente), de modo que la interfaz siempre muestra meses "1" a "24" mientras el código interno sigue usando índices base-0.

**H10 — El valor inicial del control deslizante del simulador no coincidía con la tasa de rescate real de la cohorte.**

El slider de "efectividad de rescate" tenía `value="38"` fijo en el HTML, mientras que la tasa de rescate realmente simulada en la cohorte era 34,05%. Esto significaba que, al abrir el simulador por primera vez sin tocar nada, el "escenario simulado" ya mostraba un resultado distinto del "escenario actual" — rompiendo la expectativa de que la posición por defecto del control representa "sin cambios".

*Corrección aplicada:* el valor inicial del slider ahora se fija programáticamente a `Math.round(AGG.rescueRate*100)` en tiempo de carga. Verificado con una prueba automatizada que confirma que, en esa posición, la pérdida proyectada queda dentro de ±1 punto porcentual de la base (el margen restante se debe únicamente al redondeo a porcentaje entero del control, no a un error de fórmula; sección 9, prueba 6).

---

### 🟢 BAJO

**H11 — Código duplicado entre el cálculo de agregados global y el de la tabla comparativa por establecimiento**, con riesgo de que ambos cálculos divergieran silenciosamente si se modificaba uno sin el otro. *Corrección:* la tabla comparativa ahora llama a la misma función `computeAggregates()` sobre cada subconjunto de pacientes por establecimiento, en vez de repetir las fórmulas manualmente.

**H12 — Ausencia de una verificación de consistencia entre la suma de pacientes por establecimiento y el total de la cohorte.** *Corrección:* se agregó una comprobación en tiempo de ejecución que muestra una advertencia visible si ambas cifras no coinciden (nunca debería ocurrir dado que cada paciente pertenece a exactamente un establecimiento, pero queda como salvaguarda).

**H13 — El indicador `attendanceRate` ("% cumplimiento de controles") se calculaba pero no se mostraba en ninguna vista**, pese a ser uno de los indicadores centrales de continuidad pedidos en el punto 1. *Corrección:* se agregó a la grilla de KPIs de "Resumen".

---

## Respuesta punto por punto a los 6 primeros requerimientos de la auditoría

1. **Numeradores/denominadores/ventanas/poblaciones elegibles:** todos los KPI de la vista "Resumen" ahora incluyen una línea `def` con numerador, denominador y, cuando corresponde, la ventana temporal. Ver también H2, H7, H9.
2. **Modelo de estados / ciclos:** reescrito como bucle mensual único con episodios de pérdida reiniciables (ver H5); la vista de comparación ahora muestra la distribución de episodios por paciente en vez de una única etiqueta binaria (ver H6); las trayectorias individuales sombrean **todos** los episodios de un paciente, no solo el último.
3. **Auditoría de urgencias/hospitalizaciones:** documentado en H1 como hallazgo crítico, corregido, y declarado explícitamente en la interfaz y en la tabla de supuestos (`docs` tab → "Supuestos explícitos del generador") para que ninguna asociación se presente como descubrimiento.
4. **Simulador:** separado en tres bloques independientes con controles propios (rescate, vínculo con eventos adversos, compensación no modificada) — ver H3 y H4.
5. **Establecimientos ficticios:** renombrados y documentados como arbitrarios — ver H8.
6. **Mismo modelo de datos / filtros sin inconsistencias:** ver H11, H12; verificado además con las pruebas de la sección 9.

---

## 9. Pruebas automatizadas — resultados

Archivo: `aps-continuidad/prototipo/test_generador.mjs`. El script **no reimplementa** el generador: extrae literalmente el bloque de código entre los comentarios `MODEL START`/`MODEL END` de `index.html` y lo ejecuta en un contexto `vm` de Node, de modo que las pruebas corren contra el código real publicado, no contra una copia que pueda desincronizarse.

Ejecución: `node test_generador.mjs` (sin dependencias externas).

Resultado de la última ejecución (17 de noviembre de 2026, Node del entorno del proyecto):

```
=== APS Continuidad — pruebas del generador sintético ===
Semilla: 20261117 | N pacientes: 420 | horizonte: 24 meses

1. Reproducibilidad y forma básica                                    4/4 OK
2. Consistencia entre vistas (mismo modelo de datos)                  3/3 OK
3. Episodios múltiples de pérdida (ciclos, no embudo lineal)          6/6 OK
4. Riesgo de eventos adversos ya no determinístico para "nunca perdido" 3/3 OK
5. Sesgo de tiempo de seguimiento desigual                            3/3 OK
6. Simulador parte de un estado neutro                                4/4 OK
7. Nombres de establecimientos no sugieren centros reales             1/1 OK
8. Compensación a nivel de persona vs. de visita                      1/1 OK
9. Robustez con semillas distintas (1, 2, 12345, 999999)               8/8 OK

=== Resultado: 33 pruebas OK, 0 fallidas ===
```

Cobertura de las pruebas, en relación con los hallazgos de esta auditoría:

| Prueba | Hallazgo que guarda |
|---|---|
| 1. Reproducibilidad y forma básica | Garantiza que el generador sigue siendo determinista (misma semilla → misma cohorte) tras la reescritura. |
| 2. Consistencia entre vistas | H11, H12 — detecta si la serie de activos, los totales por establecimiento o el estado final de un paciente llegan a divergir entre dos cálculos independientes. |
| 3. Episodios múltiples | H5 — confirma que el modelo genera y cierra correctamente más de un episodio de pérdida por paciente. |
| 4. Riesgo no determinístico | H1 — el hallazgo crítico; falla si alguien reintroduce una ruta de código donde el grupo "nunca perdido" vuelve a tener 0% de eventos por construcción. |
| 5. Sesgo de tiempo de seguimiento | H2 — falla si el indicador ajustado deja de calcularse o se vuelve idéntico al crudo (señal de que la corrección se removió). |
| 6. Simulador en estado neutro | H3, H4, H10 — falla si el slider deja de iniciar en la tasa real, o si el vínculo pérdida→evento deja de ser independiente del rescate. |
| 7. Nombres de establecimientos | H8 — falla si se reintroduce un nombre con connotación geográfica/tipológica. |
| 8. Compensación persona vs. visita | H7 — confirma que ambos indicadores existen y se calculan por separado. |
| 9. Robustez con otras semillas | Verifica que los hallazgos 1, 2 y 5 no sean un artefacto de la semilla de producción específica. |

**Limitación de esta batería de pruebas:** son pruebas deterministas/estructurales (verifican invariantes del código y de una semilla fija, más 4 semillas adicionales), no un análisis estadístico de las distribuciones generadas. No reemplazan una validación formal del generador frente a datos reales, que solo será posible cuando el proyecto obtenga acceso institucional (Etapa II de la propuesta de investigación).

---

## Lo que esta auditoría no cubre

- No se evaluó el diseño visual, la accesibilidad ni el rendimiento del prototipo.
- No se agregaron vistas nuevas ni funcionalidades fuera de las correcciones pedidas.
- No se validaron los parámetros del generador contra datos reales (no existen, por diseño, en esta etapa): toda la tabla de "Supuestos explícitos" en la pestaña Fuentes sigue siendo arbitraria/ilustrativa y está documentada como tal.
- No se revisó la licencia o reutilización de las fuentes reales citadas (eso corresponde a `docs/catalogo_fuentes.md`).
