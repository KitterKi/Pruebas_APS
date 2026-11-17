# Resumen de hallazgos, limitaciones y recomendaciones — Proyecto APS Continuidad

## 1. ¿Qué indicadores permiten estudiar la continuidad asistencial?

- **REM-P4 (PSCV):** población bajo control de HTA y su estado de compensación, medido mes a mes. Comparado en el tiempo (2023→2026) permite ver **caídas de cohorte** (¿bajó el número de controlados? ¿subió el % no compensado?), pero a nivel agregado, no de trayectoria individual.
- **REM-A04:** volumen de consultas y controles cardiovasculares — su caída relativa a la población bajo control puede señalar menor frecuencia de controles (proxy indirecto de pérdida de seguimiento).
- **Actividades de rescate de inasistentes** (cuando se registran en REM-A): es el indicador más directo de "intento de recuperar continuidad", pero su cobertura en la planilla es limitada y no está confirmado que se desagregue por patología.
- **Listas de espera (Glosa N°6):** señalan un punto de fuga hacia especialidad (si un hipertenso con complicación es derivado y queda en espera, hay interrupción de facto del seguimiento especializado).
- **Egresos hospitalarios y urgencias por causas cardiovasculares:** sirven como *desenlace* (outcome) de la discontinuidad — una hospitalización por crisis hipertensiva o evento cardiovascular en alguien que dejó de controlarse es la señal más fuerte de daño por pérdida de continuidad.

## 2. ¿Es posible identificar dónde se interrumpe el seguimiento?

**No con los datos públicos agregados disponibles.** Todas las bases REM accesibles son conteos mensuales por establecimiento (fotografías transversales), no registros longitudinales por paciente. Para identificar el *punto exacto* de interrupción (p. ej. "el paciente faltó a su tercer control y no fue rescatado") se necesitaría:
- Microdatos a nivel de registro individual (ficha clínica electrónica, ej. Rayen) — **acceso institucional, no público**.
- O un diseño de estudio primario (como el de Renca, BMC Primary Care) que sí trabaja a nivel de cita individual.

Los datos agregados permiten **inferir** discontinuidad a nivel poblacional (caídas de cohorte, brechas entre consultas esperadas y realizadas) pero no trazar trayectorias de pacientes.

## 3. ¿Qué indicadores solo describen actividad agregada (sin servir para continuidad)?

- Totales de consultas médicas generales (REM-A) sin desagregar por "nueva" vs. "control" ni por programa.
- Egresos hospitalarios totales sin filtrar por causa cardiovascular.
- Atenciones de urgencia totales sin desagregar por causa — son volumen de actividad, no trazabilidad de un paciente específico.

## 4. ¿Qué información permitiría estudiar hipertensión y complicaciones posteriores?

- Cruce (a nivel agregado, por establecimiento/comuna y período) entre: REM-P4 (población HTA bajo control / compensada) ↔ egresos hospitalarios con diagnóstico CIE-10 I10–I15 (HTA) e I20–I25, I50, I60–I69, N18 (complicaciones) ↔ atenciones de urgencia por causa cardiovascular en la misma área.
- Esto permite un análisis **ecológico** (no causal a nivel individual): ¿las comunas/establecimientos con menor compensación de HTA muestran más hospitalizaciones/urgencias cardiovasculares en períodos posteriores?
- El estudio de Renca (BMC Primary Care, 2026) y el de Bastías et al. (2024, discontinuidad COVID) son las dos fuentes académicas chilenas más directamente aplicables al mecanismo (por qué se pierde continuidad), aunque no son específicas de HTA con desenlace hospitalario.

## 5. ¿Qué datos requieren acceso institucional (ej. Rayen)?

- Registro clínico longitudinal por paciente (fechas de control, valores de presión arterial, adherencia a tratamiento, motivo de inasistencia).
- Microdatos crudos de egresos hospitalarios y urgencias a nivel de caso individual con identificador de paciente (aunque anonimizado, el acceso al archivo de registro, no solo al agregado publicado, requiere solicitud a DEIS).
- Sistema de captura REM en sí (`cargasrem.minsal.cl`), egresos (`egresos40.minsal.cl`) y urgencia (`atencionesurgencia.minsal.cl`) — todos requieren login institucional; no son fuentes públicas.
- El "Datos Abiertos" de DEIS (confirmado que existe para REM 2009-2024, egresos 2001-2023, urgencia 2008-2024) probablemente sí sea accesible sin credenciales institucionales, pero su extracción automatizada no fue posible en esta sesión por ser una aplicación de búsqueda interactiva en JavaScript sin API ni URLs de descarga directa indexables por las herramientas de navegación disponibles. **Este es el ítem de mayor prioridad para completar manualmente** (ver lista priorizada abajo).

