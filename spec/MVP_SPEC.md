# SIMUL-ANDE · Especificación funcional para desarrollo

Versión 0.1 · Contrato de implementación. Este documento describe software por construir. Los archivos de este paquete son especificación y datos del caso; no se modificó un repositorio de código. Fuente clínica y validación: [CLINICAL_RULES.md](CLINICAL_RULES.md) y [SOURCES.md](SOURCES.md).

## Experiencia mínima

Aplicación web en español, utilizable desde navegador de escritorio o celular. Recomendación: Python + Streamlit, un proceso servidor, caso JSON y motor de reglas como funciones. Abrir una URL HTTPS no requiere instalación al estudiante ni compilaciones por procesador. La ejecución local requiere Python y dependencias en la computadora del presentador; no se instala software en los teléfonos que accedan a una instancia publicada.

La pantalla mantiene a la vista: objetivo del ejercicio, paciente ficticio, establecimiento seleccionado, signos vitales iniciales, recursos del turno y progreso de seis decisiones. En celular se apilan paneles y el inventario queda en un desplegable accesible. No ocultar las alertas clínicas en la barra lateral.

Texto de contexto: «Práctica educativa con un caso ficticio. El contenido clínico está en revisión médica». Cambiar la segunda oración únicamente cuando exista registro de revisión. La versión del caso permanece en el resultado.

| Pantalla | Contenido e interacción | Criterio de aceptación |
|---|---|---|
| Inicio | Objetivo, alcance, estado clínico y selector I-2/I-4 | Se puede iniciar sin nombre, correo ni cuenta |
| Turno | Inventario, horario, personal relevante y logística | El usuario confirma haber visto los recursos; la elección de establecimiento queda fija |
| Atención | D1–D6, tres alternativas sin opción preseleccionada, justificación opcional de hasta 300 caracteres | Confirmar una decisión una sola vez; mostrar consecuencia y fundamento sin saltarse la siguiente |
| Seguridad | Corrección docente ante crítico o transferencia incompleta | La corrección permite continuar y conserva el error original |
| Resultado | Cuatro dominios, total, decisiones, demora evitable, alertas y fuentes | Resultado reproducible para las mismas seis elecciones |
| Reflexión IA | Botón para seleccionar un foco de reflexión a partir del intento | Se distingue respuesta real de IA de selección local de respaldo |
| Exportar/repetir | Descargar JSON y comenzar otro intento o cambiar escenario | Exportación no contiene identificadores personales; repetir reinicia puntos, stock y alertas |

## Inventarios iniciales del turno

Los siguientes valores son supuestos explícitos del caso, no mínimos normativos, estadísticas peruanas ni un censo de IPRESS. «Autorizado» significa autorizado dentro de la institución ficticia; no constituye una autorización real. Se describen solo los recursos relevantes para la simulación.

| Recurso | Puesto ficticio A, basado en I-2 | Centro ficticio B, basado en I-4 |
|---|---|---|
| Localidad / hora del caso | 100 m s. n. m.; 10:00; atención 08:00–14:00 | Misma localidad y hora; atención 24 h |
| Equipo presente para esta atención | 1 médico, 1 enfermera, 1 técnico | 2 médicos, 2 enfermeras, 1 técnico, laboratorista y tecnólogo de radiología presentes |
| Evaluación básica | Tensiómetro, termómetro, reloj, estetoscopio y pulsioxímetro operativos | Mismos recursos operativos |
| Oxígeno | Fuente operativa, regulador, interfaces; autonomía docente declarada de 180 min para el soporte configurado | Fuente operativa e interfaces; autonomía docente de 360 min |
| Monitorización | Oximetría intermitente y observación presencial | Oximetría y observación presencial; sin monitor multiparámetro continuo |
| Acceso EV y administración | Personal entrenado e insumos presentes; capacidad inicial ficticia habilitada | Personal entrenado e insumos presentes; capacidad inicial ficticia habilitada |
| Ceftriaxona 1 g inyectable | 4 viales; autorización institucional ficticia para TX01 declarada | 20 viales; misma condición declarada |
| Azitromicina 500 mg tableta | 4 tabletas | 10 tabletas |
| Amoxicilina 500 mg tableta | 20 tabletas; distractor, no plan correcto de alta | 40 tabletas; misma función |
| Radiografía de tórax | No disponible ni servicio local incorporado en el caso | Servicio ficticio autorizado, equipo y operador disponibles; informe a 20 min |
| Hemograma y urea | No disponibles durante la atención | Disponibles, resultados a 45 min; no constituyen urea inmediata |
| Tomografía, gasometría, cultivos inmediatos | No disponibles | No disponibles |
| Camas | Sin internamiento | 4 camas; 1 libre. Internamiento limitado, insuficiente para las necesidades de este caso |
| Soporte avanzado | Sin UCI, ventilación mecánica ni vasopresores en este turno | Sin UCI, ventilación mecánica ni vasopresores en este turno |
| Comunicación | Teléfono de referencia operativo | Teléfono de referencia operativo |
| Transporte asistido | Recurso de la red confirmado en 30 min tras activación; viaje de 90 min | Confirmado en 20 min; viaje de 60 min |
| Recursos del transporte | Equipo entrenado, oximetría y oxígeno independiente para 180 min en el guion | Mismas condiciones del transporte |

