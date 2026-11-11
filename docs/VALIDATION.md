# Verificación de la implementación

Estado: MVP publicado y comprobado. [Demo pública](https://simul-ande.streamlit.app/), [repositorio](https://github.com/victorroman1998/simul-ande). La revisión clínica y la validación con usuarios permanecen pendientes.

Resultados observados el 10/11/2026:

- `verify_package.py`: 11 hashes correctos, caso válido con JSON Schema Draft 2020-12; revisión `pending`.
- Motor e integraciones: **26 pruebas pasadas en 76,10 s**; la prueba exhaustiva recorre 1 458 caminos del caso.
- Suite completa Windows Python 3.12.14: **28 pruebas pasadas en 16,45 s**, incluidos ambos recorridos de Streamlit, reflexión local y reinicio.
- Instalación limpia Linux Python 3.12.16 y suite completa: **28 pruebas pasadas en 11,75 s**, [GitHub Actions del commit 6e2b2dd](https://github.com/victorroman1998/simul-ande/actions/runs/42941275189). La primera ejecución detectó un problema de transición de widgets; se corrigió moviendo cambios de estado a callbacks antes de dibujar la pantalla. La segunda ejecución pasó completa.
- `verify_live_api.py`: respuesta real de NCBI, PMID 31573350, título y fecha de publicación recibidos. Evidencia: [pubmed_live.json](evidence/pubmed_live.json), consulta 20:39:04 Lima (01:39:04 UTC del 11/11).
- Gemini: contrato verificado con respuestas controladas y fallos simulados. **Ninguna llamada real al modelo acreditada**.
- Suite ampliada final: **29 pruebas pasadas en 10,39 s** en Windows, incluida una prueba UI de D1-C y D2-B, pausa obligatoria, antecedentes revelados, 75/100 y alerta crítica conservada al finalizar.
- I-2 manual en navegador local: seis decisiones, resultado 100/100, dashboard, tutor local y descarga JSON. [JSON realmente descargado](evidence/attempt_i2.json): se comprobaron seis elecciones, stock de ceftriaxona restante de dos viales, desconocidos y ausencia de texto libre/secretos.
- I-4 manual en sesión nueva de la URL pública, con viewport 390×844: seis decisiones, 100/100, RX sintética disponible en D3-A, laboratorio pendiente, tutor local y consulta de PubMed recibida desde el servidor público. [Registro](evidence/public_validation.json), [vista móvil](evidence/mobile_i4.jpg), [resultado público](evidence/public_i4.jpg).
- Acceso independiente por `requests.get`, sin cookies ni credenciales: HTTP 200, URL final `https://simul-ande.streamlit.app/`, sin redirección a login.
- [Video de respaldo](demo/simul-ande-demo.mp4): 68,00 s, 1280×720, H.264, sin audio; 136 capturas reales a 2 fps durante un recorrido de la app pública. FFmpeg decodificó las 1 632 imágenes de salida sin errores. No es una animación de pantallas diseñadas.
- Se escanearon archivos rastreados y blobs del historial con `scripts/scan_secrets.py`: sin patrones reconocidos de claves. Esto es una comprobación técnica acotada, no garantía universal de detección. `.env` y `secrets.toml` están excluidos.

Comandos de comprobación:

```text
python scripts/verify_package.py
python -m pytest -q
python scripts/verify_live_api.py
```

La primera prueba valida hashes y esquema. Las pruebas del motor incluyen las 1 458 combinaciones (3⁶ × 2 inventarios), idempotencia, stock/autorización, desconocidos, transferencias y privacidad. Las pruebas de UI recorren ambos inventarios. La prueba de API se ejecuta aparte y necesita internet. Las respuestas simuladas de Gemini solo prueban el contrato técnico; no constituyen una llamada real al modelo.

Pendientes que las pruebas técnicas no pueden acreditar: VM-01 a VM-05, tres conversaciones, usabilidad con dos personas, disposición de pago, ensayo humano y eficacia educativa. El contenido conserva revisión pendiente.

La instalación inicial encontró lecturas lentas y vínculos incompatibles con OneDrive. Se completó desde caché con `uv pip install --link-mode copy`; el entorno del proyecto quedó ejecutable. Los procesos temporales de instalación bloqueados se detuvieron. No se modificó `Python_2/tarea_3`.