## 6. Principales limitaciones de las bases públicas

1. **Agregación, no trayectoria:** todo lo público es conteo por establecimiento/mes; no hay identificador de paciente.
2. **Portal DEIS de datos abiertos no automatizable:** requiere interacción manual (buscador JS) — no se pudo confirmar ni descargar el contenido real de las series históricas de REM-P, egresos y urgencias en esta sesión, solo confirmar que existen y su rango de años.
3. **Plantillas vs. datos:** las REM descargadas (Serie P y A) son formularios en blanco + manuales, útiles como diccionario pero no como fuente de cifras.
4. **Listas de espera en PDF no tabular:** requiere trabajo de extracción antes de análisis cuantitativo.
5. **Falta de protocolo nacional específico de rescate para HTA:** no se encontró un documento MINSAL que defina explícitamente "abandono" o periodicidad obligatoria de rescate para pacientes HTA inasistentes (sí existe para otras patologías, ej. post-ACV). Esto es en sí un hallazgo relevante: puede ser un vacío normativo real o simplemente no estar indexado en buscadores.
6. **Discrepancias de fecha en orientaciones técnicas del PSCV:** el documento encontrado circula en mirrors regionales con fecha de portada 2016 pero se cita como "2017" en literatura secundaria; no se confirmó una versión vigente publicada directamente por MINSAL/DIPRECE (el dominio diprece.minsal.cl existe pero no se exploró en profundidad).
7. **Descarga fallida de la guía PSCV completa** por error de conexión repetido con el servidor regional — pendiente reintentar.

## 7. Lista priorizada de datos que faltan (para completar el proyecto)

1. **[Alta prioridad]** Extraer manualmente (navegación interactiva humana) los datasets de REM Serie P histórico (2023-2026) desde `deis.minsal.cl/#datosabiertos` — es el dato central del proyecto (población HTA bajo control/compensada por establecimiento, comuna, edad, sexo).
2. **[Alta prioridad]** Extraer de la misma sección los microdatos de egresos hospitalarios (2023-2024) filtrables por CIE-10 cardiovascular.
3. **[Alta prioridad]** Extraer microdatos de atenciones de urgencia (SADU) 2023-2024 por causa cardiovascular.
4. **[Media]** Obtener la Orientación Técnica PSCV vigente directamente desde diprece.minsal.cl (reintentar descarga del mirror regional o buscar versión oficial actualizada).
5. **[Media]** Completar la serie de informes Glosa N°6 (2023, 2024, 2025, trimestres faltantes) para tener evolución histórica de listas de espera, no solo el corte más reciente.
6. **[Media]** Confirmar si el "Visor Ciudadano de Listas de Espera" permite exportación estructurada (CSV/API).
7. **[Baja]** Revisar protocolos de rescate de inasistentes de otros programas (ej. post-ACV, SSMN) como referencia metodológica aplicable a HTA, dado que no existe uno específico localizado.

## 8. Recomendación: qué conjuntos usar primero para el mockup

Dado que **no hay datos reales consolidados descargados** (solo estructura/diccionarios/documentación), el mockup inicial debería:

1. Usar los **manuales y planillas REM-P y REM-A** descargados para definir con precisión el modelo de datos (nombres de campos, tramos de edad, categorías de compensación) — esto ya está listo en `data/dictionaries/` y `data/raw/rem_serie_*/`.
2. Usar el **diccionario CIE-10** y el **diccionario de establecimientos** como tablas de referencia/llaves de unión.
3. Usar el **informe Glosa N°6** (único dato público real con cifras, aunque en PDF) para una vista de "listas de espera" con datos reales extraídos manualmente de sus tablas.
4. Para el flujo de "trayectoria del paciente" en el mockup, basarse en la **estructura conceptual** descrita por el estudio de Renca (BMC Primary Care) y el de Bastías et al. (COVID/discontinuidad) — citándolos explícitamente como marco conceptual, sin inventar cifras.
5. **No generar datos sintéticos** para rellenar lo faltante (según instrucción explícita) — dejar esas secciones del mockup marcadas como "pendiente de datos reales" hasta completar la extracción manual del portal de Datos Abiertos DEIS.
