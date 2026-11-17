# Catálogo de fuentes — Proyecto APS Continuidad

Fecha de descarga de todos los archivos: **17 de noviembre de 2026**.
Todos los archivos se descargaron con `curl` directamente desde los dominios oficiales indicados (sin intermediarios) y se verificaron con `file` (tipo real del archivo) y, en el caso de PDFs, con extracción de texto (`pdftotext`) para confirmar que abren correctamente.

> Convención de estado: ✅ Descargado y verificado · ⚠️ Existe pero no se pudo descargar (se explica motivo) · ❌ No localizado / requiere acceso institucional.

---

## A. DEIS — REM Serie P (Programa de Salud Cardiovascular / hipertensión)

| Archivo | Ubicación local | URL original | Año | Estado |
|---|---|---|---|---|
| Planilla REM-P 2025 (v1.3) | `data/raw/rem_serie_p/SP_25_V1.3.xlsm` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2025/SERIE/SP_25_V1.3.xlsm | 2025 | ✅ |
| Manual REM-P 2025 (v1.2) | `data/raw/rem_serie_p/MANUAL_REM_P_2025_V1.2.pdf` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2025/SERIE/MANUAL_REM_P_2025_Version_1.2.pdf | 2025 | ✅ |
| Planilla REM-P 2026 (v1.2) | — | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2026/SERIE/SP_26_V1.2.xlsm | 2026 | ⚠️ localizada, no descargada aún (misma estructura que 2025) |
| Manual REM-P 2026 (v1.1) | — | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2026/SERIE/MANUALREMP2026Version1.1.pdf | 2026 | ⚠️ localizada, no descargada aún |
| **Datos consolidados nacionales de población bajo control / HTA compensada** (series históricas por establecimiento, comuna, edad y sexo) | — | — | 2023–2026 | ❌ **No existe descarga directa en CSV/XLSX**. Ver "Limitación crítica" abajo. |

**Naturaleza real de estos archivos:** las planillas `SP_25_V1.3.xlsm`, `MANUAL_REM_P_2025_V1.2.pdf`, etc. son el **formulario en blanco** (template) que cada establecimiento de salud llena mensualmente y el **manual de instrucciones de llenado** — NO son datos poblacionales ya recolectados. Son extremadamente útiles como **diccionario de variables** (cada celda de la planilla define exactamente qué cuenta como "paciente bajo control", "HTA compensada", tramos de edad, sexo, etc.), pero no contienen cifras reales de pacientes.

