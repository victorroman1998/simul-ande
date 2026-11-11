# Matriz de cumplimiento de la tarea #204

Consigna verificada el 10/11/2026: [issue #204, Q-Lab PUCP](https://github.com/d2cml-ai/Data-Science-Python/issues/204). Entrega de comentario: 10/11/2026, 23:59, hora de Lima, según la consigna y el contexto del curso. Presentación: 11/11, 19:00–22:00. Victor Roman aparece en turno 41, aproximadamente 21:25; el orden puede adelantarse si faltan participantes.

Este paquete deja el diseño preparado. Los estados siguientes distinguen lo entregado aquí de las evidencias que todavía debe producir la ejecución del proyecto.

## Rúbrica de 20 puntos

| Requisito | Puntos | Evidencia concreta por presentar | Ubicación futura | Estado real actual |
|---|---:|---|---|---|
| Demo funcional, principio a fin; URL pública suma | 8 | Abrir app, elegir inventario, resolver seis decisiones y obtener resultado; repetir con otro establecimiento | URL y comandos de instalación en README | Especificado; software, URL y ejecución pendientes |
| Problema y usuario, tres conversaciones | 3 | Notas fieles con fecha, perfil y hallazgos; participación voluntaria y permiso para publicar notas anónimas | `docs/research/entrevista_01.md` a `_03.md` | Guía y plantilla entregadas; entrevistas pendientes |
| Solución, insight y why now | 2 | Mostrar cómo el inventario cambia D3 y conserva la necesidad de decidir referencia; explicar utilidad de IA acotada | README y demo | Propuesta entregada; valor por comprobar |
| Negocio: comprador, precio y costo | 2 | Hipótesis S/300 por piloto; medición de tokens, tarifas fechadas y costo real del servidor | README, sección negocio; métricas del tutor | Modelo propuesto; medición y validación comercial pendientes |
| Dos herramientas del curso en el producto | 2 | Tablero calculado desde el intento y llamada real a LLM con salida JSON validada | `app.py` y `tutor.py`, o rutas equivalentes comprobadas | Integración pendiente; no cuenta usar Codex solo para programar |
| Repositorio y README completo | 2 | Repo público, código reproducible, nueve partes, historial real, licencia y archivos de entorno sin secretos | Repo y README | Pendiente; este encargo no modifica repositorio |
| Presentación clara dentro de tres minutos | 1 | Ensayo cronometrado y flujo abierto antes del turno | Guion y video real | Guion propuesto; ensayo pendiente |

No se asigna una nota anticipada. La consigna permite datos sintéticos, aunque la rúbrica de demo usa la expresión «datos reales». El caso clínico será sintético y se declarará como tal; las referencias serán oficiales y las métricas procederán del software real. No inventar pacientes reales para intentar cumplir esa expresión. La interpretación final corresponde al docente.

## Nueve partes obligatorias del README futuro

| Parte | Contenido a incorporar | Evidencia o pendiente |
|---|---|---|
| 1. One-liner | Frase inicial de PRODUCT_BRIEF | Lista para adaptar |
| 2. Founder | Victor, médico e investigador/docente; explicar vínculo con problema | Verificar biografía breve con el fundador |
| 3. Problema | Situaciones reales recogidas en tres conversaciones y solución usada hoy | No sustituir con usuarios sintéticos |
| 4. Solución e insight | Decidir con recursos efectivos; categorías separadas de inventario | Mostrar cambio entre los dos recorridos |
| 5. Why now | Web pequeña, reglas auditables e IA estructurada | Explicar sin afirmar exclusividad de mercado |
| 6. Demo | URL o ejecución local, tres capturas, diagrama y APIs/modelo utilizados y motivo | Completar solo con implementación real |
| 7. Modelo de negocio | Comprador, precio piloto, tokens por usuario y costo servidor | Registrar fecha/tarifas y supuestos |
| 8. Herramientas del curso | Dashboard y salida estructurada; ruta y función donde se usan | Sustituir rutas previstas por las reales |
| 9. Qué hizo el agente | Partes creadas por Codex y cambios revisados por Victor | Atribución honesta; no atribuir uso de Claude si no ocurrió |

## Checklist de evidencias complementarias

Repo público con todo el código, `LICENSE`, `.env.example` y `.gitignore`; instalación comprobada; ausencia de claves en archivos e historial; tres capturas del software real; diagrama coherente con el código; video de respaldo de 60–90 segundos; notas de las tres conversaciones; comentario en el issue con nombre, startup, demo, repo, herramientas y video. Añadir la startup al portafolio de la tarea #203, como indica el apartado del curso, cuando se complete la implementación.

La consigna valora commits en varios días. A esta altura no puede recuperarse tiempo ya transcurrido: hacer commits reales por hitos y describir el estado con honestidad. El enlace podía entregarse con ejecución local, y la consigna permite continuar commits hasta la presentación. No existe autorización en este encargo para publicar el comentario, enviar mensajes a personas o desplegar una aplicación.

## Guion de tres minutos

| Tiempo | Acción observable |
|---|---|
| 0:00–0:30 | Explicar quién enfrenta la brecha y un hallazgo de entrevista real; si aún falta, declararlo |
| 0:30–0:45 | Abrir caso I-2 e inventario; mostrar paciente ficticio |
| 0:45–1:50 | Resolver D1–D6 con elecciones preparadas, incluyendo la ausencia de RX y el destino |
| 1:50–2:15 | Mostrar tablero y una justificación con fuente |
| 2:15–2:30 | Ejecutar tutor IA; explicar que selecciona reflexión y no altera calificación |
| 2:30–3:00 | Comprador, precio hipotético, costo medido y siguiente experimento |

El cambio al I-4 puede mostrarse solo en su inventario si el ensayo alcanza. La prueba completa de ambos escenarios debe haberse hecho antes. El video de respaldo debe grabar el software ejecutándose; una maqueta grabada no lo sustituye.
