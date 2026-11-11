# Inspección y decisiones de implementación

10 de noviembre de 2026 · America/Lima. Fuente: adjunto recuperado del chat «Evaluar simulador clínico local». La ruta `/mnt/data/` del prompt pertenece al entorno anterior; en este equipo Windows se recuperó el archivo adjunto temporal del chat mediante `read_thread`.

ZIP: `SIMUL_ANDE_especificacion_v0_1.zip`. SHA-256: `63994de72de77a20707b1d68106d26a5946c9458e6d181ba0b72f4a70a1725f5`.

Se inspeccionaron los doce archivos antes de escribir la app. Once entregables y un manifiesto de hashes; aproximadamente 126 kB descomprimidos. No había código ejecutable, servidor, modelos, entrevistas realizadas, credenciales, aprobación clínica ni despliegue. Los originales se conservan en `spec/`; el caso y esquema de `data/` son copias exactas verificadas por `scripts/verify_package.py`. La extracción comprobó que todas las rutas quedasen dentro de la carpeta de destino.

| Entregable | Resultado de inspección / uso |
|---|---|
| PRODUCT_BRIEF | Hipótesis de problema y precio S/300 por piloto; no evidencia de ventas |
| MVP_SPEC | Streamlit y Python adecuados; un proceso y estado de sesión son suficientes |
| CLINICAL_RULES | Seis decisiones; cuatro críticos; corrección obligatoria; 100 puntos formativos |
| case + schema | Datos estructurados utilizables; se valida con jsonschema Draft 2020-12 |
| SOURCES | Referencias oficiales y límites explícitos; ver contraste independiente abajo |
| RISK_REGISTER | Riesgos clínicos, gasto, idempotencia y entrega considerados en implementación |
| TASK_204_MATRIX | Contraste directo con issue #204; entrevistas y varios días de commits no pueden inventarse |
| USER_RESEARCH | Guía y plantillas vacías; no se presentaron como entrevistas |
| README_HANDOFF + VERIFICATION | Describen especificación, no una app previamente probada |

## Alcance y reglas conservadas

Un varón ficticio de 68 años a 100 m s. n. m., NAC probable, SpO₂ inicial 88 %, FR 32, PA 112/68. CRB-65=2; urea inmediata y varios criterios de severidad ausentes. No extrapolar a altura, alergia grave, shock, embarazo o infección resistente. Dos establecimientos hipotéticos basados en I-2/I-4, con inventarios y autorizaciones propios. No se presume capacidad a partir de la categoría.

Se conservan D1–D6, sus vectores, D3-B con puntaje máximo, cuatro errores críticos, 60 minutos ficticios solo en D3-C, TX01 como propuesta pendiente de VM-03 y correcciones que conservan la primera elección. No hay dinámica fisiológica ni pronóstico. No se modificaron dosis para facilitar el flujo. El motor bloquea acciones con prerrequisitos insuficientes sin actualizar puntos o stock.

La primera administración TX01 consume dos viales de 1 g y una tableta de 500 mg, una única vez. La RX sintética solo se muestra en I-4/D3-A; el laboratorio queda pendiente. I-2 nunca produce resultados no disponibles. El resultado nunca llama «aprobado» a un puntaje ni suprime una alerta crítica.

## Arquitectura y dependencias

`app.py` presenta; `engine.py` valida transiciones; JSON almacena el contenido; `tutor.py` selecciona catálogo mediante Gemini opcional; `sources_api.py` consulta metadatos públicos de NCBI. Streamlit/Plotly/pandas/jsonschema/requests/python-dotenv y pytest. Python 3.12. Sin base de datos, cuentas, telemetría propia ni persistencia entre dispositivos. Los secretos permanecen en el servidor.

## Ajustes explícitos respecto de la especificación

1. Se añade **APIs, sesión 03**, con una consulta real a NCBI E-utilities del PMID 31573350. Tiene utilidad bibliográfica dentro de la pestaña de fuentes, nunca reescribe reglas clínicas. Junto al dashboard acredita dos herramientas sin credenciales de pago. La prueba real se registra por separado; un mock no se declara como evidencia online.
2. Gemini con salida estructurada queda integrado y probado mediante transportes simulados, deshabilitado de fábrica. Sin clave y control efectivo de gasto no se afirma que exista una llamada real al modelo. Es una tercera herramienta opcional. El modelo propuesto es `gemini-2.5-flash-lite`; requiere comprobación real con una clave del propietario antes de acreditarlo como IA ejecutada.
3. Se omiten justificaciones libres del MVP. El modelo recibe únicamente IDs de elecciones y banderas del caso sintético. Esto reduce exposición de información personal y evita instrucciones del alumno dentro del prompt. Exportación por lista permitida, sin claves ni texto libre.
4. La integración bibliográfica no se denomina RAG. No hay recuperación ni generación de recomendaciones clínicas.

## Contraste independiente de fuentes

La consigna #204 se leyó directamente mediante el conector de GitHub el 10/11/2026: plazo del comentario 23:59 Lima; presentación 11/11 de 19:00 a 22:00; Victor Roman turno 41, aproximadamente 21:25, susceptible de adelantarse.

La navegación directa del PDF IETSI corto dio timeout. La búsqueda en el dominio oficial localizó la versión corta, extensa, resumen y flujograma; los extractos oficiales corroboran el umbral hospitalario CRB-65 ≥2 y el subgrupo >65 años con terapia dual ceftriaxona + macrólido. Se conservan los localizadores originales del paquete, sin afirmar una nueva verificación página por página. [Flujograma oficial](https://ietsi.essalud.gob.pe/wp-content/uploads/2025/12/GPC-NAC-adulto-Flujogramas.pdf), [GPC extensa](https://ietsi.essalud.gob.pe/wp-content/uploads/2025/12/GPC-NAC-adultos-version-extensa.pdf), [registro EsSalud](https://repositorio.essalud.gob.pe/handle/20.500.12959/5805).

La ficha [PubMed 31573350](https://pubmed.ncbi.nlm.nih.gov/31573350/) se abrió independientemente: guía ATS/IDSA de 2019, DOI 10.1164/rccm.201908-1581ST. Su función es bibliográfica complementaria. No reemplaza la adaptación peruana ni acredita su vigencia normativa.

No se hizo una revisión jurídica exhaustiva ni una nueva lectura integral de S04–S10. Se mantienen los límites de `spec/SOURCES.md`: anexo NTS 249-2026 incompleto, NT 018 no leído íntegramente y adaptación pretransferencia pendiente. Ninguna comprobación técnica sustituye VM-01 a VM-05.

## Faltantes que requieren evidencia humana o acceso

Revisión médica documentada VM-01 a VM-05; tres conversaciones reales consentidas; prueba de usabilidad con dos personas; validación del precio; ensayo de tres minutos. El historial se crea con fechas reales, sin fabricar trabajo de días anteriores. La nota final depende del docente.

Resultado de implementación: repo público `victorroman1998/simul-ande` confirmado por el titular, demo en `https://simul-ande.streamlit.app/`, video real de 68 segundos y comprobaciones en `docs/VALIDATION.md`. El titular pidió mantener revisión médica pendiente y tutor local; no se habilitó Gemini ni facturación. La cuenta de Streamlit se usó con autorización para aceptar términos e iniciar sesión. No se publicaron comentarios en la issue ni se contactó a usuarios.

El repositorio local se creó separado de `Python_2` porque allí había cambios previos en `tarea_3`. No se modificó esa tarea.
