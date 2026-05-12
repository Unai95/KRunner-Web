# KRunner Móvil

Versión móvil de [KRunner](https://github.com/Unai95/KRunner) para practicar ejercicios de Kotlin en iOS y Android.

## Stack

- **Framework**: Expo SDK 52 + Expo Router 4
- **Plataforma**: iOS y Android (React Native 0.76)
- **Editor de código**: Monaco Editor en WebView
- **Ejecución de Kotlin**: Backend HTTP API en Railway
- **Storage**: AsyncStorage (local en el dispositivo)

## Requisitos

- Node 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app en tu dispositivo

## Inicio rápido

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go (Android) o la cámara (iOS).

## Backend HTTP API

La app requiere el servidor de ejecución de Kotlin. Para configurarlo:

1. Despliega el servidor desde el repositorio KRunner en Railway/Render
2. O ejecuta localmente: `cd ../KRunner && npm run start:server`
3. Ajusta la URL en **Ajustes → URL del servidor**

## Estructura

```
app/
  _layout.tsx              # Raíz: providers de tema y ejercicios
  library.tsx              # Lista de ejercicios
  settings.tsx             # Tema, auto-main, URL servidor
  runner/[id].tsx          # Editor + ejecución
  exercise-form/[id].tsx   # Crear/editar ejercicio
components/
  KotlinEditor.tsx         # Monaco en WebView
  OutputBox.tsx, TestCaseTabs.tsx
  ui/                      # Componentes base React Native
lib/
  exercises.js, runnerUtils.js, errorClassifier.js  # Compartidas con desktop
  api.ts                   # AsyncStorage + fetch al servidor
context/
  ThemeContext.tsx, ExercisesContext.tsx
hooks/
  useTheme.ts, useExercises.ts, useSettings.ts
```
