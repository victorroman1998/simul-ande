# Entrega SIMUL-ANDE · versión visual 0.2

Estado de los recursos comprobados en GitHub el 11/11/2026. Tarea final: https://github.com/d2cml-ai/Data-Science-Python/issues/204. Presentación programada de 19:00 a 22:00 (Lima); turno original aproximado 21:25, sujeto a cambios.

## Entrega principal

- **Demo visual React + Phaser:** https://simul-ande-visual-vroman.sugary-bass-7867.chatgpt.site/
- **Rama entregable:** https://github.com/victorroman1998/simul-ande/tree/prototype/visual-phaser
- **README nuevo:** https://github.com/victorroman1998/simul-ande/blob/prototype/visual-phaser/README.md
- **Validación técnica y capturas:** [docs/visual/VALIDATION.md](visual/VALIDATION.md); [screenshots](visual/screenshots).
- **Comentario publicado originalmente:** https://github.com/d2cml-ai/Data-Science-Python/issues/204#issuecomment-6785760104
- **Demo anterior, histórica:** https://simul-ande.streamlit.app/ (no es el juego 2D).
- **Video existente:** [demo de 68 s](demo/simul-ande-demo.mp4) del **MVP anterior en Streamlit**. No presentarlo como grabación del juego visual; grabar un video nuevo del juego antes de usarlo como respaldo del despliegue 2D.

## Estado de publicación

El código visual se aloja en el subdirectorio `visual/` de la rama `prototype/visual-phaser`. El sitio `chatgpt.site` es un build estático independiente; los commits de GitHub no cambian el despliegue sin publicar otra versión. Consultar [DEPLOYMENT.md](visual/DEPLOYMENT.md) para su procedencia. La rama `main` conserva el código Python/Streamlit anterior.

El contenido clínico aún requiere VM-01–VM-05, validación educativa y entrevistas reales. Los datos son ficticios. El juego no tiene API bibliográfica propia: la sesión 03 del curso corresponde al MVP Streamlit heredado; el juego visual sí incluye la evaluación gráfica por dominios (sesión 05). No declarar integración de APIs o LLM dentro del juego hasta implementarlas y probarlas.

## Actualización del comentario del diplomado

El comentario original fue publicado, pero enlazaba al MVP anterior. **Editar manualmente el comentario existente** y colocar al inicio el nuevo enlace de demo visual y la rama `prototype/visual-phaser`. Incluir la distinción de herramientas anterior y rotular el video como histórico.

GitHub rechazó el intento de editar el comentario desde la integración actual con un error 403 de permisos; también rechazó publicar uno nuevo. Estos fallos no implican que la cuenta del titular esté impedida de editarlo directamente desde GitHub. No afirmar que el comentario ya se actualizó.

## Guion de presentación, 3 minutos

| Tiempo | Acciones en la demo visual |
|---|---|
| 0:00–0:30 | Presentar la necesidad de decisiones en entornos con inventario explícito, señalando que demanda y eficacia educativa están por validarse. |
| 0:30–0:45 | Abrir la sala I-2 y mostrar paciente y recursos: la categoría no implica stock garantizado. |
| 0:45–1:40 | Interactuar con paciente, oxímetro, estetoscopio y oxígeno; mostrar que el estado y tiempo se registran en el mismo escenario. |
| 1:40–2:10 | Contactar receptor, completar entrega y preparar traslado; enseñar las restricciones si se intenta una acción insegura. |
| 2:10–2:30 | Mostrar el tablero de devolución, bitácora y comparación con I-4 si el tiempo lo permite. |
| 2:30–3:00 | Explicar piloto comercial hipotético de S/300 por hasta 30 alumnos y pendientes: revisión médica, entrevistas y validación de aprendizaje. |

Si la demo visual falla, abrir las capturas y el código como evidencia y explicar el bloqueo técnico real. El video histórico de Streamlit no sustituye una grabación del nuevo juego. Un video nuevo debe mostrar el programa efectivamente ejecutándose.
