# Prototipo publicado y conservación de main

**Actualización vigente:** [publicación v0.3 verificada y reversión](V03-DEPLOYMENT.md). Se conservan proyecto, audiencia pública y URL. El texto siguiente registra la publicación histórica de v0.2.

**URL pública auténtica:** https://simul-ande-visual-vroman.sugary-bass-7867.chatgpt.site/

Publicado el 11/11/2026. No requiere iniciar sesión; audiencia pública confirmada por el usuario. Estado nativo de despliegue: `succeeded`, versión 1. También se completó el caso en la URL y se comprobó acceso HTTP sin cookies.

| Fuente / despliegue | Estado |
|---|---|
| GitHub `victorroman1998/simul-ande`, rama `main` | Conserva `46fc4c9e54f696a90bfcb45b940d25248613de7a`; no se hizo merge, reset ni force push. |
| GitHub, rama `prototype/visual-phaser` | Código en `visual/`, reglas, pruebas y documentación. [Abrir rama](https://github.com/victorroman1998/simul-ande/tree/prototype/visual-phaser). |
| Streamlit `https://simul-ande.streamlit.app/` | MVP anterior conservado; se observó hibernación por inactividad durante el diagnóstico. No sirve React/Phaser. |
| Sites | Hosting estático independiente; proyecto `appgprj_6af4edbd2e7081919e2f2cfa34d197b9`. Se persiste en `visual/.openai/hosting.json` para futuras actualizaciones. |

## Procedencia del build

Implementación GitHub probada: `87bfa020cc80e3b349a4e640ced34c3bcde53c1e`. Se compiló con Node 24.22.1, pnpm 11.25.0, TypeScript estricto y Vite. El bundle utiliza React 19.2.0 y Phaser 3.90.0.

El flujo de Sites mantiene un repositorio de publicación **separado**, que refleja solo el directorio `visual/` y su manifiesto; su propia rama main no es main del repositorio SIMUL-ANDE. No se copiaron `.git`, `node_modules`, `.sites-runtime`, `.env` ni credenciales. Las credenciales temporales de escritura se usaron únicamente en memoria y por stdin del helper oficial.

Commit del espejo Sites: `a0d46b99c943e498afb54fa666aaf904789bc784`.

- Versión: `appgprj_6af4edbd2e7081919e2f2cfa34d197b9~appgver_3a1d243981bc819193f7cd9eb85f2401`
- Despliegue: `appgdep_6af4f45a3e948191b390ce535ff5b525`
- Hash de archivo recibido por Sites: `sha256:788724a9c0b936af81b9a2cbbac48248220a9d717df49e81f1635e8e258ddb1d`
- Artefacto: manifiesto más index.html y tres recursos compilados. Ningún servidor Python ni API clínica se ejecuta dentro del juego.

Las fuentes del espejo y del directorio `visual/` usadas para el build coinciden. Los commits posteriores que registran pruebas/enlaces no requieren reconstruir el mismo bundle si no cambian sus entradas. Para modificarlo en el futuro: reutilizar el project_id, recompilar, sincronizar el espejo con credencial renovada y guardar/publicar una nueva versión, según la habilidad Sites. No crear otro Site ni sobrescribir el Streamlit antiguo por accidente.

## Reproducir localmente

Desde la rama visual y con Node 24 + pnpm 11.25.0:

```sh
cd visual
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev --port 5173
```

Abrir la dirección local de Vite. Los intentos del sitio público y del sitio local son independientes por origen del navegador; ninguno contiene datos de personas reales. La evaluación es formativa y local, sin garantías contra manipulación.

Para revisar el recorrido publicado: seleccionar un instrumento, prepararlo en el panel y hacer clic en el paciente. La coordinación puede iniciarse antes de terminar la entrevista. En el teléfono se registra la entrega; en la salida se prepara la transferencia. La devolución detallada aparece al finalizar.
