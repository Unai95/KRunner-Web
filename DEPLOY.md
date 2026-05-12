# Despliegue de KRunner

KRunner tiene tres salidas:

- Desktop Windows con Electron.
- Web + API Express para ejecutar Kotlin en servidor.
- App movil Expo que consume la API.

## Comprobaciones previas

Desde la raiz del proyecto:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run check
mvn.cmd -q -f runner\pom.xml package
```

En Windows usa `npm.cmd` si PowerShell bloquea `npm.ps1`.

## Desktop Windows

Generar instalador:

```powershell
npm.cmd run dist
```

Salida esperada:

```text
release\KRunner Setup 0.1.6.exe
```

Generar carpeta ejecutable sin instalador:

```powershell
npm.cmd run pack
```

Salida esperada:

```text
release\win-unpacked\KRunner.exe
```

El equipo donde se ejecute la app necesita Java instalado.

## API + Web en Railway

El proyecto ya incluye `railway.toml` y `server/Dockerfile`.

El Dockerfile compila durante el despliegue:

- El runner Kotlin con Maven.
- El frontend Vite en `dist`.
- El servidor Express con Node 20.

La imagen final usa JDK 21 completo. No cambies a JRE: el runner invoca el compilador Kotlin embebido y necesita clases del JDK.

Pasos:

1. Sube este proyecto a un repositorio GitHub.
2. En Railway, crea un proyecto nuevo desde ese repositorio.
3. Railway detectara `railway.toml`.
4. Comprueba que el servicio responda en:

```text
https://tu-servicio.railway.app/health
```

Debe devolver:

```json
{ "status": "ok", "version": "0.1.0" }
```

Si Railway sigue mostrando un error antiguo despues de subir cambios, ejecuta un redeploy manual de la ultima version o limpia la cache de build desde Railway.

La API de ejecucion queda en:

```text
https://tu-servicio.railway.app/run
```

Como el backend sirve tambien `dist`, la web queda disponible en la raiz:

```text
https://tu-servicio.railway.app/
```

## API + Web en Render

Usa un servicio Docker:

- Root directory: raiz del repo.
- Dockerfile path: `server/Dockerfile`.
- Health check path: `/health`.
- Port: Render usa la variable `PORT`; el servidor ya la respeta.

## Web separada en Vercel o Netlify

Si quieres frontend separado de la API:

- Build command: `npm run build`
- Output directory: `dist`

Variable de entorno:

```text
VITE_KRUNNER_API_URL=https://tu-api.railway.app
```

Si no pones esa variable, en produccion el frontend llama a `/run` en el mismo dominio.

## App movil Expo

Desde `mobile`:

```powershell
npm install
npx expo start
```

La URL por defecto esta en:

```text
mobile/lib/storage.ts
```

Clave:

```ts
DEFAULT_SERVER_URL
```

Cambia ese valor a la URL final de Railway/Render, o configuralo desde Ajustes dentro de la app.
