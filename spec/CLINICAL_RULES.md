# SIMUL-ANDE · Reglas clínicas y educativas

Versión 0.1. Estado: revisión médica pendiente. IDs estables para el motor y el debriefing. [SOURCES.md](SOURCES.md) contiene los enlaces y los localizadores; las fuentes no se deben inventar ni completar por inferencia.

## Caso y criterio docente

Paciente ficticio P-NAC-01: varón de 68 años, 70 kg, residente habitual a 100 m s. n. m., con tres días de fiebre y tos, disnea creciente y dolor pleurítico derecho. Llega acompañado, orientado, sin enfermedad crónica conocida, alergia medicamentosa reportada, inmunosupresión, hospitalización o antibiótico en los últimos 90 días. Tolera la vía oral. Preguntar específicamente antecedentes, fármacos, alergias, aspiración, síntomas prolongados y exposición a TB; sus respuestas son datos del guion, no exclusiones diagnósticas definitivas.

Al ingreso: T 38.5 °C, FC 112/min, FR 32/min, PA 112/68 mmHg y SpO₂ 88% al aire ambiente, confirmada con señal adecuada. Auscultación: crepitantes focales basales derechos. Estos valores son invariables del guion inicial. El diagnóstico de trabajo es NAC probable con hipoxemia y necesidad de atención hospitalaria. No atribuir patógeno confirmado.

Con estos datos el cálculo CRB-65 es 2: edad 1, respiración 1, confusión 0 y presión 0. La urea no es inmediata en ninguno de los dos inventarios. Los componentes ATS/IDSA no medidos permanecen «desconocidos»; el motor nunca convierte un dato ausente en normal. La clasificación definitiva de severidad queda pendiente, sin retrasar el destino asistencial. E01, E02 y E06.

## Seis decisiones

Cada decisión tiene tres opciones; D3 cambia sus textos según el establecimiento. El orden es fijo. La opción A es la esperada en el guion. Los vectores siguen el orden Razonamiento, Seguridad, Recursos, Referencia. Son ponderaciones docentes propuestas, pendientes de VM-05.

| ID y competencia | A: respuesta esperada y consecuencia | B: respuesta parcial y consecuencia | C: respuesta inadecuada y consecuencia | Fundamento |
|---|---|---|---|---|
| D1. Prioridad inicial | Evaluar respiración, iniciar soporte con oxígeno y monitorización, activar coordinación de referencia en paralelo. [0,10,0,5]. Soporte y coordinación activados. | Iniciar soporte y monitorización, posponer coordinación hasta completar estudio. [0,5,0,0]. Registrar referencia tardía. | Mantener en cola hasta terminar estudios. [0,0,0,0]. Alerta crítica y corrección inmediata. | E01–E02; S04 5.11; soporte específico: VM-02 |
| D2. Anamnesis dirigida | Revisar evolución, alergias/tipo de reacción, tratamientos recientes, enfermedades, tolerancia oral, TB/aspiración y apoyo familiar. [10,5,0,0]. Se revela el bloque completo. | Preguntar solo síntomas actuales. [5,0,0,0]. Se revela bloque parcial y luego corrección docente. | Elegir una historia extensa sin revisar alergias ni tratamientos. [0,0,0,0]. Corrección antes de prescribir. | E02; S09; VM-01 |
| D3. Apoyo diagnóstico | I-2: reconocer ausencia de RX/laboratorio, priorizar clínica y referencia; I-4: solicitar RX y hemograma/urea disponibles en paralelo, sin condicionar el traslado al resultado. [0,0,15,5]. | I-2: intentar gestionar RX externo sin detener referencia; I-4: diferir imágenes/laboratorio al receptor mientras se refiere. [0,0,15,5]. Alternativa aceptable dentro del guion. | Exigir completar RX, laboratorio, tomografía y cultivos antes de referir. [0,0,0,0]. Registrar 60 minutos de demora docente evitable; no fabricar resultados. | S04 5.11; adaptación docente VM-04. No se atribuye a IETSI un protocolo diagnóstico que no desarrolla. |
| D4. Riesgo y destino | Registrar CRB-65=2 y atención hospitalaria; indicar severidad ATS/IDSA pendiente donde falten datos. [15,0,0,5]. Se mantiene destino hospitalario. | Elegir hospital por juicio clínico, pero calcular CRB-65=1. [5,0,0,5]. Corregir cálculo. | Elegir alta ambulatoria porque conserva presión y orientación. [0,0,0,0]. Alerta crítica, alta interceptada. | E01 y E06 |
| D5. Tratamiento inicial | Seleccionar esquema TX01, revisar seguridad y disponibilidad/autorización; mantener coordinación. [0,15,5,0]. Registrar primera administración simulada. | Elegir solo ceftriaxona, sin añadir el segundo componente previsto para este perfil. [0,7,5,0]. Corregir selección. | Elegir solo antibiótico oral y plan de alta, o aplazar todo hasta cultivos: el MVP usa el primer distractor. [0,0,0,0]. Alerta crítica por plan de alta. | E03–E05; S07 y S09. Momento previo al traslado: VM-03. |
| D6. Transferencia y comunicación | Confirmar receptor, traslado asistido, oxígeno suficiente en transporte, reevaluación y entrega clínica con tratamientos/horas/alergias. [0,5,0,5]. Transferencia preparada. | Solicitar ambulancia sin completar receptor ni entrega clínica. [0,0,0,2]. Transferencia pendiente, corrección obligatoria. | Enviar por medios propios. [0,0,0,0]. Alerta crítica, salida interceptada. | S04 5.11; S10 solo como marco identificado. Checklist propuesto VM-04. |

## Tratamiento TX01 y condiciones previas

