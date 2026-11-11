# SIMUL-ANDE · Paquete de transferencia

Especificación v0.1, preparada el 10/11/2026, hora de Lima. No es el README de una app terminada. No incluye servidor, interfaz ejecutable ni despliegue, conforme al encargo de preparar primero la especificación y no editar código del repositorio.

## Contenido

| Archivo | Uso |
|---|---|
| PRODUCT_BRIEF.md | Problema, usuario, alcance, negocio y ruta de trabajo |
| MVP_SPEC.md | Pantallas, inventarios, arquitectura pequeña y aceptación |
| CLINICAL_RULES.md | Seis decisiones, alternativas, consecuencias, puntajes y revisión médica |
| case_nac_adult_v0_1.json | Caso estructurado directamente utilizable como datos |
| case.schema.json | Contrato de estructura para validar el caso |
| TASK_204_MATRIX.md | Requisitos, rúbrica, evidencias pendientes y guion de presentación |
| USER_RESEARCH.md | Guía para tres conversaciones y plantilla vacía |
| RISK_REGISTER.md | Riesgos clínicos, técnicos y de entrega |
| SOURCES.md | Documentos oficiales, localizadores y límites de verificación |

El JSON contiene los datos y decisiones para que el software los interprete; las fuentes están centralizadas en SOURCES. No incluir los PDFs originales ni copiar imágenes oficiales al producto.

## Prompt listo para la siguiente sesión de Codex

```text
Construye SIMUL-ANDE como aplicación funcional siguiendo este paquete. Lee primero
README_HANDOFF.md, MVP_SPEC.md y CLINICAL_RULES.md; valida el JSON con su esquema.
Trabaja sobre el repositorio que te indique y respeta sus AGENTS.md. Mantén el
alcance de un caso, dos establecimientos hipotéticos y seis decisiones.

Primero entrega un flujo local completo con Python y Streamlit, motor determinista,
inventario explícito, correcciones docentes, tablero y exportación anónima. Después
integra una llamada real a LLM con salida de IDs validada para seleccionar reflexión.
La IA no prescribe, no califica y no crea fuentes. Muestra respaldo local si falla.
No inventes entrevistas, aprobaciones clínicas, capturas, pruebas ni métricas.

Conserva medical_review.status=pending y el aviso visible hasta que Victor aporte
la validación VM-01 a VM-05. No cambies medicamentos o recursos para desbloquear
el flujo sin dejar una propuesta médica concreta. No uses datos personales reales.

Prueba ambos escenarios, las rutas alternativas de D3, los errores críticos, los
datos ausentes, doble confirmación, falta de autorización/stock y caída de IA.
Completa el README de nueve partes de la tarea #204 con estado honesto, comandos
reproducibles y rutas reales. Registra qué creó Codex y qué revisó el fundador.

Antes de exponer una API al público verifica protección de secretos y gasto.
Prepara el despliegue, capturas y video del software real. Informa qué está probado,
qué requiere credenciales y qué evidencia falta. No publiques mensajes en el issue
ni contactes usuarios salvo autorización explícita. No presentes este paquete de
documentación como si ya fuera la aplicación.
```

## Orden de trabajo recomendado

1. Victor revisa las cinco decisiones VM mientras el desarrollador prepara lectura de datos e interfaz con estado pendiente.
2. Implementar el motor y ambos recorridos completos; después el tablero y el tutor.
3. Ejecutar las verificaciones de aceptación, medir tokens/costos y probar acceso.
4. Incorporar entrevistas reales, README, capturas, video y ensayo.
5. Presentar los enlaces y el estado de entrega con autorización del fundador.

La interfaz debe diferenciar la selección inicial del alumno y la corrección docente. Si una adaptación clínica necesita cambiarse, actualizar la regla, JSON, versión y evidencia correspondiente en una misma revisión.