No se modela consumo de oxígeno por flujo. Las autonomías son entradas logísticas ficticias para verificar que el usuario comprueba el suministro; necesitan VM-02/04. El stock farmacológico se descuenta solo por administración simulada confirmada. La primera dosis TX01 consume dos viales y una tableta. No descontar una caja ni confundir concentración del vial con dosis total.

La autorización de cada recurso debe almacenarse por separado de `available`. Una acción requiere autorización aplicable, personal, insumos y cantidad suficiente. Para los fármacos, la ausencia de una restricción específica no se representa como autorización universal.

Hospital receptor H-01: hipotético, fuera del área jugable. En el guion confirma recepción, evaluación médica, oxigenoterapia sostenida, laboratorio e imágenes y capacidad para valorar escalamiento. Estos atributos se declaran, no se deducen de su nombre o categoría. El software no llama a una central real.

## Estados, reglas y tiempo

Secuencia: inicio → inventario → D1 → D2 → D3 → D4 → D5 → D6 → resultado. Una corrección docente es un estado intermedio que retorna al paso siguiente. No hay finales ocultos ni aleatoriedad.

Al confirmar: validar opción y escenario, comprobar prerrequisitos, registrar evento único, aplicar puntos de primera elección, registrar consecuencia, descontar stock si corresponde y avanzar. Reejecutar la pantalla no vuelve a ejecutar estos efectos. Las reglas, no el LLM, controlan la transición.

Todas las opciones con `requires_teaching_correction=true` requieren reconocimiento de la corrección, incluso si el error no es crítico. D3-B es una alternativa aceptada y no requiere corrección. En D5, las selecciones incorrectas representan propuestas interceptadas: solo se ejecuta TX01, una vez, después de la corrección. Así se evita descontar dos veces ceftriaxona al corregir una propuesta de monoterapia.

Se registran dos tiempos distintos: segundos reales de uso, solo informativos; y minutos ficticios de demora evitable. D3-C añade 60 minutos ficticios. No se suman los 20/45 minutos de procesamiento diagnóstico a la demora si transcurren en paralelo. No se calcula una «hora clínica total» a partir del tiempo del usuario ni se usa un umbral de 60 minutos como norma terapéutica.

D3-A en I-4 puede mostrar la RX mediante un salto docente de 20 minutos: «Se obtiene este informe mientras continúa la coordinación». Informe sintético: opacidad alveolar basal derecha, sin compromiso multilobar ni derrame descrito. El laboratorio queda pendiente para el receptor. D3-B en I-4 no muestra RX. D3 en I-2 nunca produce imágenes ni laboratorio. Se conserva «NAC probable» cuando no hay imagen. No presentar cultivo positivo ni urea normal inventados.

La espera inadecuada D3-C se intercepta mediante corrección; no se generan signos vitales de deterioro. D4 sigue usando los datos iniciales identificados como tales. Las variables ATS/IDSA faltantes siguen desconocidas incluso si la RX muestra un solo lóbulo. No calcular PaO₂/FiO₂ a partir de SpO₂.

Alerta crítica prevalece sobre el mensaje de recorrido sin incidentes. «Transferencia preparada» describe la decisión, no un resultado clínico confirmado. Durante el debriefing no se anuncian tasas de supervivencia, mejoría o prevención de mortalidad.

## Herramientas del curso dentro del producto

1. Dashboard, sesión 05: cuatro barras con puntos obtenidos/máximos, tabla de decisiones y demora del intento. Los gráficos usan eventos reales de ejecución del software; no estadísticas inventadas de estudiantes.
2. LLM con salida estructurada, sesión 08: selecciona un foco de reflexión y una pregunta entre un catálogo cerrado usando las decisiones y la justificación del usuario. El beneficio a comprobar es una devolución pertinente sin generación clínica libre.

Esto requiere una llamada auténtica durante la demostración para acreditar IA en el producto. Codex como programador no cuenta como herramienta incorporada. Si la llamada falla, el caso sigue funcionando y muestra «Reflexión seleccionada por reglas locales; IA no disponible». El respaldo no se presenta como salida generada por IA. No se denomina RAG a un catálogo fijo sin recuperación implementada.

Contrato de salida del tutor: objeto JSON con `focus_decision_id` (D1–D6), `feedback_id` (F01–F06) y `question_id` (Q01–Q06). La pareja decisión/feedback debe coincidir y corresponder al intento. Se renderiza exclusivamente el texto local aprobado de esos IDs. Un modelo no puede devolver dosis, fuentes, puntajes ni texto clínico nuevo para mostrar al usuario.

