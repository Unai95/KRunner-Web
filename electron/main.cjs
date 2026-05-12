const { app, BrowserWindow, ipcMain } = require('electron');
const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const MAX_CODE_BYTES = 256 * 1024;
const MAX_STDIN_BYTES = 64 * 1024;
const MIN_TIMEOUT_MS = 1000;
const MAX_TIMEOUT_MS = 10000;

let mainWindow;

function dataFile() {
  return path.join(app.getPath('userData'), 'exercises.json');
}

function iconFile() {
  return path.join(__dirname, '..', 'assets', 'icon.ico');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 820,
    minWidth: 1040,
    minHeight: 680,
    title: 'KRunner',
    icon: iconFile(),
    backgroundColor: '#0a0a0b',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('storage:load', async () => {
  try {
    return await fs.readFile(dataFile(), 'utf8');
  } catch {
    return '';
  }
});

ipcMain.handle('storage:save', async (_event, payload) => {
  await fs.mkdir(path.dirname(dataFile()), { recursive: true });
  await fs.writeFile(dataFile(), payload, 'utf8');
  return true;
});

ipcMain.handle('local:execute', async (_event, payload) => {
  const code = String(payload.code || '');
  const stdin = String(payload.stdin || '');
  const timeoutMs = clampTimeout(payload.timeoutMs);

  if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
    throw new Error(`LIMIT: El codigo supera el limite de ${formatBytes(MAX_CODE_BYTES)} para el runner local.`);
  }
  if (Buffer.byteLength(stdin, 'utf8') > MAX_STDIN_BYTES) {
    throw new Error(`LIMIT: La entrada supera el limite de ${formatBytes(MAX_STDIN_BYTES)} para el runner local.`);
  }

  const jarPath = app.isPackaged
    ? path.join(process.resourcesPath, 'runner', 'kotlin-local-runner-0.1.0.jar')
    : path.join(__dirname, '..', 'runner', 'target', 'kotlin-local-runner-0.1.0.jar');
  try {
    await fs.access(jarPath);
  } catch {
    throw new Error('ENVIRONMENT: No encuentro el runner local. Ejecuta: mvn -q -f runner\\pom.xml package');
  }

  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kotlin-runner-electron-'));
  const sourcePath = path.join(workDir, 'Main.kt');
  const stdinPath = path.join(workDir, 'stdin.txt');
  await fs.writeFile(sourcePath, code, 'utf8');
  await fs.writeFile(stdinPath, stdin, 'utf8');

  try {
    const stdout = await execFileText('java', ['-jar', jarPath, sourcePath, stdinPath, String(timeoutMs)], {
      timeout: timeoutMs + 15000,
    });
    try {
      return JSON.parse(stdout);
    } catch {
      throw new Error('RUNNER: El runner local devolvio una respuesta no valida.');
    }
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
});

function clampTimeout(value) {
  const timeout = Number(value || 5000);
  if (!Number.isFinite(timeout)) return 5000;
  return Math.max(MIN_TIMEOUT_MS, Math.min(MAX_TIMEOUT_MS, Math.trunc(timeout)));
}

function formatBytes(bytes) {
  return bytes >= 1024 ? `${Math.round(bytes / 1024)} KB` : `${bytes} bytes`;
}

function execFileText(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { ...options, windowsHide: true, maxBuffer: 1024 * 1024 * 4 }, (error, stdout, stderr) => {
      if (error) {
        const message = stderr || error.message;
        if (/ENOENT|not recognized|no se reconoce/i.test(message)) {
          reject(new Error('ENVIRONMENT: No se encontro Java en el sistema. Instala Java y vuelve a intentarlo.'));
          return;
        }
        reject(new Error(`RUNNER: ${message}`));
        return;
      }
      resolve(stdout);
    });
  });
}
