# SIMUL-ANDE · Resumen ejecutivo

Versión 0.1 · 10 de noviembre de 2026, America/Lima. Responsable clínico propuesto: Victor Roman-Lazarte. Estado: especificación para construir; validación médica pendiente. Este paquete no contiene una aplicación ejecutable.

## Producto y problema

Hacemos simulación clínica para estudiantes de medicina, internos y futuros médicos SERUMS mediante pacientes ficticios, recursos explícitos y retroalimentación trazable a fuentes peruanas.

La hipótesis es que practicar únicamente en escenarios con abundantes exámenes y acceso inmediato a hospitales deja una brecha para tomar decisiones en el primer nivel peruano. La experiencia docente del fundador orienta esta hipótesis; las tres entrevistas todavía deben comprobarla. No se ha medido su frecuencia ni su costo económico.

El usuario practica una atención desde el ingreso hasta la transferencia. El producto debe responder a una pregunta concreta: «¿Qué decisión puedo tomar ahora, con lo que efectivamente tengo, y qué debo coordinar para que el paciente continúe su atención?».

## Primera versión

Un adulto ficticio con sospecha de neumonía adquirida en la comunidad (NAC), dos establecimientos hipotéticos basados en I-2 e I-4 y seis decisiones. Una sesión de aprendizaje durará aproximadamente 8–12 minutos; una demostración ensayada recorrerá el mismo flujo en 120 segundos. Estas duraciones son metas de diseño.

El establecimiento I-2 permite atención inicial y referencia; el I-4 ofrece más apoyo diagnóstico e internamiento limitado. Ambos tienen límites que obligan a valorar el destino del paciente. La categoría, la cartera autorizada y la disponibilidad del turno se muestran por separado. Ninguno representa a una IPRESS real.

El MVP presenta signos vitales desde el inicio, anamnesis mediante opciones, exámenes condicionados al inventario, cálculo razonado de riesgo, tratamiento inicial, referencia, consecuencias y un tablero final. El caso y la calificación se rigen por reglas predefinidas. Un tutor con IA selecciona preguntas de reflexión entre textos aprobados; no determina el tratamiento ni el puntaje.

## Valor educativo y límites

Se evalúan razonamiento, seguridad, uso de recursos y referencia. El puntaje sirve para retroalimentar y comparar intentos del mismo caso; no certifica competencia clínica ni predice desempeño en pacientes. Los errores críticos quedan visibles aunque el puntaje total sea alto. El estudiante recibe una corrección y puede terminar el recorrido.

La progresión representa consecuencias docentes, como una demora evitable o una transferencia incompleta. No calcula mortalidad, probabilidades de complicaciones ni cambios fisiológicos causados por una decisión. La disponibilidad de camas no equivale a capacidad suficiente para cualquier paciente.

## Hipótesis comercial

Usuario: estudiante o médico en transición a práctica general. Comprador inicial por explorar: coordinador de un curso o centro de preparación. Propuesta de precio para validar: S/300 por un piloto docente de cuatro semanas y hasta 30 participantes, con este caso y una sesión de devolución. Es una hipótesis de venta; no existen ventas, acuerdos ni disposición de pago comprobada. El MVP no procesa pagos.

Costo variable de IA por intento: `(tokens_entrada × tarifa_entrada + tokens_salida × tarifa_salida) / 1 000 000`, con tarifas en USD por millón. Presupuesto de diseño: una llamada, hasta 1500 tokens de entrada y 150 de salida; medir los valores reales en la implementación. A 100 intentos serían hasta 150 000 y 15 000 tokens, respectivamente. La cotización del modelo debe registrarse antes de presentar cifras monetarias. Servidor: registrar costo mensual real; un alojamiento gratuito se considera S/0 únicamente mientras cumpla sus condiciones. Añadir revisión médica, soporte y tiempo docente como costos separados.

El «por qué ahora» propuesto es la posibilidad de combinar una interfaz web pequeña, reglas auditables y modelos con respuestas estructuradas. La ventaja a comprobar será la calidad del caso, la pertinencia de los recursos y el aprendizaje, no el número de funciones.

## Alcance cerrado

Incluye un caso, dos inventarios, seis decisiones, retroalimentación, tablero, exportación anónima de un intento y tutor IA acotado. Quedan fuera de esta versión: 3D, avatar, voz, chat clínico libre, pagos, cuentas, ranking, varias enfermedades, integración con historias clínicas, mapas de IPRESS y estimación automática de stock real.

## Ruta hacia una entrega funcional

| Bloque posterior a esta especificación | Estimación de trabajo activo | Resultado observable |
|---|---:|---|
| Validar los puntos VM y congelar contenido | 30–45 min | Caso y respuestas revisados por Victor |
| Construir motor, pantallas y dos inventarios | 90–150 min | Flujo completo local |
| Integrar tablero y tutor IA | 45–90 min | Dos herramientas usadas dentro del producto |
| Verificar, desplegar y corregir | 45–90 min | URL o ejecución local comprobada |
| README, capturas, video y ensayo | 30–45 min | Evidencias de la tarea |

Total orientativo: 4–7 horas de trabajo activo, sin incluir entrevistas, incidencias de acceso ni espera de servicios. No es una promesa de terminación antes del cierre. Con el plazo del 10/11 a las 23:59, conviene obtener primero un flujo local completo. La consigna permite continuar commits hasta la presentación del 11/11. No presentar documentación como software terminado ni alterar fechas de commits. Ver [TASK_204_MATRIX.md](TASK_204_MATRIX.md).

## Decisiones del fundador

Victor debe revisar VM-01 a VM-05 de [CLINICAL_RULES.md](CLINICAL_RULES.md), realizar tres entrevistas y validar el precio como hipótesis. El desarrollador puede avanzar con contenido marcado «prototipo docente en revisión». La difusión como contenido clínicamente revisado requiere que el responsable registre su revisión; la interfaz debe conservar el estado real.

Éxito inmediato: terminar ambos recorridos sin fallos, explicar cada resultado por una regla y mostrar un intento real del software. Éxito del piloto por comprobar: al menos dos de tres usuarios terminan sin ayuda y explican una decisión que cambió por los recursos disponibles. Esto es un criterio de decisión del producto, no una prueba de eficacia educativa.