Entrada: versión, establecimiento, seis elecciones, indicadores de error y justificación final opcional de hasta 300 caracteres. Sin datos personales. El texto del usuario se trata como dato, no como instrucciones. Salida validada con esquema y reglas de correspondencia; IDs inválidos, timeout o error → respaldo local. Una llamada como máximo por intento, hasta 1500 tokens de entrada y 150 de salida, timeout de 10 s, sin reintento automático. Cachear únicamente dentro del intento; repetir clic no vuelve a facturar.

Preguntas de reflexión locales: Q01 «¿Qué podías iniciar mientras coordinabas el siguiente nivel de atención?»; Q02 «¿Qué antecedente podía cambiar tu selección terapéutica?»; Q03 «¿Qué examen podía esperar sin cambiar el destino del paciente?»; Q04 «¿Qué dato distingue el riesgo calculado de la severidad aún no medida?»; Q05 «¿Qué comprobaciones permitían administrar el esquema en este turno?»; Q06 «¿Qué información debía recibir el equipo que continuaría la atención?».

El modelo, SDK y tarifas se eligen y verifican al implementar. Configurar `LLM_MODEL`, clave, tarifas por millón y estado habilitado en secretos del servidor. Antes de exponer IA públicamente, comprobar un límite efectivo de gasto o una modalidad sin facturación habilitada; un contador por sesión no es un tope global. Registrar uso real y costo estimado por intento. Si el proveedor no informa tokens, mostrar «costo no medido», no cero.

## Organización propuesta del código futuro

| Archivo futuro | Responsabilidad |
|---|---|
| `app.py` | Pantallas y estado de Streamlit |
| `engine.py` | Prerrequisitos, transiciones, puntaje, alertas y eventos |
| `data/case_nac_adult_v0_1.json` | Caso entregado en este paquete |
| `tutor.py` | Una integración de IA y validación de salida |
| `requirements.txt` | Dependencias fijadas tras probar instalación |
| `tests/test_engine.py` | Verificaciones de reglas y consistencia |
| `docs/research/` | Notas de entrevistas reales, revisadas para publicar |

No necesita frontend separado, microservicios, base vectorial ni base de datos central. Estado anónimo en `st.session_state`; al recargar/cerrar puede perderse, por lo que se ofrece exportación al finalizar. La app no debe afirmar que guarda resultados entre dispositivos. Separar contenido de reglas evita reescribir pantallas al corregir un texto clínico.

## Registro y exportación

Guardar por intento: ID aleatorio local, versión del caso, escenario, estado de revisión, elecciones, puntuaciones por dominio, alertas, correcciones, minutos docentes de demora, pruebas solicitadas/resultados disponibles y metadatos IA. El resultado exportado excluye justificaciones libres y claves. No enviar telemetría externa de usuarios ni crear un ranking.

Evento mínimo: `sequence`, `decision_id`, `option_id`, `event_type`, `score_delta`, `critical_flag`, `avoidable_delay_min`. Tipos: `decision_confirmed`, `teaching_correction`, `tutor_completed`, `tutor_fallback`. El intento separa selección original de acciones realizadas tras corrección.

## Verificación y definición de terminado

| Prueba requerida | Resultado esperado |
|---|---|
| Camino A en ambos escenarios | 100 puntos, sin crítico, seis decisiones, stock coherente |
| D3-B en ambos escenarios | Puntaje máximo de D3; respeta resultado disponible/pendiente |
| Error crítico con buen resto del intento | Alerta crítica persiste aunque haya puntos altos |
| Datos faltantes y límite de categoría | Urea/PaO₂ desconocidas; I-2 no entrega RX; I-4 no habilita UCI |
| Doble confirmación, rerun y reinicio | Sin puntaje/consumo/cobro duplicados; nuevo intento limpio |
| Falta de autorización o stock en fixture de prueba | Acción bloqueada con explicación; no administración ficticia |
| Tutor válido, salida ajena al catálogo y timeout | Solo texto permitido; respaldo visible; puntaje idéntico |
| Lectura de referencias | Toda regla con evidencia tiene fuente y localizador existentes |

Validar el JSON con el esquema entregado y ejecutar las pruebas del motor. Después realizar una pasada manual de ambos escenarios, una en ancho móvil y otra con API desconectada. Capturar inicio/inventario, decisión con consecuencia y resultado. Un despliegue se verifica abriendo la URL desde otra sesión; no basta que la plataforma diga «deployed».

Terminado para demo: flujo completo, dos inventarios funcionales, tablero, tutor real configurado con respaldo honesto, fuentes, exportación y ejecución reproducible. Para rotularlo como clínicamente revisado, además deben completarse VM-01 a VM-05. La obtención de entrevistas, publicación del repositorio, URL y video se evidencia aparte en la matriz de la tarea.
