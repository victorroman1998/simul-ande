# Riesgos y respuestas

Versión 0.1. Prioridad Alta/Media es una valoración del proyecto, no una probabilidad cuantificada. Responsable clínico: Victor. Responsable técnico futuro: desarrollador con revisión del fundador.

## Seguridad clínica y validez educativa

| ID | Riesgo | Prioridad | Respuesta incorporada | Condición que exige revisar |
|---|---|---|---|---|
| C01 | Enseñar una dosis o conducta pretransferencia inadecuada | Alta | TX01 explícito, fuente y VM-03; estado clínico pendiente visible | Difusión como caso revisado sin firma de VM |
| C02 | Inferir servicios o stock a partir de I-2/I-4 | Alta | Categoría, autorización, personal y disponibilidad separados | Cualquier recurso añadido sin inventario |
| C03 | Equiparar CRB-65 con severidad o convertir ausentes en normales | Alta | Datos desconocidos conservados y reglas distintas | Cálculo de severidad con urea/PaO₂ no medidas |
| C04 | Aplicar cortes de saturación sin considerar altura | Alta | Localidad ficticia a 100 m; sin extrapolación automática | Cambio a escenario de altura |
| C05 | Que IA invente recomendaciones o citas | Alta | Salida de IDs cerrados, texto local, validación y respaldo | Texto clínico libre mostrado al estudiante |
| C06 | Compensar una decisión peligrosa con puntos | Alta | Críticos independientes y corrección docente trazable | Resultado «sin incidentes» con algún crítico |
| C07 | Presentar consecuencias inventadas como pronóstico | Alta | Solo consecuencias docentes, sin mortalidad ni causalidad numérica | Añadir cambios fisiológicos o probabilidades |
| C08 | Confundir puntaje con competencia profesional | Media | Uso formativo, sin aprobado ni certificado | Usarlo para selección o acreditación de médicos |
| C09 | Quedar desactualizado normativamente | Media | Fecha de corte; S06 actualiza carteras 2026; incertidumbres registradas | Representar una IPRESS real o nueva versión normativa |

## Problemas técnicos

| ID | Riesgo | Prioridad | Respuesta | Evidencia requerida |
|---|---|---|---|---|
| T01 | Reruns duplican puntaje, consumo o llamada IA | Alta | Confirmación única y efectos idempotentes | Prueba de doble clic y rerun |
| T02 | Recarga pierde progreso | Media | Estado por sesión y exportación final; reinicio explícito | Mensaje correcto y nuevo intento limpio |
| T03 | Internet, proveedor o API caen durante demo | Alta | Motor local, debriefing fijo, respaldo rotulado y video real | Probar API desconectada y reproducción de video |
| T04 | Clave expuesta o gasto por acceso público | Alta | Secretos de servidor, límite efectivo del proveedor o sin facturación, una llamada por intento | Revisar historial, configuración y consumo; no confundir límite de sesión con global |
| T05 | Despliegue falla o arranca lento | Alta | Verificar URL desde otra sesión y llevar ejecución local abierta | Prueba de acceso y ensayo antes del turno |
| T06 | JSON y documentos divergen | Media | IDs únicos, esquema y comprobación de puntajes/fuentes | Validación del paquete y tests del motor |
| T07 | Interfaz móvil oculta inventario o alertas | Media | Paneles apilados y alertas en cuerpo principal | Recorrido manual en ancho móvil |
| T08 | Texto libre incluye información personal | Media | Justificación opcional corta, aviso y exclusión de exportación; no usar datos reales | Comprobar payload y exportación |

## Tiempo, negocio y entrega

| ID | Restricción | Prioridad | Acción de alcance | Pendiente real |
|---|---|---|---|---|
| P01 | Cierre del enlace 10/11 a 23:59 | Alta | Construir primero flujo local; luego integrar evidencia y publicar enlace autorizado | Enlace y comentario aún no entregados |
| P02 | No existe software en este paquete | Alta | Transferencia directa a Codex con orden de implementación | Construcción posterior necesaria |
| P03 | Tres entrevistas todavía no realizadas | Alta | Usar guía, registrar notas reales; declarar si falta evidencia | Victor debe realizar/coordinar |
| P04 | Historial de varios días imposible de fabricar legítimamente | Alta | Commits reales por hitos, sin alterar fechas | Aceptar limitación de evidencia temporal |
| P05 | Demo excede tres minutos | Alta | Ensayar un recorrido y una reflexión; video 60–90 s | Ensayo con cronómetro |
| P06 | Precio o costos parecen hechos observados | Media | Rotular hipótesis y medir API/servidor | Validación comercial y tarifas |
| P07 | Crecimiento del alcance | Alta | Congelar un caso y seis decisiones; cambios solo por seguridad o fallo funcional | Rechazar añadidos que impidan cerrar el flujo |

La implementación puede avanzar con el rótulo de prototipo docente en revisión. Antes de presentarlo como revisado, completar VM-01 a VM-05. Ninguna mitigación convierte por sí sola el producto en una herramienta clínica validada ni reemplaza las evidencias de la tarea.
