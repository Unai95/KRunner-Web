# KRunner

Aplicacion de escritorio para practicar ejercicios de Kotlin con ejecucion local, casos de prueba y comparacion automatica de salidas.

## Uso

Instala dependencias la primera vez:

```powershell
npm install
```

Abre la app:

```powershell
.\run.ps1
```

La app permite:

- Crear ejercicios con titulo, enunciado y casos de prueba.
- Escribir codigo Kotlin en un editor Monaco.
- Ejecutar con `Ctrl+Enter` o el boton Run.
- Ejecutar todos los casos con `Run all`.
- Comparar automaticamente la salida obtenida con la salida esperada.
- Guardar ejercicios en el directorio de datos de Electron.
- Ejecutar en modo local usando Java y un runner Kotlin empaquetado.

## Motor de ejecucion

KRunner ejecuta el codigo en local. Usa Java y un helper Maven que empaqueta el compilador de Kotlin, asi que no depende de servicios externos.

El script `run.ps1` compila ese helper antes de abrir la app:

```powershell
npm run build:runner
```

Atajo util: `Ctrl+Enter` ejecuta el codigo desde el editor.

## Comprobaciones

```powershell
npm test
npm run check
mvn -q -f runner\pom.xml package
```

## Empaquetar la app

Para generar una carpeta ejecutable sin instalador:

```powershell
npm run pack
```

Salida:

```text
release\win-unpacked\KRunner.exe
```

Para generar el instalador `.exe` de Windows:

```powershell
npm run dist
```

Salida:

```text
release\KRunner Setup <version>.exe
```

Notas:

- Cierra la app antes de empaquetar. Si el `.exe` esta abierto, Windows puede bloquear archivos de `release\win-unpacked`.
- Necesitas Java instalado en el equipo donde se ejecute la app, porque el modo local invoca `java`.
- El runner Kotlin se incluye como recurso en el instalador.
