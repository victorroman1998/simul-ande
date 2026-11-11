# Diagnóstico antes de reconstruir la interfaz

Inspección del 11/11/2026, America/Lima, antes de modificar código. Base: `46fc4c9e54f696a90bfcb45b940d25248613de7a`.

| Comprobación | Hallazgo verificable |
|---|---|
| `git status --short --branch` | Checkout limpio, `main` siguiendo `origin/main`. |
| `git ls-remote --heads origin` y `git fetch origin` | El remoto solo anuncia `main`, en el mismo SHA. No había una rama React/Phaser publicada. |
| Archivos y workflow | Solo Python/Streamlit y sus pruebas; no había package.json, TypeScript, Phaser ni compilación frontend. |
| `engine.py` | `confirm_decision` rechaza toda decisión distinta de `case.decisions[state.step]`; seis decisiones secuenciales y correcciones intermedias obligatorias. |
| `app.py` y README | Interfaz de radio buttons, formulario y reruns; el inventario es una tabla. No hay sala, objetos seleccionables ni paciente representado. |
| Enlace `https://simul-ande.streamlit.app/` en navegador real | Responde con «This app has gone to sleep due to inactivity» y botón para despertar. Es hibernación de Community Cloud; no se observó un 404 ni se demostró una falla de código. |
| README y enlaces | README apunta al Streamlit anterior; un push de un frontend a otra rama no actualiza automáticamente ese despliegue Python. La URL anterior no debe presentarse como el prototipo visual nuevo. |
| Evidencia previa | Se conservan los registros de 29 pruebas Python y la demo previa. Esas pruebas no acreditan interacciones Phaser. |

Las comprobaciones HTTP mediante Invoke-WebRequest fallaron en el cliente PowerShell con NullReferenceException; no se interpretan como códigos HTTP del servidor. La constatación del estado dormido se hizo en el navegador.

Se creó `prototype/visual-phaser` desde `origin/main` después de esta inspección. La aplicación anterior y el puntero de main se conservan. El prototipo nuevo vive en `visual/`; tiene build estático y despliegue independiente. El JSON original, esquema, fuentes y tests Python permanecen intactos.

Arquitectura elegida: React controla paneles y accesibilidad, Phaser dibuja e interactúa con la sala, un reducer TypeScript puro aplica reglas y un JSON conserva datos clínicos e inventarios. El nuevo almacenamiento usa una clave local distinta; no importa ni modifica intentos del cuestionario.
