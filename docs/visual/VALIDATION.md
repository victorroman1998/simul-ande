# Verificación del prototipo visual

11/11/2026 · America/Lima. Alcance: escenario vertical React + TypeScript + Phaser, rama `prototype/visual-phaser`.

## Comprobaciones automatizadas

- **17 pruebas TypeScript** pasaron con Vitest 3.2.4. Incluyen 1.440 órdenes completos de acciones (720 permutaciones × dos establecimientos), sin secuencia D1–D6.
- Prerrequisitos de medicación: entrevista completa, autorización, disponibilidad, personal, insumos y stock. Se verifican bloqueo sin consumo, doble clic por ID y administración única.
- Se verifican RX ausente en I-2, RX de I-4 disponible solo al llegar al tiempo docente, ausencia de fisiología generada, referencia temprana, salida insegura interceptada, críticos persistentes y entrega clínica desactualizada.
- Persistencia y recuperación: datos válidos, JSON corrupto, versión incompatible, stock imposible, IDs duplicados y almacenamiento denegado.
- `pnpm build`: TypeScript estricto y build Vite de producción correctos. React 19.2.0, Phaser 3.90.0, TypeScript 5.9.3 y Vite 7.2.2 fijados en lockfile.
- Regresión del MVP original: **29 pruebas Python pasadas en 16,93 s** y 11 hashes originales correctos con el esquema Draft 2020-12. Sus archivos no fueron reemplazados por el frontend.

## Navegador real: I-2

Se abrió `http://127.0.0.1:5173/` en el navegador del equipo y se inspeccionó el canvas. Se detectó y corrigió un fallo inicial de ciclo de vida: `Scene.create()` ocurría antes de que `sys.isActive()` devolviera verdadero, por lo que el primer render se omitía. Tras corregirlo, la habitación se dibuja desde el primer acceso.

Se seleccionó el **oxímetro con un clic de coordenadas sobre el equipo dibujado**, se preparó y se colocó haciendo clic sobre el paciente en el canvas. El motor registró SpO₂ basal 88 %, un evento y un minuto. Se recargó: persistieron evento, lectura y tiempo. Seleccionar un objeto no añadió minutos.

Recorrido usado, deliberadamente distinto de las seis decisiones antiguas:

1. Oximetría.
2. Confirmar referencia desde el teléfono.
3. Instalar oxígeno sobre el paciente.
4. Explorar físicamente al paciente.
5. Entrevistar en orden contexto → seguridad → síntomas.
6. Preparar TX01 y administrarlo sobre el paciente.
7. Registrar entrega y preparar traslado.

Resultado observado: **10 acciones, 14 minutos docentes, 100/100**, transferencia preparada, stock de **2 viales y 3 tabletas**. El equipo no mostró una saturación mejorada tras el soporte. Se descargó realmente [attempt_i2.json](attempt_i2.json). La consola no mostró errores durante las interacciones verificadas. No se usaron formularios ni radios clínicos secuenciales.

## Navegador real: I-4 y crítico

Se inició un turno I-4 nuevo. Se verificaron visualmente RX y laboratorio, inexistentes en la sala I-2, además de mayor stock y autonomía de oxígeno declarada.

Se propuso salir por medios propios: se mostró la interrupción de seguridad y la acción no se ejecutó ni avanzó el reloj. Se siguió atendiendo. Se entrevistó primero, se coordinó referencia en minuto 3, se solicitaron RX/laboratorio, se exploró, se instaló oxígeno y **después** se colocó el oxímetro. Se informó explícitamente que la lectura posterior al soporte es desconocida.

Se administró TX01, se avanzó tiempo voluntariamente y apareció el informe sintético de RX, sin inventar laboratorio. Se actualizó entrega y se preparó traslado. Resultado observado: **31 minutos docentes, 90/100**, stock **18 viales y 9 tabletas**, alerta crítica conservada en el reporte. Las esperas se eligieron para probar RX; no son obligatorias para completar el caso.

## Capturas

- [Sala I-2](screenshots/01_sala_i2.jpg)
- [Oximetría con paciente seleccionado](screenshots/02_oximetria.jpg)
- [Intervención y stock descontado](screenshots/03_intervencion.jpg)
- [Resultado I-2](screenshots/04_resultado_i2.jpg)
- [Sala I-4](screenshots/05_sala_i4.jpg)
- [RX sintética de I-4](screenshots/06_rx_i4.jpg)

La publicación HTTPS y su comprobación se registran después de recibir un despliegue exitoso. No se considera publicada una URL solo porque figure como `expected_url` de Sites.

## Pendientes de validación humana

VM-01–VM-05, entrevistas reales, usabilidad con estudiantes y docentes, evaluación de aprendizaje y revisión de las nuevas ponderaciones. Las pruebas técnicas no validan la atención clínica. No se inventaron entrevistas, aprobaciones ni resultados educativos.
