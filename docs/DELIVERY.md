# Entregar el 10 y presentar el 11 de noviembre de 2026

Todos los horarios son **America/Lima, UTC−5**. Según la [consigna #204](https://github.com/d2cml-ai/Data-Science-Python/issues/204), el enlace se entrega el martes 10 antes de las **23:59**. Se permite seguir haciendo commits hasta presentar el miércoles 11. Conectarse a las **19:00** con la demo abierta. Victor Roman figura en turno 41, aproximadamente **21:25**, pero puede adelantarse. No hay diapositivas requeridas: el software debe correr.

**Ya publicado:** [demo pública](https://simul-ande.streamlit.app/), [repo](https://github.com/victorroman1998/simul-ande), [video de 68 segundos](demo/simul-ande-demo.mp4). La publicación en Community Cloud se realizó con autorización del titular para iniciar sesión y aceptar términos; no hubo una nueva pantalla de ampliación de permisos. Caso y revisión médica siguen pendientes de validación clínica. El comentario en la issue **no fue enviado**.

## Publicar en Streamlit Community Cloud

1. Publicar el código de esta carpeta como repositorio público, rama `main`. Destino propuesto: `victorroman1998/simul-ande`. No publicar `.venv`, `.env`, secretos o datos de pacientes.
2. Entrar en [Streamlit Community Cloud](https://share.streamlit.io/), usar la cuenta propia de GitHub y crear una app desde ese repositorio.
3. Seleccionar rama `main`, archivo `app.py`, Python **3.12**, nombre público disponible; desplegar. [Instrucciones oficiales](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app).
4. Para la demo base no configurar secretos: dashboard y API bibliográfica funcionan sin claves. Gemini permanece deshabilitado. No habilitar IA de pago sin un control efectivo de gasto verificado.
5. Abrir la URL desde una sesión distinta y completar I-2 desde inicio hasta exportación. Consultar PubMed y comprobar la respuesta. Repetir I-4, incluyendo la RX sintética y el laboratorio pendiente. Registrar URL y fecha real en README y VALIDATION.

Un mensaje «deployed» no es una prueba del flujo. Si el servicio solicita nueva autorización OAuth o términos vinculantes, el titular debe revisar el alcance antes de aceptarlos. No se necesita contratar un plan para la ejecución local.

## Si el despliegue público aún no está listo

La plantilla de la issue acepta **«corre en local»**. Entregar el repositorio con ese estado real antes de las 23:59 y seguir mejorando antes de presentar. La URL pública mejora la rúbrica, pero no debe inventarse ni sustituirse por una dirección local presentada como pública.

Abrir una terminal en esta carpeta y ejecutar:

```powershell
.\.venv\Scripts\python.exe -m streamlit run app.py
```

Mantener abierta esa terminal. Llevar cargada la app y el resultado de prueba. La API bibliográfica requiere internet; el caso y el dashboard no. El respaldo local del tutor se identifica explícitamente.

## Checklist de entrega humana pendiente

- Documentar VM-01 a VM-05 con decisión, motivo, fecha y revisor antes de afirmar validación médica. Mientras tanto conservar el aviso pendiente.
- Hacer y documentar tres conversaciones reales; no llenar las plantillas con entrevistas sintéticas.
- Probar con dos personas y registrar obstáculos observados.
- Descargar y reproducir [el video de respaldo ya creado](demo/simul-ande-demo.mp4), de 68 segundos sin audio. Está dentro del repositorio y de la carpeta local `docs/demo/`. Puede grabarse una versión narrada adicional si se desea.
- Ensayar exactamente tres minutos. Abrir demo y video antes de las 19:00 del 11/11.
- Revisar historial y archivos antes de publicar: `.env` y `secrets.toml` no deben estar rastreados. Buscar patrones de claves; las palabras «token» o «secret» en documentación no son por sí mismas secretos.
- Publicar el comentario de entrega en la issue. El agente deja el texto preparado; no envía mensajes al docente sin una instrucción explícita.

## Plantilla de comentario

Texto listo para copiar en la issue antes de las 23:59. Las entrevistas y revisión médica faltantes se declaran expresamente; no se atribuye uso real de Gemini.

```text
Nombre: Victor Roman
Startup y one-liner: SIMUL-ANDE. Simulación clínica para estudiantes e internos mediante casos ficticios y recursos explícitos del primer nivel peruano.
Link del demo (URL pública, o "corre en local"): https://simul-ande.streamlit.app/
Link del repo: https://github.com/victorroman1998/simul-ande
Herramientas del curso que usa: APIs de datos públicos (03, PubMed) y dashboard evaluativo (05, Plotly). Tutor estructurado opcional (08; no acreditado como llamada real sin clave).
Video de respaldo: https://github.com/victorroman1998/simul-ande/blob/main/docs/demo/simul-ande-demo.mp4
Estado: caso sintético educativo con revisión médica pendiente. Tres conversaciones con usuarios aún pendientes; no se presentan entrevistas inventadas.
```

No se puede reconstruir honestamente un historial de commits de días anteriores. Se registran los hitos reales de hoy. No se promete una nota.

## Guion de 3 minutos

| Tiempo | Software / mensaje |
|---|---|
| 0:00–0:30 | «Queremos practicar decisiones con los recursos realmente disponibles. El problema y el precio siguen en validación; este paciente es ficticio y el contenido está en revisión.» Incorporar un hallazgo solo si existe entrevista real. |
| 0:30–0:45 | I-2, inventario: no hay RX ni laboratorio; categoría y stock son cosas distintas. |
| 0:45–1:50 | Confirmar recursos y resolver D1–D6. Mostrar qué prueba puede esperar y por qué se coordina referencia. |
| 1:50–2:10 | Dashboard del intento y primera elección conservada. No es certificación. |
| 2:10–2:30 | Pestaña Fuentes: consultar API pública. Si se usa reflexión local, nombrarla como tal. |
| 2:30–3:00 | «Exploraremos un piloto docente de cuatro semanas para 30 participantes a S/300. El caso base no usa tokens de LLM. Lo siguiente es revisar clínicamente, entrevistar y observar aprendizaje.» |

Si falla internet: continuar el caso, mostrar tablero y exportación; la API informa indisponibilidad. Si falla el servidor: reproducir video real, y explicar que el código está en el repo. Nunca improvisar desenlaces clínicos.
