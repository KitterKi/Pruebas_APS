# Diccionario preliminar de variables — Proyecto APS Continuidad

Construido a partir de los manuales y planillas REM efectivamente descargados (no de datos reales, que no estaban disponibles — ver `catalogo_fuentes.md`). Cada entrada indica el archivo fuente.

## REM Serie P (`SP_25_V1.3.xlsm`, `MANUAL_REM_P_2025_V1.2.pdf`)

| Sección/Sección REM | Variable | Definición (según manual) | Desagregación disponible en planilla |
|---|---|---|---|
| REM-P4 (Secc. A) | Población bajo control, Programa de Salud Cardiovascular (PSCV) | N° de personas inscritas y activas en el programa a fin del período | Por tramo de edad, sexo, y patología (HTA, DM2, dislipidemia, ERC, obesidad) |
| REM-P4 (Secc. A) | Personas con hipertensión arterial bajo control | Subconjunto de la población PSCV con diagnóstico de HTA activo | Por tramo de edad y sexo |
| REM-P4 | HTA compensada / no compensada | Clasificación según meta de presión arterial alcanzada en el último control registrado | Agregado nacional/establecimiento; no longitudinal a nivel de registro público |
| REM-P4 | Ingresos y egresos del programa | Movimiento de altas (nuevos ingresos) y bajas (fallecimiento, traslado, abandono) | Por motivo de egreso (cuando se registra) |

**Limitación clave:** la planilla registra **conteos agregados mensuales por establecimiento**, no trayectorias individuales de pacientes. No es posible, con estos archivos, reconstruir el recorrido de un paciente específico — solo fotografías transversales repetidas.

## REM Serie A (`SA_25_V1.5.xlsm`, `Manual_Series_REM_2025_2026_A_BS_BM_D_V1.3.pdf`)

| Sección | Variable | Definición | Desagregación |
|---|---|---|---|
| REM-A04, Secc. A | Consultas médicas (nuevas y de seguimiento) | N° de consultas médicas realizadas en APS, por tipo de profesional y motivo | Por establecimiento, tipo de consulta (nueva/control), especialidad cuando aplica |
| REM-A04 | Consultas / controles cardiovasculares | Atenciones específicas vinculadas al PSCV | Por establecimiento |
| REM-A | Actividades de rescate (cuando existen en la planilla) | Contactos realizados a pacientes inasistentes (telefónico, visita domiciliaria) | Agregado, sin vínculo a identidad del paciente | 

## Egresos hospitalarios (`Esquema_Registro_2025.xlsx`, `Formulario_IEEH_2025.pdf`)

| Campo | Descripción |
|---|---|
| Diagnóstico de egreso (CIE-10) | Diagnóstico principal y secundarios codificados con CIE-10 (ver diccionario CIE-10 descargado) |
| Tipo de alta | Médica, traslado, defunción, retiro voluntario, otro |
| Días de estada | Duración de la hospitalización |
| Establecimiento, región, servicio de salud | Identificación territorial |
| Edad, sexo, previsión | Variables demográficas y de aseguramiento |

**Nota:** el esquema de registro define la *estructura* de la base de microdatos de egresos (existe, cubre 2001–2023 según DEIS), pero el archivo descargado es el formulario/esquema de captura, no la base de microdatos en sí.

## Atenciones de Urgencia — SADU (`Manual_SADU_2025.pdf`)

| Campo | Descripción |
|---|---|
| Causa de consulta (glosa) | Motivo de la atención de urgencia |
| Categorización por edad (tramos: <1, 1-4, 5-14, 15-64, 65+, según variantes del manual) | — |
| Fecha, semana epidemiológica | Permite series temporales |
| Establecimiento | Identificación del SAPU/SAR/hospital |

## CIE-10 (`CIE10_Lista_Tabular_ago2026.xlsx`, `GES_90_CIE10_v1_4.xlsx`)

Diccionario completo de códigos CIE-10 (capítulos, categorías de 3 dígitos, subcategorías de 4 dígitos) y su correspondencia con los 90 problemas de salud garantizados (GES). Relevante para identificar los códigos de hipertensión arterial (I10–I15) y complicaciones cardiovasculares (I20–I25 cardiopatía isquémica, I60–I69 enfermedad cerebrovascular, I50 insuficiencia cardíaca, N18 enfermedad renal crónica) a usar como variables de desenlace.

## Listas de espera (Glosa N°6, `Glosa06_LE_IItrim2026.pdf`)

| Campo (extraído de tablas del informe) | Descripción |
|---|---|
| Servicio de Salud | Unidad territorial de agregación |
| Especialidad / prestación | Tipo de atención en espera |
| N° de personas en espera | Conteo a la fecha de corte |
| Tiempo promedio/mediano de espera | En días |

**Nota:** estos datos están en tablas dentro de un PDF, no en formato tabular limpio; requieren extracción (parsing) antes de análisis cuantitativo.

## Establecimientos de Salud (`Establecimientos_Diccionario_2025.xlsx`)

Diccionario de códigos de establecimientos (identificador único usado para enlazar REM, egresos y urgencias por centro de salud) — es la **llave de unión territorial** entre todas las bases REM, egresos y urgencias.
