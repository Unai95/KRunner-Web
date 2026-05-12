const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kotlinRunner', {
  loadExercises: () => ipcRenderer.invoke('storage:load'),
  saveExercises: (payload) => ipcRenderer.invoke('storage:save', payload),
  executeLocal: (payload) => ipcRenderer.invoke('local:execute', payload),
});