**Limitación crítica — no hay descarga pública de datos consolidados de REM-P:** DEIS confirma en su página de preguntas frecuentes (https://deis.minsal.cl/faqs/) que la sección "Datos Abiertos" (https://deis.minsal.cl/#datosabiertos) cubre REM desde 2009 a 2024, pero esa sección es una aplicación web (buscador interactivo en JavaScript) sin URLs de descarga directa indexables ni API documentada que nuestras herramientas de navegación (búsqueda web y fetch de páginas) pudieran resolver. No se debe asumir que la información no existe — existe en el portal, pero su extracción requiere navegación interactiva humana (clics, formularios de búsqueda) o gestión directa con DEIS, no automatizable con los medios disponibles en esta sesión.

---

## B. DEIS — REM Serie A (consultas y controles en APS)

| Archivo | Ubicación local | URL original | Año | Estado |
|---|---|---|---|---|
| Planilla REM-A 2025 (v1.5) | `data/raw/rem_serie_a/SA_25_V1.5.xlsm` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2025/SERIE/SA_25_V1.5.xlsm | 2025 | ✅ |
| Manual Series REM A/BS/BM/D 2025-2026 (v1.3) | `data/raw/rem_serie_a/Manual_Series_REM_2025_2026_A_BS_BM_D_V1.3.pdf` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2025/SERIE/Manual_Series_REM_2025_2026_SERIE_A_BS_BM_D_V1.3.pdf | 2025 | ✅ (637 páginas, incluye REM-A04 "Consultas y otras atenciones en la red") |
| Planilla y manual REM-A 2026 | — | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/REM/2026/SERIE/SA_26_V1.2.xlsm | 2026 | ⚠️ localizada, no descargada |

Mismo caso que Serie P: son plantillas y manuales (excelente diccionario de variables), no datos consolidados. Los datos reales de producción (consultas médicas, cardiovasculares, actividades de rescate de inasistentes) están sujetos a la misma limitación de "Datos Abiertos" descrita arriba.

---

## C. Urgencias y egresos hospitalarios

| Archivo | Ubicación local | URL original | Año | Estado |
|---|---|---|---|---|
| Manual de Registro SADU (Sistema de Atención Diaria de Urgencia) | `data/raw/urgencias/Manual_SADU_2025.pdf` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/Atenciones%20Urgencia/Manual%20Registro%20Atenciones%20Diarias%20de%20Urgencia%2017122025.pdf | 2025 | ✅ (22 pág.) |
| Esquema de Registro de Egresos (IEEH) 2025 | `data/raw/egresos/Esquema_Registro_2025.xlsx` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/EGRESOS/Esquema%20de%20Registro%202025/Esquema_Registros_2025_27022025.xlsx | 2025 | ✅ |
| Formulario IEEH 2025 | `data/raw/egresos/Formulario_IEEH_2025.pdf` | https://repositoriodeis.minsal.cl/.../Formulario%20IEEH%202025_final_27022025.pdf | 2025 | ✅ |
| Bases de datos abiertas de egresos hospitalarios (anonimizadas, 2001–2023) | — | https://deis.minsal.cl/#datosabiertos | 2001–2023 | ❌ confirmado que existe (ver FAQ DEIS) pero no indexable/descargable automáticamente |
| Bases de datos abiertas de atenciones de urgencia (2008–2024) | — | https://deis.minsal.cl/#datosabiertos | 2008–2024 | ❌ mismo caso |
| Tablero DEIS de egresos hospitalarios (visualización) | — | https://informesdeis.minsal.cl/SASVisualAnalytics/?reportUri=%2Freports%2Freports%2F23138671-c0be-479a-8e9d-52850e584251&... | — | ⚠️ requiere sesión interactiva (SAS Visual Analytics, devuelve 401 a fetch automatizado) |
| Sistemas de captura (acceso institucional, NO datos públicos) | — | Egresos: https://egresos40.minsal.cl/login.aspx · Urgencia: https://atencionesurgencia.minsal.cl/ | — | ❌ requieren credenciales de establecimiento de salud |

---

## D. Listas de espera

| Archivo | Ubicación local | URL original | Período | Estado |
|---|---|---|---|---|
| Informe Glosa N°6 — Listas de Espera No GES y Garantías GES retrasadas, II trimestre 2026 | `data/raw/listas_espera/Glosa06_LE_IItrim2026.pdf` | https://www.minsal.cl/wp-content/uploads/2026/08/Glosa-06-LE-II-trimestre.pdf | Corte 30-06-2026 | ✅ (76 pág., PDF con tablas por Servicio de Salud) |
| Informes trimestrales anteriores (2025, I trim. 2026) | — | Listados en https://www.minsal.cl (sección "Documentos"/Glosa N°6) | 2025–2026 | ⚠️ localizados por búsqueda, URLs específicas no confirmadas una a una; recomendable revisar la página de documentos de MINSAL directamente |
| Visor Ciudadano de Listas de Espera (consulta interactiva por Servicio de Salud) | — | mencionado por fuentes secundarias (UDD-CIPS); URL exacta no confirmada en esta sesión | — | ❌ no confirmado si exporta CSV/Excel |

**Nota:** el informe Glosa N°6 es un PDF con tablas (no datos tabulares limpios tipo CSV); para análisis cuantitativo se requerirá extracción manual o con herramientas de parsing de tablas en PDF.

---

## E. Documentación clínica y metodológica

| Documento | Ubicación local | URL original | Año | Estado |
|---|---|---|---|---|
| Orientaciones Técnicas Programa de Salud Cardiovascular (PSCV) | — | https://www.saludtarapaca.gob.cl/wp-content/uploads/2023/10/Orientaciones-Tecnicas-Programa-Salud-Cardio-Vascular.pdf | ~2016–2017 (fecha de redacción ambigua en el documento) | ⚠️ localizado; la descarga falló repetidamente por error de conexión (`Recv failure: Connection reset by peer`) del servidor saludtarapaca.gob.cl durante esta sesión. Es un mirror regional, no el sitio oficial de MINSAL/DIPRECE — **pendiente reintentar o buscar la versión vigente en diprece.minsal.cl** |
| RPE N°12 — Criterios técnicos para la programación de actividades del programa cardiovascular en Atención Primaria | `research/guidelines/RPE12_Criterios_Programacion_PSCV.pdf` | https://www.minsal.cl/wp-content/uploads/2026/09/12-RPE-Criterios-tecnicos-para-la-programacion-de-actividades-del-programa-cardiovascular-en-Atencion-Primaria.pdf | 2026 | ✅ (4 pág., fuente MINSAL oficial) |
| HEARTS MINSAL (documento 2026) | `research/guidelines/HEARTS_MINSAL_2026.pdf` | https://www.minsal.cl/wp-content/uploads/2026/09/HEARTS.pdf | 2026 | ✅ (26 pág.) |
| HEARTS Chile — presentación OPS/PAHO 2019 (resultados cohorte 1) | `research/guidelines/HEARTS_Chile_2019_PAHO.pdf` | https://paho.org/sites/default/files/hearts-2019-paises-1-cohorte-chile-carolina-neira-4es_0.pdf | 2019 | ✅ (16 pág.) |
| HEARTS — ficha técnica Área 2 (PAHO) | `research/guidelines/HEARTS_area2_ft.pdf` | https://www.paho.org/sites/default/files/2024-01/area-2-ft-hearts.pdf | 2024 | ✅ (20 pág.) |
| Diccionario CIE-10 — Lista Tabular (actualizada agosto 2026) | `data/dictionaries/CIE10_Lista_Tabular_ago2026.xlsx` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/uploads/2021/03/Lista%20tabular%20CIE-10%20-%20agosto%202026.xlsx | 2026 | ✅ |
| GES 90 problemas de salud — codificación CIE-10 (v1.4) | `data/dictionaries/GES_90_CIE10_v1_4.xlsx` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/uploads/2021/03/GES%2090%20CIE-10%20v1_4.xlsx | 2026 | ✅ |
| Diccionario de datos — Establecimientos de Salud 2025 | `data/dictionaries/Establecimientos_Diccionario_2025.xlsx` | https://repositoriodeis.minsal.cl/ContenidoSitioWeb2020/Establecimientos/Diccionario%20de%20Datos%202025.xlsx | 2025 | ✅ |

---

## F. Estudios académicos

| Estudio | Ubicación local | URL / DOI | Año | Estado |
|---|---|---|---|---|
| Escobar-San Martín, Droguett Droguett, Sabando Franulic — *Sociodemographic determinants of appointment no-show in primary care: a cross-sectional study in Renca Commune, Chile (2022–2023)*, BMC Primary Care | `research/papers/Escobar_SanMartin_2026_Renca_noshow.pdf` | DOI 10.1186/s12875-025-03170-9 (publicado online 25-02-2026) — PDF: https://link.springer.com/content/pdf/10.1186/s12875-025-03170-9.pdf | 2026 | ✅ (9 pág.) — **el estudio pedido explícitamente por el usuario** |
| Werner K, Alsuhaibani SA, Alsukait RF, et al. — *Behavioural economic interventions to reduce health care appointment non-attendance: a systematic review and meta-analysis*, BMC Health Services Research | `research/papers/Werner_2023_BehavioralEcon_NoShow_SystematicReview.pdf` | DOI 10.1186/s12913-023-10059-9 | 2023 | ✅ (13 pág., licencia CC BY 4.0) |
| Bastías et al. — *Factores sociales y de salud relacionados a la discontinuidad de los tratamientos en adultos chilenos con enfermedades crónicas durante la pandemia por COVID-19*, Revista Médica de Chile 152(10) | `research/papers/Bastias_2024_DiscontinuidadTratamiento_COVID_Chile.pdf` | DOI 10.4067/s0034-98872024001001038 | 2024 | ✅ (11 pág.) — usa datos de encuesta MOVID-IMPACT-C; relevante por cuantificar discontinuidad (12% en HTA) |
| Araya Morales, M.A. — *Desarrollo de una interfaz para la consulta y visualización de datos de salud pública de los Resúmenes Estadísticos Mensuales del MINSAL* (Memoria de Título, Ing. Civil Biomédica, Universidad de Concepción) | `research/papers/Tesis_UdeC_ConsolidacionREM.pdf` | https://repositorio.udec.cl/bitstreams/08725306-5363-4db7-b046-3cb3e251a335/download | 2024 | ✅ (69 pág.) — describe metodología de consolidación de archivos REM Serie A 2009–2023; útil como referencia técnica para procesar los REM descargados |
| Rebolledo, Mesía, Silva — *Inasistencia de pacientes a consultas médicas de especialistas...*, Medwave 14(9) | — | DOI 10.5867/medwave.2014.09.6023 | 2014 | ⚠️ localizado, no descargado (referencia secundaria citada por el estudio de Renca) |
| Michea et al. — eficacia del protocolo HEARTS vs. habitual en control de HTA en Chile | — | https://journal.paho.org/en/articles/efficacy-standardized-and-simplified-strategy-treatment-high-blood-pressure-chile-hearts | 2022 | ⚠️ localizado, no descargado |
| Barake et al. — *Chile's public healthcare sector hypertension control rates before and during the pandemic and HEARTS implementation*, Rev Panam Salud Publica | — | DOI 10.26633/RPSP.2022.126 | 2022 | ⚠️ localizado (comunicación breve), no descargado; confirma aumento de tasa de control poblacional de HTA de 16% a 33% tras HEARTS, con datos de REM de centros APS |

---

## Fuentes buscadas sin resultado localizable / que requieren acceso institucional

- **Consolidados nacionales REM-P por establecimiento/comuna/edad/sexo (2023–2026):** no descargables automáticamente (ver sección A).
- **Microdatos de egresos hospitalarios y urgencias en CSV (2023–2024):** confirmados como existentes en `deis.minsal.cl/#datosabiertos`, pero el portal no permite descarga indexable sin interacción manual en el buscador JS.
- **Sistema clínico Rayen / ficha clínica electrónica APS:** es un sistema propietario de uso institucional (Rayen Salud); no existen bases públicas descargables. Solo se encontraron manuales de usuario (admisión, toma de muestras, derivación) de servicios de salud regionales, no datos de pacientes.
- **Visor Ciudadano de Listas de Espera:** mencionado por fuentes secundarias, URL exacta no verificada.
- **Protocolos de rescate de pacientes inasistentes (específicos para HTA/PSCV):** se encontró evidencia de protocolos de rescate para otras patologías (post-ACV, SSMN) pero no un protocolo nacional específico para HTA; esto es en sí mismo un hallazgo relevante (posible vacío normativo).

---

## Resumen de verificación técnica

Todos los archivos marcados ✅ fueron:
1. Descargados con `curl` desde la URL exacta indicada (dominios `.gob.cl`, `.minsal.cl`, `springer.com`, `biomedcentral.com`, `udec.cl`).
2. Verificados con el comando `file` confirmando que son PDF o Excel reales (no páginas de error HTML).
3. En el caso de PDFs clave, verificados adicionalmente con `pdftotext` extrayendo texto legible.

Ningún archivo fue generado, simulado o inventado. Cuando una descarga falló, se registra explícitamente el motivo (error de conexión, 401, 404, portal interactivo no indexable) en lugar de omitir la fuente.
