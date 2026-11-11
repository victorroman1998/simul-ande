# Verificación de la implementación

Estado de trabajo: motor, interfaz automatizada y API verificados; comprobación visual y despliegue en curso. Esta página se actualiza con resultados observados, no con pruebas previstas.

Resultados observados el 10/11/2026:

- `verify_package.py`: 11 hashes correctos, caso válido con JSON Schema Draft 2020-12; revisión `pending`.
- Motor e integraciones: **26 pruebas pasadas en 76,10 s**; la prueba exhaustiva recorre 1 458 caminos del caso.
- Suite completa Windows Python 3.12.14: **28 pruebas pasadas en 16,45 s**, incluidos ambos recorridos de Streamlit, reflexión local y reinicio.
- Instalación limpia Linux Python 3.12.16 y suite completa: **28 pruebas pasadas en 11,75 s**, [GitHub Actions del commit 6e2b2dd](https://github.com/victorroman1998/simul-ande/actions/runs/42941275189). La primera ejecución detectó un problema de transición de widgets; se corrigió moviendo cambios de estado a callbacks antes de dibujar la pantalla. La segunda ejecución pasó completa.
- `verify_live_api.py`: respuesta real de NCBI, PMID 31573350, título y fecha de publicación recibidos. Evidencia: [pubmed_live.json](evidence/pubmed_live.json), consulta 20:39:04 Lima (01:39:04 UTC del 11/11).
- Gemini: contrato verificado con respuestas controladas y fallos simulados. **Ninguna llamada real al modelo acreditada**.

Comandos de comprobación:

```text
python scripts/verify_package.py
python -m pytest -q
python scripts/verify_live_api.py
```

La primera prueba valida hashes y esquema. Las pruebas del motor incluyen las 1 458 combinaciones (3⁶ × 2 inventarios), idempotencia, stock/autorización, desconocidos, transferencias y privacidad. Las pruebas de UI recorren ambos inventarios. La prueba de API se ejecuta aparte y necesita internet. Las respuestas simuladas de Gemini solo prueban el contrato técnico; no constituyen una llamada real al modelo.

Pendientes que las pruebas técnicas no pueden acreditar: VM-01 a VM-05, tres conversaciones, usabilidad con dos personas, disposición de pago, ensayo humano y eficacia educativa. El contenido conserva revisión pendiente.