Propuesta concreta para revisar: ceftriaxona 2 g EV como primera dosis simulada y azitromicina 500 mg VO. Las frecuencias de referencia del esquema son cada 24 horas; este MVP termina en la transferencia y no expide una receta de tratamiento completo. La selección de la dosis superior y la primera administración en el establecimiento de origen son adaptaciones a validar, no una recomendación textual de atención prehospitalaria del IETSI. Revisar VM-03 antes de declarar el caso clínicamente validado.

La regla exige que el inventario incluya dos viales de 1 g, una tableta de 500 mg, insumos, personal habilitado y autorización institucional simulada. La categoría no satisface esas condiciones por sí sola. Si alguna falla, detener la administración simulada, informar qué falta y activar revisión del escenario; no sustituir automáticamente otro fármaco ni premiar esperar para conseguirlo. En los dos inventarios iniciales las condiciones se han definido como presentes.

Antes de D5 se muestran los antecedentes relevantes incluso si D2 fue incompleta, con la etiqueta «dato revelado por corrección docente» y sin recuperar puntos. El sistema no premia prescribir a ciegas. No se entrenan alternativas para alergia grave, insuficiencia renal/hepática, shock, embarazo o sospecha de infección resistente en esta versión.

## Retroalimentación reutilizable

| feedback_id | Texto base que puede mostrar el software | Evidencia |
|---|---|---|
| F01 | Revisa la prioridad del soporte, la coordinación y las acciones que podían realizarse en paralelo. | E01–E02; VM-02 |
| F02 | La historia dirigida completa información que puede cambiar una prescripción y el destino asistencial. | E02; S09 |
| F03 | Tu plan debe corresponder al inventario del turno. Un examen pendiente se comunica al receptor. | S04 5.11; VM-04 |
| F04 | Revisa por separado el puntaje de hospitalización y los datos necesarios para valorar severidad. | E01; E06 |
| F05 | Comprueba el perfil del paciente, la autorización y los recursos de administración del esquema seleccionado. | E03–E05; S07; S09 |
| F06 | La referencia se completa con coordinación, soporte durante el traslado y entrega clínica. | S04 5.11; VM-04 |

El debriefing muestra: decisión elegida, consecuencia del guion, alternativa esperada, fundamento y estado de validación. Si una parte es adaptación, lo indica con texto. No mostrar una recomendación condicional como obligación universal.

## Puntaje y fallos críticos

Máximos por dominio: razonamiento 25, seguridad 35, recursos 20 y referencia 20. Total 100. Sumar únicamente el vector de la primera selección confirmada de cada decisión. La normalización de cada dominio para el tablero es `100 × puntos / máximo`. Seis opciones A suman 100. D3-B obtiene la misma calificación que D3-A porque ambas pueden ser seguras; el MVP evita premiar la cantidad de exámenes.

Críticos: D1-C, D4-C, D5-C y D6-C. Cualquier crítico activa «Se identificó una decisión crítica: revisar antes de repetir», independientemente del total. D6-B activa «Transferencia incompleta». No hay umbral aprobado/desaprobado ni certificación. Un clic repetido no añade puntos ni consume medicamentos otra vez.

La corrección docente exige pulsar «He revisado la corrección; continuar con el plan seguro». Aplica a las respuestas parciales incorrectas y a los errores críticos; D3-B es una alternativa aceptada. Cambia solo el estado asistencial narrado para que el caso siga siendo aprendible; conserva la elección, los puntos, la demora y el indicador crítico originales. No simula que la decisión errónea se ejecutó en un paciente real. Un evento de corrección registra el cambio. En D5 se administra únicamente TX01 después de la corrección, sin ejecutar primero el esquema incorrecto.

## Consecuencias y desenlace

| Condición al final | Mensaje del guion |
|---|---|
| Sin críticos, D6-A | Transferencia preparada; se entrega al receptor la información disponible y pendiente. |
| Algún crítico | Recorrido completado con intervención docente por seguridad. El reporte conserva el riesgo identificado. |
| D6-B | Transferencia inicialmente incompleta; se completó mediante corrección docente. |
| D3-C | Se añadió una demora evitable ficticia de 60 minutos. Es un supuesto del caso, sin estimación de daño. |

No generar muerte, sepsis o recuperación asegurada según el puntaje. No alterar SpO₂, PA ni respuesta antibiótica mediante fórmulas inventadas. Una mejoría con soporte, si se incorpora después, necesitará un guion y revisión propios.

## Validación médica pendiente

| ID | Decisión concreta que revisa Victor | Propuesta ya preparada | Registro requerido |
|---|---|---|---|
| VM-01 | Coherencia y dificultad del paciente | 68 años, hipoxemia, CRB-65=2; diagnóstico probable y severidad incompleta | Aprobado/modificar, motivo, fecha y revisor |
| VM-02 | Soporte respiratorio y mensaje de prioridad | Oxígeno titulado y monitorización según protocolo local; sin flujo ni objetivo numérico automático | Confirmar texto o adjuntar fuente específica para una meta |
| VM-03 | TX01, dosis, autorización y momento pretransferencia | Esquema propuesto y ambos inventarios con circuito institucional ficticio declarado | Confirmar adaptación, seguridad y plausibilidad institucional |
| VM-04 | Exámenes, referencia y logística | Dos rutas seguras de D3; receptor hospitalario y traslado asistido; inventarios ficticios | Confirmar recursos, demoras y checklist; revisar anexo de cartera si corresponde |
| VM-05 | Ponderaciones y gravedad de errores | Cuatro dominios, crítica independiente y alternativas de igual valor | Confirmar o ajustar para uso formativo |

Estado inicial de las cinco revisiones: pendiente. Ninguna entrevista, aprobación médica ni validación educativa se ha simulado.
