# Reglas explícitas del escenario vertical

Propuesta docente 0.2.0, revisión médica pendiente. No se generan respuestas clínicas con IA. Se usa el caso P-NAC-01 v0.1.0 conservado en `visual/src/data/case.json`; el motor nuevo está en `visual/src/clinical/engine.ts`.

| Acción | Prerrequisitos y efecto | Tiempo docente | Trazabilidad / límite |
|---|---|---:|---|
| Entrevistar | Tres temas independientes: síntomas; alergias/tratamientos; antecedentes/tolerancia oral/apoyo. Respuestas fijas H01–H07. Sin alternativas correctas/incorrectas. | 1 min por tema nuevo | E02, S09, VM-01. No sustituye anamnesis real. |
| Oximetría | Equipo básico disponible, autorizado, con personal e insumos. Coloca sensor y revela registro basal 88 % AA. Si ya hay oxígeno, no inventa una lectura posterior: actual desconocida. | 1 min | Datos iniciales del caso, VM-02. Repetir no cambia fisiología. |
| Explorar | Equipo básico operativo. Registra en conjunto examen inicial: FR 32, PA 112/68, FC 112, T 38,5, crepitantes basales derechos. | 2 min | E01/E02/E06, VM-01. Examen agrupado por alcance vertical. |
| Instalar oxígeno | Fuente, autorización, personal e insumos presentes. Cambia a soporte instalado y dibuja conexión. No consume una dosis o litros calculados ni genera metas. | 1 min | VM-02 pendiente. Autonomías logísticas declaradas del JSON. |
| TX01 | Entrevista completa para revisar seguridad y tolerancia oral; administración EV habilitada; stock, autorización, disponibilidad, personal e insumos. Una administración de 2 viales de ceftriaxona 1 g y una tableta de azitromicina 500 mg. | 3 min | E03–E05, S07/S09; propuesta VM-03 pendiente. No receta completa, técnica de inyección ni sustitución automática. |
| Coordinar | Teléfono operativo y aceptación de H-01 en el guion. Activa traslado asistido en paralelo desde cualquier momento. Llegada prevista según dispatch_min del inventario. | 2 min | S04 5.11, VM-04. No realiza llamada externa. |
| Entregar reporte | Receptor confirmado. Registra firma de la información conocida; hallazgos o intervenciones nuevos requieren actualización. | 1 min | Adaptación docente VM-04, sin transcribir un formulario normativo no leído. |
| Preparar transferencia | Entrevista, examen, sensor, soporte, receptor y entrega actualizada; equipo asistido, oximetría y autonomía suficiente de oxígeno del transporte. Finaliza como preparación, no traslado ni desenlace confirmado. | 1 min | VM-04. TX01 no se transforma en condición universal para poder trasladar. |
| Salida insegura / prerrequisito crítico ausente | Intercepta propuesta, conserva flag crítico y no ejecuta acción ni consume stock. No bloquea el resto del aprendizaje mediante un cuestionario de corrección. | 0 min | Política docente de seguridad VM-05 pendiente. |
| RX / laboratorio | Solo recursos explícitos de I-4. RX ofrece el texto sintético definido después de 20 min desde la solicitud. Laboratorio no produce valores. Pueden omitirse y preparar referencia sin esperar. | 1 min al solicitar | S04, VM-04. No se premia pedir más pruebas. |
| Esperar | Avanza cinco minutos elegidos por el estudiante. Añade demora evitable docente si aún faltan soporte o coordinación. No cambia signos. | 5 min | Regla educativa propuesta, sin predicción de daño. |
| Finalizar manualmente | Cierra y evalúa lo realizado, aunque la atención esté incompleta. No reabre estado clínico al volver a consultar la sala. | 0 min | Evaluación formativa local, no certificativa. |

Los tiempos de acciones son nuevos supuestos de interacción para el prototipo. El criterio de coordinación temprana ≤5 minutos se informa solo en la devolución; no se atribuye a una guía como plazo terapéutico. Los dominios suman 25 razonamiento + 35 seguridad + 20 recursos + 20 referencia, con nuevas ponderaciones propuestas, pendientes VM-05. Un crítico no desaparece por sumar puntos.

La animación ambiental de pecho/parpadeo solo aporta presencia visual. No codifica FR, SpO₂, deterioro, respuesta a antibióticos o eficacia del oxígeno. El botón de movimiento permite detenerla. La representación de RX es un icono de equipo; no se fabrica una imagen radiológica del paciente.

La calificación y el almacenamiento están en el navegador. No son un sistema de evaluación sumativa seguro frente a manipulación. Una versión institucional necesitaría revisión clínica, validación educativa, autenticación y trazabilidad de servidor.
